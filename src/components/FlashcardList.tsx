"use client";

import { useState } from "react";
import { Flashcard } from "@/lib/types";

interface FlashcardListProps {
  flashcards: Flashcard[];
}

export default function FlashcardList({ flashcards }: FlashcardListProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [viewMode, setViewMode] = useState<"single" | "grid">("single");

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  if (flashcards.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        No flashcards available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* View mode toggle */}
      <div className="flex justify-end gap-2">
        <button
          onClick={() => setViewMode("single")}
          className={`p-2 rounded-lg transition-colors ${
            viewMode === "single"
              ? "bg-cyan-500/20 text-cyan-400"
              : "bg-slate-800 text-slate-400 hover:text-white"
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <button
          onClick={() => setViewMode("grid")}
          className={`p-2 rounded-lg transition-colors ${
            viewMode === "grid"
              ? "bg-cyan-500/20 text-cyan-400"
              : "bg-slate-800 text-slate-400 hover:text-white"
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </button>
      </div>

      {viewMode === "single" ? (
        <>
          {/* Single card view */}
          <div
            className="relative h-72 cursor-pointer perspective-1000"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div
              className={`absolute inset-0 w-full h-full transition-transform duration-500 transform-style-3d ${
                isFlipped ? "rotate-y-180" : ""
              }`}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Front of card - Question */}
              <div
                className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-cyan-500/10 to-violet-500/10 border border-cyan-500/30 flex flex-col items-center justify-center p-8 backface-hidden"
                style={{ backfaceVisibility: "hidden" }}
              >
                <span className="text-xs text-cyan-400 mb-4 uppercase tracking-wider">Question</span>
                <p className="text-xl text-white text-center font-medium leading-relaxed">
                  {flashcards[currentIndex].q}
                </p>
                <span className="absolute bottom-4 text-xs text-slate-500">Click to flip</span>
              </div>

              {/* Back of card - Answer */}
              <div
                className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/30 flex flex-col items-center justify-center p-8 rotate-y-180"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                <span className="text-xs text-violet-400 mb-4 uppercase tracking-wider">Answer</span>
                <p className="text-xl text-white text-center font-medium leading-relaxed">
                  {flashcards[currentIndex].a}
                </p>
                <span className="absolute bottom-4 text-xs text-slate-500">Click to flip</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrev}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            <span className="text-slate-400 text-sm">
              {currentIndex + 1} / {flashcards.length}
            </span>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </>
      ) : (
        /* Grid view */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {flashcards.map((card, index) => (
            <FlashcardItem key={index} flashcard={card} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}

function FlashcardItem({ flashcard, index }: { flashcard: Flashcard; index: number }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="relative h-48 cursor-pointer perspective-1000"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={`absolute inset-0 w-full h-full transition-transform duration-500 ${
          isFlipped ? "rotate-y-180" : ""
        }`}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 w-full h-full rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex flex-col items-center justify-center p-6"
          style={{ backfaceVisibility: "hidden" }}
        >
          <span className="absolute top-3 left-3 text-xs text-cyan-500">#{index + 1}</span>
          <p className="text-white text-center text-sm leading-relaxed">{flashcard.q}</p>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 w-full h-full rounded-xl bg-gradient-to-br from-cyan-900/30 to-violet-900/30 border border-cyan-500/30 flex flex-col items-center justify-center p-6"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <span className="absolute top-3 left-3 text-xs text-violet-400">Answer</span>
          <p className="text-white text-center text-sm leading-relaxed">{flashcard.a}</p>
        </div>
      </div>
    </div>
  );
}

