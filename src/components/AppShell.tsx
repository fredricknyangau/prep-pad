import React from 'react';
import { Header, PrimaryTab } from './Header';
import { BottomNav } from './BottomNav';
import { Footer } from './Footer';

interface AppShellProps {
  activeTab: PrimaryTab;
  onTabChange: (tab: PrimaryTab) => void;
  streak?: number;
  isOffline?: boolean;
  isQuizActive?: boolean;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  activeTab,
  onTabChange,
  streak = 0,
  isOffline = false,
  isQuizActive = false,
  children,
}) => {
  return (
    <div className="min-h-dvh bg-slate-950 text-slate-100 flex flex-col font-sans antialiased overflow-x-hidden">
      {/* Sticky Header with Desktop Top Nav */}
      <Header activeTab={activeTab} onTabChange={onTabChange} streak={streak} />

      {/* Offline notification banner if device is currently offline */}
      {isOffline && (
        <div className="bg-amber-600/90 text-amber-50 px-4 py-2 text-xs font-semibold flex items-center justify-center text-center sticky top-14 z-30 shadow-md safe-area-px">
          <span>Offline mode &bull; Content cached locally and progress will sync when reconnected.</span>
        </div>
      )}

      {/* Main Container: mx-auto w-full max-w-screen-xl px-4 sm:px-6 lg:px-8 */}
      <div className="mx-auto w-full max-w-screen-xl px-4 sm:px-6 lg:px-8 flex-1 flex flex-col min-w-0">
        <main className={`flex-1 py-4 sm:py-6 min-w-0 ${isQuizActive ? 'pb-24 sm:pb-8' : 'pb-24 md:pb-8'}`}>
          {children}
        </main>
      </div>

      {/* Footer on Every Screen */}
      <Footer />

      {/* Mobile Bottom Tab Bar: hidden during quiz to avoid sticky Next button collision */}
      {!isQuizActive && <BottomNav activeTab={activeTab} onTabChange={onTabChange} />}
    </div>
  );
};
