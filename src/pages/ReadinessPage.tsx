import React, { useEffect, useState } from 'react';
import { supabase, getOrCreateSessionId } from '../lib/supabase';
import { BarChart3, RotateCcw, Play, AlertCircle } from 'lucide-react';

interface ReadinessPageProps {
  onStartQuiz: (topicSlug: string | null, topicTitle: string) => void;
  onNavigateHome: () => void;
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

export const ReadinessPage: React.FC<ReadinessPageProps> = ({ onStartQuiz, onNavigateHome }) => {
  const [readinessData, setReadinessData] = useState<ReadinessRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadReadiness() {
      try {
        setLoading(true);
        setError(null);

        const sessionId = getOrCreateSessionId();

        const { data, error: fetchErr } = await supabase
          .from('readiness_by_topic')
          .select('*')
          .eq('session_id', sessionId);

        if (fetchErr) throw fetchErr;

        setReadinessData(data || []);
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
        <div className="p-8 rounded-2xl bg-slate-800/40 border border-slate-800 text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto text-blue-400">
            <BarChart3 className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Not Enough Data Yet</h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
              Complete at least one practice quiz to assess your exam readiness and identify weak areas.
            </p>
          </div>
          <button
            onClick={() => onStartQuiz(null, 'Full Practice Quiz')}
            className="py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-lg shadow-blue-600/30 inline-flex items-center gap-2"
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
      {/* Overall Readiness Gauge Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 shadow-xl space-y-4 text-center">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          AZ-900 Exam Readiness
        </span>

        {/* Ring Gauge */}
        <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Track */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              className="text-slate-700/60"
              strokeWidth="10"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Progress Stroke */}
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
            Based on your latest 10 attempts across all practiced modules.
          </p>
        </div>

        {/* Thresholds & Guarantee Note */}
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

      {/* Topic by Topic Breakdown */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Module Readiness Breakdown ({topicRows.length})
        </h3>

        <div className="space-y-2.5">
          {topicRows.map((topic) => {
            const topicAcc = Math.round(topic.accuracy * 100);
            const bandInfo = getMappedBand(topic.accuracy, topic.attempt_count);

            return (
              <div
                key={topic.topic_id}
                className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-semibold text-white">{topic.topic_title}</h4>
                    <span className="text-[10px] text-slate-400">
                      {topic.attempt_count} attempts &bull; {topic.correct_count} correct
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${bandInfo.badge}`}>
                    {bandInfo.label}
                  </span>
                </div>

                {/* Micro Progress Bar */}
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
      </div>

      {/* CTA */}
      <div className="pt-2 flex gap-2">
        <button
          onClick={() => onStartQuiz(null, 'Targeted Practice Quiz')}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/30"
        >
          <RotateCcw className="w-4 h-4" />
          Practice Again
        </button>
        <button
          onClick={onNavigateHome}
          className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
        >
          Back to Topics
        </button>
      </div>
    </div>
  );
};
