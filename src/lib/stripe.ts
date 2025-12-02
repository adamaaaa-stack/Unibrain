import Stripe from "stripe";

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-04-30.basil",
});

// Price IDs - you'll set these after creating products in Stripe
export const PRICES = {
  PRO_MONTHLY: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || "",
  PRO_YEARLY: process.env.STRIPE_PRO_YEARLY_PRICE_ID || "",
};

// Plan limits
export const PLAN_LIMITS = {
  free: {
    coursesPerMonth: 3,
    filesPerCourse: 2,
  },
  pro: {
    coursesPerMonth: Infinity,
    filesPerCourse: Infinity,
  },
};

