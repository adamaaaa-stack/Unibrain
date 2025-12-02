"use client";

import { useState, useEffect } from "react";

// Type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

interface SpeechCoachProps {
  courseTitle: string;
  flashcards: { q: string; a: string }[];
}

interface FeedbackResult {
  correctedText: string;
  accuracy: number;
  feedback: string;
  pronunciationTips: string[];
}

export default function SpeechCoach({ courseTitle, flashcards }: SpeechCoachProps) {
  const [isListening, setIsListening] = useState(false);
  const [userText, setUserText] = useState("");
  const [currentCard, setCurrentCard] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [streak, setStreak] = useState(0);
  const [totalScore, setTotalScore] = useState(0);

  useEffect(() => {
    // Check if speech recognition is supported
    if (typeof window !== "undefined") {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognitionAPI) {
        setIsSupported(false);
      }
    }
  }, []);

  const startListening = () => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      alert("Speech recognition is not supported in your browser. Try Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
      setFeedback(null);
      setUserText("");
    };

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setUserText(transcript);
      setIsListening(false);
      
      // Evaluate with AI
      await evaluateSpeech(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      if (event.error === "not-allowed") {
        alert("Please allow microphone access to use this feature.");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const evaluateSpeech = async (transcript: string) => {
    setIsProcessing(true);
    
    try {
      const expectedAnswer = flashcards[currentCard]?.a || "";
      
      const response = await fetch("/api/speech-evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userText: transcript,
          expectedAnswer,
          question: flashcards[currentCard]?.q || "",
        }),
      });

      if (!response.ok) throw new Error("Failed to evaluate");

      const data = await response.json();
      setFeedback(data);
      
      // Update score and streak
      if (data.accuracy >= 80) {
        setStreak(s => s + 1);
        setTotalScore(s => s + data.accuracy);
      } else {
        setStreak(0);
      }
    } catch (error) {
      console.error("Evaluation error:", error);
      setFeedback({
        correctedText: "",
        accuracy: 0,
        feedback: "Failed to evaluate. Please try again.",
        pronunciationTips: [],
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const nextCard = () => {
    if (currentCard < flashcards.length - 1) {
      setCurrentCard(c => c + 1);
      setFeedback(null);
      setUserText("");
    }
  };

  const prevCard = () => {
    if (currentCard > 0) {
      setCurrentCard(c => c - 1);
      setFeedback(null);
      setUserText("");
    }
  };

  if (!isSupported) {
    return (
      <div className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700/50 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Browser Not Supported</h3>
        <p className="text-slate-400">Speech recognition requires Chrome, Edge, or Safari. Please switch browsers to use this feature.</p>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700/50 text-center">
        <p className="text-slate-400">No flashcards available for speech practice.</p>
      </div>
    );
  }

  const card = flashcards[currentCard];

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400">{currentCard + 1}/{flashcards.length}</div>
            <div className="text-xs text-slate-500">Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-violet-400 flex items-center gap-1">
              🔥 {streak}
            </div>
            <div className="text-xs text-slate-500">Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400">
              {totalScore > 0 ? Math.round(totalScore / Math.max(currentCard, 1)) : 0}%
            </div>
            <div className="text-xs text-slate-500">Avg Score</div>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-violet-500/10 border border-slate-700/50">
        <p className="text-sm text-cyan-400 mb-2">Question:</p>
        <h3 className="text-xl text-white font-medium">{card.q}</h3>
        <p className="text-sm text-slate-500 mt-4">Speak the answer aloud:</p>
        <p className="text-slate-400 mt-1 italic">&quot;{card.a}&quot;</p>
      </div>

      {/* Microphone Button */}
      <div className="flex justify-center">
        <button
          onClick={startListening}
          disabled={isListening || isProcessing}
          className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all ${
            isListening
              ? "bg-red-500 animate-pulse"
              : isProcessing
              ? "bg-slate-600"
              : "bg-gradient-to-r from-cyan-500 to-violet-500 hover:scale-105"
          }`}
        >
          {isListening ? (
            <div className="flex flex-col items-center">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
              <span className="text-xs text-white mt-1">Listening...</span>
            </div>
          ) : isProcessing ? (
            <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>
      </div>

      <p className="text-center text-slate-500 text-sm">
        {isListening ? "Speak now..." : isProcessing ? "Evaluating..." : "Click the microphone and speak your answer"}
      </p>

      {/* User's Speech */}
      {userText && (
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <p className="text-sm text-slate-400 mb-1">You said:</p>
          <p className="text-white text-lg">&quot;{userText}&quot;</p>
        </div>
      )}

      {/* AI Feedback */}
      {feedback && (
        <div className="space-y-4">
          {/* Accuracy Score */}
          <div className={`p-6 rounded-xl border ${
            feedback.accuracy >= 80 
              ? "bg-emerald-500/10 border-emerald-500/30" 
              : feedback.accuracy >= 50 
              ? "bg-amber-500/10 border-amber-500/30"
              : "bg-red-500/10 border-red-500/30"
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-white">Accuracy Score</h4>
              <div className={`text-3xl font-bold ${
                feedback.accuracy >= 80 ? "text-emerald-400" : 
                feedback.accuracy >= 50 ? "text-amber-400" : "text-red-400"
              }`}>
                {feedback.accuracy}%
              </div>
            </div>
            <div className="h-3 rounded-full bg-slate-700 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${
                  feedback.accuracy >= 80 ? "bg-emerald-500" : 
                  feedback.accuracy >= 50 ? "bg-amber-500" : "bg-red-500"
                }`}
                style={{ width: `${feedback.accuracy}%` }}
              />
            </div>
          </div>

          {/* Corrected Text */}
          {feedback.correctedText && (
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <p className="text-sm text-cyan-400 mb-1">✓ Correct answer:</p>
              <p className="text-white">{feedback.correctedText}</p>
            </div>
          )}

          {/* Feedback */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <p className="text-sm text-violet-400 mb-1">💡 Feedback:</p>
            <p className="text-slate-300">{feedback.feedback}</p>
          </div>

          {/* Pronunciation Tips */}
          {feedback.pronunciationTips && feedback.pronunciationTips.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <p className="text-sm text-fuchsia-400 mb-2">🗣️ Pronunciation Tips:</p>
              <ul className="space-y-1">
                {feedback.pronunciationTips.map((tip, index) => (
                  <li key={index} className="text-slate-300 text-sm flex items-start gap-2">
                    <span className="text-fuchsia-400">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button
          onClick={prevCard}
          disabled={currentCard === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>
        <button
          onClick={nextCard}
          disabled={currentCard === flashcards.length - 1}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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

