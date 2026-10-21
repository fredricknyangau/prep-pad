import React from 'react';
import { BookOpen, Layers, BarChart2 } from 'lucide-react';

export type PrimaryTab = 'learn' | 'practice' | 'readiness';

interface BottomNavProps {
  activeTab: PrimaryTab;
  onTabChange: (tab: PrimaryTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-3 py-1.5 flex items-center justify-around shadow-2xl safe-area-pb safe-area-px"
    >
      <button
        type="button"
        onClick={() => onTabChange('learn')}
        aria-current={activeTab === 'learn' ? 'page' : undefined}
        className={`min-h-[48px] min-w-[64px] flex-1 flex flex-col items-center justify-center gap-1 rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none py-1 ${
          activeTab === 'learn'
            ? 'text-blue-400 font-bold'
            : 'text-slate-400 hover:text-slate-200 font-medium'
        }`}
      >
        <BookOpen className={`w-5 h-5 ${activeTab === 'learn' ? 'stroke-[2.5]' : 'stroke-2'}`} />
        <span className="text-[11px] tracking-tight">Learn</span>
      </button>

      <button
        type="button"
        onClick={() => onTabChange('practice')}
        aria-current={activeTab === 'practice' ? 'page' : undefined}
        className={`min-h-[48px] min-w-[64px] flex-1 flex flex-col items-center justify-center gap-1 rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none py-1 ${
          activeTab === 'practice'
            ? 'text-blue-400 font-bold'
            : 'text-slate-400 hover:text-slate-200 font-medium'
        }`}
      >
        <Layers className={`w-5 h-5 ${activeTab === 'practice' ? 'stroke-[2.5]' : 'stroke-2'}`} />
        <span className="text-[11px] tracking-tight">Practice</span>
      </button>

      <button
        type="button"
        onClick={() => onTabChange('readiness')}
        aria-current={activeTab === 'readiness' ? 'page' : undefined}
        className={`min-h-[48px] min-w-[64px] flex-1 flex flex-col items-center justify-center gap-1 rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none py-1 ${
          activeTab === 'readiness'
            ? 'text-blue-400 font-bold'
            : 'text-slate-400 hover:text-slate-200 font-medium'
        }`}
      >
        <BarChart2 className={`w-5 h-5 ${activeTab === 'readiness' ? 'stroke-[2.5]' : 'stroke-2'}`} />
        <span className="text-[11px] tracking-tight">Readiness</span>
      </button>
    </nav>
  );
};
