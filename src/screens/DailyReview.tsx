import React from 'react';
import { AppState } from '../types';

interface Props {
  stats: AppState['stats'];
  onNext: () => void;
}

const DailyReview: React.FC<Props> = ({ stats, onNext }) => {
  // Dummy data for a small sparkline
  const data = [{v:10}, {v:15}, {v:35}, {v:20}, {v:45}, {v:30}, {v:50}];
  const values = data.map((d) => d.v);
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const range = Math.max(1, maxV - minV);

  const points = values.map((v, i) => {
    const x = (i / Math.max(1, values.length - 1)) * 100;
    const y = 30 - ((v - minV) / range) * 28 - 1;
    return { x, y };
  });

  const lineD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
  const areaD = `${lineD} L 100 30 L 0 30 Z`;

  return (
    <div className="flex flex-col h-full w-full bg-background-dark text-white animate-fade-in relative overflow-hidden">
      <div className="sticky top-0 z-10 flex items-center bg-background-dark/90 backdrop-blur-xl p-4 justify-center border-b border-white/5 shrink-0">
        <h2 className="text-base font-bold tracking-wide">今日复盘</h2>
      </div>

      <div className="flex-1 flex flex-col gap-6 p-6 overflow-y-auto">
        
        {/* Main Score Card */}
        <div className="relative flex flex-col items-center justify-center py-8">
           <div className="relative w-40 h-40 flex items-center justify-center">
              {/* Spinning Glow */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/40 to-purple-500/0 animate-spin-slow blur-xl"></div>
              <div className="absolute inset-2 rounded-full bg-surface-dark z-10"></div>
              
              <div className="relative z-20 flex flex-col items-center">
                 <span className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400">92</span>
                 <span className="text-xs font-bold text-primary uppercase tracking-widest mt-1">意志力评分</span>
              </div>
           </div>
           <p className="text-gray-400 text-sm mt-4 font-medium">身体正在通过空腹进行自噬修复</p>
        </div>

        {/* Insight Card - Health Focus */}
        <div className="bg-gradient-to-br from-surface-highlight to-surface-dark border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-6xl">spa</span>
          </div>
          <div className="relative z-10">
            <h3 className="text-lg font-bold text-white mb-1">成功守护</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              成功阻断 {stats.returns} 次进食冲动。<br/>这意味着你的胰岛素水平保持平稳，身体已进入燃脂模式。
            </p>
            <div className="flex gap-2">
               <span className="px-3 py-1 rounded-lg bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20">浮肿 -20%</span>
               <span className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20">热量 -800kcal</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-dark rounded-2xl p-4 border border-white/5 flex flex-col justify-between h-32">
             <div className="flex items-start justify-between">
                <span className="material-symbols-outlined text-gray-500">psychology</span>
                <span className="text-xl font-bold text-white">{stats.attempts}</span>
             </div>
             <div>
                <p className="text-xs text-gray-400 font-medium uppercase mb-1">冲动念头</p>
                <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
                   <div className="h-full bg-gray-400 w-[60%] rounded-full"></div>
                </div>
             </div>
          </div>

          <div className="bg-primary rounded-2xl p-4 border border-primary flex flex-col justify-between h-32 relative overflow-hidden shadow-lg shadow-primary/20">
             <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20"></div>
             <div className="relative z-10 flex items-start justify-between">
                <span className="material-symbols-outlined text-white/80">shield_lock</span>
                <span className="text-xl font-bold text-white">{stats.returns}</span>
             </div>
          <div className="relative z-10">
                <p className="text-xs text-white/80 font-medium uppercase mb-1">成功拦截</p>
                {/* Tiny Chart Background */}
                <div className="h-8 -mx-4 -mb-4 opacity-40 mix-blend-overlay">
                  <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full">
                    <path d={areaD} fill="rgba(255,255,255,0.20)" />
                    <path d={lineD} stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
             </div>
          </div>
        </div>

      </div>

      <div className="p-6 bg-gradient-to-t from-background-dark via-background-dark to-transparent shrink-0">
        <button 
          onClick={onNext}
          className="w-full flex items-center justify-center rounded-xl h-14 bg-surface-highlight border border-white/10 hover:bg-white/10 transition-all text-white gap-2 text-base font-bold"
        >
          <span>查看本周趋势</span>
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};

export default DailyReview;
