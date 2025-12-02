"use client";

import { useState, useEffect } from "react";
import { Flashcard } from "@/lib/types";

interface MatchGameProps {
  flashcards: Flashcard[];
}

interface MatchItem {
  id: string;
  text: string;
  type: "question" | "answer";
  matched: boolean;
  originalIndex: number;
}

export default function MatchGame({ flashcards }: MatchGameProps) {
  const [items, setItems] = useState<MatchItem[]>([]);
  const [selected, setSelected] = useState<MatchItem | null>(null);
  const [wrongPair, setWrongPair] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Initialize game
  const initGame = () => {
    const limitedCards = flashcards.slice(0, 6); // Limit to 6 pairs for playability
    const gameItems: MatchItem[] = [];

    limitedCards.forEach((card, index) => {
      gameItems.push({
        id: `q-${index}`,
        text: card.q,
        type: "question",
        matched: false,
        originalIndex: index,
      });
      gameItems.push({
        id: `a-${index}`,
        text: card.a,
        type: "answer",
        matched: false,
        originalIndex: index,
      });
    });

    // Shuffle
    for (let i = gameItems.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [gameItems[i], gameItems[j]] = [gameItems[j], gameItems[i]];
    }

    setItems(gameItems);
    setSelected(null);
    setScore(0);
    setMoves(0);
    setGameComplete(false);
    setStartTime(Date.now());
    setElapsedTime(0);
    setWrongPair([]);
  };

  useEffect(() => {
    initGame();
  }, [flashcards]);

  // Timer
  useEffect(() => {
    if (!startTime || gameComplete) return;

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, gameComplete]);

  const handleClick = (item: MatchItem) => {
    if (item.matched || wrongPair.includes(item.id)) return;

    if (!selected) {
      setSelected(item);
    } else if (selected.id === item.id) {
      setSelected(null);
    } else {
      setMoves(moves + 1);

      // Check if match
      if (selected.originalIndex === item.originalIndex && selected.type !== item.type) {
        // Correct match!
        setItems(items.map(i => 
          i.originalIndex === item.originalIndex ? { ...i, matched: true } : i
        ));
        setScore(score + 1);
        setSelected(null);

        // Check if game complete
        const matchedCount = items.filter(i => i.matched).length + 2;
        if (matchedCount === items.length) {
          setGameComplete(true);
        }
      } else {
        // Wrong match
        setWrongPair([selected.id, item.id]);
        setTimeout(() => {
          setWrongPair([]);
          setSelected(null);
        }, 800);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (flashcards.length < 3) {
    return (
      <div className="text-center py-12 text-slate-400">
        Need at least 3 flashcards to play the match game
      </div>
    );
  }

  if (gameComplete) {
    const totalPairs = items.length / 2;
    const accuracy = Math.round((totalPairs / moves) * 100);

    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">🎉 Complete!</h2>
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto my-8">
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="text-2xl font-bold text-cyan-400">{formatTime(elapsedTime)}</div>
            <div className="text-xs text-slate-500">Time</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="text-2xl font-bold text-violet-400">{moves}</div>
            <div className="text-xs text-slate-500">Moves</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="text-2xl font-bold text-emerald-400">{accuracy}%</div>
            <div className="text-xs text-slate-500">Accuracy</div>
          </div>
        </div>
        <button
          onClick={initGame}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-medium hover:from-cyan-400 hover:to-violet-400 transition-all"
        >
          Play Again
        </button>
      </div>
    );
  }

  const questions = items.filter(i => i.type === "question");
  const answers = items.filter(i => i.type === "answer");

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
        <div className="flex items-center gap-6">
          <div className="text-sm">
            <span className="text-slate-500">Matches: </span>
            <span className="text-cyan-400 font-bold">{score}/{items.length / 2}</span>
          </div>
          <div className="text-sm">
            <span className="text-slate-500">Moves: </span>
            <span className="text-violet-400 font-bold">{moves}</span>
          </div>
        </div>
        <div className="text-lg font-mono text-white">{formatTime(elapsedTime)}</div>
      </div>

      {/* Game board */}
      <div className="grid grid-cols-2 gap-6">
        {/* Questions column */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-cyan-400 uppercase tracking-wider mb-4">Questions</h3>
          {questions.map((item) => (
            <button
              key={item.id}
              onClick={() => handleClick(item)}
              disabled={item.matched}
              className={`w-full p-4 rounded-xl text-left transition-all ${
                item.matched
                  ? "bg-green-500/20 border-green-500/50 text-green-300 opacity-50"
                  : wrongPair.includes(item.id)
                  ? "bg-red-500/20 border-red-500/50 text-red-300 animate-shake"
                  : selected?.id === item.id
                  ? "bg-cyan-500/20 border-cyan-500 text-white ring-2 ring-cyan-500"
                  : "bg-slate-800/50 border-slate-700/50 text-slate-300 hover:border-cyan-500/50 hover:bg-slate-700/50"
              } border`}
            >
              <p className="text-sm leading-relaxed">{item.text}</p>
            </button>
          ))}
        </div>

        {/* Answers column */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-violet-400 uppercase tracking-wider mb-4">Answers</h3>
          {answers.map((item) => (
            <button
              key={item.id}
              onClick={() => handleClick(item)}
              disabled={item.matched}
              className={`w-full p-4 rounded-xl text-left transition-all ${
                item.matched
                  ? "bg-green-500/20 border-green-500/50 text-green-300 opacity-50"
                  : wrongPair.includes(item.id)
                  ? "bg-red-500/20 border-red-500/50 text-red-300 animate-shake"
                  : selected?.id === item.id
                  ? "bg-violet-500/20 border-violet-500 text-white ring-2 ring-violet-500"
                  : "bg-slate-800/50 border-slate-700/50 text-slate-300 hover:border-violet-500/50 hover:bg-slate-700/50"
              } border`}
            >
              <p className="text-sm leading-relaxed">{item.text}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Reset button */}
      <div className="text-center">
        <button
          onClick={initGame}
          className="text-slate-400 hover:text-white transition-colors text-sm"
        >
          Restart Game
        </button>
      </div>
    </div>
  );
}

