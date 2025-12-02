import { NextRequest, NextResponse } from "next/server";
import { stripe, PRICES } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

// Create admin Supabase client for database operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment variables." },
        { status: 500 }
      );
    }

    const { billing, userId, email } = await request.json();

    // Use userId and email from request body (sent from client)
    if (!userId || !email) {
      return NextResponse.json({ error: "User information required" }, { status: 400 });
    }

    return createCheckoutSession(userId, email, billing);
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

async function createCheckoutSession(userId: string, email: string, billing: "monthly" | "yearly") {
  // Check if user already has a Stripe customer
  const { data: subscription } = await supabaseAdmin
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .single();

  let customerId = subscription?.stripe_customer_id;

  // Create customer if doesn't exist
  if (!customerId) {
    const customer = await stripe.customers.create({
      email,
      metadata: { userId },
    });
    customerId = customer.id;

    // Create or update subscription record
    await supabaseAdmin.from("subscriptions").upsert({
      user_id: userId,
      stripe_customer_id: customerId,
      plan: "free",
      status: "active",
    });
  }

  const priceId = billing === "yearly" ? PRICES.PRO_YEARLY : PRICES.PRO_MONTHLY;

  if (!priceId) {
    return NextResponse.json(
      { error: "Stripe price not configured. Please set STRIPE_PRO_MONTHLY_PRICE_ID in environment variables." },
      { status: 500 }
    );
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pricing?canceled=true`,
    metadata: {
      userId,
    },
  });

  return NextResponse.json({ url: session.url });
}

