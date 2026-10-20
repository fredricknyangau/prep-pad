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
}

export interface ReadinessRow {
  topic_id: string;
  slug: string;
  title: string;
  parent_id: string | null;
  total_attempts: number;
  correct_attempts: number;
  accuracy: number;
  band: 'Not yet' | 'Getting there' | 'Likely ready' | 'Not enough data yet';
}

/**
 * Retrieves or creates a client session ID persisted in localStorage.
 * Since we access Supabase directly via the Publishable API key without user logins,
 * this persistent UUID isolates the candidate's quiz attempts and readiness scores.
 */
export function getOrCreateSessionId(): string {
  const STORAGE_KEY = 'az900_session_id';
  let id = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('az900_anon_session_id');
  if (!id) {
    id = crypto.randomUUID();
  }
  localStorage.setItem(STORAGE_KEY, id);
  return id;
}

/**
 * Backwards-compatible session getter.
 */
export async function getOrCreateAnonymousSession(): Promise<string | null> {
  return getOrCreateSessionId();
}
