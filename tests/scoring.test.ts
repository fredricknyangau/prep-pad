import { describe, it, expect } from 'vitest';
import {
  calculateAccuracy,
  isPassingScore,
  calculateStreak,
  identifyWeakTopics,
} from '../src/lib/scoring';

describe('Scoring Logic', () => {
  it('calculates accuracy percentage accurately', () => {
    expect(calculateAccuracy(7, 10)).toBe(70);
    expect(calculateAccuracy(10, 10)).toBe(100);
    expect(calculateAccuracy(0, 10)).toBe(0);
    expect(calculateAccuracy(1, 3)).toBe(33);
    expect(calculateAccuracy(2, 3)).toBe(67);
    expect(calculateAccuracy(0, 0)).toBe(0);
  });

  it('evaluates passing benchmark at 70% (AZ-900 700/1000 standard)', () => {
    expect(isPassingScore(70)).toBe(true);
    expect(isPassingScore(75)).toBe(true);
    expect(isPassingScore(100)).toBe(true);
    expect(isPassingScore(69)).toBe(false);
    expect(isPassingScore(50)).toBe(false);
    expect(isPassingScore(0)).toBe(false);
  });

  it('increments streak on consecutive correct answers and resets on error', () => {
    let streak = 0;
    streak = calculateStreak(streak, true);
    expect(streak).toBe(1);

    streak = calculateStreak(streak, true);
    expect(streak).toBe(2);

    streak = calculateStreak(streak, true);
    expect(streak).toBe(3);

    streak = calculateStreak(streak, true);
    expect(streak).toBe(4);

    streak = calculateStreak(streak, true);
    expect(streak).toBe(5); // Wow moment trigger

    streak = calculateStreak(streak, false);
    expect(streak).toBe(0); // Reset
  });

  it('identifies weak topics with accuracy below 70%', () => {
    const attempts = [
      // Topic 1: 3/3 = 100% (Strong)
      { topicId: 'topic-cloud-basics', isCorrect: true },
      { topicId: 'topic-cloud-basics', isCorrect: true },
      { topicId: 'topic-cloud-basics', isCorrect: true },

      // Topic 2: 1/3 = 33% (Weak)
      { topicId: 'topic-networking', isCorrect: true },
      { topicId: 'topic-networking', isCorrect: false },
      { topicId: 'topic-networking', isCorrect: false },

      // Topic 3: 2/3 = 67% (Weak, < 70%)
      { topicId: 'topic-governance', isCorrect: true },
      { topicId: 'topic-governance', isCorrect: true },
      { topicId: 'topic-governance', isCorrect: false },
    ];

    const weakTopics = identifyWeakTopics(attempts);
    expect(weakTopics).toContain('topic-networking');
    expect(weakTopics).toContain('topic-governance');
    expect(weakTopics).not.toContain('topic-cloud-basics');
    expect(weakTopics.length).toBe(2);
  });
});
