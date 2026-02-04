import React, { useEffect, useState } from 'react';
import { AppState } from '../types';

interface Props {
  stats: AppState['stats'];
  onSimulateInterruption: () => void;
  onEndFocus: () => void;
  onHome?: () => void;
  onSettings?: () => void;
}

const FocusDashboard: React.FC<Props> = ({ stats, onSimulateInterruption, onEndFocus, onHome, onSettings }) => {
  return (
    <div className="relative flex flex-col h-full w-full bg-background-dark overflow-hidden animate-fade-in text-white">
       {/* Ambient Dynamic Background */}
       <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[60%] bg-primary/20 rounded-full blur-[120px] animate-pulse-glow"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[50%] bg-purple-900/20 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '2s' }}></div>
       </div>

       {/* Top Status Bar (Fixed) */}
       <div className="relative z-10 flex items-center justify-between p-6 shrink-0">
         <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/5">
           <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
           <span className="text-[11px] font-bold tracking-wider text-green-400 uppercase">ACTIVE GUARD</span>
         </div>
         <div className="flex gap-2">
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                onSettings?.();
              }}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors active:scale-[0.98]"
              style={{ touchAction: 'manipulation' }}
              aria-label="Settings"
            >
              <span className="material-symbols-outlined text-white/60 text-[20px]">settings</span>
            </button>
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                onEndFocus();
              }}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors active:scale-[0.98]"
              style={{ touchAction: 'manipulation' }}
              aria-label="End"
            >
                <span className="material-symbols-outlined text-white/60 text-[20px]">power_settings_new</span>
            </button>
         </div>
       </div>

       {/* Main Content (Scrollable) */}
       <div className="relative z-10 flex-1 overflow-y-auto flex flex-col items-center justify-center w-full px-6 -mt-10">
         
         {/* Central Totem - No longer clickable to exit */}
         <div className="relative mb-12 select-none pointer-events-none">
           {/* Breathing Rings */}
           <div className="absolute inset-0 rounded-full border border-primary/30 animate-ping" style={{ animationDuration: '3s' }}></div>
           <div className="absolute inset-[-20px] rounded-full bg-primary/5 blur-xl animate-pulse"></div>
           
           <div className="relative w-56 h-56 rounded-full bg-gradient-to-b from-surface-highlight to-background-dark border border-white/10 shadow-[0_0_50px_rgba(23,84,207,0.25)] flex items-center justify-center backdrop-blur-xl">
              <div className="flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-5xl text-blue-200 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">accessibility_new</span>
                <span className="text-xs font-medium text-blue-200/60 tracking-widest uppercase mt-2">SHAPE GUARD</span>
              </div>
           </div>
           
           {/* Floating Badge */}
           <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-surface-dark border border-white/10 px-4 py-1.5 rounded-full shadow-xl flex items-center gap-2 whitespace-nowrap">
              <span className="material-symbols-outlined text-yellow-400 text-[16px]">bolt</span>
              <span className="text-xs font-bold">已保持空腹 {stats.returns * 20} 分钟</span>
           </div>
         </div>

         <div className="text-center space-y-3 max-w-[280px]">
           <h1 className="text-2xl font-bold tracking-tight text-white leading-tight">
             此刻的饥饿感<br/>是身体变轻的信号
           </h1>
           <p className="text-gray-400 text-sm font-medium leading-relaxed">
             外卖软件已被锁定。<br/>享受这种轻盈，明天你会感谢自己。
           </p>
         </div>
       </div>

       {/* Bottom Actions (Fixed) */}
       <div className="relative z-10 flex flex-col w-full px-6 pb-8 gap-4 shrink-0">
         <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-dark/50 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center gap-1 backdrop-blur-sm">
               <span className="text-2xl font-bold text-white">{stats.attempts}</span>
               <span className="text-[10px] text-gray-400 uppercase tracking-wider">冲动念头</span>
            </div>
            <div className="bg-surface-dark/50 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center gap-1 backdrop-blur-sm">
               <span className="text-2xl font-bold text-green-400">{stats.returns}</span>
               <span className="text-[10px] text-gray-400 uppercase tracking-wider">成功拦截</span>
            </div>
         </div>

         <button
           type="button"
           className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-white font-bold text-sm flex items-center justify-center gap-2 group active:scale-[0.98]"
           onPointerDown={(e) => {
             e.preventDefault();
             onHome?.();
           }}
           style={{ touchAction: 'manipulation' }}
         >
            <span className="material-symbols-outlined text-gray-400 group-hover:text-white transition-colors">home_app_logo</span>
             回到桌面 (测试拦截)
         </button>
       </div>
    </div>
  );
};

export default FocusDashboard;
