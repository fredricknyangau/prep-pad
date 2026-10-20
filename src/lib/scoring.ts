/**
 * Scoring and Readiness calculation utilities
 * Implements AZ-900 passing benchmarks and SQL readiness_by_topic rules.
 */

export interface TopicAttempt {
  topicId: string;
  isCorrect: boolean;
  createdAt?: string;
}

/**
 * Calculates percentage score rounded to integer.
 */
export function calculateAccuracy(correct: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((correct / total) * 100);
}

/**
 * AZ-900 Passing mark is 700 / 1000 (70%).
 */
export function isPassingScore(accuracyPct: number): boolean {
  return accuracyPct >= 70;
}

/**
 * Updates question streak (increments on correct, resets on incorrect).
 */
export function calculateStreak(currentStreak: number, isCorrect: boolean): number {
  return isCorrect ? currentStreak + 1 : 0;
}

/**
 * Flags topics with under 70% accuracy as weak areas requiring retry.
 */
export function identifyWeakTopics(attempts: TopicAttempt[]): string[] {
  const map: Record<string, { correct: number; total: number }> = {};
  for (const a of attempts) {
    if (!map[a.topicId]) {
      map[a.topicId] = { correct: 0, total: 0 };
    }
    map[a.topicId].total += 1;
    if (a.isCorrect) {
      map[a.topicId].correct += 1;
    }
  }

  return Object.entries(map)
    .filter(([_, stats]) => stats.total > 0 && stats.correct / stats.total < 0.7)
    .map(([topicId]) => topicId);
}

/**
 * Mirrors the CASE statement in supabase/migrations/0001_init.sql readiness_by_topic view:
 *   when attempt_count < 5    then 'Not enough data'
 *   when accuracy >= 0.80     then 'Ready'
 *   when accuracy >= 0.60     then 'Borderline'
 *   else                           'Needs work'
 */
export function evaluateReadinessBand(
  accuracyDecimal: number,
  attemptCount: number
): 'Not enough data' | 'Ready' | 'Borderline' | 'Needs work' {
  if (attemptCount < 5) {
    return 'Not enough data';
  }
  if (accuracyDecimal >= 0.8) {
    return 'Ready';
  }
  if (accuracyDecimal >= 0.6) {
    return 'Borderline';
  }
  return 'Needs work';
}

/**
 * Windowing simulation: isolates the latest 10 attempts per topic ordered by created_at desc.
 */
export function windowLatest10Attempts<T extends { createdAt: string }>(attempts: T[]): T[] {
  return [...attempts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);
}
