"use client";

import { useState } from "react";
import { PracticeQuestion } from "@/lib/types";

interface PracticeQuestionsProps {
  questions: PracticeQuestion[];
}

export default function PracticeQuestions({ questions }: PracticeQuestionsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");

  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        No practice questions available
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % questions.length);
    setShowHint(false);
    setShowAnswer(false);
    setUserAnswer("");
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + questions.length) % questions.length);
    setShowHint(false);
    setShowAnswer(false);
    setUserAnswer("");
  };

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>Question {currentIndex + 1} of {questions.length}</span>
        <div className="flex gap-1">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setShowHint(false);
                setShowAnswer(false);
                setUserAnswer("");
              }}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex
                  ? "bg-cyan-500"
                  : "bg-slate-700 hover:bg-slate-600"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question card */}
      <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50">
        {/* Question */}
        <div className="mb-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-fuchsia-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-lg text-white leading-relaxed">{currentQuestion.question}</p>
          </div>

          {/* Hint button */}
          {currentQuestion.hint && !showHint && (
            <button
              onClick={() => setShowHint(true)}
              className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Show hint
            </button>
          )}

          {/* Hint display */}
          {showHint && currentQuestion.hint && (
            <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm">
              💡 {currentQuestion.hint}
            </div>
          )}
        </div>

        {/* Answer area */}
        <div className="space-y-4">
          <textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Type your answer here..."
            className="w-full h-32 p-4 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 resize-none focus:outline-none focus:border-cyan-500/50"
          />

          {/* Show answer button */}
          {!showAnswer ? (
            <button
              onClick={() => setShowAnswer(true)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-medium hover:from-violet-400 hover:to-fuchsia-400 transition-all"
            >
              Show Sample Answer
            </button>
          ) : (
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <h4 className="text-sm font-medium text-green-400 mb-2 uppercase tracking-wider">
                Sample Answer
              </h4>
              <p className="text-slate-300 leading-relaxed">{currentQuestion.sampleAnswer}</p>
            </div>
          )}
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
    </div>
  );
}

