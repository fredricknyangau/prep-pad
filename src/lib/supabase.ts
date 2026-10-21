import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Publishable Key is missing from environment variables (.env.local).');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Topic {
  id: string;
  slug: string;
  title: string;
  parent_id: string | null;
  sort_order: number;
}

export interface QuestionOption {
  id: string;
  text: string;
  is_correct: boolean;
  rationale: string;
  explanation?: string;
  explanation_word_count?: number;
}

export interface Question {
  id: string;
  topic_id: string;
  skill_ref: string;
  difficulty: number;
  question: string;
  options: QuestionOption[];
  summary: string;
  explain_simply?: {
    azure_term: string;
    analogy: string;
    key_takeaway: string;
  };
  reviewed_by_human: boolean;
  lesson_id?: string | null;
}

export interface KeyTerm {
  term: string;
  definition: string;
}

export interface CheckYourselfQuestion {
  q: string;
  a: string;
}

export interface Lesson {
  id: string;
  slug: string;
  topic_id: string;
  position: number;
  title: string;
  summary: string;
  key_terms: KeyTerm[];
  real_example: string;
  exam_lens: string;
  common_distractor: string | null;
  memory_hook: string;
  check_yourself: CheckYourselfQuestion[];
  source_url: string;
  est_read_minutes: number;
  needs_verification: boolean;
  verify_note: string | null;
  reviewed_by_human: boolean;
  created_at?: string;
}

export type LessonProgressStatus = 'viewed' | 'completed';

export interface LessonProgress {
  session_id: string;
  lesson_id: string;
  status: LessonProgressStatus;
  first_viewed_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface ReadinessRow {
  session_id?: string;
  topic_id: string | null;
  topic_title?: string;
  domain_id?: string | null;
  attempt_count: number;
  correct_count: number;
  accuracy: number;
  band: string;
}

export type QuizMode = 'topic' | 'mixed' | 'weak' | 'missed';
export type QuizStatus = 'in_progress' | 'completed' | 'abandoned';

export interface QuizRun {
  id: string;
  session_id: string;
  mode: QuizMode;
  topic_slug: string | null;
  question_ids: string[];
  current_index: number;
  status: QuizStatus;
  started_at: string;
  updated_at: string;
}

export interface AttemptRecord {
  id?: string;
  run_id?: string | null;
  session_id: string;
  question_id: string;
  topic_id: string;
  chosen_id: string;
  is_correct: boolean;
  answered_at?: string;
  created_at?: string;
}

let inMemorySessionId: string | null = null;

/**
 * Retrieves or creates a client session ID persisted in localStorage.
 * Handles storage-blocked environments gracefully via in-memory fallback.
 */
export function getOrCreateSessionId(): string {
  const STORAGE_KEY = 'az900_session_id';
  try {
    let id = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('az900_anon_session_id');
    if (!id) {
      id = crypto.randomUUID();
    }
    localStorage.setItem(STORAGE_KEY, id);
    return id;
  } catch (err) {
    if (!inMemorySessionId) {
      inMemorySessionId = crypto.randomUUID();
    }
    return inMemorySessionId;
  }
}

/**
 * Backwards-compatible session getter.
 */
export async function getOrCreateAnonymousSession(): Promise<string | null> {
  return getOrCreateSessionId();
}
