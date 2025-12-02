"use client";

import { useState } from "react";
import { StudyGuideSection } from "@/lib/types";

interface StudyGuideProps {
  sections: StudyGuideSection[];
}

export default function StudyGuide({ sections }: StudyGuideProps) {
  const [expandedSection, setExpandedSection] = useState<number | null>(0);

  if (!sections || sections.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        No study guide available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sections.map((section, index) => (
        <div
          key={index}
          className="rounded-xl bg-slate-800/50 border border-slate-700/50 overflow-hidden"
        >
          {/* Section header */}
          <button
            onClick={() => setExpandedSection(expandedSection === index ? null : index)}
            className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-700/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-500 text-white text-sm font-bold">
                {index + 1}
              </span>
              <h3 className="text-lg font-semibold text-white">{section.title}</h3>
            </div>
            <svg
              className={`w-5 h-5 text-slate-400 transition-transform ${
                expandedSection === index ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Section content */}
          {expandedSection === index && (
            <div className="px-5 pb-5 border-t border-slate-700/50">
              <p className="text-slate-300 leading-relaxed mt-4 mb-4">
                {section.content}
              </p>

              {section.keyPoints && section.keyPoints.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-cyan-400 mb-3 uppercase tracking-wider">
                    Key Points
                  </h4>
                  <ul className="space-y-2">
                    {section.keyPoints.map((point, pointIndex) => (
                      <li key={pointIndex} className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-slate-300">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

