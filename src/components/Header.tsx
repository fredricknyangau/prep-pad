import { Cloud, BarChart2, BookOpen, Flame } from 'lucide-react';

interface HeaderProps {
  currentScreen: 'home' | 'quiz' | 'result' | 'readiness';
  onNavigate: (screen: 'home' | 'quiz' | 'result' | 'readiness') => void;
  streak?: number;
}

export const Header: React.FC<HeaderProps> = ({ currentScreen, onNavigate, streak = 0 }) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
      <div 
        onClick={() => onNavigate('home')}
        className="flex items-center gap-2 cursor-pointer select-none group"
      >
        <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
          <Cloud className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
            AZ-900 Prep Coach
          </h1>
          <span className="text-[10px] text-blue-400 font-medium tracking-wide uppercase">
            Mobile Edition
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {streak >= 3 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold animate-pulse">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
            <span>{streak}</span>
          </div>
        )}

        <button
          onClick={() => onNavigate(currentScreen === 'readiness' ? 'home' : 'readiness')}
          className={`p-2 rounded-xl border transition-all text-xs flex items-center gap-1.5 font-medium ${
            currentScreen === 'readiness'
              ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/30'
              : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
          }`}
          title="Readiness Dashboard"
        >
          {currentScreen === 'readiness' ? (
            <>
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Topics</span>
            </>
          ) : (
            <>
              <BarChart2 className="w-4 h-4" />
              <span className="hidden sm:inline">Readiness</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
