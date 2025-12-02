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

interface SpeechRubricProps {
  courseTitle: string;
  summary: string;
}

interface RubricCriterion {
  name: string;
  description: string;
  weight: number;
}

interface EvaluationScore {
  criterion: string;
  score: number;
  maxScore: number;
  feedback: string;
}

interface EvaluationResult {
  scores: EvaluationScore[];
  overallScore: number;
  overallFeedback: string;
  strengths: string[];
  improvements: string[];
}

const DEFAULT_RUBRIC: RubricCriterion[] = [
  { name: "Content Accuracy", description: "Correctness of information presented", weight: 25 },
  { name: "Organization", description: "Logical flow and structure of ideas", weight: 20 },
  { name: "Clarity", description: "Clear and understandable delivery", weight: 20 },
  { name: "Key Points", description: "Coverage of important concepts", weight: 20 },
  { name: "Vocabulary", description: "Use of appropriate terminology", weight: 15 },
];

export default function SpeechRubric({ courseTitle, summary }: SpeechRubricProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [recordingTime, setRecordingTime] = useState(0);
  const [rubric, setRubric] = useState<RubricCriterion[]>(DEFAULT_RUBRIC);
  const [customRubricText, setCustomRubricText] = useState("");
  const [showRubricEditor, setShowRubricEditor] = useState(false);
  const [useCustomRubric, setUseCustomRubric] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognitionAPI) {
        setIsSupported(false);
      }
    }
  }, []);

  useEffect(() => {
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      setCustomRubricText(text);
      setUseCustomRubric(true);
      setShowRubricEditor(false);
    } catch (error) {
      console.error("Error reading file:", error);
      alert("Could not read the file. Please try a .txt file with your rubric criteria.");
    }
  };

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
      // Controlled manually
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
      const rubricData = useCustomRubric ? customRubricText : JSON.stringify(rubric);

      const response = await fetch("/api/speech-rubric", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spokenText,
          rubricData,
          courseTitle,
          summary,
          useCustomRubric,
        }),
      });

      if (!response.ok) throw new Error("Failed to evaluate");

      const data = await response.json();
      setEvaluation(data);
    } catch (error) {
      console.error("Evaluation error:", error);
      setEvaluation({
        scores: [],
        overallScore: 0,
        overallFeedback: "Failed to evaluate. Please try again.",
        strengths: [],
        improvements: [],
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

  const getScoreColor = (score: number, max: number) => {
    const percentage = (score / max) * 100;
    if (percentage >= 80) return "text-emerald-400";
    if (percentage >= 60) return "text-amber-400";
    return "text-red-400";
  };

  const getScoreBgColor = (score: number, max: number) => {
    const percentage = (score / max) * 100;
    if (percentage >= 80) return "bg-emerald-500";
    if (percentage >= 60) return "bg-amber-500";
    return "bg-red-500";
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
      <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/10 to-pink-500/10 border border-slate-700/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Speech Practice with Rubric</h2>
            <p className="text-slate-400 text-sm">Get graded on specific criteria</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-800/50">
          <p className="text-sm text-orange-400 mb-1">Topic:</p>
          <h3 className="text-lg text-white font-medium">{courseTitle}</h3>
        </div>
      </div>

      {/* Rubric Section */}
      {!evaluation && (
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">Evaluation Rubric</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setShowRubricEditor(!showRubricEditor)}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                {showRubricEditor ? "Hide" : "Edit Rubric"}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".txt,.json"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Upload Rubric
              </button>
            </div>
          </div>

          {useCustomRubric ? (
            <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
              <p className="text-sm text-cyan-400 mb-1">📄 Custom Rubric Loaded</p>
              <p className="text-xs text-slate-400 truncate">{customRubricText.substring(0, 100)}...</p>
              <button
                onClick={() => {
                  setUseCustomRubric(false);
                  setCustomRubricText("");
                }}
                className="text-xs text-red-400 hover:text-red-300 mt-2"
              >
                Remove & Use Default
              </button>
            </div>
          ) : (
            <>
              {showRubricEditor ? (
                <div className="space-y-3">
                  {rubric.map((criterion, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/50">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={criterion.name}
                          onChange={(e) => {
                            const newRubric = [...rubric];
                            newRubric[index].name = e.target.value;
                            setRubric(newRubric);
                          }}
                          className="w-full bg-transparent text-white font-medium focus:outline-none"
                        />
                        <input
                          type="text"
                          value={criterion.description}
                          onChange={(e) => {
                            const newRubric = [...rubric];
                            newRubric[index].description = e.target.value;
                            setRubric(newRubric);
                          }}
                          className="w-full bg-transparent text-slate-400 text-sm focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={criterion.weight}
                          onChange={(e) => {
                            const newRubric = [...rubric];
                            newRubric[index].weight = parseInt(e.target.value) || 0;
                            setRubric(newRubric);
                          }}
                          className="w-12 px-2 py-1 rounded bg-slate-800 text-white text-center focus:outline-none"
                        />
                        <span className="text-slate-500 text-sm">pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {rubric.map((criterion, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/50">
                      <span className="text-slate-300 text-sm">{criterion.name}</span>
                      <span className="text-orange-400 text-sm font-medium">{criterion.weight} pts</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Recording Section */}
      {!evaluation && (
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isEvaluating}
              className={`relative w-32 h-32 rounded-full flex flex-col items-center justify-center transition-all ${
                isRecording
                  ? "bg-red-500 animate-pulse"
                  : isEvaluating
                  ? "bg-slate-600"
                  : "bg-gradient-to-r from-orange-500 to-pink-500 hover:scale-105"
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

          {isRecording && (
            <div className="text-3xl font-mono text-red-400">
              {formatTime(recordingTime)}
            </div>
          )}

          <p className="text-slate-500">
            {isRecording
              ? "Deliver your speech... Click to stop when done"
              : isEvaluating
              ? "Grading your speech..."
              : "Click to start your speech presentation"
            }
          </p>

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
          {/* Overall Score */}
          <div className={`p-6 rounded-2xl border ${
            evaluation.overallScore >= 80
              ? "bg-emerald-500/10 border-emerald-500/30"
              : evaluation.overallScore >= 60
              ? "bg-amber-500/10 border-amber-500/30"
              : "bg-red-500/10 border-red-500/30"
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-white">Overall Grade</h4>
                <p className="text-sm text-slate-400">Based on rubric criteria</p>
              </div>
              <div className={`text-5xl font-bold ${
                evaluation.overallScore >= 80 ? "text-emerald-400" :
                evaluation.overallScore >= 60 ? "text-amber-400" : "text-red-400"
              }`}>
                {evaluation.overallScore}%
              </div>
            </div>
            <div className="h-4 rounded-full bg-slate-700 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  evaluation.overallScore >= 80 ? "bg-emerald-500" :
                  evaluation.overallScore >= 60 ? "bg-amber-500" : "bg-red-500"
                }`}
                style={{ width: `${evaluation.overallScore}%` }}
              />
            </div>
          </div>

          {/* Criterion Scores */}
          {evaluation.scores.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <h4 className="text-lg font-medium text-white mb-4">📊 Rubric Breakdown</h4>
              <div className="space-y-4">
                {evaluation.scores.map((score, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">{score.criterion}</span>
                      <span className={`font-bold ${getScoreColor(score.score, score.maxScore)}`}>
                        {score.score}/{score.maxScore}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${getScoreBgColor(score.score, score.maxScore)}`}
                        style={{ width: `${(score.score / score.maxScore) * 100}%` }}
                      />
                    </div>
                    {score.feedback && (
                      <p className="text-xs text-slate-400">{score.feedback}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Your Speech */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <p className="text-sm text-slate-400 mb-2">📝 Your Speech:</p>
            <p className="text-white">&quot;{transcript}&quot;</p>
          </div>

          {/* Strengths */}
          {evaluation.strengths.length > 0 && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <p className="text-sm text-emerald-400 mb-2">💪 Strengths:</p>
              <ul className="space-y-1">
                {evaluation.strengths.map((strength, index) => (
                  <li key={index} className="text-slate-300 text-sm flex items-start gap-2">
                    <span className="text-emerald-400">✓</span>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Improvements */}
          {evaluation.improvements.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <p className="text-sm text-amber-400 mb-2">📈 Areas to Improve:</p>
              <ul className="space-y-1">
                {evaluation.improvements.map((improvement, index) => (
                  <li key={index} className="text-slate-300 text-sm flex items-start gap-2">
                    <span className="text-amber-400">→</span>
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Overall Feedback */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <p className="text-sm text-pink-400 mb-2">💬 Instructor Feedback:</p>
            <p className="text-slate-300">{evaluation.overallFeedback}</p>
          </div>

          {/* Try Again */}
          <div className="flex justify-center pt-4">
            <button
              onClick={resetAndTryAgain}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-medium hover:opacity-90 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Practice Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

