"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { GeneratedCourse, UsageStats } from "@/lib/types";
import TextInputArea, { UploadedFile } from "@/components/TextInputArea";

export default function CreatePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [generatedCourse, setGeneratedCourse] = useState<GeneratedCourse | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"input" | "preview">("input");
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loadingUsage, setLoadingUsage] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Fetch usage stats
  useEffect(() => {
    async function fetchUsage() {
      if (!user) return;
      try {
        const response = await fetch(`/api/usage?userId=${user.id}`);
        const data = await response.json();
        setUsage(data);
      } catch (err) {
        console.error("Failed to fetch usage:", err);
      } finally {
        setLoadingUsage(false);
      }
    }
    if (user) {
      fetchUsage();
    }
  }, [user]);

  const handleGenerate = async () => {
    if (!title.trim()) {
      setError("Please enter a course title");
      return;
    }
    if (text.length < 10 && files.length === 0) {
      setError("Please enter some text or upload files to generate a course");
      return;
    }

    setError("");
    setGenerating(true);

    try {
      const response = await fetch("/api/generateCourse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          text,
          files: files.map(f => ({
            name: f.name,
            type: f.type,
            base64: f.base64,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate course");
      }

      setGeneratedCourse(data.course);
      setStep("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate course");
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!user || !generatedCourse) {
      setError("Please log in and generate a course first");
      return;
    }

    setSaving(true);
    setError("");

    try {
      console.log("Saving course for user:", user.id);
      
      const { data, error } = await supabase
        .from("courses")
        .insert({
          user_id: user.id,
          title,
          original_text: text || "(Generated from uploaded files)",
          summary: generatedCourse.summary,
          flashcards: generatedCourse.flashcards,
          quiz: generatedCourse.quiz,
          key_terms: generatedCourse.key_terms || [],
          study_guide: generatedCourse.study_guide || [],
          practice_questions: generatedCourse.practice_questions || [],
          study_tips: generatedCourse.study_tips || [],
        })
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(error.message || "Failed to save to database");
      }

      if (!data) {
        throw new Error("No data returned from database");
      }

      console.log("Course saved:", data.id);
      router.push(`/course/${data.id}`);
    } catch (err) {
      console.error("Save error:", err);
      const message = err instanceof Error ? err.message : "Failed to save course";
      setError(message);
      alert(`Error saving course: ${message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    setStep("input");
    setGeneratedCourse(null);
  };

  if (authLoading || !user || loadingUsage) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  const hasContent = text.length >= 10 || files.length > 0;
  const isAtLimit = usage && !usage.can_create_course;
  const filesLimit = usage?.plan === "pro" ? Infinity : 2;
  const isOverFileLimit = files.length > filesLimit;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-4 mb-12">
        <div
          className={`flex items-center gap-2 ${
            step === "input" ? "text-cyan-400" : "text-slate-500"
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step === "input"
                ? "bg-cyan-500 text-white"
                : "bg-slate-700 text-slate-400"
            }`}
          >
            1
          </div>
          <span className="hidden sm:inline font-medium">Input Content</span>
        </div>
        <div className="w-12 h-0.5 bg-slate-700" />
        <div
          className={`flex items-center gap-2 ${
            step === "preview" ? "text-cyan-400" : "text-slate-500"
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step === "preview"
                ? "bg-cyan-500 text-white"
                : "bg-slate-700 text-slate-400"
            }`}
          >
            2
          </div>
          <span className="hidden sm:inline font-medium">Preview & Save</span>
        </div>
      </div>

      {step === "input" ? (
        <>
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Create a New Course
            </h1>
            <p className="text-slate-400">
              Paste text, upload images, or add files - AI will generate your learning package
            </p>
          </div>

          {/* Usage limit banner */}
          {isAtLimit && (
            <div className="mb-6 p-6 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-amber-400 mb-1">
                    Monthly limit reached
                  </h3>
                  <p className="text-slate-400 text-sm">
                    You&apos;ve created {usage?.courses_this_month} of {usage?.courses_limit} free courses this month.
                    Upgrade to Pro for unlimited courses.
                  </p>
                </div>
                <Link
                  href="/pricing"
                  className="flex-shrink-0 px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-medium hover:from-cyan-400 hover:to-violet-400 transition-all"
                >
                  Upgrade to Pro
                </Link>
              </div>
            </div>
          )}


          {/* Usage indicator */}
          {usage && !isAtLimit && !usage.is_trial && usage.courses_limit !== -1 && (
            <div className="mb-6 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">
                  Courses this month: {usage.courses_this_month} / {usage.courses_limit}
                </span>
                <Link href="/pricing" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                  Upgrade for unlimited →
                </Link>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-700 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 transition-all"
                  style={{ width: `${Math.min((usage.courses_this_month / usage.courses_limit) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
              {error}
            </div>
          )}

          {/* Form */}
          <div className="space-y-6">
            {/* Title input */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Course Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Introduction to Machine Learning"
                className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
              />
            </div>

            {/* Text and file input */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Source Content
              </label>
              <TextInputArea
                value={text}
                onChange={setText}
                files={files}
                onFilesChange={setFiles}
              />
            </div>

            {/* File limit warning */}
            {isOverFileLimit && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm">
                Free plan allows {filesLimit} files per course. Remove some files or{" "}
                <Link href="/pricing" className="underline hover:text-amber-300">
                  upgrade to Pro
                </Link>{" "}
                for unlimited uploads.
              </div>
            )}

            {/* Generate button */}
            <div className="flex justify-end">
              <button
                onClick={handleGenerate}
                disabled={generating || !title.trim() || !hasContent || isAtLimit || isOverFileLimit}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-medium hover:from-cyan-400 hover:to-violet-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing & Generating...
                  </>
                ) : isAtLimit ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Upgrade to Continue
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    Generate Course
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Error in preview */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
              {error}
            </div>
          )}

          {/* Preview Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <svg
                className="w-5 h-5"
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
              Back to Edit
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-medium hover:from-cyan-400 hover:to-violet-400 transition-all disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Save Course
                </>
              )}
            </button>
          </div>

          {/* Preview Content */}
          {generatedCourse && (
            <div className="space-y-8">
              {/* Title */}
              <div>
                <h1 className="text-3xl font-bold text-white">{title}</h1>
              </div>

              {/* Summary */}
              <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-cyan-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Summary
                </h2>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {generatedCourse.summary}
                </p>
              </div>

              {/* Flashcards Preview */}
              <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-violet-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  Flashcards ({generatedCourse.flashcards.length})
                </h2>
                <div className="grid gap-3">
                  {generatedCourse.flashcards.slice(0, 3).map((card, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50"
                    >
                      <p className="text-sm text-cyan-400 mb-1">Question:</p>
                      <p className="text-slate-300 mb-2">{card.q}</p>
                      <p className="text-sm text-violet-400 mb-1">Answer:</p>
                      <p className="text-slate-300">{card.a}</p>
                    </div>
                  ))}
                  {generatedCourse.flashcards.length > 3 && (
                    <p className="text-center text-slate-500 text-sm">
                      +{generatedCourse.flashcards.length - 3} more flashcards
                    </p>
                  )}
                </div>
              </div>

              {/* Quiz Preview */}
              <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-fuchsia-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Quiz Questions ({generatedCourse.quiz.length})
                </h2>
                <div className="grid gap-3">
                  {generatedCourse.quiz.slice(0, 2).map((question, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50"
                    >
                      <p className="text-slate-300 mb-2">
                        {index + 1}. {question.q}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {question.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className={`px-3 py-2 rounded-lg text-sm ${
                              option === question.answer
                                ? "bg-green-500/20 border border-green-500/30 text-green-400"
                                : "bg-slate-800/50 border border-slate-700/50 text-slate-400"
                            }`}
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {generatedCourse.quiz.length > 2 && (
                    <p className="text-center text-slate-500 text-sm">
                      +{generatedCourse.quiz.length - 2} more questions
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
