"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-cyan-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:shadow-cyan-500/40 transition-shadow">
              <svg
                className="w-6 h-6 text-white"
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
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-300 to-violet-400 bg-clip-text text-transparent">
              UniBrain
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {!loading && user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-slate-300 hover:text-cyan-400 transition-colors font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/create"
                  className="text-slate-300 hover:text-cyan-400 transition-colors font-medium"
                >
                  Create Course
                </Link>
                <Link
                  href="/pricing"
                  className="text-slate-300 hover:text-cyan-400 transition-colors font-medium"
                >
                  Pricing
                </Link>
                <button
                  onClick={() => logout()}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all border border-slate-700"
                >
                  Sign Out
                </button>
              </>
            ) : !loading ? (
              <>
                <Link
                  href="/pricing"
                  className="text-slate-300 hover:text-cyan-400 transition-colors font-medium"
                >
                  Pricing
                </Link>
                <Link
                  href="/login"
                  className="text-slate-300 hover:text-cyan-400 transition-colors font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-medium hover:from-cyan-400 hover:to-violet-400 transition-all shadow-lg shadow-cyan-500/25"
                >
                  Get Started
                </Link>
              </>
            ) : null}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-slate-300 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800">
            {!loading && user ? (
              <div className="flex flex-col gap-3">
                <Link
                  href="/dashboard"
                  className="text-slate-300 hover:text-cyan-400 transition-colors font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/create"
                  className="text-slate-300 hover:text-cyan-400 transition-colors font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Create Course
                </Link>
                <Link
                  href="/pricing"
                  className="text-slate-300 hover:text-cyan-400 transition-colors font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-left text-slate-300 hover:text-cyan-400 transition-colors font-medium py-2"
                >
                  Sign Out
                </button>
              </div>
            ) : !loading ? (
              <div className="flex flex-col gap-3">
                <Link
                  href="/pricing"
                  className="text-slate-300 hover:text-cyan-400 transition-colors font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link
                  href="/login"
                  className="text-slate-300 hover:text-cyan-400 transition-colors font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="text-slate-300 hover:text-cyan-400 transition-colors font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </nav>
  );
}

