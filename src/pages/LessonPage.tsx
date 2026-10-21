import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  HelpCircle,
  Sparkles,
  RefreshCw,
  RotateCcw,
} from 'lucide-react';
import * as api from '../lib/api';
import type { Lesson, Topic } from '../lib/api';
import { FormattedText } from '../components/FormattedText';

interface LessonPageProps {
  lessonSlug: string;
  onNavigateHome: () => void;
  onSelectLesson: (slug: string) => void;
  onStartQuiz: (topicSlug: string | null, topicTitle: string, mode: 'topic') => void;
  onBackToQuiz?: () => void;
}

export const LessonPage: React.FC<LessonPageProps> = ({
  lessonSlug,
  onNavigateHome,
  onSelectLesson,
  onStartQuiz,
  onBackToQuiz,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [moduleTopic, setModuleTopic] = useState<Topic | null>(null);
  const [siblingLessons, setSiblingLessons] = useState<Lesson[]>([]);
  const [reviewedQuestionCount, setReviewedQuestionCount] = useState<number>(0);
  const [showAnswer, setShowAnswer] = useState<Record<number, boolean>>({});
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [savingProgress, setSavingProgress] = useState<boolean>(false);

  const loadLessonData = async () => {
    setLoading(true);
    setError(null);
    setShowAnswer({});
    try {
      const fetchedLesson = await api.getLessonBySlug(lessonSlug);
      if (!fetchedLesson) {
        setLesson(null);
        setLoading(false);
        return;
      }

      setLesson(fetchedLesson);

      // Record 'viewed' immediately upon opening
      api.markLessonProgress(fetchedLesson.id, 'viewed').catch((e) =>
        console.warn('Failed to mark lesson viewed:', e)
      );

      // Check current progress
      const progressMap = await api.getLessonProgress();
      if (progressMap[fetchedLesson.id]?.status === 'completed') {
        setIsCompleted(true);
      } else {
        setIsCompleted(false);
      }

      // Fetch module lessons and topic metadata
      const [allTopics, moduleLessons, questionCounts] = await Promise.all([
        api.getTopics(),
        api.getLessons(fetchedLesson.topic_id),
        api.getReviewedQuestionCounts(),
      ]);

      setSiblingLessons(moduleLessons);
      setReviewedQuestionCount(questionCounts[fetchedLesson.topic_id] || 0);

      // Find module topic title
      for (const d of allTopics) {
        const found = d.modules.find((m) => m.id === fetchedLesson.topic_id);
        if (found) {
          setModuleTopic(found);
          break;
        }
      }
    } catch (err: any) {
      console.error('Error loading lesson:', err);
      setError(err?.message || 'Could not load lesson content.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLessonData();
  }, [lessonSlug]);

  const toggleAnswer = (qIndex: number) => {
    setShowAnswer((prev) => ({
      ...prev,
      [qIndex]: !prev[qIndex],
    }));
  };

  // Sibling navigation
  const currentIndex = siblingLessons.findIndex((l) => l.slug === lessonSlug);
  const prevLesson = currentIndex > 0 ? siblingLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < siblingLessons.length - 1
      ? siblingLessons[currentIndex + 1]
      : null;
  const isLastLessonInModule =
    currentIndex >= 0 && currentIndex === siblingLessons.length - 1;

  const handleMarkDoneAndContinue = async () => {
    if (!lesson) return;
    setSavingProgress(true);
    try {
      await api.markLessonProgress(lesson.id, 'completed');
      setIsCompleted(true);
      if (nextLesson) {
        onSelectLesson(nextLesson.slug);
      }
    } catch (err) {
      console.error('Error marking lesson completed:', err);
    } finally {
      setSavingProgress(false);
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="max-w-[68ch] mx-auto py-6 space-y-6 animate-pulse">
        <div className="h-4 w-40 bg-slate-800 rounded" />
        <div className="h-8 w-3/4 bg-slate-800 rounded" />
        <div className="h-28 bg-slate-800/40 rounded-xl" />
        <div className="h-40 bg-slate-800/40 rounded-xl" />
        <div className="h-24 bg-slate-800/40 rounded-xl" />
      </div>
    );
  }

  // Error state with Retry
  if (error) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-6 bg-rose-950/30 border border-rose-800/50 rounded-2xl">
        <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-100 mb-2">Lesson Unavailable</h2>
        <p className="text-xs text-rose-200/80 mb-6">{error}</p>
        <button
          type="button"
          onClick={loadLessonData}
          className="min-h-[44px] px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-medium text-xs flex items-center gap-2 mx-auto transition-colors focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-none"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  // Content Gate empty state
  if (!lesson) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-8 bg-slate-800/30 border border-slate-800 rounded-3xl">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white mb-2">Lessons being reviewed</h2>
        <p className="text-xs text-slate-400 leading-relaxed mb-6">
          Lessons for this topic are being reviewed. As each revision unit is verified, it will
          become accessible here.
        </p>
        <button
          type="button"
          onClick={onNavigateHome}
          className="min-h-[44px] px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium text-xs inline-flex items-center gap-2 transition-colors focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Learn</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row items-start justify-center gap-8 py-2 sm:py-4 pb-16">
      {/* Sticky Module Lessons Sidebar (Visible on lg and wider) */}
      <aside
        aria-label="Module Lessons"
        className="hidden lg:block w-72 shrink-0 sticky top-24 self-start space-y-4 max-h-[calc(100vh-8rem)] overflow-y-auto pr-1"
      >
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md space-y-3">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
              Module Lessons
            </span>
            <h3 className="text-xs font-bold text-white truncate" title={moduleTopic?.title || 'Current Module'}>
              {moduleTopic?.title || 'Current Module'}
            </h3>
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-1.5">
            {siblingLessons.map((sib, idx) => {
              const isCurrent = sib.slug === lessonSlug;
              return (
                <button
                  key={sib.id}
                  type="button"
                  onClick={() => onSelectLesson(sib.slug)}
                  className={`w-full min-h-[44px] px-3 py-2 rounded-xl text-left text-xs transition-colors flex items-center justify-between group focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none ${
                    isCurrent
                      ? 'bg-blue-600 text-white font-semibold shadow-md'
                      : 'bg-slate-800/40 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span
                      className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center shrink-0 ${
                        isCurrent ? 'bg-blue-500 text-white font-bold' : 'bg-slate-700/60 text-slate-300'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="truncate">{sib.title}</span>
                  </div>
                  <span className={`text-[10px] shrink-0 ${isCurrent ? 'text-blue-100' : 'text-slate-400'}`}>
                    ~{sib.est_read_minutes}m
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Reading Column (Capped at 68ch for optimal reading line length) */}
      <article className="max-w-[68ch] w-full min-w-0 space-y-6">
        {/* Quiz In-Progress Resume Banner */}
        {onBackToQuiz && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/80 via-indigo-950/70 to-slate-900 border border-blue-500/40 flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2.5 text-xs text-blue-200">
              <RotateCcw className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Quiz in progress &bull; Your answers and position are saved.</span>
            </div>
            <button
              type="button"
              onClick={onBackToQuiz}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-md shadow-blue-600/30 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none active:scale-[0.98]"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to quiz</span>
            </button>
          </div>
        )}

        {/* 1. Breadcrumb & Lesson Counter */}
        <nav aria-label="Breadcrumb" className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 truncate">
            <button
              type="button"
              onClick={onNavigateHome}
              className="hover:text-blue-400 transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none rounded px-2.5 py-2 min-h-[44px] min-w-[44px] inline-flex items-center"
            >
              Learn
            </button>
            <span>/</span>
            <span className="truncate text-slate-300">
              {moduleTopic?.title || 'Module'}
            </span>
          </div>
          {siblingLessons.length > 0 && (
            <span className="font-mono text-[11px] bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700/60 shrink-0 text-slate-300">
              Lesson {currentIndex + 1} of {siblingLessons.length}
            </span>
          )}
        </nav>

        {/* Lesson Title */}
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white leading-tight">
            {lesson.title}
          </h1>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>~{lesson.est_read_minutes} min read</span>
          {isCompleted && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3" />
              Completed
            </span>
          )}
          {lesson.needs_verification && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-medium">
              check current Learn page
            </span>
          )}
        </div>
      </div>

      {/* 2. In Short (Summary) */}
      <section aria-labelledby="section-in-short" className="space-y-2">
        <h2 id="section-in-short" className="text-xs font-bold uppercase tracking-wider text-blue-400">
          In short
        </h2>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-sm sm:text-base text-slate-200 leading-relaxed">
          <FormattedText text={lesson.summary} />
        </div>
      </section>

      {/* 3. Key Terms (Definition List) */}
      {lesson.key_terms && lesson.key_terms.length > 0 && (
        <section aria-labelledby="section-key-terms" className="space-y-2">
          <h2 id="section-key-terms" className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Key terms
          </h2>
          <dl className="p-4 rounded-xl bg-slate-900 border border-slate-800 divide-y divide-slate-800/80 text-xs sm:text-sm">
            {lesson.key_terms.map((item, idx) => (
              <div key={idx} className={idx > 0 ? 'pt-3' : 'pb-3'}>
                <dt className="font-bold text-slate-100 mb-0.5">
                  <FormattedText text={item.term} />
                </dt>
                <dd className="text-slate-300 leading-relaxed">
                  <FormattedText text={item.definition} />
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* 4. In Real Life (Amber Callout) */}
      <section aria-labelledby="section-real-life" className="space-y-2">
        <h2 id="section-real-life" className="text-xs font-bold uppercase tracking-wider text-amber-400">
          In real life
        </h2>
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs sm:text-sm text-amber-100/90 leading-relaxed">
          <FormattedText text={lesson.real_example} />
        </div>
      </section>

      {/* 5. What the Exam Tests (Exam Lens) */}
      <section aria-labelledby="section-exam-tests" className="space-y-2">
        <h2 id="section-exam-tests" className="text-xs font-bold uppercase tracking-wider text-indigo-400">
          What the exam tests
        </h2>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed">
          <FormattedText text={lesson.exam_lens} />
        </div>
      </section>

      {/* 6. Watch Out (Common Distractor, Warning Style) */}
      {lesson.common_distractor && (
        <section aria-labelledby="section-watch-out" className="space-y-2">
          <h2 id="section-watch-out" className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            Watch out
          </h2>
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-800/40 text-xs sm:text-sm text-rose-200/90 leading-relaxed">
            <FormattedText text={lesson.common_distractor} />
          </div>
        </section>
      )}

      {/* 7. Memory Hook (Highlighted) */}
      <section aria-labelledby="section-memory-hook" className="space-y-2">
        <h2 id="section-memory-hook" className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Memory hook
        </h2>
        <div className="p-4 rounded-xl bg-emerald-950/25 border border-emerald-500/30 text-xs sm:text-sm text-emerald-100 font-medium leading-relaxed shadow-sm">
          <FormattedText text={lesson.memory_hook} />
        </div>
      </section>

      {/* 8. Check Yourself (2 Interactive Cards) */}
      {lesson.check_yourself && lesson.check_yourself.length > 0 && (
        <section aria-labelledby="section-check-yourself" className="space-y-3 pt-2">
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-blue-400" />
            <h2 id="section-check-yourself" className="text-xs font-bold uppercase tracking-wider text-blue-400">
              Check yourself
            </h2>
          </div>

          <div className="space-y-3">
            {lesson.check_yourself.map((item, idx) => {
              const isOpen = !!showAnswer[idx];
              const ansId = `check-yourself-ans-${idx}`;

              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3"
                >
                  <p className="text-xs sm:text-sm font-medium text-slate-100 leading-relaxed">
                    <span className="font-bold text-blue-400 mr-2">{idx + 1}.</span>
                    <FormattedText text={item.q} />
                  </p>

                  <div>
                    <button
                      type="button"
                      onClick={() => toggleAnswer(idx)}
                      aria-expanded={isOpen}
                      aria-controls={ansId}
                      className="min-h-[44px] px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none"
                    >
                      {isOpen ? 'Hide answer' : 'Show answer'}
                    </button>

                    {isOpen && (
                      <div
                        id={ansId}
                        className="mt-3 p-3.5 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs sm:text-sm text-emerald-300 leading-relaxed animate-in fade-in duration-200"
                      >
                        <FormattedText text={item.a} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 9. Read the official Microsoft Learn unit */}
      <div className="pt-2">
        <a
          href={lesson.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-[44px] inline-flex items-center gap-2 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none rounded px-1"
        >
          <span>Read the official Microsoft Learn unit</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Verification note if flagged */}
      {lesson.needs_verification && lesson.verify_note && (
        <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200/90 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-semibold text-amber-300">Exam baseline note: </span>
            {lesson.verify_note}
          </p>
        </div>
      )}

      {/* 10. End of Module Quiz Callout (if last lesson in module) */}
      {isLastLessonInModule && moduleTopic && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 to-slate-900 border border-blue-500/30 space-y-3 mt-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white">Module Complete!</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            You reached the end of <strong className="text-white">{moduleTopic.title}</strong>.
          </p>

          {reviewedQuestionCount > 0 ? (
            <button
              type="button"
              onClick={() =>
                onStartQuiz(moduleTopic.slug, moduleTopic.title, 'topic')
              }
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none"
            >
              <span>Ready? Take the {reviewedQuestionCount}-question quiz for this module</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <p className="text-xs text-slate-400 font-medium italic">
              Questions for this module are coming soon
            </p>
          )}
        </div>
      )}

      {/* 11. Footer Actions: Previous | Mark as done and continue */}
      <div className="pt-6 border-t border-slate-800 flex items-center justify-between gap-4">
        {prevLesson ? (
          <button
            type="button"
            onClick={() => onSelectLesson(prevLesson.slug)}
            className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onNavigateHome}
            className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>All Lessons</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleMarkDoneAndContinue}
          disabled={savingProgress}
          className="min-h-[44px] px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-md focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>
            {nextLesson
              ? 'Mark as done and continue'
              : isCompleted
              ? 'Completed'
              : 'Mark as done'}
          </span>
          {nextLesson && <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Baseline Notice under lesson */}
      <div className="pt-6 text-center border-t border-slate-800/60">
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Based on the AZ-900 skills measured as of 14 Jan 2026. Microsoft updates the exam, so
          check the current study guide.
        </p>
      </div>
    </article>
  </div>
  );
};
