"use client";

import { useState } from "react";
import { KeyTerm } from "@/lib/types";

interface KeyTermsProps {
  terms: KeyTerm[];
}

export default function KeyTerms({ terms }: KeyTermsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedTerm, setExpandedTerm] = useState<number | null>(null);

  if (!terms || terms.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        No key terms available
      </div>
    );
  }

  const filteredTerms = terms.filter(
    (term) =>
      term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.definition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search terms..."
          className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
        />
      </div>

      {/* Terms grid */}
      <div className="grid gap-3">
        {filteredTerms.map((term, index) => (
          <div
            key={index}
            className="group rounded-xl bg-slate-800/50 border border-slate-700/50 overflow-hidden hover:border-cyan-500/30 transition-colors"
          >
            <button
              onClick={() => setExpandedTerm(expandedTerm === index ? null : index)}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center">
                  <span className="text-lg font-bold text-violet-400">
                    {term.term.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="font-semibold text-white">{term.term}</span>
              </div>
              <svg
                className={`w-5 h-5 text-slate-400 transition-transform ${
                  expandedTerm === index ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {expandedTerm === index && (
              <div className="px-4 pb-4 border-t border-slate-700/50">
                <p className="text-slate-300 mt-3 leading-relaxed">{term.definition}</p>
              </div>
            )}
          </div>
        ))}

        {filteredTerms.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            No terms match your search
          </div>
        )}
      </div>

      {/* Term count */}
      <div className="text-center text-sm text-slate-500">
        {filteredTerms.length} of {terms.length} terms
      </div>
    </div>
  );
}

