"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function PricingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (plan: "free" | "pro") => {
    if (!user) {
      router.push("/signup");
      return;
    }

    if (plan === "free") {
      router.push("/dashboard");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billing,
          userId: user.id,
          email: user.email,
        }),
      });

      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to create checkout session");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      const message = error instanceof Error ? error.message : "Failed to start checkout";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const monthlyPrice = 9.99;
  const yearlyPrice = 99.99;
  const yearlySavings = Math.round((1 - yearlyPrice / (monthlyPrice * 12)) * 100);

  return (
    <div className="min-h-[90vh] py-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Choose the plan that works best for you.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`text-sm ${billing === "monthly" ? "text-white" : "text-slate-500"}`}>
            Monthly
          </span>
          <button
            onClick={() => setBilling(billing === "monthly" ? "yearly" : "monthly")}
            className="relative w-14 h-7 rounded-full bg-slate-700 transition-colors"
          >
            <div
              className={`absolute top-1 w-5 h-5 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 transition-all ${
                billing === "yearly" ? "left-8" : "left-1"
              }`}
            />
          </button>
          <span className={`text-sm ${billing === "yearly" ? "text-white" : "text-slate-500"}`}>
            Yearly
            <span className="ml-2 px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs">
              Save {yearlySavings}%
            </span>
          </span>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="relative p-8 rounded-2xl bg-slate-800/50 border border-slate-700/50">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">Free</h3>
              <p className="text-slate-400 text-sm">Perfect for getting started</p>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold text-white">$0</span>
              <span className="text-slate-500">/month</span>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3 text-slate-300">
                <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                3 courses per month
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                2 file uploads per course
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                AI summaries & flashcards
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Interactive quizzes
              </li>
            </ul>

            <button
              onClick={() => handleSubscribe("free")}
              className="w-full py-3 rounded-xl bg-slate-700 text-white font-medium hover:bg-slate-600 transition-colors"
            >
              {user ? "Go to Dashboard" : "Get Started Free"}
            </button>
          </div>

          {/* Pro Plan */}
          <div className="relative p-8 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-violet-500/10 border border-cyan-500/30">
            {/* Popular badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 text-white text-sm font-medium">
              Most Popular
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">Pro</h3>
              <p className="text-slate-400 text-sm">For serious learners</p>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold text-white">
                ${billing === "monthly" ? monthlyPrice : (yearlyPrice / 12).toFixed(2)}
              </span>
              <span className="text-slate-500">/month</span>
              {billing === "yearly" && (
                <p className="text-sm text-slate-500 mt-1">
                  Billed ${yearlyPrice}/year
                </p>
              )}
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3 text-slate-300">
                <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <strong className="text-white">Unlimited</strong> courses
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <strong className="text-white">Unlimited</strong> file uploads
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Priority AI processing
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Early access to new features
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Cancel anytime
              </li>
            </ul>

            <button
              onClick={() => handleSubscribe("pro")}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-medium hover:from-cyan-400 hover:to-violet-400 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                "Upgrade to Pro"
              )}
            </button>
          </div>
        </div>

        {/* FAQ or trust badges */}
        <div className="mt-16 text-center">
          <p className="text-slate-500 text-sm">
            Secure payments powered by Stripe. Cancel anytime.
          </p>
          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              SSL Secure
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Stripe Payments
            </div>
          </div>
        </div>

        {/* Back to home */}
        <div className="mt-12 text-center">
          <Link href="/" className="text-slate-400 hover:text-white transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

