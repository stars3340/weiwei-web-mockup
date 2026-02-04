import React from 'react';

interface Props {
  selectedIntensity: 'standard' | 'strict';
  onSelect: (val: 'standard' | 'strict') => void;
  onNext: () => void;
  onBack: () => void;
}

const IntensitySelection: React.FC<Props> = ({ selectedIntensity, onSelect, onNext, onBack }) => {
  return (
    <div className="flex flex-col h-full w-full bg-background-dark animate-fade-in relative overflow-hidden">
       {/* Nav */}
       <div className="flex items-center justify-between p-4 pt-6 pb-2 shrink-0">
        <button onClick={onBack} className="flex size-10 items-center justify-center rounded-full hover:bg-white/10 transition-colors">
          <span className="material-symbols-outlined text-white">arrow_back_ios_new</span>
        </button>
        {/* Dots */}
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-gray-700"></div>
          <div className="h-1.5 w-6 rounded-full bg-primary"></div>
          <div className="h-1.5 w-1.5 rounded-full bg-gray-700"></div>
        </div>
        <div className="size-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col px-6 pt-4 pb-6">
            <h1 className="text-[32px] font-bold leading-tight text-white mb-3">拦截力度</h1>
            <p className="text-base text-gray-400">设置我们如何介入。别担心，目标是帮你找回控制权，而不是把你锁死。</p>
        </div>

        <div className="flex flex-col gap-5 px-6 flex-1 pb-6">
            {/* Standard */}
            <div 
            onClick={() => onSelect('standard')}
            className={`group relative flex cursor-pointer flex-col gap-4 rounded-2xl border-2 p-5 transition-all duration-300 bg-surface-dark ${selectedIntensity === 'standard' ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(23,84,207,0.2)]' : 'border-primary/20 hover:border-primary/50'}`}
            >
            <div className="flex w-full items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent-warm/20 text-accent-warm">
                <span className="material-symbols-outlined text-[28px]">shield_person</span>
                </div>
                <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-white">温柔提醒</span>
                    <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-bold text-blue-300">推荐</span>
                </div>
                <p className="text-sm font-medium leading-relaxed text-gray-400">
                    打开外卖 App 时会弹出“灵魂拷问”。如果你确认是真的饿，点击后依然可以进入。适合大部分人。
                </p>
                </div>
                {selectedIntensity === 'standard' ? (
                <span className="material-symbols-outlined text-primary absolute right-5 top-5">check_circle</span>
                ) : (
                <span className="material-symbols-outlined text-gray-600 absolute right-5 top-5">radio_button_unchecked</span>
                )}
            </div>
            </div>

            {/* Strict */}
            <div 
            onClick={() => onSelect('strict')}
            className={`group relative flex cursor-pointer flex-col gap-4 rounded-2xl border-2 p-5 transition-all duration-300 bg-surface-dark ${selectedIntensity === 'strict' ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(23,84,207,0.2)]' : 'border-white/5 hover:border-white/20'}`}
            >
            <div className="flex w-full items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gray-800 text-gray-400">
                <span className="material-symbols-outlined text-[28px]">lock</span>
                </div>
                <div className="flex flex-col gap-1">
                <span className="text-lg font-bold text-white">强制阻断</span>
                <p className="text-sm font-medium leading-relaxed text-gray-400">
                    直接无法打开。适合那些“只要看一眼图就忍不住下单”的易感人群。
                </p>
                </div>
                {selectedIntensity === 'strict' ? (
                <span className="material-symbols-outlined text-primary absolute right-5 top-5">check_circle</span>
                ) : (
                <span className="material-symbols-outlined text-gray-600 absolute right-5 top-5">radio_button_unchecked</span>
                )}
            </div>
            </div>
        </div>
      </div>

      <div className="p-6 pb-8 bg-gradient-to-t from-background-dark via-background-dark to-transparent shrink-0">
        <button 
          onClick={onNext}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-center font-bold text-white shadow-lg shadow-blue-900/40 transition-transform active:scale-[0.98]"
        >
          <span>完成设置，开始改变</span>
          <span className="material-symbols-outlined text-[20px]">check</span>
        </button>
      </div>
    </div>
  );
};

export default IntensitySelection;