import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { isFrameInCategory, WEIWEI_FRAMES } from '../figma/flow';
import { EmotionType } from '../types';
import ActionSuggestion from './ActionSuggestion';
import Breathing from './Breathing';
import EmotionRecognition from './EmotionRecognition';
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
};

function isEmotionType(v: string): v is EmotionType {
  return v === 'hunger' || v === 'stress' || v === 'reward' || v === 'habit';
}

function StartScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="relative w-full h-full bg-background-dark text-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-18%] left-[-20%] w-[80%] h-[60%] bg-primary/18 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-16%] right-[-18%] w-[70%] h-[55%] bg-purple-900/18 rounded-full blur-[110px]" />
      </div>

      <div className="relative z-10 flex flex-col h-full px-6">
        <div className="h-[44px] shrink-0" />

        <div className="pt-6 text-center">
          <p className="text-white/60 text-xs font-bold tracking-[0.18em] uppercase">WeiWei</p>
          <h1 className="mt-3 text-[28px] font-extrabold leading-tight">How you feel today?</h1>
          <p className="mt-2 text-white/55 text-sm leading-relaxed">用 90 秒把“冲动”变成“选择”。</p>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="relative w-[260px] h-[260px] rounded-full bg-gradient-to-b from-surface-highlight to-background-dark border border-white/10 shadow-[0_0_70px_rgba(23,84,207,0.25)] overflow-hidden">
            <img
              alt="Monster"
              src="/monster.png"
              className="absolute inset-0 w-full h-full object-cover opacity-95"
              draggable={false}
              decoding="async"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>
        </div>

        <div className="pb-10">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              onStart();
            }}
            className="w-full h-14 rounded-full bg-primary shadow-lg shadow-blue-900/40 font-bold active:scale-[0.98] transition-transform"
            style={{ touchAction: 'manipulation' }}
          >
            开始 90 秒
          </button>
          <p className="mt-3 text-center text-[11px] text-white/35">点按开始（更快、更像真实 App）</p>
        </div>
      </div>
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
      return <StartScreen onStart={() => onOpen(WEIWEI_FRAMES.feeling[0])} />;
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
        <EmotionRecognition
          onBack={() => (stackLen <= 1 ? onExit() : onPop())}
          onSelectEmotion={(emotion) => {
            if (!isEmotionType(emotion)) return;
            onSetEmotion(emotion);
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
    return <StartScreen onStart={() => onOpen(WEIWEI_FRAMES.feeling[0])} />;
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

