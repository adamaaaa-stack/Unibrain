"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Course } from "@/lib/types";
import FlashcardList from "@/components/FlashcardList";
import QuizList from "@/components/QuizList";
import StudyGuide from "@/components/StudyGuide";
import KeyTerms from "@/components/KeyTerms";
import PracticeQuestions from "@/components/PracticeQuestions";
import StudyTips from "@/components/StudyTips";
import MatchGame from "@/components/MatchGame";
import WriteMode from "@/components/WriteMode";
import LearnMode from "@/components/LearnMode";
import AITutor from "@/components/AITutor";
import SpeechCoach from "@/components/SpeechCoach";
import TopicSpeaker from "@/components/TopicSpeaker";
import SpeechRubric from "@/components/SpeechRubric";

type TabType = "summary" | "guide" | "terms" | "flashcards" | "learn" | "write" | "match" | "quiz" | "practice" | "tips" | "tutor" | "speak" | "explain" | "present";

export default function CoursePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("summary");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchCourse() {
      if (!user || !courseId) return;

      try {
        const { data, error } = await supabase
          .from("courses")
          .select("*")
          .eq("id", courseId)
          .single();

        if (error) throw error;

        if (data) {
          // Verify the course belongs to the current user
          if (data.user_id !== user.id) {
            router.push("/dashboard");
            return;
          }
          setCourse(data as Course);
        } else {
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Error fetching course:", error);
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchCourse();
    }
  }, [user, courseId, router]);

  const handleDelete = async () => {
    if (!courseId) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", courseId);

      if (error) throw error;
      router.push("/dashboard");
    } catch (error) {
      console.error("Error deleting course:", error);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (authLoading || !user || loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl text-white mb-4">Course not found</h2>
          <Link
            href="/dashboard"
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const tabs: { id: TabType; label: string; icon: React.ReactNode; count?: number; badge?: string }[] = [
    {
      id: "summary",
      label: "Summary",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      id: "guide",
      label: "Guide",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      count: course.study_guide?.length,
    },
    {
      id: "terms",
      label: "Terms",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      count: course.key_terms?.length,
    },
    {
      id: "flashcards",
      label: "Cards",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      count: course.flashcards?.length,
    },
    {
      id: "learn",
      label: "Learn",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      badge: "AI",
    },
    {
      id: "write",
      label: "Write",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      ),
    },
    {
      id: "match",
      label: "Match",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
      badge: "🎮",
    },
    {
      id: "quiz",
      label: "Quiz",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      count: course.quiz?.length,
    },
    {
      id: "practice",
      label: "Practice",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      count: course.practice_questions?.length,
    },
    {
      id: "tips",
      label: "Tips",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      count: course.study_tips?.length,
    },
    {
      id: "tutor",
      label: "Tutor",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      badge: "AI",
    },
    {
      id: "speak",
      label: "Speak",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      ),
      badge: "🎤",
    },
    {
      id: "explain",
      label: "Explain",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      badge: "🧠",
    },
    {
      id: "present",
      label: "Present",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      badge: "📊",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{course.title}</h1>
            <p className="text-slate-400 text-sm">
              Created on{" "}
              {new Date(course.created_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 text-center">
          <div className="text-2xl font-bold text-cyan-400">{course.flashcards?.length || 0}</div>
          <div className="text-xs text-slate-500 mt-1">Flashcards</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 text-center">
          <div className="text-2xl font-bold text-violet-400">{course.quiz?.length || 0}</div>
          <div className="text-xs text-slate-500 mt-1">Quiz Questions</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 text-center">
          <div className="text-2xl font-bold text-fuchsia-400">{course.key_terms?.length || 0}</div>
          <div className="text-xs text-slate-500 mt-1">Key Terms</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 text-center">
          <div className="text-2xl font-bold text-emerald-400">{course.study_guide?.length || 0}</div>
          <div className="text-xs text-slate-500 mt-1">Guide Sections</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 p-1 rounded-xl bg-slate-800/30 border border-slate-700/50 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center justify-center gap-1.5 px-3 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-cyan-500 to-violet-500 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-700/50"
            }`}
          >
            {tab.icon}
            <span className="hidden lg:inline text-sm">{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.id ? "bg-white/20" : "bg-slate-700"
              }`}>
                {tab.count}
              </span>
            )}
            {tab.badge && (
              <span className={`absolute -top-1 -right-1 text-xs px-1 rounded ${
                tab.badge === "AI" 
                  ? "bg-gradient-to-r from-cyan-500 to-violet-500 text-white" 
                  : ""
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "summary" && (
          <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50">
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-lg">
              {course.summary}
            </p>
          </div>
        )}

        {activeTab === "guide" && (
          <StudyGuide sections={course.study_guide || []} />
        )}

        {activeTab === "terms" && (
          <KeyTerms terms={course.key_terms || []} />
        )}

        {activeTab === "flashcards" && (
          <FlashcardList flashcards={course.flashcards || []} />
        )}

        {activeTab === "learn" && (
          <LearnMode flashcards={course.flashcards || []} />
        )}

        {activeTab === "write" && (
          <WriteMode flashcards={course.flashcards || []} />
        )}

        {activeTab === "match" && (
          <MatchGame flashcards={course.flashcards || []} />
        )}

        {activeTab === "quiz" && (
          <QuizList quiz={course.quiz || []} />
        )}

        {activeTab === "practice" && (
          <PracticeQuestions questions={course.practice_questions || []} />
        )}

        {activeTab === "tips" && (
          <StudyTips tips={course.study_tips || []} />
        )}

        {activeTab === "tutor" && (
          <AITutor
            courseTitle={course.title}
            courseSummary={course.summary}
            flashcards={course.flashcards || []}
            keyTerms={course.key_terms || []}
          />
        )}

        {activeTab === "speak" && (
          <SpeechCoach
            courseTitle={course.title}
            flashcards={course.flashcards || []}
          />
        )}

        {activeTab === "explain" && (
          <TopicSpeaker
            courseTitle={course.title}
            summary={course.summary}
            keyTerms={course.key_terms || []}
            flashcards={course.flashcards || []}
          />
        )}

        {activeTab === "present" && (
          <SpeechRubric
            courseTitle={course.title}
            summary={course.summary}
          />
        )}

      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 p-6 rounded-2xl bg-slate-800 border border-slate-700">
            <h3 className="text-xl font-semibold text-white mb-2">Delete Course</h3>
            <p className="text-slate-400 mb-6">
              Are you sure you want to delete &quot;{course.title}&quot;? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-400 transition-colors disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
