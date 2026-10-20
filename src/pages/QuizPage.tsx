import React, { useState, useEffect } from 'react';
import { supabase, Question, QuestionOption } from '../lib/supabase';
import { CheckCircle2, XCircle, ArrowRight, Lightbulb, AlertCircle, X, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuizPageProps {
  topicSlug: string | null;
  topicTitle: string;
  onFinishQuiz: (results: QuizResult) => void;
  onBackToHome: () => void;
  onStreakUpdate: (streak: number) => void;
}

export interface AnswerRecord {
  questionId: string;
  topicId: string;
  questionText: string;
  chosenOptionId: string;
  isCorrect: boolean;
  chosenOption: QuestionOption;
  correctOption: QuestionOption;
  explainSimply?: {
    azure_term: string;
    analogy: string;
    key_takeaway: string;
  };
}

export interface QuizResult {
  topicSlug: string | null;
  topicTitle: string;
  totalQuestions: number;
  correctCount: number;
  answers: AnswerRecord[];
}

export const QuizPage: React.FC<QuizPageProps> = ({
  topicSlug,
  topicTitle,
  onFinishQuiz,
  onBackToHome,
  onStreakUpdate,
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [showExplainerModal, setShowExplainerModal] = useState(false);

  // Fetch verified questions (reviewed_by_human = true)
  useEffect(() => {
    async function loadQuestions() {
      try {
        setLoading(true);
        setError(null);

        let query = supabase
          .from('questions')
          .select('*')
          .eq('reviewed_by_human', true);

        if (topicSlug) {
          // Check if topicSlug is a UUID (e.g. from weak topic retry) or a slug
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(topicSlug);
          const topicQuery = supabase.from('topics').select('id, parent_id');
          const { data: topicData } = await (isUuid
            ? topicQuery.eq('id', topicSlug)
            : topicQuery.eq('slug', topicSlug)
          ).single();

          if (topicData) {
            if (topicData.parent_id === null) {
              // Domain: fetch all child module IDs
              const { data: childModules } = await supabase
                .from('topics')
                .select('id')
                .eq('parent_id', topicData.id);

              const moduleIds = childModules?.map((m) => m.id) || [];
              query = query.in('topic_id', moduleIds);
            } else {
              // Module: direct filter
              query = query.eq('topic_id', topicData.id);
            }
          }
        }

        const { data, error: qErr } = await query;
        if (qErr) throw qErr;

        if (!data || data.length === 0) {
          setError('No published questions found for this topic yet.');
          return;
        }

        // Shuffle questions for a fresh practice experience
        const shuffled = [...data].sort(() => 0.5 - Math.random());
        // Limit quiz session to 10 questions max for mobile attention spans
        setQuestions(shuffled.slice(0, 10));
      } catch (err: unknown) {
        console.error('Failed to load quiz questions:', err);
        setError('Failed to fetch quiz questions. Please check connection.');
      } finally {
        setLoading(false);
      }
    }

    loadQuestions();
  }, [topicSlug]);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (optId: string) => {
    if (isAnswered || !currentQ) return;

    setSelectedOptionId(optId);
    setIsAnswered(true);

    const chosen = currentQ.options.find((o) => o.id === optId)!;
    const correct = currentQ.options.find((o) => o.is_correct)!;
    const isCorrect = chosen.is_correct;

    let nextStreak = isCorrect ? currentStreak + 1 : 0;
    setCurrentStreak(nextStreak);
    onStreakUpdate(nextStreak);

    // Tasteful "wow" moment on reaching 5-streak
    if (nextStreak === 5) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#60a5fa', '#f59e0b', '#10b981'],
        });
      } catch {
        // ignore in non-browser envs
      }
    }

    // Persist attempt to Supabase
    saveAttempt(currentQ, optId, isCorrect);

    // Record local answer
    setAnswers((prev) => [
      ...prev,
      {
        questionId: currentQ.id,
        topicId: currentQ.topic_id,
        questionText: currentQ.question,
        chosenOptionId: optId,
        isCorrect,
        chosenOption: chosen,
        correctOption: correct,
        explainSimply: currentQ.explain_simply,
      },
    ]);
  };

  const saveAttempt = async (q: Question, chosenId: string, isCorrect: boolean) => {
    try {
      const sessionId = localStorage.getItem('az900_anon_session_id') || crypto.randomUUID();
      await supabase.from('attempts').insert({
        session_id: sessionId,
        question_id: q.id,
        topic_id: q.topic_id,
        chosen_id: chosenId,
        is_correct: isCorrect,
      });
    } catch (err) {
      console.warn('Could not save attempt in background:', err);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setIsAnswered(false);
    } else {
      const totalCorrect = answers.filter((a) => a.isCorrect).length;
      onFinishQuiz({
        topicSlug,
        topicTitle,
        totalQuestions: questions.length,
        correctCount: totalCorrect,
        answers,
      });
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading verified quiz questions...</p>
      </div>
    );
  }

  if (error || !currentQ) {
    return (
      <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700 text-center space-y-4">
        <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
        <h3 className="text-base font-bold text-white">Quiz Unavailable</h3>
        <p className="text-xs text-slate-300">{error || 'No questions available.'}</p>
        <button
          onClick={onBackToHome}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-semibold"
        >
          Return to Topics
        </button>
      </div>
    );
  }

  const chosenOpt = currentQ.options.find((o) => o.id === selectedOptionId);
  const correctOpt = currentQ.options.find((o) => o.is_correct);

  return (
    <div className="space-y-4 pb-8">
      {/* Progress & Counter */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>
            Question <strong className="text-white">{currentIndex + 1}</strong> of {questions.length}
          </span>
          {currentStreak >= 3 && (
            <span className="text-amber-400 font-semibold flex items-center gap-1.5 animate-pulse">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
              <span>{currentStreak} in a row!</span>
            </span>
          )}
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
            {topicTitle}
          </span>
          <span className="text-[10px] text-slate-400 flex items-center gap-1.5">
            <span>Difficulty:</span>
            <span
              className={`w-2 h-2 rounded-full inline-block ${currentQ.difficulty === 1
                  ? 'bg-emerald-400'
                  : currentQ.difficulty === 2
                    ? 'bg-amber-400'
                    : 'bg-rose-400'
                }`}
            />
            <span className="font-medium text-slate-300">
              {currentQ.difficulty === 1 ? 'Basic' : currentQ.difficulty === 2 ? 'Intermediate' : 'Advanced'}
            </span>
          </span>
        </div>

        <h3 className="text-sm font-semibold text-white leading-relaxed">
          {currentQ.question}
        </h3>
      </div>

      {/* Options List */}
      <div className="space-y-2.5">
        {currentQ.options.map((opt) => {
          const isSelected = selectedOptionId === opt.id;
          let btnClass = 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600 text-slate-200';

          if (isAnswered) {
            if (opt.is_correct) {
              btnClass = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/50';
            } else if (isSelected && !opt.is_correct) {
              btnClass = 'bg-rose-950/60 border-rose-500 text-rose-200 ring-1 ring-rose-500/50';
            } else {
              btnClass = 'bg-slate-900/40 border-slate-800 text-slate-400 opacity-60';
            }
          }

          return (
            <button
              key={opt.id}
              disabled={isAnswered}
              onClick={() => handleSelectOption(opt.id)}
              className={`w-full min-h-[52px] p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 active:scale-[0.99] ${btnClass}`}
            >
              <span
                className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 transition-colors ${isAnswered && opt.is_correct
                    ? 'bg-emerald-500 text-white'
                    : isAnswered && isSelected && !opt.is_correct
                      ? 'bg-rose-500 text-white'
                      : 'bg-slate-700/60 text-slate-300'
                  }`}
              >
                {opt.id}
              </span>
              <span className="text-xs leading-relaxed flex-1 pt-0.5">{opt.text}</span>
              {isAnswered && opt.is_correct && (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              )}
              {isAnswered && isSelected && !opt.is_correct && (
                <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Instant Feedback Drawer / Card */}
      {isAnswered && chosenOpt && (
        <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 shadow-xl space-y-3 animate-pop">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {chosenOpt.is_correct ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Correct!
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> Incorrect
                </span>
              )}
            </div>

            {/* Explain it simply button */}
            <button
              onClick={() => setShowExplainerModal(true)}
              className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Lightbulb className="w-3.5 h-3.5 text-blue-400" />
              <span>Explain it simply</span>
            </button>
          </div>

          {/* Rationales */}
          <div className="text-xs space-y-2 text-slate-300">
            <div>
              <p className="font-semibold text-white">Your selection (Option {chosenOpt.id}):</p>
              <p className="text-slate-300 mt-0.5">{chosenOpt.rationale}</p>
            </div>

            {!chosenOpt.is_correct && correctOpt && (
              <div className="pt-2 border-t border-slate-700/60">
                <p className="font-semibold text-emerald-300">Why Option {correctOpt.id} is correct:</p>
                <p className="text-slate-300 mt-0.5">{correctOpt.rationale}</p>
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleNext}
              className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all flex items-center gap-2 shadow-lg shadow-blue-600/30"
            >
              <span>{currentIndex + 1 < questions.length ? 'Next Question' : 'View Results'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* "Explain It Simply" Modal (Kenyan Analogy + Exact Azure Term) */}
      {showExplainerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-pop">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-blue-500/30 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                <Lightbulb className="w-4 h-4" />
                <span>Explain It Simply</span>
              </div>
              <button
                onClick={() => setShowExplainerModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-200">
              {chosenOpt?.explanation ? (
                <div className="space-y-2.5 leading-relaxed">
                  <p>{chosenOpt.explanation}</p>
                </div>
              ) : currentQ.explain_simply ? (
                <div className="space-y-2.5 leading-relaxed">
                  <p className="text-slate-300">{currentQ.explain_simply.analogy}</p>
                  <p className="text-slate-300 font-medium">{currentQ.explain_simply.key_takeaway}</p>
                  <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 font-semibold">
                    Exact Azure term to remember: {currentQ.explain_simply.azure_term}
                  </div>
                </div>
              ) : (
                <p>No plain-language analogy recorded for this question yet.</p>
              )}
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setShowExplainerModal(false)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl text-xs"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
