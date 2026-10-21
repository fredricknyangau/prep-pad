import React, { useState, useEffect } from 'react';
import { AppShell } from './components/AppShell';
import type { PrimaryTab } from './components/Header';
import type { QuizRun, QuizMode } from './lib/api';
import type { QuizResult } from './pages/QuizPage';
import * as api from './lib/api';

const HomePage = React.lazy(() =>
  import('./pages/HomePage').then((m) => ({ default: m.HomePage }))
);
const LearnHomePage = React.lazy(() =>
  import('./pages/LearnHomePage').then((m) => ({ default: m.LearnHomePage }))
);
const LessonPage = React.lazy(() =>
  import('./pages/LessonPage').then((m) => ({ default: m.LessonPage }))
);
const QuizPage = React.lazy(() =>
  import('./pages/QuizPage').then((m) => ({ default: m.QuizPage }))
);
const ResultPage = React.lazy(() =>
  import('./pages/ResultPage').then((m) => ({ default: m.ResultPage }))
);
const ReadinessPage = React.lazy(() =>
  import('./pages/ReadinessPage').then((m) => ({ default: m.ReadinessPage }))
);

const PageSkeleton: React.FC = () => (
  <div className="space-y-6 animate-pulse py-2" aria-busy="true" aria-label="Loading page content">
    <div className="h-28 bg-slate-800/50 rounded-2xl border border-slate-700/50" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="h-40 bg-slate-800/40 rounded-2xl border border-slate-800" />
      <div className="h-40 bg-slate-800/40 rounded-2xl border border-slate-800" />
      <div className="h-40 bg-slate-800/40 rounded-2xl border border-slate-800" />
    </div>
  </div>
);

type Screen = 'learn' | 'lesson' | 'practice' | 'quiz' | 'result' | 'readiness';

export const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('learn');
  const [selectedLessonSlug, setSelectedLessonSlug] = useState<string | null>(null);
  const [activeTopicSlug, setActiveTopicSlug] = useState<string | null>(null);
  const [activeTopicTitle, setActiveTopicTitle] = useState<string>('Practice Quiz');
  const [quizMode, setQuizMode] = useState<QuizMode>('mixed');
  const [resumeRun, setResumeRun] = useState<QuizRun | null>(null);
  const [returnToQuizState, setReturnToQuizState] = useState<{
    run: QuizRun;
    topicSlug: string | null;
    topicTitle: string;
    quizMode: QuizMode;
  } | null>(null);
  const [quizResults, setQuizResults] = useState<QuizResult | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [isOffline, setIsOffline] = useState<boolean>(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );

  // Initialize client session and flush any queued offline answers & lesson progress on mount
  useEffect(() => {
    api.getOrCreateSessionId();
    api.flushAllPending();

    const handleOnline = () => {
      setIsOffline(false);
      api.flushAllPending();
    };
    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const activeTab: PrimaryTab =
    currentScreen === 'learn' || currentScreen === 'lesson'
      ? 'learn'
      : currentScreen === 'readiness'
      ? 'readiness'
      : 'practice';

  const handleTabChange = (tab: PrimaryTab) => {
    if (tab === 'learn') {
      setCurrentScreen('learn');
    } else if (tab === 'practice') {
      setCurrentScreen('practice');
    } else if (tab === 'readiness') {
      setCurrentScreen('readiness');
    }
  };

  const handleSelectLesson = (slug: string) => {
    setSelectedLessonSlug(slug);
    setCurrentScreen('lesson');
  };

  const handleStartQuiz = (
    topicSlug: string | null,
    topicTitle: string,
    mode: QuizMode = 'topic'
  ) => {
    setResumeRun(null);
    setReturnToQuizState(null);
    setActiveTopicSlug(topicSlug);
    setActiveTopicTitle(topicTitle);
    setQuizMode(mode);
    setCurrentScreen('quiz');
  };

  const handleResumeQuiz = (run: QuizRun, title?: string) => {
    setResumeRun(run);
    setActiveTopicSlug(run.topic_slug);
    setActiveTopicTitle(title || (run.mode === 'mixed' ? 'Mixed Practice Quiz' : 'Practice Quiz'));
    setQuizMode(run.mode);
    setCurrentScreen('quiz');
  };

  const handleReviewLessonFromQuiz = (
    slug: string,
    run: QuizRun,
    currentIndex: number
  ) => {
    setReturnToQuizState({
      run: { ...run, current_index: currentIndex },
      topicSlug: activeTopicSlug,
      topicTitle: activeTopicTitle,
      quizMode,
    });
    setSelectedLessonSlug(slug);
    setCurrentScreen('lesson');
  };

  const handleBackToQuiz = () => {
    if (returnToQuizState) {
      setResumeRun(returnToQuizState.run);
      setActiveTopicSlug(returnToQuizState.topicSlug);
      setActiveTopicTitle(returnToQuizState.topicTitle);
      setQuizMode(returnToQuizState.quizMode);
      setCurrentScreen('quiz');
    }
  };

  const handleFinishQuiz = (results: QuizResult) => {
    setQuizResults(results);
    setResumeRun(null);
    setReturnToQuizState(null);
    setCurrentScreen('result');
  };

  return (
    <AppShell
      activeTab={activeTab}
      onTabChange={handleTabChange}
      streak={streak}
      isOffline={isOffline}
      isQuizActive={currentScreen === 'quiz'}
    >
      <React.Suspense fallback={<PageSkeleton />}>
        {currentScreen === 'learn' && (
          <LearnHomePage
            onSelectLesson={handleSelectLesson}
            onNavigatePractice={() => setCurrentScreen('practice')}
          />
        )}

        {currentScreen === 'lesson' && selectedLessonSlug && (
          <LessonPage
            lessonSlug={selectedLessonSlug}
            onNavigateHome={() => setCurrentScreen('learn')}
            onSelectLesson={handleSelectLesson}
            onStartQuiz={handleStartQuiz}
            onBackToQuiz={returnToQuizState ? handleBackToQuiz : undefined}
          />
        )}

        {currentScreen === 'practice' && (
          <HomePage
            onStartQuiz={handleStartQuiz}
            onResumeQuiz={handleResumeQuiz}
            onNavigateReadiness={() => setCurrentScreen('readiness')}
            onSelectLesson={handleSelectLesson}
          />
        )}

        {currentScreen === 'quiz' && (
          <QuizPage
            topicSlug={activeTopicSlug}
            topicTitle={activeTopicTitle}
            quizMode={quizMode}
            resumeRun={resumeRun}
            onFinishQuiz={handleFinishQuiz}
            onBackToHome={() => setCurrentScreen('practice')}
            onStreakUpdate={(s) => setStreak(s)}
            onReviewLesson={handleReviewLessonFromQuiz}
          />
        )}

        {currentScreen === 'result' && quizResults && (
          <ResultPage
            results={quizResults}
            onRetryWeakTopics={(weakTopicId) =>
              handleStartQuiz(weakTopicId, 'Weak Area Retry', 'weak')
            }
            onNavigateHome={() => setCurrentScreen('practice')}
            onNavigateReadiness={() => setCurrentScreen('readiness')}
            onSelectLesson={handleSelectLesson}
          />
        )}

        {currentScreen === 'readiness' && (
          <ReadinessPage
            onStartQuiz={handleStartQuiz}
            onNavigateHome={() => setCurrentScreen('practice')}
            onSelectLesson={handleSelectLesson}
          />
        )}
      </React.Suspense>
    </AppShell>
  );
};

export default App;
