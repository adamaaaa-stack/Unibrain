"use client";

import { useState } from "react";
import { QuizQuestion } from "@/lib/types";

interface QuizListProps {
  quiz: QuizQuestion[];
}

export default function QuizList({ quiz }: QuizListProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(string | null)[]>(
    new Array(quiz.length).fill(null)
  );
  const [showResults, setShowResults] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (quiz.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        No quiz questions available
      </div>
    );
  }

  const handleSelectAnswer = (answer: string) => {
    if (submitted) return;
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answer;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quiz.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setShowResults(true);
  };

  const handleReset = () => {
    setSelectedAnswers(new Array(quiz.length).fill(null));
    setSubmitted(false);
    setShowResults(false);
    setCurrentQuestion(0);
  };

  const score = selectedAnswers.reduce((acc, answer, index) => {
    return answer === quiz[index].answer ? acc + 1 : acc;
  }, 0);

  const allAnswered = selectedAnswers.every((answer) => answer !== null);

  if (showResults && submitted) {
    return (
      <div className="space-y-8">
        {/* Score card */}
        <div className="text-center py-8 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50">
          <div className="mb-4">
            <span className="text-6xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              {score}/{quiz.length}
            </span>
          </div>
          <p className="text-xl text-slate-300 mb-2">
            {score === quiz.length
              ? "🎉 Perfect Score!"
              : score >= quiz.length * 0.7
              ? "🌟 Great job!"
              : score >= quiz.length * 0.5
              ? "👍 Good effort!"
              : "📚 Keep studying!"}
          </p>
          <p className="text-slate-500">
            You got {Math.round((score / quiz.length) * 100)}% correct
          </p>
        </div>

        {/* Review questions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Review Answers</h3>
          {quiz.map((q, index) => {
            const isCorrect = selectedAnswers[index] === q.answer;
            return (
              <div
                key={index}
                className={`p-4 rounded-xl border ${
                  isCorrect
                    ? "bg-green-500/10 border-green-500/30"
                    : "bg-red-500/10 border-red-500/30"
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <span
                    className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCorrect
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {isCorrect ? "✓" : "✗"}
                  </span>
                  <p className="text-white font-medium">{q.q}</p>
                </div>
                <div className="ml-9 space-y-1 text-sm">
                  <p className="text-slate-400">
                    Your answer:{" "}
                    <span
                      className={isCorrect ? "text-green-400" : "text-red-400"}
                    >
                      {selectedAnswers[index] || "Not answered"}
                    </span>
                  </p>
                  {!isCorrect && (
                    <p className="text-slate-400">
                      Correct answer:{" "}
                      <span className="text-green-400">{q.answer}</span>
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Restart button */}
        <div className="text-center">
          <button
            onClick={handleReset}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-medium hover:from-cyan-400 hover:to-violet-400 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const currentQ = quiz[currentQuestion];

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="flex items-center gap-2">
        {quiz.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentQuestion(index)}
            className={`flex-1 h-2 rounded-full transition-colors ${
              index === currentQuestion
                ? "bg-cyan-500"
                : selectedAnswers[index] !== null
                ? "bg-violet-500/50"
                : "bg-slate-700"
            }`}
          />
        ))}
      </div>

      {/* Question number */}
      <div className="text-sm text-slate-400">
        Question {currentQuestion + 1} of {quiz.length}
      </div>

      {/* Question */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50">
        <h3 className="text-xl text-white font-medium mb-6">{currentQ.q}</h3>

        {/* Options */}
        <div className="space-y-3">
          {currentQ.options.map((option, index) => {
            const isSelected = selectedAnswers[currentQuestion] === option;
            return (
              <button
                key={index}
                onClick={() => handleSelectAnswer(option)}
                className={`w-full p-4 rounded-xl text-left transition-all ${
                  isSelected
                    ? "bg-cyan-500/20 border-cyan-500/50 text-white"
                    : "bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-700/50 hover:text-white"
                } border`}
              >
                <span className="inline-flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-full border flex items-center justify-center text-sm ${
                      isSelected
                        ? "border-cyan-400 bg-cyan-500 text-white"
                        : "border-slate-600 text-slate-500"
                    }`}
                  >
                    {String.fromCharCode(65 + index)}
                  </span>
                  {option}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={currentQuestion === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            currentQuestion === 0
              ? "bg-slate-800/50 text-slate-600 cursor-not-allowed"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
          }`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Previous
        </button>

        {currentQuestion === quiz.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              allAnswered
                ? "bg-gradient-to-r from-cyan-500 to-violet-500 text-white hover:from-cyan-400 hover:to-violet-400"
                : "bg-slate-800/50 text-slate-600 cursor-not-allowed"
            }`}
          >
            Submit Quiz
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            Next
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

