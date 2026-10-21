import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as api from '../src/lib/api';
import type { Lesson } from '../src/lib/api';

class MockLocalStorage {
  private store: Record<string, string> = {};
  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }
  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }
  removeItem(key: string): void {
    delete this.store[key];
  }
  clear(): void {
    this.store = {};
  }
  key(index: number): string | null {
    return Object.keys(this.store)[index] ?? null;
  }
  get length(): number {
    return Object.keys(this.store).length;
  }
}

const mockStorage = new MockLocalStorage();
Object.defineProperty(global, 'localStorage', {
  value: mockStorage,
  writable: true,
  configurable: true,
});

describe('Learn, Check, Practice & Offline Resilience', () => {
  const dummyLesson: Lesson = {
    id: '11111111-2222-3333-4444-555555555555',
    slug: 'p1-m1-01-cloud-concepts',
    topic_id: 'aaaa1111-bbbb-cccc-dddd-eeeeffff0000',
    position: 1,
    title: 'Introduction to Cloud Computing',
    summary: 'Cloud computing overview.',
    key_terms: [{ term: 'Cloud Computing', definition: 'Delivery of computing services over the internet.' }],
    real_example: 'Running M-Pesa transaction processing servers in cloud data centers.',
    exam_lens: 'Focus on shared responsibility model.',
    common_distractor: 'Confusing IaaS with SaaS.',
    memory_hook: 'IaaS = Infrastructure, PaaS = Platform, SaaS = Software.',
    check_yourself: [
      { q: 'What is cloud computing?', a: 'Delivery of computing services over the internet.' },
      { q: 'What model provides full control over OS?', a: 'IaaS.' },
    ],
    source_url: 'https://learn.microsoft.com/en-us/training/modules/describe-cloud-compute/',
    est_read_minutes: 3,
    needs_verification: false,
    verify_note: null,
    reviewed_by_human: true,
  };

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('serves cached lessons offline keyed by content version', async () => {
    // Populate cache manually
    const cacheKey = api.getLessonsCacheKey();
    localStorage.setItem(
      cacheKey,
      JSON.stringify({
        version: api.LESSONS_CONTENT_VERSION,
        cachedAt: Date.now(),
        lessons: [dummyLesson],
      })
    );

    // Mock navigator.onLine = false
    Object.defineProperty(globalThis, 'navigator', {
      value: { onLine: false },
      writable: true,
      configurable: true,
    });

    const lessons = await api.getLessons();
    expect(lessons).toHaveLength(1);
    expect(lessons[0].slug).toBe('p1-m1-01-cloud-concepts');
    expect(lessons[0].title).toBe('Introduction to Cloud Computing');
  });

  it('queues lesson progress offline and never downgrades completed to viewed', async () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: { onLine: false },
      writable: true,
      configurable: true,
    });

    const sid = 'test-session-uuid';

    // 1. Mark completed
    const rec1 = await api.markLessonProgress(dummyLesson.id, 'completed', sid);
    expect(rec1.status).toBe('completed');
    expect(rec1.completed_at).toBeDefined();

    // Verify pending queue count increased
    expect(api.getPendingLessonProgressCount()).toBe(1);

    // 2. Mark viewed on the same completed lesson: must remain completed (never downgrade!)
    const rec2 = await api.markLessonProgress(dummyLesson.id, 'viewed', sid);
    expect(rec2.status).toBe('completed');

    // Progress record in local map stays completed
    const progressMap = await api.getLessonProgress(sid);
    expect(progressMap[dummyLesson.id].status).toBe('completed');
  });

  it('resolves linked lesson for questions via local cache and skill_ref', async () => {
    const cacheKey = api.getLessonsCacheKey();
    localStorage.setItem(
      cacheKey,
      JSON.stringify({
        version: api.LESSONS_CONTENT_VERSION,
        cachedAt: Date.now(),
        lessons: [dummyLesson],
      })
    );

    // Question with lesson_id
    const resolvedById = await api.getLessonForQuestion({
      id: 'q-uuid-1',
      lesson_id: dummyLesson.id,
    });
    expect(resolvedById).not.toBeNull();
    expect(resolvedById?.slug).toBe('p1-m1-01-cloud-concepts');
    expect(resolvedById?.title).toBe('Introduction to Cloud Computing');

    // Question with skill_ref matching source_url
    const resolvedBySkillRef = await api.getLessonForQuestion({
      id: 'q-uuid-2',
      skill_ref: dummyLesson.source_url,
    });
    expect(resolvedBySkillRef).not.toBeNull();
    expect(resolvedBySkillRef?.slug).toBe('p1-m1-01-cloud-concepts');
  });

  it('finds the first uncompleted lesson for a topic', async () => {
    const sid = 'test-session-2';
    const cacheKey = api.getLessonsCacheKey(dummyLesson.topic_id);
    localStorage.setItem(
      cacheKey,
      JSON.stringify({
        version: api.LESSONS_CONTENT_VERSION,
        cachedAt: Date.now(),
        lessons: [dummyLesson],
      })
    );

    Object.defineProperty(globalThis, 'navigator', {
      value: { onLine: false },
      writable: true,
      configurable: true,
    });

    const firstIncomplete = await api.getFirstIncompleteLessonForTopic(dummyLesson.topic_id, sid);
    expect(firstIncomplete).not.toBeNull();
    expect(firstIncomplete?.id).toBe(dummyLesson.id);
  });
});
