import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { isFrameInCategory, WEIWEI_FRAMES } from '../figma/flow';
import { EmotionType } from '../types';
import ActionSuggestion from './ActionSuggestion';
import Breathing from './Breathing';
import FocusDashboard from './FocusDashboard';
import WeeklyReview from './WeeklyReview';

type NavKind = 'push' | 'pop' | 'replace' | 'reset';

type Props = {
  frameId: string;
  cursor: number;
  navKind: NavKind;
  stackLen: number;
  stats: { attempts: number; returns: number };
  selectedEmotion?: EmotionType;
  onSetEmotion: (emotion: EmotionType) => void;
  onExit: () => void;
  onPop: () => void;
  onOpen: (frameId: string, opts?: { replace?: boolean }) => void;
  debugOverlay?: boolean;
};

const DW = 393;
const DH = 852;
const pct = (v: number, base: number) => `${(v / base) * 100}%`;
const rect = (x: number, y: number, w: number, h: number) => ({
  left: pct(x, DW),
  top: pct(y, DH),
  width: pct(w, DW),
  height: pct(h, DH),
});

function HomeFigma({ onStart, debugOverlay, frameId }: { onStart: () => void; debugOverlay?: boolean; frameId: string }) {
  return (
    <div className="relative w-full h-full overflow-hidden bg-[#101010] text-white">
      {/* Ambient blobs (from Figma frame 1:33) */}
      <div className="absolute rounded-full blur-[300px]" style={{ ...rect(-80, 485, 554, 443), background: '#9D37D4', opacity: 0.30 }} />
      <div className="absolute rounded-full blur-[300px]" style={{ ...rect(-80, 519, 554, 443), background: '#5337DE', opacity: 0.40 }} />
      <div className="absolute rounded-full blur-[300px]" style={{ ...rect(-51, 650, 496, 326), background: '#B237DE', opacity: 0.20 }} />
      <div className="absolute rounded-full blur-[300px]" style={{ ...rect(-51, -230, 496, 326), background: '#374DDE', opacity: 0.20 }} />

      {/* Avatar + greeting */}
      <button
        type="button"
        className="absolute rounded-full border-0 p-0 bg-transparent"
        style={{ ...rect(29, 44, 54, 54), touchAction: 'manipulation' }}
        aria-label="Profile"
      >
        <div className="absolute inset-0 rounded-full" style={{ background: '#E1FCFF' }} />
        <img
          alt="Avatar"
          src="/figma/weiwei-wzx/ui/avatar.png"
          className="absolute inset-0 w-full h-full rounded-full"
          style={{ objectFit: 'cover' }}
          draggable={false}
          decoding="async"
          loading="eager"
        />
      </button>
      <div
        className="absolute"
        style={{
          ...rect(102, 58, 200, 26),
          fontFamily: '"Plus Jakarta Sans","Manrope","Noto Sans SC",system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
          fontWeight: 600,
          fontSize: 20,
          lineHeight: '25px',
        }}
      >
        Hi! Lilian
      </div>

      {/* Small pill (How you feel today?) */}
      <div
        className="absolute rounded-[22px] backdrop-blur-xl"
        style={{ ...rect(128, 117, 222, 79), background: 'rgba(252,252,252,0.70)' }}
      />
      <div
        className="absolute"
        style={{
          ...rect(165, 147, 200, 20),
          fontFamily: '"Inria Serif","Noto Sans SC",serif',
          fontWeight: 700,
          fontSize: 16,
          lineHeight: '19px',
          color: '#000',
        }}
      >
        How you feel today?
      </div>

      {/* Monster (tap to start) */}
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          onStart();
        }}
        className="absolute border-0 bg-transparent p-0 active:scale-[0.99] transition-transform"
        style={{ ...rect(65, 196, 263.93, 265.58), touchAction: 'manipulation' }}
        aria-label="Start"
      >
        <img
          alt="Monster"
          src="/figma/weiwei-wzx/ui/monster_home.png"
          className="absolute inset-0 w-full h-full"
          style={{ objectFit: 'cover', opacity: 0.90 }}
          draggable={false}
          decoding="async"
          loading="eager"
        />
      </button>
      <div className="absolute rounded-full" style={{ ...rect(74.9, 433.53, 243.31, 35.47), background: 'rgba(0,0,0,0.25)' }} />
      <div className="absolute rounded-full" style={{ ...rect(109.54, 433.53, 192.17, 28.04), background: 'rgba(0,0,0,0.25)' }} />

      {/* Mood hint */}
      <div
        className="absolute"
        style={{
          ...rect(144, 672, 200, 20),
          fontFamily: '"Inria Serif","Noto Sans SC",serif',
          fontWeight: 700,
          fontSize: 16,
          lineHeight: '19px',
          color: '#fff',
        }}
      >
        Feeling low ...
      </div>

      {/* Bottom nav (Home / SOS / User) */}
      <div
        className="absolute rounded-[27px] backdrop-blur-xl"
        style={{ ...rect(93, 744, 198, 54), background: 'rgba(255,255,255,0.60)' }}
      />
      <button
        type="button"
        className="absolute grid place-items-center text-[#1D2547] active:scale-[0.98]"
        style={{ ...rect(121, 761, 20, 20), touchAction: 'manipulation' }}
        aria-label="Home"
      >
        <img alt="" src="/figma/weiwei-wzx/ui/home_outlined.svg" className="w-[21px] h-[20px]" draggable={false} />
      </button>
      <button
        type="button"
        className="absolute grid place-items-center text-[#1D2547] active:scale-[0.98]"
        style={{ ...rect(243, 761, 20, 20), touchAction: 'manipulation' }}
        aria-label="User"
      >
        <img alt="" src="/figma/weiwei-wzx/ui/user_outlined.svg" className="w-[17px] h-[18px]" draggable={false} />
      </button>
      <button
        type="button"
        className="absolute rounded-full active:scale-[0.98] transition-transform"
        style={{ ...rect(165, 744, 54, 54), background: '#F5A6FE', touchAction: 'manipulation' }}
        aria-label="SOS"
        onPointerDown={(e) => {
          e.preventDefault();
          onStart();
        }}
      >
        <div className="absolute inset-[3px] rounded-full bg-black/90" />
        <div
          className="absolute inset-0 grid place-items-center text-white"
          style={{
            fontFamily: 'ui-rounded,"Arial Rounded MT Bold","Avenir Next","SF Pro Rounded","Noto Sans SC",system-ui,sans-serif',
            fontWeight: 700,
            fontSize: 16,
            lineHeight: '19px',
          }}
        >
          SOS
        </div>
      </button>

      {debugOverlay && (
        <img
          alt=""
          src={`/figma/weiwei-wzx/frames/${frameId.replace(/:/g, '-')}.svg`}
          className="absolute inset-0 w-full h-full pointer-events-none select-none"
          style={{ opacity: 0.35, mixBlendMode: 'difference' }}
          draggable={false}
        />
      )}
    </div>
  );
}

function CheckInScreen({ onPick, onBack }: { onPick: (idx: number) => void; onBack: () => void }) {
  const options = ['我很难受', '还好但想吃', '其实没那么饿'];
  return (
    <div className="flex flex-col h-full w-full bg-background-dark text-white animate-fade-in relative overflow-hidden">
      <header className="flex items-center justify-between p-6 z-20 shrink-0">
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onBack();
          }}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-dark border border-white/5 text-gray-300 active:scale-[0.98]"
          style={{ touchAction: 'manipulation' }}
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back_ios_new</span>
        </button>
        <div className="w-10" />
      </header>

      <main className="flex-1 flex flex-col px-6 pb-10">
        <h1 className="text-3xl font-extrabold leading-tight">先确认一下：</h1>
        <p className="mt-2 text-white/50 text-base">你现在的身体状态更接近哪一种？</p>

        <div className="mt-8 flex flex-col gap-3">
          {options.map((label, idx) => (
            <button
              key={label}
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                onPick(idx);
              }}
              className="w-full h-[54px] rounded-2xl bg-surface-dark border border-white/5 text-left px-5 font-semibold active:scale-[0.98] transition-transform"
              style={{ touchAction: 'manipulation' }}
            >
              {label}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

function DesireScreen({ onPick, onBack }: { onPick: (idx: number) => void; onBack: () => void }) {
  const options = ['想要安慰', '想要放松', '想要奖励'];
  return (
    <div className="flex flex-col h-full w-full bg-background-dark text-white animate-fade-in relative overflow-hidden">
      <header className="flex items-center justify-between p-6 z-20 shrink-0">
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onBack();
          }}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-dark border border-white/5 text-gray-300 active:scale-[0.98]"
          style={{ touchAction: 'manipulation' }}
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back_ios_new</span>
        </button>
        <div className="w-10" />
      </header>

      <main className="flex-1 flex flex-col px-6 pb-10">
        <h1 className="text-3xl font-extrabold leading-tight">你真正想要的是？</h1>
        <p className="mt-2 text-white/50 text-base">把“想吃”翻译成更准确的需求。</p>

        <div className="mt-8 flex flex-col gap-3">
          {options.map((label, idx) => (
            <button
              key={label}
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                onPick(idx);
              }}
              className="w-full h-[54px] rounded-2xl bg-surface-dark border border-white/5 text-left px-5 font-semibold active:scale-[0.98] transition-transform"
              style={{ touchAction: 'manipulation' }}
            >
              {label}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

function FeelingFigma({
  onPick,
  onSettings,
  debugOverlay,
  frameId,
}: {
  onPick: (choice: 0 | 1 | 2) => void;
  onSettings: () => void;
  debugOverlay?: boolean;
  frameId: string;
}) {
  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #FEDCFF 0%, #D1FAFF 100%)' }}
    >
      <div className="absolute rounded-full blur-[300px]" style={{ ...rect(-149, 138, 346, 352), background: '#FFF8D9' }} />
      <div className="absolute rounded-full blur-[300px]" style={{ ...rect(220, 294, 276, 281), background: '#FFF8D9' }} />

      {/* Avatar + LV.1 */}
      <div className="absolute rounded-full border border-white/60 bg-white/35 backdrop-blur-xl" style={{ ...rect(18.05, 33.05, 75.9, 75.9) }} />
      <div
        className="absolute"
        style={{
          ...rect(94, 62, 50, 18),
          color: '#1D2547',
          fontFamily: '"Noto Sans SC","Manrope",system-ui,sans-serif',
          fontWeight: 700,
          fontSize: 12,
          lineHeight: '16px',
        }}
      >
        LV.1
      </div>

      {/* Settings (Figma exported) */}
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          onSettings();
        }}
        className="absolute border-0 bg-transparent p-0 active:scale-[0.98]"
        style={{ ...rect(325, 51, 40, 40), touchAction: 'manipulation' }}
        aria-label="Settings"
      >
        <img alt="" src="/figma/weiwei-wzx/ui/settings_button.svg" className="w-full h-full" draggable={false} />
      </button>

      {/* Tip pill */}
      <div
        className="absolute rounded-[22px] backdrop-blur-xl"
        style={{ ...rect(144, 126, 182, 79), background: 'rgba(252,252,252,0.70)' }}
      />
      <div
        className="absolute"
        style={{
          ...rect(164, 157, 200, 16),
          color: '#000',
          fontFamily: '"Noto Sans SC","Manrope",system-ui,sans-serif',
          fontWeight: 300,
          fontSize: 12,
          lineHeight: '15px',
        }}
      >
        冲动很正常，我们先慢下来
      </div>

      {/* Monster */}
      <div style={{ ...rect(86, 210, 222, 224) }} className="absolute">
        <img
          alt="Monster"
          src="/figma/weiwei-wzx/ui/monster_feeling.png"
          className="absolute inset-0 w-full h-full"
          style={{ objectFit: 'cover', opacity: 0.90 }}
          draggable={false}
          decoding="async"
          loading="eager"
        />
      </div>
      <div className="absolute rounded-full" style={{ ...rect(94, 410, 205, 30), background: 'rgba(0,0,0,0.05)' }} />
      <div className="absolute rounded-full" style={{ ...rect(123, 410, 162, 24), background: 'rgba(0,0,0,0.05)' }} />

      {/* Options (from Figma text positions & hotspot rows) */}
      {[
        { label: '今天很糟糕', y: 466, iconSrc: '/figma/weiwei-wzx/ui/feeling_icon_1.svg' },
        { label: '说不上来，很难受', y: 540, iconSrc: '/figma/weiwei-wzx/ui/feeling_icon_2.svg' },
        { label: '压力太大了', y: 614, iconSrc: '/figma/weiwei-wzx/ui/feeling_icon_3.svg' },
      ].map((o, idx) => (
        <button
          key={o.label}
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onPick(idx as 0 | 1 | 2);
          }}
          className="absolute rounded-[28px] border border-white/70 bg-white/70 backdrop-blur-xl shadow-[0_16px_40px_rgba(0,0,0,0.10)] active:scale-[0.99] transition-transform"
          style={{ ...rect(79, o.y, 290, 84.985), touchAction: 'manipulation' }}
          aria-label={o.label}
        >
          <div className="absolute inset-0 rounded-[28px]" style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.55)' }} />
          <div
            className="absolute rounded-full bg-white/60 border border-white/70 grid place-items-center overflow-hidden"
            style={{ ...rect(12, 12, 60.98, 60.98) }}
          >
            <img alt="" src={o.iconSrc} className="w-[40px] h-[40px]" draggable={false} />
          </div>
          <div
            className="absolute"
            style={{
              left: pct(96, 290),
              top: pct(28, 84.985),
              fontFamily: '"Noto Sans SC","Manrope",system-ui,sans-serif',
              fontWeight: 300,
              fontSize: 16,
              lineHeight: '20px',
              color: '#000',
            }}
          >
            {o.label}
          </div>
        </button>
      ))}

      {/* Bottom nav (from Figma frame 1:405) */}
      <div
        className="absolute rounded-[30px]"
        style={{
          ...rect(107, 744, 170, 54),
          background: '#1D2547',
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
        }}
      />
      <button
        type="button"
        className="absolute grid place-items-center active:scale-[0.98]"
        style={{ ...rect(123, 761, 20, 20), touchAction: 'manipulation' }}
        aria-label="Trends"
      >
        <img alt="" src="/figma/weiwei-wzx/ui/tab_trends.svg" className="w-[20px] h-[20px]" draggable={false} />
      </button>
      <button
        type="button"
        className="absolute grid place-items-center active:scale-[0.98]"
        style={{ ...rect(161, 744, 54, 54), touchAction: 'manipulation' }}
        aria-label="Home"
      >
        <img alt="" src="/figma/weiwei-wzx/ui/tab_home.svg" className="w-[54px] h-[54px]" draggable={false} />
      </button>
      <button
        type="button"
        className="absolute grid place-items-center active:scale-[0.98]"
        style={{ ...rect(237, 761, 20, 20), touchAction: 'manipulation' }}
        aria-label="Guard"
      >
        <img alt="" src="/figma/weiwei-wzx/ui/tab_guard.svg" className="w-[20px] h-[20px]" draggable={false} />
      </button>

      {debugOverlay && (
        <img
          alt=""
          src={`/figma/weiwei-wzx/frames/${frameId.replace(/:/g, '-')}.svg`}
          className="absolute inset-0 w-full h-full pointer-events-none select-none"
          style={{ opacity: 0.35, mixBlendMode: 'difference' }}
          draggable={false}
        />
      )}
    </div>
  );
}

export default function WeiweiApp({
  frameId,
  cursor,
  navKind,
  stackLen,
  stats,
  selectedEmotion,
  onSetEmotion,
  onExit,
  onPop,
  onOpen,
  debugOverlay,
}: Props) {
  const anim = (() => {
    if (navKind === 'push') return { type: 'slide' as const, dir: 1 };
    if (navKind === 'pop') return { type: 'slide' as const, dir: -1 };
    return { type: 'fade' as const, dir: 0 };
  })();

  const variants = {
    initial: (custom: { type: 'fade' | 'slide'; dir: number }) => {
      if (custom.type === 'slide') return { x: custom.dir > 0 ? 28 : -28, opacity: 0, pointerEvents: 'none' as const };
      return { opacity: 0, scale: 0.995, pointerEvents: 'none' as const };
    },
    animate: { x: 0, opacity: 1, scale: 1, pointerEvents: 'auto' as const },
    exit: (custom: { type: 'fade' | 'slide'; dir: number }) => {
      if (custom.type === 'slide') return { x: custom.dir > 0 ? -28 : 28, opacity: 0, pointerEvents: 'none' as const };
      return { opacity: 0, scale: 1.005, pointerEvents: 'none' as const };
    },
  } as const;

  const node = (() => {
    if (isFrameInCategory(frameId, 'home')) {
      return <HomeFigma frameId={frameId} debugOverlay={debugOverlay} onStart={() => onOpen(WEIWEI_FRAMES.feeling[0])} />;
    }
    if (isFrameInCategory(frameId, 'stage')) {
      return (
        <FocusDashboard
          stats={stats}
          onSimulateInterruption={() => onExit()}
          onEndFocus={() => (stackLen <= 1 ? onExit() : onPop())}
          onHome={() => onExit()}
          onSettings={() => onOpen(WEIWEI_FRAMES.guard[0])}
        />
      );
    }
    if (isFrameInCategory(frameId, 'feeling')) {
      return (
        <FeelingFigma
          frameId={frameId}
          debugOverlay={debugOverlay}
          onSettings={() => onOpen(WEIWEI_FRAMES.guard[0], { replace: true })}
          onPick={(choice) => {
            const mapped: EmotionType = choice === 0 ? 'stress' : choice === 1 ? 'hunger' : 'habit';
            onSetEmotion(mapped);
            onOpen(WEIWEI_FRAMES.breathing[cursor % WEIWEI_FRAMES.breathing.length]);
          }}
        />
      );
    }
    if (isFrameInCategory(frameId, 'breathing')) {
      return (
        <Breathing
          onComplete={() => {
            onOpen(WEIWEI_FRAMES.checkin[cursor % WEIWEI_FRAMES.checkin.length], { replace: true });
          }}
        />
      );
    }
    if (isFrameInCategory(frameId, 'checkin')) {
      return (
        <CheckInScreen
          onBack={() => onPop()}
          onPick={(idx) => onOpen(WEIWEI_FRAMES.desire[(cursor + idx) % WEIWEI_FRAMES.desire.length])}
        />
      );
    }
    if (isFrameInCategory(frameId, 'desire')) {
      return (
        <DesireScreen
          onBack={() => onPop()}
          onPick={(idx) => onOpen(WEIWEI_FRAMES.actions[(cursor + idx) % WEIWEI_FRAMES.actions.length])}
        />
      );
    }
    if (isFrameInCategory(frameId, 'actions')) {
      return (
        <ActionSuggestion
          emotion={selectedEmotion ?? 'stress'}
          onBack={() => onPop()}
          onSurrender={() => onExit()}
          onActionSelect={(actionId) => {
            if (actionId === 'breathing') {
              onOpen(WEIWEI_FRAMES.breathing[cursor % WEIWEI_FRAMES.breathing.length]);
              return;
            }
            onOpen(WEIWEI_FRAMES.trends[0], { replace: true });
          }}
        />
      );
    }
    if (isFrameInCategory(frameId, 'trends')) {
      return <WeeklyReview onBack={() => onExit()} onRestart={() => onOpen(WEIWEI_FRAMES.home[0], { replace: true })} />;
    }
    if (isFrameInCategory(frameId, 'guard')) {
      return (
        <WeeklyReview
          onBack={() => (stackLen <= 1 ? onExit() : onPop())}
          onRestart={() => onOpen(WEIWEI_FRAMES.stage[0], { replace: true })}
        />
      );
    }
    return <HomeFigma frameId={frameId} debugOverlay={debugOverlay} onStart={() => onOpen(WEIWEI_FRAMES.feeling[0])} />;
  })();

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      <AnimatePresence mode="sync" initial={false} custom={anim}>
        <motion.div
          key={frameId}
          className="absolute inset-0"
          custom={anim}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.16, ease: 'easeOut' }}
        >
          {node}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
