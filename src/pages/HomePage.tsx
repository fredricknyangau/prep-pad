import React, { useEffect, useState } from 'react';
import { supabase, Topic } from '../lib/supabase';
import { Layers, Play, AlertCircle, Sparkles } from 'lucide-react';

interface HomePageProps {
  onStartQuiz: (topicSlug: string | null, topicTitle: string) => void;
  onNavigateReadiness: () => void;
}

interface DomainWithModules {
  domain: Topic;
  modules: Topic[];
}

interface TopicProgress {
  accuracy: number;
  attempt_count: number;
  band: string;
}

export const HomePage: React.FC<HomePageProps> = ({ onStartQuiz, onNavigateReadiness }) => {
  const [domainGroups, setDomainGroups] = useState<DomainWithModules[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, TopicProgress>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTopicsAndProgress() {
      try {
        setLoading(true);
        setError(null);

        // Fetch all topics ordered by hierarchy
        const { data: topicData, error: fetchErr } = await supabase
          .from('topics')
          .select('*')
          .order('sort_order', { ascending: true });

        if (fetchErr) throw fetchErr;

        if (topicData) {
          const domains = topicData.filter((t) => t.parent_id === null);
          const grouped = domains.map((d) => ({
            domain: d,
            modules: topicData.filter((m) => m.parent_id === d.id),
          }));
          setDomainGroups(grouped);
        }

        // Fetch readiness progress for active session
        const sessionId = localStorage.getItem('az900_anon_session_id');
        if (sessionId) {
          const { data: readinessData } = await supabase
            .from('readiness_by_topic')
            .select('topic_id, accuracy, attempt_count, band')
            .eq('session_id', sessionId);

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
        }
      } catch (err: unknown) {
        console.error('Failed to load topics or progress:', err);
        setError('Could not connect to database. Make sure migrations are applied.');
      } finally {
        setLoading(false);
      }
    }

    loadTopicsAndProgress();
  }, []);

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-900/60 via-slate-800 to-slate-900 border border-blue-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-start justify-between gap-3 relative z-10">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <Sparkles className="w-3 h-3 text-blue-400" />
              African Candidate Edition
            </span>
            <h2 className="text-xl font-bold text-white mt-2">
              Master the AZ-900 Exam
            </h2>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Curated original questions grounded in Kenyan engineering scenarios. Learn <span className="text-blue-300 font-medium">why</span> answers are right or wrong.
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between gap-2">
          <button
            onClick={() => onStartQuiz(null, 'Full Exam Simulation')}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-semibold text-xs transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-white" />
            Start Full Exam Simulation
          </button>
        </div>
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 animate-pulse space-y-3">
              <div className="h-4 bg-slate-700 rounded w-1/3" />
              <div className="h-3 bg-slate-700/50 rounded w-3/4" />
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

      {/* Domain & Module Cards */}
      {!loading && !error && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Exam Domains ({domainGroups.length})
            </h3>
            <button
              onClick={onNavigateReadiness}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300"
            >
              View Readiness &rarr;
            </button>
          </div>

          {domainGroups.map(({ domain, modules }) => {
            // Aggregate domain progress
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
                className="rounded-2xl bg-slate-800/40 border border-slate-800 p-4 space-y-3 transition-all hover:border-slate-700"
              >
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
                    onClick={() => onStartQuiz(domain.slug, domain.title)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 border border-blue-500/40 hover:border-blue-500 text-blue-300 hover:text-white font-medium text-xs transition-colors shrink-0 flex items-center gap-1"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    Quiz Domain
                  </button>
                </div>

                {/* Domain Aggregate Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Domain Mastery</span>
                    <span>{totalAttempts > 0 ? `${avgAccuracy}%` : 'Not started'}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${avgAccuracy >= 80
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
                <div className="pt-2 border-t border-slate-800/80 space-y-2">
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
                            onClick={() => onStartQuiz(m.slug, m.title)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white border border-slate-700 hover:border-blue-500 text-[11px] font-medium transition-all shrink-0 flex items-center gap-1"
                          >
                            <Play className="w-2.5 h-2.5 fill-current" />
                            Start Quiz
                          </button>
                        </div>

                        {/* Module Progress Bar */}
                        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${accuracyPct >= 80
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
            );
          })}
        </div>
      )}
    </div>
  );
};
