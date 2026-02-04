import React from 'react';

interface Props {
  intensity: 'standard' | 'strict';
  onReturnToFocus: () => void;
  onIgnore: () => void;
}

const ShieldOverlay: React.FC<Props> = ({ intensity, onReturnToFocus, onIgnore }) => {
  return (
    <div className="relative w-full h-full overflow-hidden animate-fade-in z-50">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #FEDCFF 0%, #D1FAFF 100%)' }} />
      <div
        className="absolute"
        style={{ left: -149, top: 138, width: 346, height: 352, background: '#FFF8D9', filter: 'blur(300px)' }}
      />
      <div
        className="absolute"
        style={{ left: 220, top: 294, width: 276, height: 281, background: '#FFF8D9', filter: 'blur(300px)' }}
      />

      {/* Status bar safe area */}
      <div className="w-full h-[44px]" />

      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <div className="w-full mt-2 flex justify-between items-center">
          <div className="w-[76px] h-[76px] rounded-full overflow-hidden border-2 border-white shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
            <div className="w-full h-full bg-white/70 backdrop-blur-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-[#1D2547] text-[34px]">chat</span>
            </div>
          </div>
          <button
            type="button"
            aria-label="Settings"
            className="w-10 h-10 rounded-full bg-white/40 border border-white/60 backdrop-blur-xl flex items-center justify-center active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[#5a5a5a] text-[20px]">settings</span>
          </button>
        </div>

        <div
          className="mt-10 w-full rounded-[30px] border border-white/60 shadow-[0_16px_40px_rgba(0,0,0,0.10)]"
          style={{ background: 'rgba(252,252,252,0.70)', backdropFilter: 'blur(20px)' }}
        >
          <div className="px-6 py-7 flex flex-col items-center">
            <div className="w-[96px] h-[96px] rounded-[28px] bg-white/70 border border-white/70 flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.10)]">
              <span className="material-symbols-outlined text-[#1D2547] text-[54px]">block</span>
            </div>

            <h1 className="mt-5 text-[22px] font-semibold tracking-tight text-black">甚至都不需要打开它</h1>
            <p className="mt-3 text-[14px] leading-relaxed text-black/70 max-w-[280px]">
              这一单吃下去，带来的快乐只有 10 分钟。<br />
              但明早的浮肿和后悔会持续一整天。
            </p>

            <div className="mt-6 w-full flex flex-col gap-3">
              <button
                onClick={onReturnToFocus}
                className="w-full h-[52px] rounded-[18px] text-white text-[15px] font-semibold active:scale-[0.98] transition"
                style={{ background: '#1D2547' }}
              >
                放下手机，跟喂喂 90 秒
              </button>

              {intensity !== 'strict' && (
                <button
                  onClick={onIgnore}
                  className="w-full h-[52px] rounded-[18px] text-[15px] font-semibold active:scale-[0.98] transition border border-white/60"
                  style={{ background: 'rgba(255,255,255,0.35)', color: '#1D2547', backdropFilter: 'blur(20px)' }}
                >
                  忽略，我非要吃
                </button>
              )}

              {intensity === 'strict' && <p className="text-black/50 text-xs">当前为强力阻断模式，无法忽略。</p>}
            </div>
          </div>
        </div>

        <div className="mt-4 text-[12px] text-black/40 flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">shield</span>
          <span className="font-medium">喂喂 正在守护你的意志力</span>
        </div>
      </div>
    </div>
  );
};

export default ShieldOverlay;
