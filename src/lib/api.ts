import {
  supabase,
  getOrCreateSessionId,
} from './supabase';
import type {
  Topic,
  Question,
  ReadinessRow,
  QuizRun,
  QuizMode,
  AttemptRecord,
  Lesson,
  LessonProgress,
  LessonProgressStatus,
} from './supabase';

export { getOrCreateSessionId, getOrCreateAnonymousSession } from './supabase';
export type {
  Topic,
  QuestionOption,
  Question,
  ReadinessRow,
  QuizRun,
  QuizMode,
  AttemptRecord,
  Lesson,
  LessonProgress,
  LessonProgressStatus,
  KeyTerm,
  CheckYourselfQuestion,
} from './supabase';

/**
 * Storage helpers resilient to blocked cookies / private browsing / quota errors.
 */
function safeStorageGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeStorageSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Graceful degradation when localStorage is blocked
  }
}

function safeStorageRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Graceful degradation
  }
}

export const LESSONS_CONTENT_VERSION = 'v1_2026_01_14';

const STORAGE_KEY_ACTIVE_RUN = 'az900_active_run';
const STORAGE_KEY_RUN_ATTEMPTS = 'az900_active_run_attempts';
const STORAGE_KEY_PENDING_ANSWERS = 'az900_pending_answers';
const STORAGE_KEY_LESSON_PROGRESS = 'az900_lesson_progress';
const STORAGE_KEY_PENDING_LESSON_PROGRESS = 'az900_pending_lesson_progress';
const STORAGE_KEY_LESSONS_CACHE = 'az900_lessons_cache';

export interface PendingLessonProgress {
  sessionId: string;
  lessonId: string;
  status: LessonProgressStatus;
  timestamp: string;
}

type SyncListener = (pendingCount: number) => void;
const syncListeners: Set<SyncListener> = new Set();

function notifySyncListeners() {
  const count = getTotalPendingSyncCount();
  syncListeners.forEach((fn) => fn(count));
}

export function subscribeToSyncStatus(listener: SyncListener): () => void {
  syncListeners.add(listener);
  listener(getTotalPendingSyncCount());
  return () => syncListeners.delete(listener);
}

export function getPendingAnswerCount(): number {
  const pending = safeStorageGet<AttemptRecord[]>(STORAGE_KEY_PENDING_ANSWERS, []);
  return pending.length;
}

export function getPendingLessonProgressCount(): number {
  const pending = safeStorageGet<PendingLessonProgress[]>(STORAGE_KEY_PENDING_LESSON_PROGRESS, []);
  return pending.length;
}

export function getTotalPendingSyncCount(): number {
  return getPendingAnswerCount() + getPendingLessonProgressCount();
}

// =============================================================================
// 1. Topics API
// =============================================================================

export interface DomainWithModules {
  domain: Topic;
  modules: Topic[];
}

export async function getTopics(): Promise<DomainWithModules[]> {
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  if (!data) return [];

  const domains = data.filter((t: Topic) => t.parent_id === null);
  return domains.map((d: Topic) => ({
    domain: d,
    modules: data.filter((m: Topic) => m.parent_id === d.id),
  }));
}

// =============================================================================
// 2. Questions API (Strict: reviewed_by_human = true ALWAYS)
// =============================================================================

export interface FetchQuestionsParams {
  mode: QuizMode;
  topicSlug?: string | null;
  weakTopicIds?: string[];
  missedQuestionIds?: string[];
  limit?: number;
}

export async function getQuestionsForQuiz(params: FetchQuestionsParams): Promise<Question[]> {
  const limit = params.limit ?? 10;
  let query = supabase
    .from('questions')
    .select('*')
    .eq('reviewed_by_human', true);

  if (params.mode === 'topic' && params.topicSlug) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.topicSlug);
    const topicQuery = supabase.from('topics').select('id, parent_id');
    const { data: topicData } = await (isUuid
      ? topicQuery.eq('id', params.topicSlug)
      : topicQuery.eq('slug', params.topicSlug)
    ).single();

    if (topicData) {
      if (topicData.parent_id === null) {
        // Domain row: get questions for child modules
        const { data: childModules } = await supabase
          .from('topics')
          .select('id')
          .eq('parent_id', topicData.id);

        const moduleIds = childModules?.map((m: { id: string }) => m.id) || [];
        query = query.in('topic_id', moduleIds);
      } else {
        // Module row: direct filter
        query = query.eq('topic_id', topicData.id);
      }
    }
  } else if (params.mode === 'weak' && params.weakTopicIds && params.weakTopicIds.length > 0) {
    query = query.in('topic_id', params.weakTopicIds);
  } else if (params.mode === 'missed' && params.missedQuestionIds && params.missedQuestionIds.length > 0) {
    query = query.in('id', params.missedQuestionIds);
  }

  const { data, error } = await query;
  if (error) throw error;
  if (!data || data.length === 0) return [];

  // Shuffle and slice to limit
  const shuffled = [...data].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, limit);
}

/**
 * Fetches questions by explicit IDs, preserving the exact order of the IDs array.
 * Ensures reviewed_by_human = true.
 */
export async function getQuestionsByIds(ids: string[]): Promise<Question[]> {
  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .in('id', ids)
    .eq('reviewed_by_human', true);

  if (error) throw error;
  if (!data) return [];

  const map = new Map<string, Question>();
  data.forEach((q: Question) => map.set(q.id, q));

  // Preserve original requested order
  return ids.map((id) => map.get(id)).filter(Boolean) as Question[];
}

// =============================================================================
// 3. Quiz Runs API (Autosave, Resume, Idempotency)
// =============================================================================

export async function createQuizRun(params: {
  mode: QuizMode;
  topicSlug?: string | null;
  questionIds: string[];
}): Promise<QuizRun> {
  const sessionId = getOrCreateSessionId();
  const runId = crypto.randomUUID();
  const now = new Date().toISOString();

  const newRun: QuizRun = {
    id: runId,
    session_id: sessionId,
    mode: params.mode,
    topic_slug: params.topicSlug || null,
    question_ids: params.questionIds,
    current_index: 0,
    status: 'in_progress',
    started_at: now,
    updated_at: now,
  };

  // Always mirror immediately to localStorage
  safeStorageSet(STORAGE_KEY_ACTIVE_RUN, newRun);
  safeStorageSet(STORAGE_KEY_RUN_ATTEMPTS, {});

  // Persist to Supabase if available
  try {
    const { error } = await supabase.from('quiz_runs').insert({
      id: newRun.id,
      session_id: newRun.session_id,
      mode: newRun.mode,
      topic_slug: newRun.topic_slug,
      question_ids: newRun.question_ids,
      current_index: newRun.current_index,
      status: newRun.status,
      started_at: newRun.started_at,
      updated_at: newRun.updated_at,
    });
    if (error) {
      console.warn('Could not persist quiz_runs to DB (will rely on local mirror until migration 0004 runs):', error.message);
    }
  } catch (err) {
    console.warn('Network error creating quiz run in DB:', err);
  }

  return newRun;
}

export async function getActiveQuizRun(sessionId: string): Promise<QuizRun | null> {
  // 1. Check local mirror first for immediate response
  const localRun = safeStorageGet<QuizRun | null>(STORAGE_KEY_ACTIVE_RUN, null);

  // 2. Check remote database for truth
  try {
    const { data, error } = await supabase
      .from('quiz_runs')
      .select('*')
      .eq('session_id', sessionId)
      .eq('status', 'in_progress')
      .order('updated_at', { ascending: false })
      .limit(1);

    if (!error && data && data.length > 0) {
      const dbRun = data[0] as QuizRun;
      // Mirror to local
      safeStorageSet(STORAGE_KEY_ACTIVE_RUN, dbRun);
      return dbRun;
    }
  } catch (err) {
    console.warn('Could not query quiz_runs from DB:', err);
  }

  // Fall back to local mirror if in_progress and matches session
  if (localRun && localRun.session_id === sessionId && localRun.status === 'in_progress') {
    return localRun;
  }

  return null;
}

export async function updateQuizRun(
  runId: string,
  updates: Partial<Pick<QuizRun, 'current_index' | 'status'>>
): Promise<void> {
  const now = new Date().toISOString();

  // Update local mirror
  const activeRun = safeStorageGet<QuizRun | null>(STORAGE_KEY_ACTIVE_RUN, null);
  if (activeRun && activeRun.id === runId) {
    const updated = {
      ...activeRun,
      ...updates,
      updated_at: now,
    };
    safeStorageSet(STORAGE_KEY_ACTIVE_RUN, updated);
    if (updates.status === 'completed' || updates.status === 'abandoned') {
      // Clear active run if finished
      safeStorageRemove(STORAGE_KEY_ACTIVE_RUN);
      safeStorageRemove(STORAGE_KEY_RUN_ATTEMPTS);
    }
  }

  // Persist update to Supabase
  try {
    await supabase
      .from('quiz_runs')
      .update({
        ...updates,
        updated_at: now,
      })
      .eq('id', runId);
  } catch (err) {
    console.warn('Could not update quiz run in DB:', err);
  }
}

export async function abandonQuizRun(runId: string): Promise<void> {
  await updateQuizRun(runId, { status: 'abandoned' });
}

// =============================================================================
// 4. Attempts & Offline Idempotent Autosave
// =============================================================================

export interface RecordAnswerParams {
  runId: string;
  sessionId: string;
  questionId: string;
  topicId: string;
  chosenId: string;
  isCorrect: boolean;
}

export interface RecordAnswerResult {
  isDuplicate: boolean;
  savedLocally: boolean;
  synced: boolean;
}

export async function recordAnswer(params: RecordAnswerParams): Promise<RecordAnswerResult> {
  const answeredAt = new Date().toISOString();

  // 1. Idempotency check on local mirror: First answer wins; answers are locked.
  const attemptsMap = safeStorageGet<Record<string, AttemptRecord>>(STORAGE_KEY_RUN_ATTEMPTS, {});
  if (attemptsMap[params.questionId]) {
    // Already answered in this run: do NOT overwrite or double count!
    return { isDuplicate: true, savedLocally: true, synced: true };
  }

  // Record into active run local attempts
  const attemptRecord: AttemptRecord = {
    run_id: params.runId,
    session_id: params.sessionId,
    question_id: params.questionId,
    topic_id: params.topicId,
    chosen_id: params.chosenId,
    is_correct: params.isCorrect,
    answered_at: answeredAt,
  };
  attemptsMap[params.questionId] = attemptRecord;
  safeStorageSet(STORAGE_KEY_RUN_ATTEMPTS, attemptsMap);

  // 2. Offline / Network Sync check
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  if (!isOnline) {
    queuePendingAnswer(attemptRecord);
    notifySyncListeners();
    return { isDuplicate: false, savedLocally: true, synced: false };
  }

  // Try writing to Supabase
  try {
    // Attempt insert with run_id and onConflict
    const { error } = await supabase
      .from('attempts')
      .upsert(
        {
          run_id: params.runId,
          session_id: params.sessionId,
          question_id: params.questionId,
          topic_id: params.topicId,
          chosen_id: params.chosenId,
          is_correct: params.isCorrect,
          answered_at: answeredAt,
        },
        { onConflict: 'run_id,question_id', ignoreDuplicates: true }
      );

    if (error) {
      // If run_id column is not in DB yet (e.g. migration 0004 not run yet in Supabase)
      if (error.code === 'PGRST204') {
        // Fallback: insert standard legacy attempt so live scores and readiness calculate
        await supabase.from('attempts').insert({
          session_id: params.sessionId,
          question_id: params.questionId,
          topic_id: params.topicId,
          chosen_id: params.chosenId,
          is_correct: params.isCorrect,
        });
      } else {
        // Other DB error: queue for retry
        queuePendingAnswer(attemptRecord);
        notifySyncListeners();
        return { isDuplicate: false, savedLocally: true, synced: false };
      }
    }

    notifySyncListeners();
    return { isDuplicate: false, savedLocally: true, synced: true };
  } catch (err) {
    console.warn('Network error recording answer, queued offline:', err);
    queuePendingAnswer(attemptRecord);
    notifySyncListeners();
    return { isDuplicate: false, savedLocally: true, synced: false };
  }
}

function queuePendingAnswer(attempt: AttemptRecord) {
  const pending = safeStorageGet<AttemptRecord[]>(STORAGE_KEY_PENDING_ANSWERS, []);
  // Avoid duplicate queueing
  const exists = pending.some(
    (p) => p.run_id === attempt.run_id && p.question_id === attempt.question_id
  );
  if (!exists) {
    pending.push(attempt);
    safeStorageSet(STORAGE_KEY_PENDING_ANSWERS, pending);
  }
}

export async function flushPendingAnswers(): Promise<number> {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  if (!isOnline) return 0;

  const pending = safeStorageGet<AttemptRecord[]>(STORAGE_KEY_PENDING_ANSWERS, []);
  if (pending.length === 0) return 0;

  const remaining: AttemptRecord[] = [];
  let syncedCount = 0;

  for (const item of pending) {
    try {
      const { error } = await supabase.from('attempts').upsert(
        {
          run_id: item.run_id,
          session_id: item.session_id,
          question_id: item.question_id,
          topic_id: item.topic_id,
          chosen_id: item.chosen_id,
          is_correct: item.is_correct,
          answered_at: item.answered_at,
        },
        { onConflict: 'run_id,question_id', ignoreDuplicates: true }
      );

      if (error && error.code === 'PGRST204') {
        // Fallback without run_id
        await supabase.from('attempts').insert({
          session_id: item.session_id,
          question_id: item.question_id,
          topic_id: item.topic_id,
          chosen_id: item.chosen_id,
          is_correct: item.is_correct,
        });
        syncedCount++;
      } else if (error) {
        remaining.push(item);
      } else {
        syncedCount++;
      }
    } catch {
      remaining.push(item);
    }
  }

  safeStorageSet(STORAGE_KEY_PENDING_ANSWERS, remaining);
  notifySyncListeners();
  return syncedCount;
}

// Auto-register online listener to flush pending answers
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    flushPendingAnswers();
  });
}

/**
 * Returns saved attempts for a run, combining database rows and local mirror.
 */
export async function getAttemptsForRun(runId: string): Promise<Record<string, AttemptRecord>> {
  const result: Record<string, AttemptRecord> = {};

  // Check local mirror first
  const localMap = safeStorageGet<Record<string, AttemptRecord>>(STORAGE_KEY_RUN_ATTEMPTS, {});
  Object.values(localMap).forEach((a) => {
    if (a.run_id === runId) {
      result[a.question_id] = a;
    }
  });

  // Query Supabase for attempts with run_id
  try {
    const { data, error } = await supabase
      .from('attempts')
      .select('*')
      .eq('run_id', runId);

    if (!error && data) {
      data.forEach((row: AttemptRecord) => {
        result[row.question_id] = row;
      });
    }
  } catch (err) {
    console.warn('Could not query run attempts from DB:', err);
  }

  return result;
}

// =============================================================================
// 5. Readiness API
// =============================================================================

export async function getReadinessScores(sessionId: string): Promise<ReadinessRow[]> {
  const { data, error } = await supabase
    .from('readiness_by_topic')
    .select('*')
    .eq('session_id', sessionId);

  if (error) throw error;
  return (data || []) as ReadinessRow[];
}

// =============================================================================
// 6. Lessons & Learn Mode API (Strict: reviewed_by_human = true ALWAYS)
// =============================================================================

interface CachedLessonsEnvelope {
  version: string;
  cachedAt: number;
  lessons: Lesson[];
}

export function getLessonsCacheKey(topicId?: string): string {
  return `${STORAGE_KEY_LESSONS_CACHE}_${topicId || 'all'}_${LESSONS_CONTENT_VERSION}`;
}

export function getAllCachedLessons(): Lesson[] {
  const map = new Map<string, Lesson>();
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEY_LESSONS_CACHE)) {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            const list: Lesson[] = Array.isArray(parsed) ? parsed : (parsed?.lessons || []);
            list.forEach((l) => {
              if (l?.id) map.set(l.id, l);
            });
          } catch {
            // ignore malformed cache entry
          }
        }
      }
    }
  } catch {
    // localStorage blocked
  }
  return Array.from(map.values());
}

export async function getLessons(topicId?: string): Promise<Lesson[]> {
  const cacheKey = getLessonsCacheKey(topicId);
  const cachedEnvelope = safeStorageGet<CachedLessonsEnvelope | null>(cacheKey, null);
  const fallbackCached = safeStorageGet<Lesson[]>(STORAGE_KEY_LESSONS_CACHE, []);

  const cachedLessons: Lesson[] =
    cachedEnvelope?.lessons ||
    (topicId ? fallbackCached.filter((l) => l.topic_id === topicId) : fallbackCached);

  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  if (!isOnline) {
    return cachedLessons;
  }

  // Stale-while-revalidate: Fetch fresh reviewed lessons from Supabase
  try {
    let query = supabase
      .from('lessons')
      .select('*')
      .eq('reviewed_by_human', true)
      .order('position', { ascending: true });

    if (topicId) {
      query = query.eq('topic_id', topicId);
    }

    const { data, error } = await query;
    if (error) throw error;
    const freshLessons = (data || []) as Lesson[];

    // Save to versioned cache in localStorage (wrapped in try/catch via safeStorageSet)
    safeStorageSet<CachedLessonsEnvelope>(cacheKey, {
      version: LESSONS_CONTENT_VERSION,
      cachedAt: Date.now(),
      lessons: freshLessons,
    });

    // Also mirror to global list for cross-module lookup
    if (!topicId && freshLessons.length > 0) {
      safeStorageSet(STORAGE_KEY_LESSONS_CACHE, freshLessons);
    }

    return freshLessons;
  } catch (err) {
    console.warn('Could not load lessons from database, serving cached:', err);
    return cachedLessons;
  }
}

export async function getLessonBySlug(slug: string): Promise<Lesson | null> {
  // Check cached pool first
  const allCached = getAllCachedLessons();
  const cachedMatch = allCached.find((l) => l.slug === slug);

  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  if (!isOnline && cachedMatch) {
    return cachedMatch;
  }

  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('slug', slug)
      .eq('reviewed_by_human', true)
      .maybeSingle();

    if (error) throw error;
    if (data) {
      const lesson = data as Lesson;
      const cached = safeStorageGet<Lesson[]>(STORAGE_KEY_LESSONS_CACHE, []);
      const idx = cached.findIndex((l) => l.id === lesson.id);
      if (idx >= 0) cached[idx] = lesson;
      else cached.push(lesson);
      safeStorageSet(STORAGE_KEY_LESSONS_CACHE, cached);
      return lesson;
    }
  } catch (err) {
    console.warn(`Could not load lesson ${slug} from DB:`, err);
  }

  return cachedMatch || null;
}

export async function getLessonProgress(sessionId?: string): Promise<Record<string, LessonProgress>> {
  const sid = sessionId || getOrCreateSessionId();
  const localMap = safeStorageGet<Record<string, LessonProgress>>(STORAGE_KEY_LESSON_PROGRESS, {});

  try {
    const { data, error } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('session_id', sid);

    if (!error && data) {
      data.forEach((row: LessonProgress) => {
        // Merge with local, preserving completed status if local was completed
        if (!localMap[row.lesson_id] || row.status === 'completed') {
          localMap[row.lesson_id] = row;
        }
      });
      safeStorageSet(STORAGE_KEY_LESSON_PROGRESS, localMap);
    }
  } catch (err) {
    console.warn('Could not load lesson progress from DB:', err);
  }

  return localMap;
}

function queuePendingLessonProgress(item: PendingLessonProgress) {
  const pending = safeStorageGet<PendingLessonProgress[]>(STORAGE_KEY_PENDING_LESSON_PROGRESS, []);
  const existingIndex = pending.findIndex(
    (p) => p.lessonId === item.lessonId && p.sessionId === item.sessionId
  );
  if (existingIndex >= 0) {
    const existing = pending[existingIndex];
    // Rule: completed never downgrades to viewed
    const finalStatus: LessonProgressStatus =
      existing.status === 'completed' || item.status === 'completed' ? 'completed' : item.status;
    pending[existingIndex] = {
      ...existing,
      status: finalStatus,
      timestamp: item.timestamp,
    };
  } else {
    pending.push(item);
  }
  safeStorageSet(STORAGE_KEY_PENDING_LESSON_PROGRESS, pending);
}

export async function flushPendingLessonProgress(): Promise<number> {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  if (!isOnline) return 0;

  const pending = safeStorageGet<PendingLessonProgress[]>(STORAGE_KEY_PENDING_LESSON_PROGRESS, []);
  if (pending.length === 0) return 0;

  const remaining: PendingLessonProgress[] = [];
  let syncedCount = 0;

  for (const item of pending) {
    try {
      const { error } = await supabase.rpc('mark_lesson_progress', {
        p_lesson_id: item.lessonId,
        p_status: item.status,
      });

      if (error) {
        remaining.push(item);
      } else {
        syncedCount++;
      }
    } catch {
      remaining.push(item);
    }
  }

  safeStorageSet(STORAGE_KEY_PENDING_LESSON_PROGRESS, remaining);
  notifySyncListeners();
  return syncedCount;
}

export async function flushAllPending(): Promise<{ answers: number; lessonProgress: number }> {
  const [answers, lessonProgress] = await Promise.all([
    flushPendingAnswers(),
    flushPendingLessonProgress(),
  ]);
  return { answers, lessonProgress };
}

export async function markLessonProgress(
  lessonId: string,
  status: LessonProgressStatus,
  sessionId?: string
): Promise<LessonProgress> {
  const sid = sessionId || getOrCreateSessionId();
  const localMap = safeStorageGet<Record<string, LessonProgress>>(STORAGE_KEY_LESSON_PROGRESS, {});
  const existing = localMap[lessonId];

  // Rule: completed never downgrades to viewed
  const finalStatus: LessonProgressStatus =
    existing?.status === 'completed' ? 'completed' : status;
  const now = new Date().toISOString();

  const record: LessonProgress = {
    session_id: sid,
    lesson_id: lessonId,
    status: finalStatus,
    first_viewed_at: existing?.first_viewed_at || now,
    updated_at: now,
    completed_at: existing?.completed_at || (finalStatus === 'completed' ? now : null),
  };

  localMap[lessonId] = record;
  safeStorageSet(STORAGE_KEY_LESSON_PROGRESS, localMap);

  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  const pendingItem: PendingLessonProgress = {
    sessionId: sid,
    lessonId,
    status: finalStatus,
    timestamp: now,
  };

  if (!isOnline) {
    queuePendingLessonProgress(pendingItem);
    notifySyncListeners();
    return record;
  }

  // Sync to Supabase via RPC
  try {
    const { error } = await supabase.rpc('mark_lesson_progress', {
      p_lesson_id: lessonId,
      p_status: finalStatus,
    });
    if (error) {
      queuePendingLessonProgress(pendingItem);
    }
  } catch {
    queuePendingLessonProgress(pendingItem);
  }

  notifySyncListeners();
  return record;
}

export async function getReviewedQuestionCounts(): Promise<Record<string, number>> {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('topic_id')
      .eq('reviewed_by_human', true);

    if (error) throw error;
    const counts: Record<string, number> = {};
    (data || []).forEach((row: { topic_id: string }) => {
      counts[row.topic_id] = (counts[row.topic_id] || 0) + 1;
    });
    return counts;
  } catch (err) {
    console.warn('Could not load question counts from DB:', err);
    return {};
  }
}

export async function getWeakestTopicForStudy(
  sessionId: string
): Promise<{ topicId: string; topicTitle: string; accuracy: number } | null> {
  try {
    const scores = await getReadinessScores(sessionId);
    const moduleRows = scores.filter(
      (r) => r.topic_id !== null && r.attempt_count > 0 && r.accuracy !== undefined
    );
    if (moduleRows.length === 0) return null;

    // Sort by accuracy ascending
    moduleRows.sort((a, b) => a.accuracy - b.accuracy);
    const weakest = moduleRows[0];
    return {
      topicId: weakest.topic_id!,
      topicTitle: weakest.topic_title || 'Weakest Module',
      accuracy: weakest.accuracy,
    };
  } catch (err) {
    console.warn('Could not determine weakest topic:', err);
    return null;
  }
}

export async function getLessonForQuestion(
  question: { id: string; lesson_id?: string | null; skill_ref?: string }
): Promise<{ id: string; slug: string; title: string } | null> {
  // 1. Try local cache
  const allCached = getAllCachedLessons();
  if (question.lesson_id) {
    const found = allCached.find((l) => l.id === question.lesson_id);
    if (found) return { id: found.id, slug: found.slug, title: found.title };
  }
  if (question.skill_ref) {
    const found = allCached.find((l) => l.source_url === question.skill_ref);
    if (found) return { id: found.id, slug: found.slug, title: found.title };
  }

  // 2. Query DB
  try {
    if (question.lesson_id) {
      const { data } = await supabase
        .from('lessons')
        .select('id, slug, title')
        .eq('id', question.lesson_id)
        .eq('reviewed_by_human', true)
        .maybeSingle();
      if (data) return data;
    }

    if (question.skill_ref) {
      const { data } = await supabase
        .from('lessons')
        .select('id, slug, title')
        .eq('source_url', question.skill_ref)
        .eq('reviewed_by_human', true)
        .maybeSingle();
      if (data) return data;
    }
  } catch (err) {
    console.warn('Could not query lesson for question:', err);
  }

  return null;
}

export async function getFirstIncompleteLessonForTopic(
  topicId: string,
  sessionId?: string
): Promise<Lesson | null> {
  const sid = sessionId || getOrCreateSessionId();
  try {
    const [lessons, progress] = await Promise.all([
      getLessons(topicId),
      getLessonProgress(sid),
    ]);
    if (lessons.length === 0) return null;
    const uncompleted = lessons.find((l) => progress[l.id]?.status !== 'completed');
    return uncompleted || lessons[0];
  } catch (err) {
    console.warn('Could not get first incomplete lesson:', err);
    return null;
  }
}
