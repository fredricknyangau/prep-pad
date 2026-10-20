import { describe, it, expect } from 'vitest';
import { evaluateReadinessBand, windowLatest10Attempts } from '../src/lib/scoring';

describe('Readiness View Logic (readiness_by_topic)', () => {
  describe('Band Classification & Minimum Attempt Threshold', () => {
    it('returns "Not enough data" when attempt_count is less than 5', () => {
      expect(evaluateReadinessBand(1.0, 0)).toBe('Not enough data');
      expect(evaluateReadinessBand(1.0, 1)).toBe('Not enough data');
      expect(evaluateReadinessBand(1.0, 4)).toBe('Not enough data');
      expect(evaluateReadinessBand(0.2, 4)).toBe('Not enough data');
    });

    it('returns "Ready" when accuracy >= 0.80 with at least 5 attempts', () => {
      expect(evaluateReadinessBand(0.80, 5)).toBe('Ready');
      expect(evaluateReadinessBand(0.85, 10)).toBe('Ready');
      expect(evaluateReadinessBand(1.0, 8)).toBe('Ready');
    });

    it('returns "Borderline" when 0.60 <= accuracy < 0.80 with at least 5 attempts', () => {
      expect(evaluateReadinessBand(0.60, 5)).toBe('Borderline');
      expect(evaluateReadinessBand(0.70, 7)).toBe('Borderline');
      expect(evaluateReadinessBand(0.79, 10)).toBe('Borderline');
    });

    it('returns "Needs work" when accuracy < 0.60 with at least 5 attempts', () => {
      expect(evaluateReadinessBand(0.59, 5)).toBe('Needs work');
      expect(evaluateReadinessBand(0.40, 10)).toBe('Needs work');
      expect(evaluateReadinessBand(0.0, 6)).toBe('Needs work');
    });
  });

  describe('Windowing Logic (Latest 10 attempts per topic)', () => {
    it('selects exactly the latest 10 attempts ordered by created_at desc', () => {
      const attempts = [
        { id: 1, createdAt: '2026-10-01T10:00:00Z', isCorrect: false },
        { id: 2, createdAt: '2026-10-02T10:00:00Z', isCorrect: false },
        { id: 3, createdAt: '2026-10-03T10:00:00Z', isCorrect: false },
        { id: 4, createdAt: '2026-10-04T10:00:00Z', isCorrect: true },
        { id: 5, createdAt: '2026-10-05T10:00:00Z', isCorrect: true },
        { id: 6, createdAt: '2026-10-06T10:00:00Z', isCorrect: true },
        { id: 7, createdAt: '2026-10-07T10:00:00Z', isCorrect: true },
        { id: 8, createdAt: '2026-10-08T10:00:00Z', isCorrect: true },
        { id: 9, createdAt: '2026-10-09T10:00:00Z', isCorrect: true },
        { id: 10, createdAt: '2026-10-10T10:00:00Z', isCorrect: true },
        { id: 11, createdAt: '2026-10-11T10:00:00Z', isCorrect: true },
        { id: 12, createdAt: '2026-10-12T10:00:00Z', isCorrect: true },
        { id: 13, createdAt: '2026-10-13T10:00:00Z', isCorrect: true },
      ];

      const windowed = windowLatest10Attempts(attempts);
      expect(windowed.length).toBe(10);
      // The newest attempts (id 13 down to id 4) are retained
      expect(windowed[0].id).toBe(13);
      expect(windowed[9].id).toBe(4);
      // The oldest 3 attempts (ids 1, 2, 3) are excluded from the window
      expect(windowed.map((a) => a.id)).not.toContain(1);
      expect(windowed.map((a) => a.id)).not.toContain(2);
      expect(windowed.map((a) => a.id)).not.toContain(3);

      // In the windowed 10, all 10 are correct (100% accuracy)
      const correctInWindow = windowed.filter((a) => a.isCorrect).length;
      expect(correctInWindow).toBe(10);
      expect(evaluateReadinessBand(correctInWindow / 10, 10)).toBe('Ready');
    });
  });
});
