import React from 'react';

interface Props {
  onReturnToFocus: () => void;
  onNeedToEat: () => void;
  onEndFocus: () => void;
}

const ReEntry: React.FC<Props> = ({ onReturnToFocus, onNeedToEat, onEndFocus }) => {
  return (
    <div className="flex flex-col h-full w-full bg-background-dark animate-fade-in justify-between overflow-hidden">
      <div className="w-full h-12 shrink-0"></div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8 w-full overflow-y-auto">
        {/* Icon */}
        <div className="mb-10 relative flex items-center justify-center">
          <div className="absolute w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="relative z-10 w-24 h-24 rounded-full bg-surface-dark flex items-center justify-center border border-white/5 shadow-2xl backdrop-blur-sm">
            <span className="material-symbols-outlined text-primary text-5xl">scale</span>
          </div>
        </div>

        <h1 className="text-white text-[28px] md:text-[32px] font-extrabold leading-tight text-center mb-4 animate-slide-up">
          等一下，<br/>我们再确认最后一次。
        </h1>
        <p className="text-gray-400 text-base md:text-lg font-medium leading-relaxed text-center max-w-[320px] animate-slide-up" style={{ animationDelay: '0.1s' }}>
          食欲的浪潮往往只要几分钟就会退去。<br/>现在的克制，是明天清爽的脸庞。
        </p>
      </div>

      <div className="w-full px-6 pb-10 flex flex-col gap-3 animate-slide-up shrink-0" style={{ animationDelay: '0.2s' }}>
        <button 
          onClick={onReturnToFocus}
          className="group relative flex w-full items-center justify-center overflow-hidden rounded-xl h-14 bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-[0.98]"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className="material-symbols-outlined mr-2 text-[20px]">fitness_center</span>
          <span className="text-lg font-bold tracking-wide">不吃了，我要变美</span>
        </button>

        <button 
          onClick={onNeedToEat}
          className="flex w-full items-center justify-center rounded-xl h-14 bg-surface-dark border border-white/10 text-gray-200 hover:bg-white/5 transition-colors active:scale-[0.98]"
        >
          <span className="text-base font-semibold">但我确实很饿 / 很难受...</span>
        </button>
      </div>
    </div>
  );
};

export default ReEntry;