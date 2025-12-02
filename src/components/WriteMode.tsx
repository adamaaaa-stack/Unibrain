"use client";

import { useState, useEffect, useRef } from "react";
import { Flashcard } from "@/lib/types";

interface WriteModeProps {
  flashcards: Flashcard[];
}

interface CardResult {
  card: Flashcard;
  userAnswer: string;
  correct: boolean;
}

export default function WriteMode({ flashcards }: WriteModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [results, setResults] = useState<CardResult[]>([]);
  const [gameComplete, setGameComplete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentIndex]);

  if (flashcards.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        No flashcards available
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  const normalizeAnswer = (answer: string) => {
    return answer
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, " ");
  };

  const checkAnswer = () => {
    const normalizedUser = normalizeAnswer(userAnswer);
    const normalizedCorrect = normalizeAnswer(currentCard.a);
    
    // Check for exact match or high similarity
    const correct = normalizedUser === normalizedCorrect ||
      normalizedCorrect.includes(normalizedUser) ||
      normalizedUser.includes(normalizedCorrect) ||
      calculateSimilarity(normalizedUser, normalizedCorrect) > 0.8;

    setIsCorrect(correct);
    setShowResult(true);
    setResults([...results, { card: currentCard, userAnswer, correct }]);
  };

  const calculateSimilarity = (str1: string, str2: string) => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer("");
      setShowResult(false);
    } else {
      setGameComplete(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (showResult) {
        handleNext();
      } else if (userAnswer.trim()) {
        checkAnswer();
      }
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setUserAnswer("");
    setShowResult(false);
    setResults([]);
    setGameComplete(false);
  };

  const overrideCorrect = () => {
    const updatedResults = [...results];
    updatedResults[updatedResults.length - 1].correct = true;
    setResults(updatedResults);
    setIsCorrect(true);
  };

  if (gameComplete) {
    const correctCount = results.filter(r => r.correct).length;
    const accuracy = Math.round((correctCount / results.length) * 100);

    return (
      <div className="space-y-8">
        {/* Score card */}
        <div className="text-center py-8 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50">
          <div className="mb-4">
            <span className="text-6xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              {correctCount}/{results.length}
            </span>
          </div>
          <p className="text-xl text-slate-300 mb-2">
            {accuracy >= 90 ? "🌟 Outstanding!" : accuracy >= 70 ? "👏 Great job!" : accuracy >= 50 ? "👍 Good effort!" : "📚 Keep practicing!"}
          </p>
          <p className="text-slate-500">{accuracy}% accuracy</p>
        </div>

        {/* Results breakdown */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Review Your Answers</h3>
          {results.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border ${
                result.correct
                  ? "bg-green-500/10 border-green-500/30"
                  : "bg-red-500/10 border-red-500/30"
              }`}
            >
              <p className="text-white font-medium mb-2">{result.card.q}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Your answer: </span>
                  <span className={result.correct ? "text-green-400" : "text-red-400"}>
                    {result.userAnswer || "(empty)"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Correct: </span>
                  <span className="text-green-400">{result.card.a}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={handleRestart}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-medium hover:from-cyan-400 hover:to-violet-400 transition-all"
          >
            Practice Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="flex items-center gap-2">
        {flashcards.map((_, index) => (
          <div
            key={index}
            className={`flex-1 h-2 rounded-full transition-colors ${
              index < currentIndex
                ? results[index]?.correct
                  ? "bg-green-500"
                  : "bg-red-500"
                : index === currentIndex
                ? "bg-cyan-500"
                : "bg-slate-700"
            }`}
          />
        ))}
      </div>

      {/* Card counter */}
      <div className="text-sm text-slate-400">
        Card {currentIndex + 1} of {flashcards.length}
      </div>

      {/* Question card */}
      <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50">
        <div className="text-center mb-8">
          <span className="text-xs text-cyan-400 uppercase tracking-wider">Question</span>
          <p className="text-2xl text-white font-medium mt-2">{currentCard.q}</p>
        </div>

        {/* Answer input */}
        <div className="space-y-4">
          <input
            ref={inputRef}
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={showResult}
            placeholder="Type your answer..."
            className={`w-full px-4 py-4 rounded-xl text-center text-lg border focus:outline-none transition-all ${
              showResult
                ? isCorrect
                  ? "bg-green-500/10 border-green-500/50 text-green-300"
                  : "bg-red-500/10 border-red-500/50 text-red-300"
                : "bg-slate-900/50 border-slate-700 text-white focus:border-cyan-500"
            }`}
          />

          {showResult && (
            <div className={`p-4 rounded-xl ${isCorrect ? "bg-green-500/10" : "bg-slate-800/50"}`}>
              {isCorrect ? (
                <div className="flex items-center justify-center gap-2 text-green-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Correct!
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-slate-400 mb-2">Correct answer:</p>
                  <p className="text-white font-medium">{currentCard.a}</p>
                  <button
                    onClick={overrideCorrect}
                    className="mt-3 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Override: I was correct
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-4">
        {!showResult ? (
          <button
            onClick={checkAnswer}
            disabled={!userAnswer.trim()}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-medium hover:from-cyan-400 hover:to-violet-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Check Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-medium hover:from-cyan-400 hover:to-violet-400 transition-all"
          >
            {currentIndex < flashcards.length - 1 ? "Next Card" : "See Results"}
          </button>
        )}
      </div>

      {/* Keyboard hint */}
      <p className="text-center text-xs text-slate-600">
        Press Enter to {showResult ? "continue" : "check your answer"}
      </p>
    </div>
  );
}

