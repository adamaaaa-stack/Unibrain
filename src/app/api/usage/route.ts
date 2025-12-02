import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PLAN_LIMITS } from "@/lib/stripe";
import { PlanType, UsageStats } from "@/lib/types";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

const TRIAL_DAYS = 7;

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return NextResponse.json({
        courses_this_month: 0,
        plan: "free",
        courses_limit: 3,
        can_create_course: true,
        is_trial: false,
        trial_days_left: 0,
      });
    }

    // Default values
    let plan: PlanType = "free";
    let isTrial = false;
    let trialDaysLeft = 0;

    // Try to get or create subscription
    try {
      let { data: subscription } = await supabaseAdmin
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .single();

      // If no subscription, create one with trial
      if (!subscription) {
        const trialEndsAt = new Date();
        trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DAYS);

        const { data: newSub, error: insertError } = await supabaseAdmin
          .from("subscriptions")
          .insert({
            user_id: userId,
            plan: "pro",
            status: "trialing",
            trial_ends_at: trialEndsAt.toISOString(),
          })
          .select()
          .single();

        if (!insertError && newSub) {
          subscription = newSub;
        }
      }

      if (subscription) {
        // Check if in active trial
        if (subscription.status === "trialing" && subscription.trial_ends_at) {
          const trialEnd = new Date(subscription.trial_ends_at);
          const now = new Date();
          
          if (trialEnd > now) {
            // Still in trial
            plan = "pro";
            isTrial = true;
            trialDaysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          } else {
            // Trial expired - downgrade to free
            await supabaseAdmin
              .from("subscriptions")
              .update({ plan: "free", status: "active" })
              .eq("user_id", userId);
            plan = "free";
          }
        } else if (subscription.plan === "pro" && subscription.status === "active") {
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
      is_trial: isTrial,
      trial_days_left: trialDaysLeft,
    };

    return NextResponse.json(usage);
  } catch (error) {
    console.error("Usage check error:", error);
    return NextResponse.json({
      courses_this_month: 0,
      plan: "free",
      courses_limit: 3,
      can_create_course: true,
      is_trial: false,
      trial_days_left: 0,
    });
  }
}
