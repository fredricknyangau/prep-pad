import React, { useState, useEffect } from 'react';
import { QuizResult, AnswerRecord } from './QuizPage';
import { Award, RotateCcw, BarChart2, BookOpen, CheckCircle, XCircle, Sparkles, ArrowRight } from 'lucide-react';
import * as api from '../lib/api';

interface ResultPageProps {
  results: QuizResult;
  onRetryWeakTopics: (weakTopicId: string | null) => void;
  onNavigateHome: () => void;
  onNavigateReadiness: () => void;
  onSelectLesson?: (slug: string) => void;
}

interface RevisitLessonGroup {
  lessonId: string;
  lessonSlug: string;
  lessonTitle: string;
  answers: AnswerRecord[];
}

export const ResultPage: React.FC<ResultPageProps> = ({
  results,
  onRetryWeakTopics,
  onNavigateHome,
  onNavigateReadiness,
  onSelectLesson,
}) => {
  const [revisitGroups, setRevisitGroups] = useState<RevisitLessonGroup[]>([]);
  const percentage = Math.round((results.correctCount / results.totalQuestions) * 100) || 0;
  const passed = percentage >= 70; // 700/1000 passing mark on AZ-900

  // Resolve and group missed questions by lesson
  useEffect(() => {
    let isCancelled = false;
    const missed = results.answers.filter((a) => !a.isCorrect);

    if (missed.length === 0) {
      setRevisitGroups([]);
      return;
    }

    async function resolveRevisitLessons() {
      const groupsMap = new Map<string, RevisitLessonGroup>();

      for (const ans of missed) {
        let slug = ans.lessonSlug;
        let title = ans.lessonTitle;
        let id = ans.lessonId;

        // If not attached to the answer record, resolve via API
        if (!slug) {
          const lesson = await api.getLessonForQuestion({
            id: ans.questionId,
            lesson_id: ans.lessonId,
          });
          if (lesson) {
            slug = lesson.slug;
            title = lesson.title;
            id = lesson.id;
          }
        }

        if (slug && title) {
          const key = slug;
          if (!groupsMap.has(key)) {
            groupsMap.set(key, {
              lessonId: id || slug,
              lessonSlug: slug,
              lessonTitle: title,
              answers: [ans],
            });
          } else {
            groupsMap.get(key)!.answers.push(ans);
          }
        }
      }

      if (!isCancelled) {
        setRevisitGroups(Array.from(groupsMap.values()));
      }
    }

    resolveRevisitLessons();

    return () => {
      isCancelled = true;
    };
  }, [results.answers]);

  // Group answers by topic to find weak topics
  const topicMap: Record<string, { total: number; correct: number }> = {};
  results.answers.forEach((ans) => {
    if (!topicMap[ans.topicId]) {
      topicMap[ans.topicId] = { total: 0, correct: 0 };
    }
    topicMap[ans.topicId].total += 1;
    if (ans.isCorrect) {
      topicMap[ans.topicId].correct += 1;
    }
  });

  // Weak topics are those with < 70% accuracy
  const weakTopicIds = Object.entries(topicMap)
    .filter(([_, stats]) => (stats.correct / stats.total) < 0.7)
    .map(([topicId]) => topicId);

  return (
    <div className="space-y-6 pb-8">
      {/* Top Section: Stacked on mobile, Side-by-Side from md */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Score Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 text-center space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {results.topicTitle}
              </span>
              <div className="text-4xl font-extrabold text-white mt-1">
                {percentage}%
              </div>
              <p className="text-xs text-slate-300 mt-1">
                You answered <strong className="text-white">{results.correctCount}</strong> out of{' '}
                <strong className="text-white">{results.totalQuestions}</strong> questions correctly.
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 text-xs font-semibold">
              {passed ? (
                <span className="text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Passing Standard (70%+ target)</span>
                </span>
              ) : (
                <span className="text-amber-400 border border-amber-500/30 bg-amber-500/10 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>Needs Reinforcement (under 70%)</span>
                </span>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
            {passed
              ? 'Great job! Keep reviewing to maintain high accuracy.'
              : 'Review the lessons below to strengthen your weak topics.'}
          </div>
        </div>

        {/* Performance Chart Card */}
        <div
          role="img"
          aria-label={`Quiz performance chart: ${results.correctCount} of ${results.totalQuestions} questions correct (${percentage}%). ${Object.keys(topicMap).length} topics tested.`}
          className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/80 shadow-xl min-h-[220px] flex flex-col justify-between space-y-4"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-400">
                <BarChart2 className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Topic Breakdown
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {results.correctCount}/{results.totalQuestions} Correct
              </span>
            </div>

            {/* Per-Topic Accuracy Bars */}
            <div className="space-y-3 pt-1">
              {Object.entries(topicMap).map(([topicId, stats]) => {
                const topicPct = Math.round((stats.correct / stats.total) * 100);
                const isWeak = topicPct < 70;

                return (
                  <div key={topicId} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 truncate max-w-[200px] sm:max-w-[260px]">
                        {topicId}
                      </span>
                      <span className={`font-semibold ${isWeak ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {stats.correct}/{stats.total} ({topicPct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          topicPct >= 80
                            ? 'bg-emerald-500'
                            : topicPct >= 60
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${topicPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>AZ-900 Target: 70%</span>
            <span>
              {weakTopicIds.length === 0 ? (
                <span className="text-emerald-400 font-medium">All topics passed!</span>
              ) : (
                <span className="text-amber-400 font-medium">{weakTopicIds.length} weak topic(s)</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Lessons to Revisit (Grouped Missed Questions - 2 columns from lg) */}
      {revisitGroups.length > 0 && (
        <section aria-label="Lessons to revisit" className="space-y-3">
          <div className="flex items-center gap-2 text-amber-400">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Lessons to Revisit ({revisitGroups.length})
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            You missed questions mapped to these topics. Reinforce concepts here before re-testing:
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {revisitGroups.map((group) => (
              <div
                key={group.lessonSlug}
                className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 hover:border-slate-600 transition-colors flex flex-col justify-between gap-3 shadow-md"
              >
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-white">
                    {group.lessonTitle}
                  </h4>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <span className="text-rose-400 font-medium">
                      {group.answers.length} question{group.answers.length === 1 ? '' : 's'} missed
                    </span>
                    <span>&bull;</span>
                    <span className="text-slate-400 line-clamp-1 italic max-w-xs">
                      &ldquo;{group.answers[0].questionText}&rdquo;
                    </span>
                  </div>
                </div>

                {onSelectLesson && (
                  <button
                    type="button"
                    onClick={() => onSelectLesson(group.lessonSlug)}
                    className="w-full sm:w-auto self-start min-h-[44px] px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-md shadow-blue-600/30 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none active:scale-[0.98]"
                  >
                    <span>Study Lesson</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Review of Question Answers (2 columns from lg) */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Session Breakdown ({results.answers.length} items)
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {results.answers.map((ans, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-start gap-3 hover:border-slate-700/60 transition-colors"
            >
              {ans.isCorrect ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="text-xs space-y-1 min-w-0 flex-1">
                <p className="text-slate-200 line-clamp-2">{ans.questionText}</p>
                <p className="text-[11px] text-slate-400">
                  Selected <strong className="text-slate-300">Option {ans.chosenOptionId}</strong>
                  {!ans.isCorrect && (
                    <span> &bull; Correct was <strong className="text-emerald-400">Option {ans.correctOption.id}</strong></span>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTAs */}
      <div className="space-y-2 pt-2 max-w-lg mx-auto sm:max-w-none">
        {weakTopicIds.length > 0 && (
          <button
            type="button"
            onClick={() => onRetryWeakTopics(weakTopicIds[0])}
            className="w-full min-h-[44px] py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-600/30 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
          >
            <RotateCcw className="w-4 h-4" />
            Retry Weak Topics ({weakTopicIds.length} flagged)
          </button>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onNavigateReadiness}
            className="w-full sm:w-1/2 min-h-[44px] py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none"
          >
            <BarChart2 className="w-4 h-4" />
            View Readiness Dashboard
          </button>

          <button
            type="button"
            onClick={onNavigateHome}
            className="w-full sm:w-1/2 min-h-[44px] py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none"
          >
            <BookOpen className="w-4 h-4" />
            Back to Topics
          </button>
        </div>
      </div>
    </div>
  );
};
