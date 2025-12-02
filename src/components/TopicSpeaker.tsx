"use client";

import { useState, useEffect, useRef } from "react";

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

interface TopicSpeakerProps {
  courseTitle: string;
  summary: string;
  keyTerms: { term: string; definition: string }[];
  flashcards: { q: string; a: string }[];
}

interface EvaluationResult {
  score: number;
  keyPointsCovered: string[];
  keyPointsMissed: string[];
  feedback: string;
  fluencyTips: string[];
  suggestedImprovements: string[];
}

export default function TopicSpeaker({ courseTitle, summary, keyTerms, flashcards }: TopicSpeakerProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [recordingTime, setRecordingTime] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognitionAPI) {
        setIsSupported(false);
      }
    }
  }, []);

  useEffect(() => {
    // Timer for recording duration
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(t => t + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const startRecording = () => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      alert("Speech recognition is not supported in your browser. Try Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onstart = () => {
      setIsRecording(true);
      setTranscript("");
      setInterimTranscript("");
      setEvaluation(null);
      setRecordingTime(0);
    };

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";
      
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript + " ";
        } else {
          interimText += result[0].transcript;
        }
      }
      
      if (finalText) {
        setTranscript(prev => prev + finalText);
      }
      setInterimTranscript(interimText);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        alert("Please allow microphone access to use this feature.");
      }
      setIsRecording(false);
    };

    recognition.onend = () => {
      // Don't set isRecording to false here - we control it manually
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopRecording = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    setInterimTranscript("");
    
    const finalTranscript = transcript + interimTranscript;
    if (finalTranscript.trim()) {
      setTranscript(finalTranscript);
      await evaluateSpeech(finalTranscript);
    }
  };

  const evaluateSpeech = async (spokenText: string) => {
    setIsEvaluating(true);
    
    try {
      // Build context from course materials
      const termsContext = keyTerms.map(t => `${t.term}: ${t.definition}`).join("\n");
      const flashcardsContext = flashcards.map(f => `Q: ${f.q} A: ${f.a}`).join("\n");
      
      const response = await fetch("/api/topic-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spokenText,
          courseTitle,
          summary,
          termsContext,
          flashcardsContext,
        }),
      });

      if (!response.ok) throw new Error("Failed to evaluate");

      const data = await response.json();
      setEvaluation(data);
      
      if (data.score > bestScore) {
        setBestScore(data.score);
      }
    } catch (error) {
      console.error("Evaluation error:", error);
      setEvaluation({
        score: 0,
        keyPointsCovered: [],
        keyPointsMissed: [],
        feedback: "Failed to evaluate. Please try again.",
        fluencyTips: [],
        suggestedImprovements: [],
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetAndTryAgain = () => {
    setTranscript("");
    setEvaluation(null);
    setRecordingTime(0);
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
        <p className="text-slate-400">Speech recognition requires Chrome, Edge, or Safari.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-fuchsia-500/10 to-cyan-500/10 border border-slate-700/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-500 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Topic Speaking Challenge</h2>
            <p className="text-slate-400 text-sm">Explain everything you know about this topic</p>
          </div>
        </div>
        
        <div className="p-4 rounded-xl bg-slate-800/50">
          <p className="text-sm text-cyan-400 mb-1">Topic:</p>
          <h3 className="text-lg text-white font-medium">{courseTitle}</h3>
        </div>

        {bestScore > 0 && (
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="text-slate-400">🏆 Best Score:</span>
            <span className="text-emerald-400 font-bold">{bestScore}%</span>
          </div>
        )}
      </div>

      {/* Recording Section */}
      {!evaluation && (
        <div className="text-center space-y-4">
          {/* Recording Button */}
          <div className="flex justify-center">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isEvaluating}
              className={`relative w-32 h-32 rounded-full flex flex-col items-center justify-center transition-all ${
                isRecording
                  ? "bg-red-500 animate-pulse"
                  : isEvaluating
                  ? "bg-slate-600"
                  : "bg-gradient-to-r from-fuchsia-500 to-cyan-500 hover:scale-105"
              }`}
            >
              {isRecording ? (
                <>
                  <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                  <span className="text-white text-sm mt-1">Stop</span>
                </>
              ) : isEvaluating ? (
                <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  <span className="text-white text-sm mt-1">Start</span>
                </>
              )}
            </button>
          </div>

          {/* Timer */}
          {isRecording && (
            <div className="text-3xl font-mono text-red-400">
              {formatTime(recordingTime)}
            </div>
          )}

          <p className="text-slate-500">
            {isRecording 
              ? "Speak about everything you know... Click to stop when done" 
              : isEvaluating 
              ? "Evaluating your response..." 
              : "Click the microphone and explain the topic in your own words"
            }
          </p>

          {/* Live Transcript */}
          {(transcript || interimTranscript) && (
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-left max-h-48 overflow-y-auto">
              <p className="text-sm text-slate-400 mb-2">Live transcript:</p>
              <p className="text-white">
                {transcript}
                <span className="text-slate-500">{interimTranscript}</span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Evaluation Results */}
      {evaluation && (
        <div className="space-y-4">
          {/* Score Card */}
          <div className={`p-6 rounded-2xl border ${
            evaluation.score >= 80 
              ? "bg-emerald-500/10 border-emerald-500/30" 
              : evaluation.score >= 50 
              ? "bg-amber-500/10 border-amber-500/30"
              : "bg-red-500/10 border-red-500/30"
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-white">Your Score</h4>
                <p className="text-sm text-slate-400">Based on content coverage & accuracy</p>
              </div>
              <div className={`text-5xl font-bold ${
                evaluation.score >= 80 ? "text-emerald-400" : 
                evaluation.score >= 50 ? "text-amber-400" : "text-red-400"
              }`}>
                {evaluation.score}%
              </div>
            </div>
            <div className="h-4 rounded-full bg-slate-700 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  evaluation.score >= 80 ? "bg-emerald-500" : 
                  evaluation.score >= 50 ? "bg-amber-500" : "bg-red-500"
                }`}
                style={{ width: `${evaluation.score}%` }}
              />
            </div>
          </div>

          {/* What You Said */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <p className="text-sm text-slate-400 mb-2">📝 What you said:</p>
            <p className="text-white">&quot;{transcript}&quot;</p>
          </div>

          {/* Key Points Covered */}
          {evaluation.keyPointsCovered.length > 0 && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <p className="text-sm text-emerald-400 mb-2">✅ Key Points Covered:</p>
              <ul className="space-y-1">
                {evaluation.keyPointsCovered.map((point, index) => (
                  <li key={index} className="text-slate-300 text-sm flex items-start gap-2">
                    <span className="text-emerald-400">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Key Points Missed */}
          {evaluation.keyPointsMissed.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <p className="text-sm text-amber-400 mb-2">⚠️ Key Points Missed:</p>
              <ul className="space-y-1">
                {evaluation.keyPointsMissed.map((point, index) => (
                  <li key={index} className="text-slate-300 text-sm flex items-start gap-2">
                    <span className="text-amber-400">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Feedback */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <p className="text-sm text-violet-400 mb-2">💡 Feedback:</p>
            <p className="text-slate-300">{evaluation.feedback}</p>
          </div>

          {/* Fluency Tips */}
          {evaluation.fluencyTips.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <p className="text-sm text-cyan-400 mb-2">🗣️ Speaking Tips:</p>
              <ul className="space-y-1">
                {evaluation.fluencyTips.map((tip, index) => (
                  <li key={index} className="text-slate-300 text-sm flex items-start gap-2">
                    <span className="text-cyan-400">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggested Improvements */}
          {evaluation.suggestedImprovements.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <p className="text-sm text-fuchsia-400 mb-2">📚 To Improve:</p>
              <ul className="space-y-1">
                {evaluation.suggestedImprovements.map((improvement, index) => (
                  <li key={index} className="text-slate-300 text-sm flex items-start gap-2">
                    <span className="text-fuchsia-400">•</span>
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Try Again Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={resetAndTryAgain}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white font-medium hover:opacity-90 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

