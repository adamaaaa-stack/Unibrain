// UniBrain Type Definitions

export interface Flashcard {
  q: string;
  a: string;
}

export interface QuizQuestion {
  q: string;
  options: string[];
  answer: string;
}

export interface KeyTerm {
  term: string;
  definition: string;
}

export interface StudyGuideSection {
  title: string;
  content: string;
  keyPoints: string[];
}

export interface PracticeQuestion {
  question: string;
  hint?: string;
  sampleAnswer: string;
}

export interface Course {
  id?: string;
  user_id: string;
  title: string;
  original_text: string;
  summary: string;
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  key_terms?: KeyTerm[];
  study_guide?: StudyGuideSection[];
  practice_questions?: PracticeQuestion[];
  study_tips?: string[];
  created_at: string;
  updated_at: string;
}

export interface GeneratedCourse {
  summary: string;
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  key_terms: KeyTerm[];
  study_guide: StudyGuideSection[];
  practice_questions: PracticeQuestion[];
  study_tips: string[];
}

export interface User {
  id: string;
  email: string | null;
}

export type PlanType = "free" | "pro";

export interface Subscription {
  id?: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: PlanType;
  status: "active" | "canceled" | "past_due" | "incomplete" | "trialing";
  trial_ends_at: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface UsageStats {
  courses_this_month: number;
  plan: PlanType;
  courses_limit: number;
  can_create_course: boolean;
  is_trial: boolean;
  trial_days_left: number;
}
