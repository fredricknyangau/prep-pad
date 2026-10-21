import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Eye,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  AlertTriangle,
  Clock,
  Compass,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import * as api from '../lib/api';
import type { DomainWithModules, Lesson, LessonProgress } from '../lib/api';

interface LearnHomePageProps {
  onSelectLesson: (lessonSlug: string) => void;
  onNavigatePractice: () => void;
}

export const LearnHomePage: React.FC<LearnHomePageProps> = ({
  onSelectLesson,
  onNavigatePractice,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [domainData, setDomainData] = useState<DomainWithModules[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, LessonProgress>>({});
  const [weakestModule, setWeakestModule] = useState<{
    topicId: string;
    topicTitle: string;
    accuracy: number;
  } | null>(null);
  const [expandedDomains, setExpandedDomains] = useState<Record<string, boolean>>({});

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const sessionId = api.getOrCreateSessionId();
      const [fetchedTopics, fetchedLessons, fetchedProgress, weakest] = await Promise.all([
        api.getTopics(),
        api.getLessons(),
        api.getLessonProgress(sessionId),
        api.getWeakestTopicForStudy(sessionId),
      ]);

      setDomainData(fetchedTopics);
      setLessons(fetchedLessons);
      setProgressMap(fetchedProgress);
      setWeakestModule(weakest);

      // Default expand all domains
      const initialExpanded: Record<string, boolean> = {};
      fetchedTopics.forEach((d) => {
        initialExpanded[d.domain.id] = true;
      });
      setExpandedDomains(initialExpanded);
    } catch (err: any) {
      console.error('Error loading learn home:', err);
      setError(err?.message || 'Could not load lessons. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleDomain = (domainId: string) => {
    setExpandedDomains((prev) => ({
      ...prev,
      [domainId]: !prev[domainId],
    }));
  };

  // Determine Continue lesson candidate
  const continueLesson = React.useMemo(() => {
    if (lessons.length === 0) return null;

    // 1. Last viewed lesson that is not completed
    const viewedNotCompleted = [...lessons]
      .reverse()
      .find((l) => progressMap[l.id]?.status === 'viewed');
    if (viewedNotCompleted) return viewedNotCompleted;

    // 2. Next unviewed lesson
    const nextUnviewed = lessons.find((l) => !progressMap[l.id]);
    if (nextUnviewed) return nextUnviewed;

    // 3. Fallback: first lesson if all completed
    return lessons[0];
  }, [lessons, progressMap]);

  // Find first lesson for weakest module if available
  const weakestLesson = React.useMemo(() => {
    if (!weakestModule) return null;
    const moduleLessons = lessons.filter((l) => l.topic_id === weakestModule.topicId);
    if (moduleLessons.length === 0) return null;
    // Prefer first uncompleted in weakest module
    const uncompleted = moduleLessons.find((l) => progressMap[l.id]?.status !== 'completed');
    return uncompleted || moduleLessons[0];
  }, [weakestModule, lessons, progressMap]);

  // Loading skeleton state
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse max-w-4xl mx-auto py-2">
        <div className="h-28 bg-slate-800/60 rounded-2xl border border-slate-700/50" />
        <div className="space-y-4">
          <div className="h-6 w-48 bg-slate-800 rounded" />
          <div className="h-44 bg-slate-800/40 rounded-2xl border border-slate-800" />
          <div className="h-44 bg-slate-800/40 rounded-2xl border border-slate-800" />
        </div>
      </div>
    );
  }

  // Error state with Retry
  if (error) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-6 bg-rose-950/30 border border-rose-800/50 rounded-2xl">
        <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-100 mb-2">Could Not Load Lessons</h2>
        <p className="text-xs text-rose-200/80 mb-6">{error}</p>
        <button
          type="button"
          onClick={loadData}
          className="min-h-[44px] px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-medium text-xs flex items-center gap-2 mx-auto transition-colors focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-none"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  // Content Gate empty state
  if (lessons.length === 0) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-8 bg-slate-800/30 border border-slate-800 rounded-3xl">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white mb-2">Lessons being reviewed</h2>
        <p className="text-xs text-slate-400 leading-relaxed mb-6">
          Lessons for this topic are being reviewed. As each revision unit is verified against the
          official syllabus, it will appear here.
        </p>
        <button
          type="button"
          onClick={onNavigatePractice}
          className="min-h-[44px] px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium text-xs inline-flex items-center gap-2 transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none"
        >
          <span>Practise questions instead</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-[11px] text-slate-500 mt-8">
          Based on the AZ-900 skills measured as of 14 Jan 2026. Microsoft updates the exam, so
          check the current study guide.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Sticky Syllabus Outline (visible from lg) */}
        <aside
          aria-label="Syllabus Outline"
          className="hidden lg:block lg:col-span-4 lg:sticky lg:top-24 space-y-4"
        >
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                Syllabus Outline
              </span>
              <h2 className="text-sm font-bold text-white">AZ-900 Learning Paths</h2>
            </div>

            {/* Overall Progress */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
                <span>Total Completion</span>
                <span>
                  {lessons.filter((l) => progressMap[l.id]?.status === 'completed').length}/
                  {lessons.length}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      lessons.length
                        ? (lessons.filter((l) => progressMap[l.id]?.status === 'completed').length /
                            lessons.length) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Domains Jump List */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Exam Domains ({domainData.length})
              </span>
              <nav className="space-y-1.5" aria-label="Domain quick navigation">
                {domainData.map((dGroup) => {
                  const domain = dGroup.domain;
                  const domainModuleIds = new Set(dGroup.modules.map((m) => m.id));
                  const domainLessons = lessons.filter((l) => domainModuleIds.has(l.topic_id));
                  if (domainLessons.length === 0) return null;

                  const doneCount = domainLessons.filter(
                    (l) => progressMap[l.id]?.status === 'completed'
                  ).length;
                  const isExpanded = expandedDomains[domain.id] ?? true;

                  return (
                    <button
                      key={domain.id}
                      type="button"
                      onClick={() => toggleDomain(domain.id)}
                      className={`w-full min-h-[44px] p-2.5 rounded-xl text-left text-xs transition-colors flex items-center justify-between group focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none ${
                        isExpanded
                          ? 'bg-blue-950/40 border border-blue-500/30 text-white'
                          : 'bg-slate-800/40 hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <span className="truncate pr-2 font-medium group-hover:text-blue-300">
                        {domain.title}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400 shrink-0">
                        {doneCount}/{domainLessons.length}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </aside>

        {/* Right Column: Cards & Content */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Continue / Weakest Topic Recommendation Card */}
          {weakestModule && weakestLesson && (
            <div className="bg-gradient-to-r from-amber-950/40 to-slate-900/80 border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Study this first &bull; Weakest Module ({Math.round(weakestModule.accuracy * 100)}% accuracy)
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-white">
                    {weakestModule.topicTitle}
                  </h2>
                  <p className="text-xs text-slate-300">
                    Recommended next lesson:{' '}
                    <span className="font-semibold text-amber-200">{weakestLesson.title}</span> (~
                    {weakestLesson.est_read_minutes} min)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectLesson(weakestLesson.slug)}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shrink-0 focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:outline-none"
                >
                  <span>Start lesson</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {continueLesson && (!weakestModule || continueLesson.id !== weakestLesson?.id) && (
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 sm:p-5 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5" />
                    {progressMap[continueLesson.id]?.status === 'viewed'
                      ? 'Continue learning'
                      : 'Up next'}
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-white">
                    {continueLesson.title}
                  </h2>
                  <p className="text-xs text-slate-400 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>~{continueLesson.est_read_minutes} min read</span>
                    {continueLesson.needs_verification && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-medium">
                        check current Learn page
                      </span>
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectLesson(continueLesson.slug)}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md shrink-0 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none"
                >
                  <span>
                    {progressMap[continueLesson.id]?.status === 'viewed' ? 'Resume' : 'Start'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* 2. Domains & Modules Accordions (Single column on phones, cards on desktop) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold tracking-wide uppercase text-slate-400">
                Exam Domains & Modules
              </h2>
              <span className="text-xs text-slate-400 font-medium">
                {lessons.filter((l) => progressMap[l.id]?.status === 'completed').length}/
                {lessons.length} completed
              </span>
            </div>

            {domainData.map((dGroup) => {
              const domain = dGroup.domain;
              const modules = dGroup.modules;
              const domainModuleIds = new Set(modules.map((m) => m.id));
              const domainLessons = lessons.filter((l) => domainModuleIds.has(l.topic_id));

              if (domainLessons.length === 0) {
                return null; // Content gate: hide domain if no reviewed lessons yet
              }

              const completedCount = domainLessons.filter(
                (l) => progressMap[l.id]?.status === 'completed'
              ).length;
              const isExpanded = expandedDomains[domain.id] ?? true;

              return (
                <div
                  key={domain.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm"
                >
                  {/* Domain Accordion Header */}
                  <button
                    type="button"
                    onClick={() => toggleDomain(domain.id)}
                    className="w-full min-h-[52px] px-4 sm:px-6 py-4 flex items-center justify-between text-left bg-slate-850/40 hover:bg-slate-800/40 transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none"
                    aria-expanded={isExpanded}
                  >
                    <div className="space-y-1 pr-4">
                      <h3 className="font-bold text-sm sm:text-base text-white">{domain.title}</h3>
                      <p className="text-xs text-slate-400 font-medium">
                        {completedCount} of {domainLessons.length} lessons completed
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-300"
                          style={{
                            width: `${domainLessons.length ? (completedCount / domainLessons.length) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {/* Modules & Lesson Rows */}
                  {isExpanded && (
                    <div className="px-3 sm:px-6 py-3 border-t border-slate-800/80 space-y-5">
                      {modules.map((module) => {
                        const moduleLessons = lessons.filter((l) => l.topic_id === module.id);
                        if (moduleLessons.length === 0) return null;

                        const modDone = moduleLessons.filter(
                          (l) => progressMap[l.id]?.status === 'completed'
                        ).length;
                        const percent = Math.round((modDone / moduleLessons.length) * 100);

                        return (
                          <div
                            key={module.id}
                            className="p-3 sm:p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-3"
                          >
                            {/* Module Heading & Progress Bar */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <h4 className="font-semibold text-xs sm:text-sm text-slate-200">
                                {module.title}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
                                <span className="font-mono text-[11px]">
                                  {modDone}/{moduleLessons.length} lessons
                                </span>
                                <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Lesson Rows */}
                            <div className="space-y-1.5 pt-1">
                              {moduleLessons.map((lesson) => {
                                const pStatus = progressMap[lesson.id]?.status;
                                const isDone = pStatus === 'completed';
                                const isViewed = pStatus === 'viewed';

                                return (
                                  <button
                                    key={lesson.id}
                                    type="button"
                                    onClick={() => onSelectLesson(lesson.slug)}
                                    className="w-full min-h-[44px] px-3 py-2.5 rounded-lg flex items-center justify-between text-left hover:bg-slate-800/70 transition-colors group focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none"
                                  >
                                    <div className="flex items-center gap-3 min-w-0 pr-3">
                                      {isDone ? (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                      ) : isViewed ? (
                                        <Eye className="w-4 h-4 text-blue-400 shrink-0" />
                                      ) : (
                                        <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                                      )}
                                      <span
                                        className={`text-xs sm:text-sm truncate ${
                                          isDone
                                            ? 'text-slate-300'
                                            : 'text-slate-100 font-medium group-hover:text-blue-300'
                                        }`}
                                      >
                                        {lesson.title}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                      {lesson.needs_verification && (
                                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-medium hidden md:inline">
                                          check current Learn page
                                        </span>
                                      )}
                                      <span className="text-[11px] text-slate-500 font-medium">
                                        ~{lesson.est_read_minutes} min
                                      </span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Baseline Notice */}
      <div className="pt-4 text-center">
        <p className="text-[11px] text-slate-500 leading-relaxed max-w-xl mx-auto">
          Based on the AZ-900 skills measured as of 14 Jan 2026. Microsoft updates the exam, so
          check the current study guide.
        </p>
      </div>
    </div>
  );
};
