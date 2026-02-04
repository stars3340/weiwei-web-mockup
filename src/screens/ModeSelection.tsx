import React from 'react';

interface Props {
  selectedMode: 'night' | 'allDay';
  onSelect: (mode: 'night' | 'allDay') => void;
  onNext: () => void;
  onBack: () => void;
}

const ModeSelection: React.FC<Props> = ({ selectedMode, onSelect, onNext, onBack }) => {
  return (
    <div className="flex flex-col h-full w-full bg-background-dark animate-fade-in relative overflow-hidden">
      <div className="flex items-center p-4 shrink-0 bg-background-dark/90 backdrop-blur-md z-20">
        <button onClick={onBack} className="size-10 flex items-center justify-center rounded-full active:bg-white/10 transition-colors">
          <span className="material-symbols-outlined text-white">arrow_back_ios_new</span>
        </button>
        <h2 className="text-white text-lg font-bold flex-1 text-center pr-10">选择模式</h2>
      </div>

      <div className="flex-1 overflow-y-auto pb-4">
        <div className="px-6 pt-2 pb-6">
            <h1 className="text-[28px] font-bold leading-tight text-center tracking-tight mb-3">
            你想在什么时候<br/><span className="text-primary">保持掌控？</span>
            </h1>
            <p className="text-gray-400 text-center text-sm font-medium leading-relaxed">
            不同的场景，需要不同的守护策略。
            </p>
        </div>

        <div className="px-5 flex flex-col gap-5 pb-6">
            {/* Night Mode Card */}
            <div 
            onClick={() => onSelect('night')}
            className={`relative overflow-hidden rounded-2xl bg-surface-dark transition-all duration-300 active:scale-[0.98] cursor-pointer ${selectedMode === 'night' ? 'ring-2 ring-primary' : 'border border-white/5'}`}
            >
            {selectedMode === 'night' && (
                <div className="absolute top-0 right-0 p-3 z-10">
                <div className="size-6 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/40">
                    <span className="material-symbols-outlined text-white text-sm font-bold">check</span>
                </div>
                </div>
            )}
            <div className="relative h-32 w-full">
                <div className="absolute inset-0 bg-gradient-to-t from-surface-dark to-transparent z-10"></div>
                <div 
                className="w-full h-full bg-cover bg-center opacity-80"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1541336032412-2048a678540d?q=80&w=2574&auto=format&fit=crop')` }}
                />
                <div className="absolute bottom-3 left-4 z-20 flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary text-white">推荐</span>
                <span className="material-symbols-outlined text-primary/80 text-[20px]">dark_mode</span>
                </div>
            </div>
            <div className="px-5 py-4 flex flex-col gap-3">
                <div>
                <h3 className="text-white text-xl font-bold leading-tight mb-1">睡前轻盈模式</h3>
                <p className="text-primary font-bold text-sm tracking-wide">21:30 – 01:30</p>
                </div>
                <div className="h-px w-full bg-white/5"></div>
                <p className="text-gray-400 text-sm leading-relaxed font-medium">
                专治“睡前嘴馋”。切断睡前热量摄入，保证生长激素正常分泌，这是变瘦最简单的路。
                </p>
            </div>
            </div>

            {/* All Day Mode Card */}
            <div 
            onClick={() => onSelect('allDay')}
            className={`relative overflow-hidden rounded-2xl bg-surface-dark transition-all duration-300 active:scale-[0.98] cursor-pointer ${selectedMode === 'allDay' ? 'ring-2 ring-primary' : 'border border-white/5'}`}
            >
            {selectedMode === 'allDay' && (
                <div className="absolute top-0 right-0 p-3 z-10">
                <div className="size-6 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/40">
                    <span className="material-symbols-outlined text-white text-sm font-bold">check</span>
                </div>
                </div>
            )}
            <div className="relative h-24 w-full">
                <div className="absolute inset-0 bg-gradient-to-t from-surface-dark to-transparent z-10"></div>
                <div 
                className="w-full h-full bg-cover bg-center opacity-60 grayscale"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=2671&auto=format&fit=crop')` }}
                />
                <div className="absolute bottom-2 left-4 z-20">
                <span className="material-symbols-outlined text-gray-500 text-[20px]">all_inclusive</span>
                </div>
            </div>
            <div className="px-5 pb-4 pt-2 flex flex-col gap-2">
                <div>
                <h3 className="text-gray-200 text-lg font-bold leading-tight mb-1">全天多巴胺戒断</h3>
                <p className="text-gray-400 font-medium text-sm">自定义时段</p>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed mt-1">
                适合压力型进食严重，习惯性点外卖寻找慰藉，想要重置饮食习惯的用户。
                </p>
            </div>
            </div>
        </div>
      </div>

      <div className="px-5 pt-4 pb-6 bg-background-dark shrink-0">
        <button 
          onClick={onNext}
          className="w-full relative group overflow-hidden rounded-xl bg-primary py-4 px-6 text-center shadow-[0_0_20px_rgba(23,84,207,0.3)] hover:shadow-[0_0_30px_rgba(23,84,207,0.5)] transition-all duration-300"
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          <span className="text-white text-base font-bold tracking-[0.02em] flex items-center justify-center gap-2">
            下一步 <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default ModeSelection;