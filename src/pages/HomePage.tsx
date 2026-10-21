import React, { useEffect, useState } from 'react';
import * as api from '../lib/api';
import type { QuizRun, QuizMode, Lesson } from '../lib/api';
import { Layers, Play, AlertCircle, Sparkles, RotateCcw, Trash2, ArrowRight, BookOpen } from 'lucide-react';

interface HomePageProps {
  onStartQuiz: (topicSlug: string | null, topicTitle: string, mode?: QuizMode) => void;
  onResumeQuiz: (run: QuizRun, title?: string) => void;
  onNavigateReadiness: () => void;
  onSelectLesson?: (slug: string) => void;
}

interface TopicProgress {
  accuracy: number;
  attempt_count: number;
  band: string;
}

interface PendingQuizRequest {
  topicSlug: string | null;
  topicTitle: string;
  mode: QuizMode;
}

export const HomePage: React.FC<HomePageProps> = ({
  onStartQuiz,
  onResumeQuiz,
  onNavigateReadiness,
  onSelectLesson,
}) => {
  const [domainGroups, setDomainGroups] = useState<api.DomainWithModules[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, TopicProgress>>({});
  const [activeRun, setActiveRun] = useState<QuizRun | null>(null);
  const [weakestStudyTarget, setWeakestStudyTarget] = useState<{
    topicId: string;
    topicSlug: string;
    topicTitle: string;
    accuracy: number;
    lesson: Lesson | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingQuizRequest, setPendingQuizRequest] = useState<PendingQuizRequest | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const sessionId = api.getOrCreateSessionId();

        // 1. Load active quiz run for resume card
        const run = await api.getActiveQuizRun(sessionId);
        setActiveRun(run);

        // 2. Load topics from api.ts
        const grouped = await api.getTopics();
        setDomainGroups(grouped);

        // 3. Load readiness progress for active session from api.ts
        const readinessData = await api.getReadinessScores(sessionId);
        if (readinessData) {
          const map: Record<string, TopicProgress> = {};
          readinessData.forEach((r) => {
            if (r.topic_id) {
              map[r.topic_id] = {
                accuracy: Number(r.accuracy),
                attempt_count: Number(r.attempt_count),
                band: r.band,
              };
            }
          });
          setProgressMap(map);
        }

        // 4. Load weakest module study recommendation
        const weakest = await api.getWeakestTopicForStudy(sessionId);
        if (weakest) {
          const lesson = await api.getFirstIncompleteLessonForTopic(weakest.topicId, sessionId);
          let topicSlug: string = weakest.topicId;
          for (const d of grouped) {
            const mod = d.modules.find((m) => m.id === weakest.topicId);
            if (mod) {
              topicSlug = mod.slug;
              break;
            }
          }
          setWeakestStudyTarget({
            topicId: weakest.topicId,
            topicSlug,
            topicTitle: weakest.topicTitle,
            accuracy: weakest.accuracy,
            lesson,
          });
        } else {
          setWeakestStudyTarget(null);
        }
      } catch (err: unknown) {
        console.error('Failed to load home page data:', err);
        setError('Could not connect to database. Make sure migrations are applied.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleQuizSelection = (
    topicSlug: string | null,
    topicTitle: string,
    mode: QuizMode = 'topic'
  ) => {
    // If an in_progress quiz run exists, offer "Resume" or "Abandon"
    if (activeRun && activeRun.status === 'in_progress') {
      setPendingQuizRequest({ topicSlug, topicTitle, mode });
    } else {
      onStartQuiz(topicSlug, topicTitle, mode);
    }
  };

  const handleAbandonAndStartNew = async () => {
    if (activeRun) {
      await api.abandonQuizRun(activeRun.id);
      setActiveRun(null);
    }
    if (pendingQuizRequest) {
      onStartQuiz(
        pendingQuizRequest.topicSlug,
        pendingQuizRequest.topicTitle,
        pendingQuizRequest.mode
      );
      setPendingQuizRequest(null);
    }
  };

  const handleAbandonCurrentRun = async () => {
    if (activeRun) {
      await api.abandonQuizRun(activeRun.id);
      setActiveRun(null);
    }
    setPendingQuizRequest(null);
  };

  return (
    <div className="space-y-6">
      {/* Resume Card (Shows when an in_progress run exists) */}
      {activeRun && activeRun.status === 'in_progress' && (
        <section
          aria-label="Resume Quiz"
          className="p-5 rounded-2xl bg-gradient-to-r from-blue-900/80 via-indigo-900/60 to-slate-900 border-2 border-blue-500/50 shadow-2xl relative overflow-hidden animate-pop"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/30 text-blue-200 border border-blue-400/40">
                <RotateCcw className="w-3 h-3 animate-spin-slow" />
                Unfinished Quiz Session
              </span>
              <h2 className="text-lg font-bold text-white">
                Resume quiz ({activeRun.current_index + 1} of {activeRun.question_ids.length})
              </h2>
              <p className="text-xs text-slate-300">
                Mode: <span className="capitalize font-semibold text-blue-300">{activeRun.mode}</span> &bull; Your answers and position are saved.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1 sm:pt-0">
              <button
                type="button"
                onClick={() => onResumeQuiz(activeRun)}
                className="flex-1 sm:flex-initial min-h-[44px] py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-semibold text-xs transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none"
              >
                <span>Resume Quiz</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleAbandonCurrentRun}
                className="min-h-[44px] min-w-[44px] py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-rose-950/80 hover:text-rose-200 hover:border-rose-500/40 border border-slate-700 text-slate-400 font-medium text-xs transition-all flex items-center justify-center gap-1 focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-none"
                title="Abandon in-progress quiz"
              >
                <Trash2 className="w-4 h-4" />
                <span className="sr-only sm:not-sr-only">Abandon</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Hero Banner */}
      <section
        aria-label="Overview Banner"
        className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-blue-900/50 via-slate-800 to-slate-900 border border-blue-500/20 shadow-xl relative overflow-hidden landscape-hide-hero"
      >
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <Sparkles className="w-3 h-3 text-blue-400" />
            African Candidate Edition
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-2">
            Build your AZ-900 confidence
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
            Curated original questions grounded in Kenyan engineering scenarios. Learn <span className="text-blue-300 font-medium">why</span> answers are right or wrong with honest readiness benchmarks.
          </p>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-700/50 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            type="button"
            onClick={() => handleQuizSelection(null, 'Mixed Practice Quiz', 'mixed')}
            className="min-h-[44px] py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-semibold text-xs sm:text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none"
          >
            <Play className="w-4 h-4 fill-white" />
            Start mixed practice quiz
          </button>
          <button
            type="button"
            onClick={onNavigateReadiness}
            className="min-h-[44px] py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none"
          >
            Check Exam Readiness &rarr;
          </button>
        </div>
      </section>

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 animate-pulse space-y-3 min-h-[160px]"
            >
              <div className="h-4 bg-slate-700 rounded w-1/3" />
              <div className="h-3 bg-slate-700/50 rounded w-3/4" />
              <div className="h-8 bg-slate-700/30 rounded mt-4" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Unable to load topics</p>
            <p className="text-slate-400 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Domain & Module Cards (Responsive Grid: 1 col on mobile, 2 on md, 3 on lg) */}
      {!loading && !error && (
        <section aria-label="Exam Domains" className="space-y-4">
          {/* Weakest Module Recommendation Card */}
          {weakestStudyTarget && weakestStudyTarget.lesson && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/70 via-slate-800/90 to-slate-900 border border-amber-500/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pop">
              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Focus Recommendation &bull; Weakest Module ({Math.round(weakestStudyTarget.accuracy * 100)}% accuracy)
                </span>
                <h3 className="text-base font-bold text-white">
                  {weakestStudyTarget.topicTitle}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Reinforce this module with lesson:{' '}
                  <strong className="text-amber-200">{weakestStudyTarget.lesson.title}</strong>{' '}
                  (~{weakestStudyTarget.lesson.est_read_minutes} min read)
                </p>
              </div>

              <div className="flex items-center gap-2.5 pt-1 sm:pt-0 shrink-0">
                {onSelectLesson && (
                  <button
                    type="button"
                    onClick={() => onSelectLesson(weakestStudyTarget.lesson!.slug)}
                    className="min-h-[44px] px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-600/30 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none active:scale-[0.98]"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Study this first</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() =>
                    handleQuizSelection(
                      weakestStudyTarget.topicSlug,
                      weakestStudyTarget.topicTitle,
                      'topic'
                    )
                  }
                  className="min-h-[44px] px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-600/30 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none active:scale-[0.98]"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Quiz it</span>
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Exam Domains ({domainGroups.length})
            </h3>
            <button
              type="button"
              onClick={onNavigateReadiness}
              className="min-h-[44px] px-2 flex items-center text-xs font-semibold text-blue-400 hover:text-blue-300 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none rounded-lg"
            >
              View Readiness &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {domainGroups.map(({ domain, modules }) => {
              const moduleProgresses = modules
                .map((m) => progressMap[m.id])
                .filter(Boolean);
              const totalAttempts = moduleProgresses.reduce((acc, p) => acc + p.attempt_count, 0);
              const avgAccuracy =
                moduleProgresses.length > 0
                  ? Math.round(
                      (moduleProgresses.reduce((acc, p) => acc + p.accuracy, 0) /
                        moduleProgresses.length) *
                        100
                    )
                  : 0;

              return (
                <div
                  key={domain.id}
                  className="rounded-2xl bg-slate-800/40 border border-slate-800 p-4 sm:p-5 flex flex-col justify-between transition-all hover:border-slate-700 shadow-md"
                >
                  <div className="space-y-3">
                    {/* Domain Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-blue-400 text-xs font-semibold">
                          <Layers className="w-3.5 h-3.5" />
                          <span>Domain</span>
                        </div>
                        <h4 className="font-bold text-sm text-white">{domain.title}</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleQuizSelection(domain.slug, domain.title, 'topic')}
                        className="min-h-[44px] px-3.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 border border-blue-500/40 hover:border-blue-500 text-blue-300 hover:text-white font-medium text-xs transition-colors shrink-0 flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        Quiz
                      </button>
                    </div>

                    {/* Domain Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Domain Mastery</span>
                        <span>{totalAttempts > 0 ? `${avgAccuracy}%` : 'Not started'}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            avgAccuracy >= 80
                              ? 'bg-emerald-500'
                              : avgAccuracy >= 60
                              ? 'bg-amber-500'
                              : totalAttempts > 0
                              ? 'bg-blue-500'
                              : 'bg-slate-700'
                          }`}
                          style={{ width: `${totalAttempts > 0 ? avgAccuracy : 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Modules list inside domain */}
                    <div className="pt-3 border-t border-slate-800/80 space-y-2">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Modules ({modules.length})
                      </span>
                      {modules.map((m) => {
                        const prog = progressMap[m.id];
                        const hasProgress = prog && prog.attempt_count > 0;
                        const accuracyPct = hasProgress ? Math.round(prog.accuracy * 100) : 0;

                        return (
                          <div
                            key={m.id}
                            className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 hover:border-slate-700 space-y-2 transition-all"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-0.5">
                                <span className="text-xs text-slate-200 font-semibold block">
                                  {m.title}
                                </span>
                                <span className="text-[10px] text-slate-400 block">
                                  {hasProgress
                                    ? `${prog.attempt_count} attempts • ${prog.band}`
                                    : '0 attempts'}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleQuizSelection(m.slug, m.title, 'topic')}
                                className="min-h-[44px] px-3 py-1 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white border border-slate-700 hover:border-blue-500 text-xs font-medium transition-all shrink-0 flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none"
                              >
                                <Play className="w-2.5 h-2.5 fill-current" />
                                Practice
                              </button>
                            </div>

                            {/* Module Progress Bar */}
                            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 ${
                                  accuracyPct >= 80
                                    ? 'bg-emerald-500'
                                    : accuracyPct >= 60
                                    ? 'bg-amber-500'
                                    : hasProgress
                                    ? 'bg-blue-500'
                                    : 'bg-transparent'
                                }`}
                                style={{ width: `${hasProgress ? accuracyPct : 0}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Confirmation Modal when a different quiz is requested while a run is in progress */}
      {pendingQuizRequest && activeRun && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="abandon-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-pop"
        >
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-blue-500/40 p-5 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 id="abandon-modal-title" className="text-sm font-bold text-white">
                  Quiz in progress ({activeRun.current_index + 1} of {activeRun.question_ids.length})
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  You have an unfinished practice quiz. Would you like to resume your saved progress or abandon it to start <strong className="text-white">{pendingQuizRequest.topicTitle}</strong>?
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  onResumeQuiz(activeRun);
                  setPendingQuizRequest(null);
                }}
                className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none"
              >
                <RotateCcw className="w-4 h-4" />
                Resume quiz ({activeRun.current_index + 1} of {activeRun.question_ids.length})
              </button>
              <button
                type="button"
                onClick={handleAbandonAndStartNew}
                className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-rose-950/70 hover:text-rose-200 hover:border-rose-500/40 border border-slate-700 text-slate-300 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-none"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Abandon and start new
              </button>
              <button
                type="button"
                onClick={() => setPendingQuizRequest(null)}
                className="w-full min-h-[44px] py-2 px-4 rounded-xl text-slate-400 hover:text-slate-200 text-xs transition-colors focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
