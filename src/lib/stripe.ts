import Stripe from "stripe";

// Server-side Stripe instance - only create if key exists
const stripeKey = process.env.STRIPE_SECRET_KEY;

export const stripe = stripeKey 
  ? new Stripe(stripeKey, { apiVersion: "2025-11-17.clover" })
  : null as unknown as Stripe;

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

