import React from 'react';

interface Props {
  intensity: 'standard' | 'strict';
  onReturnToFocus: () => void;
  onIgnore: () => void;
}

const ShieldOverlay: React.FC<Props> = ({ intensity, onReturnToFocus, onIgnore }) => {
  return (
    <div className="relative w-full h-full bg-[#f2f2f7] flex flex-col items-center text-center animate-fade-in z-50">
      
      {/* Background blur effect simulation */}
      <div className="absolute inset-0 backdrop-blur-3xl bg-white/40 pointer-events-none"></div>

      {/* Status Bar Placeholder */}
      <div className="w-full h-12 shrink-0 z-10"></div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-20 w-full z-10">
        <div className="mb-8 relative">
          <div className="size-[96px] rounded-[22px] bg-[#e5e5ea] flex items-center justify-center shadow-sm">
             <span className="material-symbols-outlined text-[#8e8e93] text-[52px]">block</span>
          </div>
          {/* Badge app icon overlay */}
          <div className="absolute -bottom-2 -right-2 size-10 rounded-[10px] bg-[#FFC300] flex items-center justify-center border-[4px] border-[#f2f2f7]">
             <span className="material-symbols-outlined text-[#333] text-[20px]">lunch_dining</span>
          </div>
        </div>

        <h1 className="text-[28px] font-bold text-black mb-3 tracking-tight">
          甚至都不需要打开它
        </h1>
        <p className="text-[#3a3a3c] text-[17px] leading-relaxed mb-12 max-w-[280px]">
          这一单吃下去，带来的快乐只有 10 分钟。<br/>
          但明早的浮肿和后悔会持续一整天。
        </p>

        <div className="w-full max-w-[320px] flex flex-col gap-3">
            {/* Main Action - The "Good" Choice */}
            <button 
            onClick={onReturnToFocus}
            className="w-full h-[52px] bg-[#007aff] rounded-xl text-white text-[17px] font-semibold active:scale-[0.98] transition-all shadow-sm"
            >
            放下手机，保持清醒
            </button>

            {/* Secondary Action - The "Bad" Choice - HIDDEN IN STRICT MODE */}
            {intensity !== 'strict' && (
              <button 
              onClick={onIgnore}
              className="text-[#007aff] text-[17px] font-normal py-2 active:opacity-60 transition-opacity"
              >
              忽略，我非要吃
              </button>
            )}
            
            {intensity === 'strict' && (
              <p className="text-gray-400 text-xs mt-2">
                当前为强力阻断模式，无法忽略。
              </p>
            )}
        </div>
      </div>

      {/* Disclaimer (Simulated System Text) */}
      <div className="absolute bottom-12 px-8 z-10 flex items-center gap-1 opacity-40">
        <span className="material-symbols-outlined text-[14px] text-black">shield</span>
        <p className="text-black text-[12px] font-medium">喂喂 正在守护你的意志力</p>
      </div>
    </div>
  );
};

export default ShieldOverlay;
