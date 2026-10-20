import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { QuizPage, QuizResult } from './pages/QuizPage';
import { ResultPage } from './pages/ResultPage';
import { ReadinessPage } from './pages/ReadinessPage';
import { getOrCreateSessionId } from './lib/supabase';

type Screen = 'home' | 'quiz' | 'result' | 'readiness';

export const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [activeTopicSlug, setActiveTopicSlug] = useState<string | null>(null);
  const [activeTopicTitle, setActiveTopicTitle] = useState<string>('Practice Quiz');
  const [quizResults, setQuizResults] = useState<QuizResult | null>(null);
  const [streak, setStreak] = useState<number>(0);

  // Initialize client session on mount
  useEffect(() => {
    getOrCreateSessionId();
  }, []);

  const handleStartQuiz = (topicSlug: string | null, topicTitle: string) => {
    setActiveTopicSlug(topicSlug);
    setActiveTopicTitle(topicTitle);
    setCurrentScreen('quiz');
  };

  const handleFinishQuiz = (results: QuizResult) => {
    setQuizResults(results);
    setCurrentScreen('result');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col bg-slate-900 border-x border-slate-800 shadow-2xl relative min-h-screen">
        {/* Sticky Header */}
        <Header
          currentScreen={currentScreen}
          onNavigate={(screen) => setCurrentScreen(screen)}
          streak={streak}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 overflow-y-auto">
          {currentScreen === 'home' && (
            <HomePage
              onStartQuiz={handleStartQuiz}
              onNavigateReadiness={() => setCurrentScreen('readiness')}
            />
          )}

          {currentScreen === 'quiz' && (
            <QuizPage
              topicSlug={activeTopicSlug}
              topicTitle={activeTopicTitle}
              onFinishQuiz={handleFinishQuiz}
              onBackToHome={() => setCurrentScreen('home')}
              onStreakUpdate={(s) => setStreak(s)}
            />
          )}

          {currentScreen === 'result' && quizResults && (
            <ResultPage
              results={quizResults}
              onRetryWeakTopics={(weakTopicId) => handleStartQuiz(weakTopicId, 'Weak Area Retry')}
              onNavigateHome={() => setCurrentScreen('home')}
              onNavigateReadiness={() => setCurrentScreen('readiness')}
            />
          )}

          {currentScreen === 'readiness' && (
            <ReadinessPage
              onStartQuiz={handleStartQuiz}
              onNavigateHome={() => setCurrentScreen('home')}
            />
          )}
        </main>

        {/* Footer on Every Screen */}
        <Footer />
      </div>
    </div>
  );
};

export default App;
