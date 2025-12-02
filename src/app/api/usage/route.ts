import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PLAN_LIMITS } from "@/lib/stripe";
import { PlanType, UsageStats } from "@/lib/types";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    return null;
  }
  
  return createClient(url, key);
}

const defaultUsage = {
  courses_this_month: 0,
  plan: "free" as PlanType,
  courses_limit: 3,
  can_create_course: true,
  is_trial: false,
  trial_days_left: 0,
};

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return NextResponse.json(defaultUsage);
    }

    // Get Supabase client
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      console.error("Supabase not configured");
      return NextResponse.json(defaultUsage);
    }

    // Default values
    let plan: PlanType = "free";

    // Try to get or create subscription
    try {
      let { data: subscription } = await supabaseAdmin
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .single();

      // If no subscription, create one with free plan
      if (!subscription) {
        const { data: newSub, error: insertError } = await supabaseAdmin
          .from("subscriptions")
          .insert({
            user_id: userId,
            plan: "free",
            status: "active",
          })
          .select()
          .single();

        if (!insertError && newSub) {
          subscription = newSub;
        }
      }

      if (subscription) {
        if (subscription.plan === "pro" && subscription.status === "active") {
          plan = "pro";
        }
      }
    } catch (err) {
      console.log("Subscription check error:", err);
    }

    // Get courses created this month
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { count } = await supabaseAdmin
      .from("courses")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", firstOfMonth);

    const coursesThisMonth = count || 0;
    const limit = PLAN_LIMITS[plan].coursesPerMonth;

    const usage: UsageStats = {
      courses_this_month: coursesThisMonth,
      plan,
      courses_limit: limit === Infinity ? -1 : limit,
      can_create_course: coursesThisMonth < limit,
      is_trial: false,
      trial_days_left: 0,
    };

    return NextResponse.json(usage);
  } catch (error) {
    console.error("Usage check error:", error);
    return NextResponse.json(defaultUsage);
  }
}
