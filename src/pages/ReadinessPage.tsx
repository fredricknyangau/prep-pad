import React, { useEffect, useState } from 'react';
import * as api from '../lib/api';
import type { Lesson } from '../lib/api';
import { BarChart3, RotateCcw, Play, AlertCircle, BookOpen, Sparkles } from 'lucide-react';

interface ReadinessPageProps {
  onStartQuiz: (topicSlug: string | null, topicTitle: string, mode?: 'topic' | 'mixed' | 'weak') => void;
  onNavigateHome: () => void;
  onSelectLesson?: (slug: string) => void;
}

interface ReadinessRecord {
  session_id: string;
  topic_id: string | null;
  topic_title: string;
  domain_id: string | null;
  attempt_count: number;
  correct_count: number;
  accuracy: number;
  band: string;
}

export const ReadinessPage: React.FC<ReadinessPageProps> = ({
  onStartQuiz,
  onNavigateHome,
  onSelectLesson,
}) => {
  const [readinessData, setReadinessData] = useState<ReadinessRecord[]>([]);
  const [weakestStudyTarget, setWeakestStudyTarget] = useState<{
    topic: ReadinessRecord;
    lesson: Lesson | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadReadiness() {
      try {
        setLoading(true);
        setError(null);

        const sessionId = api.getOrCreateSessionId();
        const data = await api.getReadinessScores(sessionId);

        const rows = (data as unknown as ReadinessRecord[]) || [];
        setReadinessData(rows);

        // Find weakest topic that has attempts
        const practicedModules = rows.filter(
          (r) => r.topic_id !== null && r.attempt_count > 0 && r.accuracy !== undefined
        );
        if (practicedModules.length > 0) {
          practicedModules.sort((a, b) => a.accuracy - b.accuracy);
          const weakest = practicedModules[0];
          const lesson = await api.getFirstIncompleteLessonForTopic(weakest.topic_id!, sessionId);
          setWeakestStudyTarget({ topic: weakest, lesson });
        } else {
          setWeakestStudyTarget(null);
        }
      } catch (err: unknown) {
        console.error('Failed to load readiness scores:', err);
        setError('Could not fetch readiness scores.');
      } finally {
        setLoading(false);
      }
    }

    loadReadiness();
  }, []);

  const overall = readinessData.find((r) => r.topic_id === null);
  const topicRows = readinessData.filter((r) => r.topic_id !== null);

  const getMappedBand = (accuracy: number, attempts: number): { label: string; color: string; badge: string } => {
    if (attempts < 3) {
      return {
        label: 'Not enough data yet',
        color: 'text-slate-400 border-slate-700 bg-slate-800/40',
        badge: 'bg-slate-700/50 text-slate-300',
      };
    }
    if (accuracy >= 0.8) {
      return {
        label: 'Likely ready',
        color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20',
        badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
      };
    }
    if (accuracy >= 0.6) {
      return {
        label: 'Getting there',
        color: 'text-amber-400 border-amber-500/30 bg-amber-950/20',
        badge: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      };
    }
    return {
      label: 'Not yet',
      color: 'text-rose-400 border-rose-500/30 bg-rose-950/20',
      badge: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
    };
  };

  if (loading) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Evaluating readiness metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  const hasData = readinessData.length > 0 && (overall?.attempt_count || 0) > 0;

  if (!hasData) {
    return (
      <div className="py-8 space-y-6">
        <div className="p-8 sm:p-12 rounded-2xl bg-slate-800/40 border border-slate-800 text-center space-y-4 shadow-xl max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto text-blue-400">
            <BarChart3 className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">Not Enough Data Yet</h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xs mx-auto leading-relaxed">
              Complete at least one practice quiz to assess your exam readiness and identify weak areas.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onStartQuiz(null, 'Full Practice Quiz')}
            className="min-h-[44px] py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-lg shadow-blue-600/30 inline-flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none"
          >
            <Play className="w-4 h-4 fill-white" />
            Start First Quiz
          </button>
        </div>
      </div>
    );
  }

  const overallAccuracy = overall ? Math.round(overall.accuracy * 100) : 0;
  const overallBand = getMappedBand(overall?.accuracy || 0, overall?.attempt_count || 0);

  // SVG Ring calculation
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallAccuracy / 100) * circumference;

  return (
    <div className="space-y-6 pb-8">
      {/* Top Section: Stacked on mobile, Side-by-Side from md (Gauge + Weakest Topic / Focus Recommendation) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Overall Readiness Gauge Card */}
        <div
          role="img"
          aria-label={`AZ-900 Exam readiness gauge: ${overallAccuracy}% accuracy across all practiced modules, status: ${overallBand.label}.`}
          className="p-6 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 shadow-xl space-y-4 text-center flex flex-col justify-between"
        >
          <div className="space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              AZ-900 Exam Readiness
            </span>

            {/* Ring Gauge */}
            <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" aria-hidden="true">
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  className="text-slate-700/60"
                  strokeWidth="10"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  className="text-blue-500 transition-all duration-1000 ease-out"
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-white">{overallAccuracy}%</span>
                <span className="text-[10px] text-slate-400 uppercase font-medium tracking-wider">
                  Accuracy
                </span>
              </div>
            </div>

            <div>
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${overallBand.badge}`}>
                {overallBand.label}
              </span>
              <p className="text-[11px] text-slate-400 mt-2">
                Based on your latest attempts across all practiced modules.
              </p>
            </div>
          </div>

          {/* Thresholds & Disclaimer */}
          <div className="pt-3 border-t border-slate-800/80 text-[10px] text-slate-400 space-y-1">
            <p>
              Thresholds: <strong className="text-emerald-400">Likely ready &ge; 80%</strong> &bull;{' '}
              <strong className="text-amber-400">Getting there &ge; 60%</strong> &bull;{' '}
              <strong className="text-rose-400">Not yet &lt; 60%</strong>
            </p>
            <p className="italic text-slate-400">
              * Estimate, not a guarantee. Minimum 10 attempts per module recommended.
            </p>
          </div>
        </div>

        {/* Weakest Topic Study Recommendation Card (or Balanced Focus Card) */}
        {weakestStudyTarget && weakestStudyTarget.lesson ? (
          <section
            aria-label="Study this first recommendation"
            className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/70 via-slate-800/90 to-slate-900 border border-amber-500/40 shadow-xl flex flex-col justify-between gap-4 animate-pop"
          >
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Focus Recommendation &bull; Weakest Module ({Math.round(weakestStudyTarget.topic.accuracy * 100)}% accuracy)
              </span>
              <h3 className="text-lg font-bold text-white">
                {weakestStudyTarget.topic.topic_title}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Reinforce this module with lesson:{' '}
                <strong className="text-amber-200">{weakestStudyTarget.lesson.title}</strong>{' '}
                (~{weakestStudyTarget.lesson.est_read_minutes} min read)
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2 border-t border-slate-800/80">
              {onSelectLesson && (
                <button
                  type="button"
                  onClick={() => onSelectLesson(weakestStudyTarget.lesson!.slug)}
                  className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-600/30 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Study this first</span>
                </button>
              )}

              <button
                type="button"
                onClick={() =>
                  onStartQuiz(
                    weakestStudyTarget.topic.topic_id,
                    weakestStudyTarget.topic.topic_title,
                    'topic'
                  )
                }
                className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-600/30 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Quiz it</span>
              </button>
            </div>
          </section>
        ) : (
          <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Targeted Recommendation
              </span>
              <h3 className="text-lg font-bold text-white">Consistent High Performance</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                You do not have any modules falling below 70% accuracy. Continue practicing mixed quizzes to retain mastery across all exam objectives.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => onStartQuiz(null, 'Mixed Practice Quiz', 'mixed')}
                className="w-full min-h-[44px] py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/30 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none"
              >
                <Play className="w-4 h-4 fill-white" />
                Start Mixed Practice Quiz
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Topic by Topic Breakdown (3 columns from lg) */}
      <section aria-label="Module readiness breakdown" className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Module Readiness Breakdown ({topicRows.length})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topicRows.map((topic) => {
            const topicAcc = Math.round(topic.accuracy * 100);
            const bandInfo = getMappedBand(topic.accuracy, topic.attempt_count);

            return (
              <div
                key={topic.topic_id}
                className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors flex flex-col justify-between shadow-sm"
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-semibold text-white leading-snug">
                      {topic.topic_title}
                    </h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${bandInfo.badge}`}>
                      {bandInfo.label}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    {topic.attempt_count} attempts &bull; {topic.correct_count} correct ({topicAcc}%)
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      topicAcc >= 80 ? 'bg-emerald-500' : topicAcc >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${topicAcc}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Bottom Bar */}
      <div className="pt-2 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={() => onStartQuiz(null, 'Targeted Practice Quiz')}
          className="w-full sm:w-1/2 min-h-[44px] py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/30 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none"
        >
          <RotateCcw className="w-4 h-4" />
          Practice Again
        </button>
        <button
          type="button"
          onClick={onNavigateHome}
          className="w-full sm:w-1/2 min-h-[44px] py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none"
        >
          Back to Topics
        </button>
      </div>
    </div>
  );
};
