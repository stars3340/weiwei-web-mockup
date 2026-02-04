import React, { useState } from 'react';
import { EmotionType } from '../types';

interface Props {
  onSelectEmotion: (emotion: string) => void;
  onBack: () => void;
}

const EmotionRecognition: React.FC<Props> = ({ onSelectEmotion, onBack }) => {
  const [selected, setSelected] = useState<EmotionType | null>(null);

  const options: { id: EmotionType; icon: string; title: string; color: string; bg: string }[] = [
    { id: 'stress', icon: 'thunderstorm', title: '压力/累', color: 'text-blue-300', bg: 'from-blue-900/40 to-blue-800/10' },
    { id: 'hunger', icon: 'restaurant', title: '真的饿', color: 'text-orange-300', bg: 'from-orange-900/40 to-orange-800/10' },
    { id: 'habit', icon: 'history', title: '惯性手滑', color: 'text-emerald-300', bg: 'from-emerald-900/40 to-emerald-800/10' },
    { id: 'reward', icon: 'celebration', title: '求安慰', color: 'text-purple-300', bg: 'from-purple-900/40 to-purple-800/10' },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-background-dark animate-fade-in relative overflow-hidden">
      <header className="flex items-center justify-between p-6 z-20 shrink-0">
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onBack();
          }}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-dark border border-white/5 text-gray-400 hover:text-white transition-colors active:scale-[0.98]"
          style={{ touchAction: 'manipulation' }}
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 flex flex-col px-6 overflow-y-auto">
        <div className="mb-8">
           <h1 className="text-3xl font-bold text-white mb-2 leading-tight">诚实地感受一下，<br/>现在是什么感觉？</h1>
           <p className="text-gray-400 text-base">精准识别情绪，是拿回控制权的第一步。</p>
        </div>

        <div className="grid grid-cols-2 gap-4 auto-rows-fr">
          {options.map((opt) => (
            <button 
              key={opt.id}
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                setSelected(opt.id);
              }}
              className={`relative flex flex-col items-start justify-between p-5 rounded-2xl border transition-all duration-300 aspect-square text-left group overflow-hidden ${selected === opt.id ? 'border-primary ring-2 ring-primary/30' : 'border-white/5 hover:border-white/20'}`}
              style={{ touchAction: 'manipulation' }}
            >
              {/* Gradient BG */}
              <div className={`absolute inset-0 bg-gradient-to-br ${opt.bg} opacity-0 group-hover:opacity-100 transition-opacity ${selected === opt.id ? 'opacity-100' : ''}`}></div>
              
              <div className={`relative z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md ${opt.color}`}>
                <span className="material-symbols-outlined text-[24px]">{opt.icon}</span>
              </div>
              
              <div className="relative z-10 w-full flex justify-between items-end">
                <span className="text-lg font-bold text-white leading-tight">{opt.title}</span>
                {selected === opt.id && <span className="material-symbols-outlined text-primary text-[20px] animate-fade-in">check_circle</span>}
              </div>
            </button>
          ))}
        </div>
      </main>

      <div className="p-6 pb-8 bg-gradient-to-t from-background-dark via-background-dark to-transparent shrink-0">
        <button 
          disabled={!selected}
          type="button"
          onPointerDown={(e) => {
            if (!selected) return;
            e.preventDefault();
            onSelectEmotion(selected);
          }}
          className={`w-full flex items-center justify-center gap-2 text-white text-lg font-bold h-14 rounded-xl shadow-lg transition-all transform active:scale-[0.98] ${selected ? 'bg-primary hover:bg-blue-600 shadow-blue-500/20' : 'bg-surface-highlight text-gray-500 opacity-50 cursor-not-allowed'}`}
          style={{ touchAction: 'manipulation' }}
        >
          <span>就选这个，下一步</span>
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};

export default EmotionRecognition;
