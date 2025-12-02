"use client";

import { useState, useEffect } from "react";
import { Flashcard } from "@/lib/types";

interface LearnModeProps {
  flashcards: Flashcard[];
}

interface CardState {
  card: Flashcard;
  mastery: number; // 0-100
  timesCorrect: number;
  timesIncorrect: number;
  lastSeen: number;
}

export default function LearnMode({ flashcards }: LearnModeProps) {
  const [cardStates, setCardStates] = useState<CardState[]>([]);
  const [currentCard, setCurrentCard] = useState<CardState | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [cardsStudied, setCardsStudied] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);

  // Initialize cards
  useEffect(() => {
    const states: CardState[] = flashcards.map((card) => ({
      card,
      mastery: 0,
      timesCorrect: 0,
      timesIncorrect: 0,
      lastSeen: 0,
    }));
    setCardStates(states);
    pickNextCard(states);
  }, [flashcards]);

  const pickNextCard = (states: CardState[]) => {
    // Prioritize cards with lower mastery and haven't been seen recently
    const unmastered = states.filter(s => s.mastery < 100);
    
    if (unmastered.length === 0) {
      setSessionComplete(true);
      return;
    }

    // Weight by inverse mastery (lower mastery = higher chance)
    const weighted = unmastered.map(s => ({
      ...s,
      weight: (100 - s.mastery) + Math.random() * 20,
    }));

    weighted.sort((a, b) => b.weight - a.weight);
    setCurrentCard(weighted[0]);
    setShowAnswer(false);
  };

  const handleResponse = (knew: boolean) => {
    if (!currentCard) return;

    const updatedStates = cardStates.map(s => {
      if (s.card === currentCard.card) {
        const newMastery = knew
          ? Math.min(100, s.mastery + 25)
          : Math.max(0, s.mastery - 15);
        
        return {
          ...s,
          mastery: newMastery,
          timesCorrect: knew ? s.timesCorrect + 1 : s.timesCorrect,
          timesIncorrect: knew ? s.timesIncorrect : s.timesIncorrect + 1,
          lastSeen: Date.now(),
        };
      }
      return s;
    });

    setCardStates(updatedStates);
    setCardsStudied(cardsStudied + 1);
    
    if (knew) {
      setCorrectCount(correctCount + 1);
      setStreak(streak + 1);
    } else {
      setStreak(0);
    }

    // Check if session should end (studied each card at least once and average mastery > 70)
    const avgMastery = updatedStates.reduce((sum, s) => sum + s.mastery, 0) / updatedStates.length;
    const allSeen = updatedStates.every(s => s.lastSeen > 0);
    
    if (allSeen && avgMastery >= 80) {
      setSessionComplete(true);
    } else {
      pickNextCard(updatedStates);
    }
  };

  const handleRestart = () => {
    const states: CardState[] = flashcards.map((card) => ({
      card,
      mastery: 0,
      timesCorrect: 0,
      timesIncorrect: 0,
      lastSeen: 0,
    }));
    setCardStates(states);
    setSessionComplete(false);
    setCardsStudied(0);
    setCorrectCount(0);
    setStreak(0);
    pickNextCard(states);
  };

  if (flashcards.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        No flashcards available
      </div>
    );
  }

  if (sessionComplete) {
    const avgMastery = Math.round(cardStates.reduce((sum, s) => sum + s.mastery, 0) / cardStates.length);
    const accuracy = cardsStudied > 0 ? Math.round((correctCount / cardsStudied) * 100) : 0;

    return (
      <div className="space-y-8">
        {/* Celebration */}
        <div className="text-center py-8 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30">
          <div className="text-6xl mb-4">🎓</div>
          <h2 className="text-3xl font-bold text-white mb-2">Session Complete!</h2>
          <p className="text-slate-400">You&apos;ve mastered this material</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center">
            <div className="text-3xl font-bold text-cyan-400">{avgMastery}%</div>
            <div className="text-xs text-slate-500 mt-1">Mastery</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center">
            <div className="text-3xl font-bold text-violet-400">{cardsStudied}</div>
            <div className="text-xs text-slate-500 mt-1">Cards Reviewed</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center">
            <div className="text-3xl font-bold text-emerald-400">{accuracy}%</div>
            <div className="text-xs text-slate-500 mt-1">Accuracy</div>
          </div>
        </div>

        {/* Card breakdown */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Card Mastery</h3>
          {cardStates.map((state, index) => (
            <div key={index} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white text-sm font-medium truncate flex-1 mr-4">{state.card.q}</p>
                <span className="text-cyan-400 font-bold">{state.mastery}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all"
                  style={{ width: `${state.mastery}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={handleRestart}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-medium hover:from-cyan-400 hover:to-violet-400 transition-all"
          >
            Study Again
          </button>
        </div>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="text-center py-12">
        <div className="spinner mx-auto" />
      </div>
    );
  }

  const avgMastery = Math.round(cardStates.reduce((sum, s) => sum + s.mastery, 0) / cardStates.length);

  return (
    <div className="space-y-6">
      {/* Progress header */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
        <div className="flex items-center gap-6">
          <div className="text-sm">
            <span className="text-slate-500">Mastery: </span>
            <span className="text-cyan-400 font-bold">{avgMastery}%</span>
          </div>
          <div className="text-sm">
            <span className="text-slate-500">Studied: </span>
            <span className="text-violet-400 font-bold">{cardsStudied}</span>
          </div>
          {streak > 2 && (
            <div className="text-sm">
              <span className="text-orange-400 font-bold">🔥 {streak} streak!</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Card mastery:</span>
          <div className="w-20 h-2 rounded-full bg-slate-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all"
              style={{ width: `${currentCard.mastery}%` }}
            />
          </div>
        </div>
      </div>

      {/* Card */}
      <div
        onClick={() => !showAnswer && setShowAnswer(true)}
        className="min-h-[300px] p-8 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 cursor-pointer hover:border-cyan-500/30 transition-all"
      >
        <div className="h-full flex flex-col items-center justify-center text-center">
          {!showAnswer ? (
            <>
              <span className="text-xs text-cyan-400 uppercase tracking-wider mb-4">Question</span>
              <p className="text-2xl text-white font-medium leading-relaxed">{currentCard.card.q}</p>
              <p className="text-slate-500 text-sm mt-8">Click to reveal answer</p>
            </>
          ) : (
            <>
              <span className="text-xs text-violet-400 uppercase tracking-wider mb-4">Answer</span>
              <p className="text-2xl text-white font-medium leading-relaxed">{currentCard.card.a}</p>
            </>
          )}
        </div>
      </div>

      {/* Response buttons */}
      {showAnswer && (
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleResponse(false)}
            className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-medium hover:bg-red-500/20 transition-all"
          >
            <div className="text-2xl mb-1">😕</div>
            <div>Still learning</div>
          </button>
          <button
            onClick={() => handleResponse(true)}
            className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 font-medium hover:bg-green-500/20 transition-all"
          >
            <div className="text-2xl mb-1">😊</div>
            <div>Got it!</div>
          </button>
        </div>
      )}

      {/* Hint */}
      {!showAnswer && (
        <p className="text-center text-xs text-slate-600">
          Think of the answer, then click to reveal and rate yourself
        </p>
      )}
    </div>
  );
}

