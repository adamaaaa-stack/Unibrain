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

interface LanguageSpeechProps {
  flashcards: { q: string; a: string }[];
  keyTerms: { term: string; definition: string }[];
}

interface EvaluationResult {
  pronunciationScore: number;
  accuracyScore: number;
  overallScore: number;
  whatYouSaid: string;
  correctPronunciation: string;
  feedback: string;
  pronunciationTips: string[];
  commonMistakes: string[];
}

const LANGUAGES = [
  { code: "es-ES", name: "Spanish", flag: "🇪🇸" },
  { code: "fr-FR", name: "French", flag: "🇫🇷" },
  { code: "de-DE", name: "German", flag: "🇩🇪" },
  { code: "it-IT", name: "Italian", flag: "🇮🇹" },
  { code: "pt-BR", name: "Portuguese", flag: "🇧🇷" },
  { code: "zh-CN", name: "Chinese", flag: "🇨🇳" },
  { code: "ja-JP", name: "Japanese", flag: "🇯🇵" },
  { code: "ko-KR", name: "Korean", flag: "🇰🇷" },
  { code: "ru-RU", name: "Russian", flag: "🇷🇺" },
  { code: "ar-SA", name: "Arabic", flag: "🇸🇦" },
  { code: "hi-IN", name: "Hindi", flag: "🇮🇳" },
  { code: "en-US", name: "English", flag: "🇺🇸" },
];

export default function LanguageSpeech({ flashcards, keyTerms }: LanguageSpeechProps) {
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0]);
  const [isListening, setIsListening] = useState(false);
  const [userText, setUserText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [mode, setMode] = useState<"terms" | "phrases">("terms");
  const [streak, setStreak] = useState(0);
  const [customPhrase, setCustomPhrase] = useState("");
  const [useCustomPhrase, setUseCustomPhrase] = useState(false);

  // Combine flashcards and key terms for practice
  const practiceItems = mode === "terms" 
    ? keyTerms.map(t => ({ text: t.term, translation: t.definition }))
    : flashcards.map(f => ({ text: f.a, translation: f.q }));

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognitionAPI) {
        setIsSupported(false);
      }
    }
  }, []);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = selectedLanguage.code;
      utterance.rate = 0.8; // Slightly slower for learning
      window.speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      alert("Speech recognition is not supported in your browser. Try Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = selectedLanguage.code;
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
      setEvaluation(null);
      setUserText("");
    };

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setUserText(transcript);
      setIsListening(false);
      
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
    
    const targetPhrase = useCustomPhrase 
      ? customPhrase 
      : (practiceItems[currentIndex]?.text || "");
    
    try {
      const response = await fetch("/api/language-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userSpeech: transcript,
          targetPhrase,
          language: selectedLanguage.name,
          languageCode: selectedLanguage.code,
        }),
      });

      if (!response.ok) throw new Error("Failed to evaluate");

      const data = await response.json();
      setEvaluation(data);
      
      if (data.overallScore >= 80) {
        setStreak(s => s + 1);
      } else {
        setStreak(0);
      }
    } catch (error) {
      console.error("Evaluation error:", error);
      setEvaluation({
        pronunciationScore: 0,
        accuracyScore: 0,
        overallScore: 0,
        whatYouSaid: transcript,
        correctPronunciation: targetPhrase,
        feedback: "Failed to evaluate. Please try again.",
        pronunciationTips: [],
        commonMistakes: [],
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const nextPhrase = () => {
    if (currentIndex < practiceItems.length - 1) {
      setCurrentIndex(i => i + 1);
      setEvaluation(null);
      setUserText("");
    }
  };

  const prevPhrase = () => {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1);
      setEvaluation(null);
      setUserText("");
    }
  };

  const currentItem = practiceItems[currentIndex];

  if (!isSupported) {
    return (
      <div className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700/50 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Browser Not Supported</h3>
        <p className="text-slate-400">Speech recognition requires Chrome, Edge, or Safari.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-teal-500/10 border border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center text-2xl">
              {selectedLanguage.flag}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Language Pronunciation</h2>
              <p className="text-slate-400 text-sm">Practice speaking in {selectedLanguage.name}</p>
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">🔥 {streak}</div>
            <div className="text-xs text-slate-500">Streak</div>
          </div>
        </div>

        {/* Language Selector */}
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setSelectedLanguage(lang)}
              className={`px-3 py-2 rounded-lg text-sm transition-all ${
                selectedLanguage.code === lang.code
                  ? "bg-gradient-to-r from-green-500 to-teal-500 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {lang.flag} {lang.name}
            </button>
          ))}
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2 p-1 rounded-xl bg-slate-800/50 border border-slate-700/50">
        <button
          onClick={() => { setMode("terms"); setUseCustomPhrase(false); setCurrentIndex(0); }}
          className={`flex-1 py-2 rounded-lg font-medium transition-all ${
            mode === "terms" && !useCustomPhrase
              ? "bg-gradient-to-r from-green-500 to-teal-500 text-white"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Key Terms ({keyTerms.length})
        </button>
        <button
          onClick={() => { setMode("phrases"); setUseCustomPhrase(false); setCurrentIndex(0); }}
          className={`flex-1 py-2 rounded-lg font-medium transition-all ${
            mode === "phrases" && !useCustomPhrase
              ? "bg-gradient-to-r from-green-500 to-teal-500 text-white"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Flashcard Answers ({flashcards.length})
        </button>
        <button
          onClick={() => setUseCustomPhrase(true)}
          className={`flex-1 py-2 rounded-lg font-medium transition-all ${
            useCustomPhrase
              ? "bg-gradient-to-r from-green-500 to-teal-500 text-white"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Custom Phrase
        </button>
      </div>

      {/* Phrase to Practice */}
      <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50">
        {useCustomPhrase ? (
          <div className="space-y-4">
            <label className="block text-sm text-slate-400">Enter a phrase to practice:</label>
            <input
              type="text"
              value={customPhrase}
              onChange={(e) => setCustomPhrase(e.target.value)}
              placeholder={`Type a ${selectedLanguage.name} phrase...`}
              className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-green-500"
            />
          </div>
        ) : currentItem ? (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500">
                {currentIndex + 1} / {practiceItems.length}
              </span>
              <button
                onClick={() => speakText(currentItem.text)}
                className="flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
                Listen
              </button>
            </div>
            <p className="text-3xl text-white font-medium text-center py-4">{currentItem.text}</p>
            <p className="text-center text-slate-400 text-sm">({currentItem.translation})</p>
          </>
        ) : (
          <p className="text-center text-slate-400">No phrases available. Add flashcards or key terms to your course.</p>
        )}
      </div>

      {/* Microphone Button */}
      {(currentItem || (useCustomPhrase && customPhrase)) && (
        <div className="flex justify-center">
          <button
            onClick={startListening}
            disabled={isListening || isProcessing}
            className={`relative w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all ${
              isListening
                ? "bg-red-500 animate-pulse"
                : isProcessing
                ? "bg-slate-600"
                : "bg-gradient-to-r from-green-500 to-teal-500 hover:scale-105"
            }`}
          >
            {isListening ? (
              <>
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
                <span className="text-xs text-white mt-1">Listening...</span>
              </>
            ) : isProcessing ? (
              <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <span className="text-xs text-white mt-1">Speak</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* User's Speech */}
      {userText && (
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <p className="text-sm text-slate-400 mb-1">You said:</p>
          <p className="text-xl text-white text-center">&quot;{userText}&quot;</p>
        </div>
      )}

      {/* Evaluation Results */}
      {evaluation && (
        <div className="space-y-4">
          {/* Scores */}
          <div className="grid grid-cols-3 gap-4">
            <div className={`p-4 rounded-xl text-center ${
              evaluation.pronunciationScore >= 80 ? "bg-emerald-500/10 border border-emerald-500/30" :
              evaluation.pronunciationScore >= 50 ? "bg-amber-500/10 border border-amber-500/30" :
              "bg-red-500/10 border border-red-500/30"
            }`}>
              <div className={`text-3xl font-bold ${
                evaluation.pronunciationScore >= 80 ? "text-emerald-400" :
                evaluation.pronunciationScore >= 50 ? "text-amber-400" : "text-red-400"
              }`}>
                {evaluation.pronunciationScore}%
              </div>
              <div className="text-xs text-slate-400 mt-1">Pronunciation</div>
            </div>
            <div className={`p-4 rounded-xl text-center ${
              evaluation.accuracyScore >= 80 ? "bg-emerald-500/10 border border-emerald-500/30" :
              evaluation.accuracyScore >= 50 ? "bg-amber-500/10 border border-amber-500/30" :
              "bg-red-500/10 border border-red-500/30"
            }`}>
              <div className={`text-3xl font-bold ${
                evaluation.accuracyScore >= 80 ? "text-emerald-400" :
                evaluation.accuracyScore >= 50 ? "text-amber-400" : "text-red-400"
              }`}>
                {evaluation.accuracyScore}%
              </div>
              <div className="text-xs text-slate-400 mt-1">Accuracy</div>
            </div>
            <div className={`p-4 rounded-xl text-center ${
              evaluation.overallScore >= 80 ? "bg-emerald-500/10 border border-emerald-500/30" :
              evaluation.overallScore >= 50 ? "bg-amber-500/10 border border-amber-500/30" :
              "bg-red-500/10 border border-red-500/30"
            }`}>
              <div className={`text-3xl font-bold ${
                evaluation.overallScore >= 80 ? "text-emerald-400" :
                evaluation.overallScore >= 50 ? "text-amber-400" : "text-red-400"
              }`}>
                {evaluation.overallScore}%
              </div>
              <div className="text-xs text-slate-400 mt-1">Overall</div>
            </div>
          </div>

          {/* Comparison */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-3">
            <div>
              <p className="text-sm text-red-400 mb-1">❌ What you said:</p>
              <p className="text-white">{evaluation.whatYouSaid}</p>
            </div>
            <div>
              <p className="text-sm text-emerald-400 mb-1">✅ Correct pronunciation:</p>
              <p className="text-white">{evaluation.correctPronunciation}</p>
              <button
                onClick={() => speakText(evaluation.correctPronunciation)}
                className="mt-2 text-sm text-green-400 hover:text-green-300 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
                Listen to correct pronunciation
              </button>
            </div>
          </div>

          {/* Feedback */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <p className="text-sm text-teal-400 mb-2">💬 Feedback:</p>
            <p className="text-slate-300">{evaluation.feedback}</p>
          </div>

          {/* Pronunciation Tips */}
          {evaluation.pronunciationTips.length > 0 && (
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
              <p className="text-sm text-green-400 mb-2">🗣️ Pronunciation Tips:</p>
              <ul className="space-y-1">
                {evaluation.pronunciationTips.map((tip, index) => (
                  <li key={index} className="text-slate-300 text-sm flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Common Mistakes */}
          {evaluation.commonMistakes.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <p className="text-sm text-amber-400 mb-2">⚠️ Watch out for:</p>
              <ul className="space-y-1">
                {evaluation.commonMistakes.map((mistake, index) => (
                  <li key={index} className="text-slate-300 text-sm flex items-start gap-2">
                    <span className="text-amber-400">•</span>
                    {mistake}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      {!useCustomPhrase && practiceItems.length > 0 && (
        <div className="flex justify-between pt-4">
          <button
            onClick={prevPhrase}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>
          <button
            onClick={nextPhrase}
            disabled={currentIndex === practiceItems.length - 1}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Next
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

