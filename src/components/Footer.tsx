import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto py-4 px-4 text-center border-t border-slate-800 bg-slate-950/80 backdrop-blur-sm">
      <p className="text-xs font-medium text-slate-400">
        Unofficial: not affiliated with Microsoft
      </p>
      <p className="text-[10px] text-slate-400 mt-1">
        Built for East African cloud candidates &bull; AZ-900 Exam Prep
      </p>
    </footer>
  );
};
