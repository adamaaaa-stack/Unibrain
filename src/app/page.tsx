"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse-glow animation-delay-300" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse-glow animation-delay-600" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/80 border border-slate-700/50 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            </span>
            <span className="text-sm text-slate-300">
              Powered by Google Gemini AI
            </span>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="text-white">Turn Any Text Into</span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent animate-gradient">
              a Learning Experience
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            Paste your lecture notes, articles, or any text. UniBrain creates
            <span className="text-cyan-400"> summaries</span>,
            <span className="text-violet-400"> flashcards</span>, and
            <span className="text-fuchsia-400"> quizzes</span> instantly.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={user ? "/create" : "/signup"}
              className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-semibold text-lg overflow-hidden transition-all hover:scale-105"
            >
              <span className="relative z-10">
                {user ? "Create Course" : "Get Started Free"}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-violet-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link
              href="#features"
              className="px-8 py-4 rounded-xl bg-slate-800/80 text-slate-300 font-semibold text-lg border border-slate-700 hover:border-slate-600 hover:text-white transition-all"
            >
              Learn More
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-cyan-400 mb-2">
                5 min
              </div>
              <div className="text-sm text-slate-500">Average Learning Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-violet-400 mb-2">
                10x
              </div>
              <div className="text-sm text-slate-500">Faster Retention</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-fuchsia-400 mb-2">
                100%
              </div>
              <div className="text-sm text-slate-500">Free to Start</div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg
            className="w-6 h-6 text-slate-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Everything You Need to Learn
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              UniBrain transforms passive reading into active learning with AI-powered tools
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 - Summary */}
            <div className="group p-8 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-cyan-500/50 transition-all">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Smart Summaries
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Get concise, well-structured summaries that capture the key concepts from any text, no matter how long.
              </p>
            </div>

            {/* Feature 2 - Flashcards */}
            <div className="group p-8 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-violet-500/50 transition-all">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Interactive Flashcards
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Automatically generated flashcards help you memorize key facts with spaced repetition.
              </p>
            </div>

            {/* Feature 3 - Quiz */}
            <div className="group p-8 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-fuchsia-500/50 transition-all">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-fuchsia-500 to-fuchsia-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Quiz Yourself
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Test your knowledge with AI-generated multiple-choice quizzes and track your progress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-400">
              Three simple steps to transform your learning
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-14 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500" />

            {/* Step 1 */}
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border border-cyan-500/30 mb-6">
                <span className="text-4xl font-bold text-cyan-400">1</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Paste Your Text
              </h3>
              <p className="text-slate-400">
                Copy any text - lecture notes, articles, transcripts - and paste it into UniBrain.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-violet-500/20 to-violet-500/5 border border-violet-500/30 mb-6">
                <span className="text-4xl font-bold text-violet-400">2</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                AI Generates Content
              </h3>
              <p className="text-slate-400">
                Our AI analyzes your text and creates summaries, flashcards, and quiz questions.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-fuchsia-500/20 to-fuchsia-500/5 border border-fuchsia-500/30 mb-6">
                <span className="text-4xl font-bold text-fuchsia-400">3</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Learn & Review
              </h3>
              <p className="text-slate-400">
                Study with flashcards, take quizzes, and save courses to your dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl" />

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Learn Smarter?
              </h2>
              <p className="text-lg text-slate-400 mb-8 max-w-xl mx-auto">
                Join thousands of students and professionals who are transforming how they learn.
              </p>
              <Link
                href={user ? "/create" : "/signup"}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-semibold text-lg hover:from-cyan-400 hover:to-violet-400 transition-all hover:scale-105"
              >
                {user ? "Create Your First Course" : "Start Learning Free"}
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 via-violet-500 to-fuchsia-500 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <span className="font-semibold text-slate-300">UniBrain</span>
          </div>
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} UniBrain. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
