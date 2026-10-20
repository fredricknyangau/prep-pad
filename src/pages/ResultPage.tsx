import React from 'react';
import { QuizResult } from './QuizPage';
import { Award, RotateCcw, BarChart2, BookOpen, CheckCircle, XCircle, Sparkles } from 'lucide-react';

interface ResultPageProps {
  results: QuizResult;
  onRetryWeakTopics: (weakTopicId: string | null) => void;
  onNavigateHome: () => void;
  onNavigateReadiness: () => void;
}

export const ResultPage: React.FC<ResultPageProps> = ({
  results,
  onRetryWeakTopics,
  onNavigateHome,
  onNavigateReadiness,
}) => {
  const percentage = Math.round((results.correctCount / results.totalQuestions) * 100) || 0;
  const passed = percentage >= 70; // 700/1000 passing mark on AZ-900

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
      {/* Score Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 text-center space-y-4 shadow-xl">
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

      {/* Review of Question Answers */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Session Breakdown ({results.answers.length} items)
        </h3>
        <div className="space-y-2">
          {results.answers.map((ans, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-start gap-3"
            >
              {ans.isCorrect ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="text-xs space-y-1">
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
      <div className="space-y-2 pt-2">
        {weakTopicIds.length > 0 && (
          <button
            onClick={() => onRetryWeakTopics(weakTopicIds[0])}
            className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-600/30"
          >
            <RotateCcw className="w-4 h-4" />
            Retry Weak Topics ({weakTopicIds.length} flagged)
          </button>
        )}

        <button
          onClick={onNavigateReadiness}
          className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
        >
          <BarChart2 className="w-4 h-4" />
          View Readiness Dashboard
        </button>

        <button
          onClick={onNavigateHome}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all flex items-center justify-center gap-2"
        >
          <BookOpen className="w-4 h-4" />
          Back to Topics
        </button>
      </div>
    </div>
  );
};
