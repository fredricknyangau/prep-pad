import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as api from '../src/lib/api';

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
}

if (!globalThis.localStorage) {
  Object.defineProperty(globalThis, 'localStorage', {
    value: new MockLocalStorage(),
    writable: true,
  });
}

describe('Quiz Runs, Autosave & Offline Idempotency', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('creates an active quiz run with fixed question order and status in_progress', async () => {
    const questionIds = ['q1-uuid', 'q2-uuid', 'q3-uuid'];
    const run = await api.createQuizRun({
      mode: 'mixed',
      questionIds,
    });

    expect(run).toBeDefined();
    expect(run.id).toBeDefined();
    expect(run.mode).toBe('mixed');
    expect(run.question_ids).toEqual(questionIds);
    expect(run.current_index).toBe(0);
    expect(run.status).toBe('in_progress');

    // Verify localStorage mirror
    const active = await api.getActiveQuizRun(run.session_id);
    expect(active).not.toBeNull();
    expect(active?.id).toBe(run.id);
    expect(active?.question_ids).toEqual(questionIds);
  });

  it('records an answer immediately and locks it against double-counting (idempotent)', async () => {
    const run = await api.createQuizRun({
      mode: 'topic',
      topicSlug: 'cloud-concepts',
      questionIds: ['q1', 'q2'],
    });

    // First answer submission
    const res1 = await api.recordAnswer({
      runId: run.id,
      sessionId: run.session_id,
      questionId: 'q1',
      topicId: 't1',
      chosenId: 'B',
      isCorrect: true,
    });

    expect(res1.isDuplicate).toBe(false);
    expect(res1.savedLocally).toBe(true);

    // Duplicate answer submission for same question in same run (double-tap or reload)
    const res2 = await api.recordAnswer({
      runId: run.id,
      sessionId: run.session_id,
      questionId: 'q1',
      topicId: 't1',
      chosenId: 'C', // Learner attempts to change or retry
      isCorrect: false,
    });

    expect(res2.isDuplicate).toBe(true); // Locked: first answer wins

    // Verify attempts map kept the initial choice
    const attempts = await api.getAttemptsForRun(run.id);
    expect(attempts['q1']).toBeDefined();
    expect(attempts['q1'].chosen_id).toBe('B');
    expect(attempts['q1'].is_correct).toBe(true);
  });

  it('queues answers offline and reports pending sync count', async () => {
    const run = await api.createQuizRun({
      mode: 'mixed',
      questionIds: ['q-offline-1', 'q-offline-2'],
    });

    // Simulate offline state
    const originalNavigator = global.navigator;
    Object.defineProperty(global, 'navigator', {
      value: { onLine: false },
      configurable: true,
    });

    expect(api.getPendingAnswerCount()).toBe(0);

    const res = await api.recordAnswer({
      runId: run.id,
      sessionId: run.session_id,
      questionId: 'q-offline-1',
      topicId: 't1',
      chosenId: 'A',
      isCorrect: true,
    });

    expect(res.savedLocally).toBe(true);
    expect(res.synced).toBe(false);
    expect(api.getPendingAnswerCount()).toBe(1);

    // Restore navigator
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      configurable: true,
    });
  });

  it('restores position and answered questions when resuming an in_progress run', async () => {
    const questionIds = ['q1', 'q2', 'q3', 'q4'];
    const run = await api.createQuizRun({
      mode: 'mixed',
      questionIds,
    });

    // Answer first 2 questions
    await api.recordAnswer({
      runId: run.id,
      sessionId: run.session_id,
      questionId: 'q1',
      topicId: 't1',
      chosenId: 'A',
      isCorrect: true,
    });

    await api.recordAnswer({
      runId: run.id,
      sessionId: run.session_id,
      questionId: 'q2',
      topicId: 't1',
      chosenId: 'D',
      isCorrect: false,
    });

    // Update progress index to 2 (question 3 of 4)
    await api.updateQuizRun(run.id, { current_index: 2, status: 'in_progress' });

    // Retrieve active run
    const resumed = await api.getActiveQuizRun(run.session_id);
    expect(resumed).not.toBeNull();
    expect(resumed?.current_index).toBe(2);
    expect(resumed?.question_ids).toEqual(questionIds);

    const savedAttempts = await api.getAttemptsForRun(run.id);
    expect(Object.keys(savedAttempts).length).toBe(2);
    expect(savedAttempts['q1'].chosen_id).toBe('A');
    expect(savedAttempts['q2'].chosen_id).toBe('D');
  });

  it('clears active run status when quiz run is completed or abandoned', async () => {
    const run = await api.createQuizRun({
      mode: 'topic',
      topicSlug: 'arch-mod1',
      questionIds: ['q1'],
    });

    expect(await api.getActiveQuizRun(run.session_id)).not.toBeNull();

    // Abandon the quiz run
    await api.abandonQuizRun(run.id);

    // Should no longer return as in_progress run
    const active = await api.getActiveQuizRun(run.session_id);
    expect(active).toBeNull();
  });
});
