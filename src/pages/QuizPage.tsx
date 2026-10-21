import React, { useState, useEffect } from 'react';
import * as api from '../lib/api';
import type {
  Question,
  QuestionOption,
  QuizRun,
  QuizMode,
} from '../lib/api';
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  Lightbulb,
  AlertCircle,
  X,
  Flame,
  CloudOff,
  RefreshCw,
  BookOpen,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuizPageProps {
  topicSlug: string | null;
  topicTitle: string;
  quizMode?: QuizMode;
  resumeRun?: QuizRun | null;
  onFinishQuiz: (results: QuizResult) => void;
  onBackToHome: () => void;
  onStreakUpdate: (streak: number) => void;
  onReviewLesson?: (lessonSlug: string, currentRun: QuizRun, currentIndex: number) => void;
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
  lessonId?: string | null;
  lessonSlug?: string | null;
  lessonTitle?: string | null;
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
  quizMode = 'topic',
  resumeRun = null,
  onFinishQuiz,
  onBackToHome,
  onStreakUpdate,
  onReviewLesson,
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeRun, setActiveRun] = useState<QuizRun | null>(resumeRun);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [showExplainerModal, setShowExplainerModal] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [linkedLesson, setLinkedLesson] = useState<{ id: string; slug: string; title: string } | null>(null);

  // Subscribe to pending sync count
  useEffect(() => {
    return api.subscribeToSyncStatus((count) => {
      setPendingCount(count);
      if (count === 0 && syncNotice) {
        setSyncNotice(null);
      }
    });
  }, [syncNotice]);

  // Load questions and initialize or resume quiz run
  useEffect(() => {
    let isCancelled = false;

    async function initQuiz() {
      try {
        setLoading(true);
        setError(null);

        let loadedQuestions: Question[] = [];
        let currentRun: QuizRun;

        if (resumeRun) {
          // 1. Resuming existing quiz: Load questions by their exact fixed order
          loadedQuestions = await api.getQuestionsByIds(resumeRun.question_ids);
          currentRun = resumeRun;
        } else {
          // 2. Starting fresh: Fetch reviewed questions and create new run
          loadedQuestions = await api.getQuestionsForQuiz({
            mode: quizMode,
            topicSlug,
            limit: 10,
          });

          if (loadedQuestions.length === 0) {
            if (!isCancelled) {
              setError('No published questions found for this topic yet.');
              setLoading(false);
            }
            return;
          }

          currentRun = await api.createQuizRun({
            mode: quizMode,
            topicSlug,
            questionIds: loadedQuestions.map((q) => q.id),
          });
        }

        if (isCancelled) return;

        setQuestions(loadedQuestions);
        setActiveRun(currentRun);

        // If resuming, restore previously answered questions and position
        if (resumeRun) {
          const savedAttempts = await api.getAttemptsForRun(resumeRun.id);
          const restoredAnswers = (
            await Promise.all(
              loadedQuestions.map(async (q) => {
                const att = savedAttempts[q.id];
                if (!att) return null;
                const chosen = q.options.find((o) => o.id === att.chosen_id);
                const correct = q.options.find((o) => o.is_correct);
                if (!chosen || !correct) return null;
                const lessonInfo = await api.getLessonForQuestion(q);
                return {
                  questionId: q.id,
                  topicId: q.topic_id,
                  questionText: q.question,
                  chosenOptionId: att.chosen_id,
                  isCorrect: chosen.is_correct,
                  chosenOption: chosen,
                  correctOption: correct,
                  explainSimply: q.explain_simply,
                  lessonId: lessonInfo?.id || q.lesson_id || null,
                  lessonSlug: lessonInfo?.slug || null,
                  lessonTitle: lessonInfo?.title || null,
                } as AnswerRecord;
              })
            )
          ).filter(Boolean) as AnswerRecord[];

          setAnswers(restoredAnswers);

          // Restore position
          const targetIndex = Math.min(
            resumeRun.current_index,
            loadedQuestions.length - 1
          );
          setCurrentIndex(targetIndex);

          // Check if current question is already answered
          const currentQ = loadedQuestions[targetIndex];
          if (currentQ && savedAttempts[currentQ.id]) {
            setSelectedOptionId(savedAttempts[currentQ.id].chosen_id);
            setIsAnswered(true);
          } else {
            setSelectedOptionId(null);
            setIsAnswered(false);
          }
        } else {
          setCurrentIndex(0);
          setSelectedOptionId(null);
          setIsAnswered(false);
        }
      } catch (err: unknown) {
        console.error('Failed to initialize quiz:', err);
        if (!isCancelled) {
          setError('Failed to fetch quiz questions. Please check connection.');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    initQuiz();

    return () => {
      isCancelled = true;
    };
  }, [topicSlug, quizMode, resumeRun]);

  const currentQ = questions[currentIndex];

  // Resolve linked lesson for current question
  useEffect(() => {
    let isCancelled = false;
    if (!currentQ) {
      setLinkedLesson(null);
      return;
    }

    api.getLessonForQuestion(currentQ).then((lesson) => {
      if (!isCancelled) {
        setLinkedLesson(lesson);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [currentQ?.id]);

  const handleReviewLesson = async (slug: string) => {
    if (!activeRun) return;

    // Ensure active run position is persisted to this current question
    await api.updateQuizRun(activeRun.id, {
      current_index: currentIndex,
      status: 'in_progress',
    });

    if (onReviewLesson) {
      onReviewLesson(slug, activeRun, currentIndex);
    }
  };

  const handleSelectOption = async (optId: string) => {
    if (isAnswered || !currentQ || !activeRun) return;

    // Lock answer immediately
    setSelectedOptionId(optId);
    setIsAnswered(true);

    const chosen = currentQ.options.find((o) => o.id === optId)!;
    const correct = currentQ.options.find((o) => o.is_correct)!;
    const isCorrect = chosen.is_correct;

    const nextStreak = isCorrect ? currentStreak + 1 : 0;
    setCurrentStreak(nextStreak);
    onStreakUpdate(nextStreak);

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

    // Record local answer state
    setAnswers((prev) => {
      // Avoid duplicate local answer records for same question
      if (prev.some((a) => a.questionId === currentQ.id)) {
        return prev;
      }
      return [
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
          lessonId: linkedLesson?.id || currentQ.lesson_id || null,
          lessonSlug: linkedLesson?.slug || null,
          lessonTitle: linkedLesson?.title || null,
        },
      ];
    });

    // Save answer immediately via api.ts (idempotent ON CONFLICT DO NOTHING)
    const sessionId = api.getOrCreateSessionId();
    const result = await api.recordAnswer({
      runId: activeRun.id,
      sessionId,
      questionId: currentQ.id,
      topicId: currentQ.topic_id,
      chosenId: optId,
      isCorrect,
    });

    if (!result.synced) {
      setSyncNotice('Saved on this device, will sync');
    } else {
      setSyncNotice(null);
    }

    // Mark run completed on the last answer
    if (currentIndex === questions.length - 1) {
      await api.updateQuizRun(activeRun.id, {
        current_index: currentIndex,
        status: 'completed',
      });
    }
  };

  const handleNext = async () => {
    if (!activeRun) return;

    if (currentIndex + 1 < questions.length) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);

      // Check if next question was already answered in resumed run
      const nextQ = questions[nextIdx];
      const existingAnswer = answers.find((a) => a.questionId === nextQ.id);

      if (existingAnswer) {
        setSelectedOptionId(existingAnswer.chosenOptionId);
        setIsAnswered(true);
      } else {
        setSelectedOptionId(null);
        setIsAnswered(false);
      }

      // Update run's current_index
      await api.updateQuizRun(activeRun.id, {
        current_index: nextIdx,
        status: 'in_progress',
      });
    } else {
      // Quiz complete
      await api.updateQuizRun(activeRun.id, {
        current_index: currentIndex,
        status: 'completed',
      });

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
      <div className="py-16 text-center space-y-4">
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
          type="button"
          onClick={onBackToHome}
          className="min-h-[44px] px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-semibold focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none"
        >
          Return to Topics
        </button>
      </div>
    );
  }

  const chosenOpt = currentQ.options.find((o) => o.id === selectedOptionId);
  const correctOpt = currentQ.options.find((o) => o.is_correct);

  return (
    <div className="space-y-4 pb-24 sm:pb-8">
      {/* Top Header & Sync Status */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBackToHome}
          className="min-h-[44px] min-w-[44px] px-3.5 py-2.5 text-xs text-slate-400 hover:text-white flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none rounded-xl bg-slate-800/40 hover:bg-slate-800/80 transition-colors"
        >
          &larr; Exit to Topics
        </button>

        {syncNotice ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <CloudOff className="w-3 h-3 text-amber-400" />
            <span>Saved on this device, will sync</span>
          </span>
        ) : pendingCount > 0 ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <RefreshCw className="w-3 h-3 text-blue-400 animate-spin" />
            <span>Syncing {pendingCount} offline answers...</span>
          </span>
        ) : null}
      </div>

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
        <div
          role="progressbar"
          aria-valuenow={currentIndex + 1}
          aria-valuemin={1}
          aria-valuemax={questions.length}
          className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden"
        >
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Responsive Layout: 1 col below lg; 2 columns from lg */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Question & Options (max-w-[640px] on desktop) */}
        <div className="lg:col-span-7 w-full max-w-[640px] space-y-4">
          {/* Question Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                {topicTitle}
              </span>
              <span className="text-[10px] sm:text-xs text-slate-400 flex items-center gap-1.5">
                <span>Difficulty:</span>
                <span
                  className={`w-2 h-2 rounded-full inline-block ${
                    currentQ.difficulty === 1
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

            <h3 className="text-sm sm:text-base font-semibold text-white leading-relaxed break-words">
              {currentQ.question}
            </h3>
          </div>

          {/* Options List */}
          <div className="space-y-2.5" role="group" aria-label="Question options">
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
                  type="button"
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(opt.id)}
                  className={`w-full min-h-[44px] p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none ${btnClass}`}
                >
                  <span
                    className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      isAnswered && opt.is_correct
                        ? 'bg-emerald-500 text-white'
                        : isAnswered && isSelected && !opt.is_correct
                        ? 'bg-rose-500 text-white'
                        : 'bg-slate-700/60 text-slate-300'
                    }`}
                  >
                    {opt.id}
                  </span>
                  <span className="text-xs sm:text-sm leading-relaxed flex-1 pt-0.5 break-words">{opt.text}</span>
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

          {/* Feedback Drawer (Mobile and tablet below lg) */}
          <div className="lg:hidden">
            {isAnswered && chosenOpt && (
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/90 border border-slate-700 shadow-xl space-y-3 animate-pop mt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {chosenOpt.is_correct ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Correct!
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Incorrect
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowExplainerModal(true)}
                    className="min-h-[44px] px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-medium flex items-center gap-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-blue-400" />
                    <span>Explain it simply</span>
                  </button>
                </div>

                <div className="text-xs sm:text-sm space-y-2 text-slate-300">
                  <div>
                    <p className="font-semibold text-white">Your selection (Option {chosenOpt.id}):</p>
                    <p className="text-slate-300 mt-0.5 leading-relaxed break-words">{chosenOpt.rationale}</p>
                  </div>

                  {!chosenOpt.is_correct && correctOpt && (
                    <div className="pt-2 border-t border-slate-700/60">
                      <p className="font-semibold text-emerald-300">Why Option {correctOpt.id} is correct:</p>
                      <p className="text-slate-300 mt-0.5 leading-relaxed break-words">{correctOpt.rationale}</p>
                    </div>
                  )}
                </div>

                {linkedLesson && (
                  <div className="pt-2 border-t border-slate-700/60">
                    <button
                      type="button"
                      onClick={() => handleReviewLesson(linkedLesson.slug)}
                      className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 text-xs font-semibold flex items-center justify-between gap-2 transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none"
                    >
                      <span className="flex items-center gap-2 text-left min-w-0">
                        <BookOpen className="w-4 h-4 text-blue-400 shrink-0" />
                        <span className="truncate">Review: <strong className="text-white">{linkedLesson.title}</strong></span>
                      </span>
                      <ArrowRight className="w-4 h-4 text-blue-400 shrink-0" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sticky Feedback Panel on Desktop (from lg) */}
        <div className="hidden lg:block lg:col-span-5 lg:sticky lg:top-24 space-y-4">
          {!isAnswered ? (
            <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-slate-900/50 border border-dashed border-slate-800 text-center min-h-[320px] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
                <Lightbulb className="w-6 h-6 text-blue-400" />
              </div>
              <h4 className="text-base font-bold text-white">Answer to see why</h4>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Select an option on the left to reveal the detailed answer rationale and official exam guidance.
              </p>
            </div>
          ) : chosenOpt ? (
            <div className="p-5 rounded-2xl bg-slate-800/90 border border-slate-700 shadow-xl space-y-4 animate-pop">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {chosenOpt.is_correct ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Correct!
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Incorrect
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setShowExplainerModal(true)}
                  className="min-h-[44px] px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-medium flex items-center gap-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-blue-400" />
                  <span>Explain it simply</span>
                </button>
              </div>

              <div className="text-sm space-y-3 text-slate-300">
                <div>
                  <p className="font-semibold text-white">Your selection (Option {chosenOpt.id}):</p>
                  <p className="text-slate-300 mt-1 leading-relaxed break-words">{chosenOpt.rationale}</p>
                </div>

                {!chosenOpt.is_correct && correctOpt && (
                  <div className="pt-3 border-t border-slate-700/60">
                    <p className="font-semibold text-emerald-300">Why Option {correctOpt.id} is correct:</p>
                    <p className="text-slate-300 mt-1 leading-relaxed break-words">{correctOpt.rationale}</p>
                  </div>
                )}
              </div>

              {linkedLesson && (
                <div className="pt-3 border-t border-slate-700/60">
                  <button
                    type="button"
                    onClick={() => handleReviewLesson(linkedLesson.slug)}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 text-xs font-semibold flex items-center justify-between gap-2 transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none"
                  >
                    <span className="flex items-center gap-2 text-left min-w-0">
                      <BookOpen className="w-4 h-4 text-blue-400 shrink-0" />
                      <span className="truncate">Review: <strong className="text-white">{linkedLesson.title}</strong></span>
                    </span>
                    <ArrowRight className="w-4 h-4 text-blue-400 shrink-0" />
                  </button>
                </div>
              )}

              {/* Next button directly inside the sticky desktop panel */}
              <button
                type="button"
                onClick={handleNext}
                className="w-full min-h-[44px] py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none active:scale-[0.98] mt-2"
              >
                <span>{currentIndex + 1 < questions.length ? 'Next Question' : 'View Results'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Sticky Bottom Next Button Bar on Mobile (hidden from lg where it lives in sticky panel) */}
      {isAnswered && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 p-3 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 shadow-2xl flex justify-center safe-area-pb safe-area-px">
          <button
            type="button"
            onClick={handleNext}
            className="w-full min-h-[44px] py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none active:scale-[0.98]"
          >
            <span>{currentIndex + 1 < questions.length ? 'Next Question' : 'View Results'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* "Explain It Simply" Modal (Kenyan Analogy + Exact Azure Term) */}
      {showExplainerModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="explainer-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-pop"
        >
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-blue-500/30 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                <Lightbulb className="w-4 h-4" />
                <span id="explainer-modal-title">Explain It Simply</span>
              </div>
              <button
                type="button"
                onClick={() => setShowExplainerModal(false)}
                className="text-slate-400 hover:text-white p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-200">
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
                type="button"
                onClick={() => setShowExplainerModal(false)}
                className="w-full min-h-[44px] py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl text-xs sm:text-sm focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none"
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
