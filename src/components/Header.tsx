import React from 'react';
import { Cloud, BarChart2, BookOpen, Layers, Flame } from 'lucide-react';

export type PrimaryTab = 'learn' | 'practice' | 'readiness';

interface HeaderProps {
  activeTab: PrimaryTab;
  onTabChange: (tab: PrimaryTab) => void;
  streak?: number;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange, streak = 0 }) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-3 sm:px-6 py-2 sm:py-3 landscape-compact-header flex items-center justify-between gap-2 safe-area-px safe-area-pt">
      {/* Brand & Unofficial Label */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onTabChange('learn')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onTabChange('learn');
          }
        }}
        className="flex items-center gap-2 cursor-pointer select-none group min-h-[44px] rounded-xl focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none p-1 min-w-0 flex-1 sm:flex-initial"
        aria-label="AZ-900 Prep Coach Home"
      >
        <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform shrink-0">
          <Cloud className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h1 className="font-bold text-sm sm:text-base tracking-tight text-white flex items-center gap-1.5 truncate">
            AZ-900 Prep Coach
          </h1>
          <span className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase block truncate">
            UNOFFICIAL STUDY TOOL
          </span>
        </div>
      </div>

      {/* Desktop Primary Navigation (md and up) */}
      <nav aria-label="Desktop primary navigation" className="hidden md:flex items-center gap-1 bg-slate-950/70 p-1 rounded-2xl border border-slate-800">
        <button
          type="button"
          onClick={() => onTabChange('learn')}
          aria-current={activeTab === 'learn' ? 'page' : undefined}
          className={`min-h-[44px] min-w-[44px] px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none ${
            activeTab === 'learn'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Learn</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('practice')}
          aria-current={activeTab === 'practice' ? 'page' : undefined}
          className={`min-h-[44px] min-w-[44px] px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none ${
            activeTab === 'practice'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Practice</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('readiness')}
          aria-current={activeTab === 'readiness' ? 'page' : undefined}
          className={`min-h-[44px] min-w-[44px] px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none ${
            activeTab === 'readiness'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Readiness</span>
        </button>
      </nav>

      {/* Streak Badge */}
      <div className="flex items-center gap-2 shrink-0">
        {streak >= 3 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold animate-pulse">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
            <span>{streak}</span>
          </div>
        )}
      </div>
    </header>
  );
};
