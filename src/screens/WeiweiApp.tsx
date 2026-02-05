import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { AppState, EmotionType, GuardIntensity } from '../types';
import DailyReview from './DailyReview';
import EmotionRecognition from './EmotionRecognition';
import Settings from './Settings';
import WeeklyReview from './WeeklyReview';

type TabKey = 'review' | 'home' | 'setup';
type SessionMode = 'intercepted' | 'selfInitiated';
type SessionStep = 'action' | 'reflection' | 'result' | 'delay' | 'proceedInfo';

type Props = {
  state: AppState;
  onUpdate: (updates: Partial<AppState>) => void;
  onExit: () => void;
  onProceedToTargetApp: () => void;
};

const STRINGS = {
  stageStatusActive: '守护中',
  stageStatusNotEnabled: '未守护',
  stageBubbleDefault: '冲动很正常，我们先慢下来。',
  sessionPauseTitle: '先停一下',
  sessionReflectionTitle: '可选复盘',
  sessionResultTitle: '现在决定',
  sessionDelayTitle: '延迟 2 分钟',
  sessionProceedInfoTitle: '好的',
  bubbleWaitToZero: '只要等到 0。',
  bubbleReflection: '可选：选一下会更清楚。',
  bubbleProceedSafe: '好的。也请温和一点。',
  bubbleProceedGate: '如果你仍想继续，需要先完成门槛。',
  proceedInfoDetailSafeDefault: '回到刚才的 App，再点一次“继续”。这次会放行一次。',
  proceedInfoDetailGateNeeded: (seconds: number) => `要继续进入刚才的 App，需要先完成 ${seconds} 秒门槛动作。`,
} as const;

function clampInt(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.trunc(n)));
}

function SessionAction({
  requiredSeconds,
  onClose,
  onComplete,
}: {
  requiredSeconds: number;
  onClose: () => void;
  onComplete: () => void;
}) {
  const secondsTotal = clampInt(requiredSeconds, 5, 180);
  const [remaining, setRemaining] = useState(secondsTotal);
  const [phase, setPhase] = useState<'inhale' | 'exhale'>('inhale');
  const [phaseRemaining, setPhaseRemaining] = useState(4);
  const completedRef = useRef(false);

  useEffect(() => {
    const t = window.setInterval(() => {
      setRemaining((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          if (!completedRef.current) {
            completedRef.current = true;
            window.clearInterval(t);
            onComplete();
          }
          return 0;
        }
        return next;
      });

      setPhaseRemaining((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          setPhase((p) => (p === 'inhale' ? 'exhale' : 'inhale'));
          return 4;
        }
        return next;
      });
    }, 1000);

    return () => window.clearInterval(t);
  }, [onComplete]);

  const guidance = phase === 'inhale' ? `吸气 ${phaseRemaining}s` : `呼气 ${phaseRemaining}s`;
  const progress = 1 - remaining / secondsTotal;

  return (
    <div className="flex flex-col h-full w-full bg-[#0A0A0C] text-white overflow-hidden">
      <div className="flex items-center justify-between px-6 pt-6 pb-2 shrink-0">
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onClose();
          }}
          className="text-white/40 hover:text-white/70 p-2 rounded-full hover:bg-white/5 active:scale-[0.98]"
          style={{ touchAction: 'manipulation' }}
          aria-label="Close"
        >
          <span className="material-symbols-outlined !text-[22px]">close</span>
        </button>

        <div className="text-xs font-bold tracking-[0.18em] uppercase text-white/50">{STRINGS.sessionPauseTitle}</div>

        <div className="text-xs font-semibold text-white/50 tabular-nums">{remaining}s</div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="relative w-64 h-64 flex items-center justify-center mb-10 select-none">
          <div className="absolute inset-0 rounded-full bg-[#1754cf]/10 blur-3xl" />
          <div
            className="absolute inset-10 rounded-full border border-[#1754cf]/25 transition-transform duration-1000 ease-in-out"
            style={{ transform: `scale(${phase === 'inhale' ? 1.08 : 0.86})` }}
          />
          <div className="absolute inset-[82px] rounded-full bg-gradient-to-br from-[#1754cf]/35 to-[#1754cf]/10 border border-white/5 shadow-[0_0_60px_rgba(23,84,207,0.24)]" />

          <svg className="absolute inset-0" viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="46" stroke="rgba(255,255,255,0.08)" strokeWidth="4" fill="none" />
            <circle
              cx="50"
              cy="50"
              r="46"
              stroke="rgba(23,84,207,0.9)"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${(progress * 2 * Math.PI * 46).toFixed(2)} ${(2 * Math.PI * 46).toFixed(2)}`}
              transform="rotate(-90 50 50)"
            />
          </svg>

          <div className="relative z-10 text-center">
            <div className="text-5xl font-extrabold tabular-nums">{remaining}</div>
            <div className="mt-1 text-xs font-semibold text-white/45 tracking-widest">{STRINGS.bubbleWaitToZero}</div>
          </div>
        </div>

        <div className="text-center">
          <div className="text-white/85 text-lg font-light tracking-[0.14em]">{guidance}</div>
          <div className="mt-2 text-white/35 text-xs font-medium tracking-wider">只要跟着呼吸就好。</div>
        </div>
      </div>

      <div className="px-6 pb-8 shrink-0">
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onComplete();
          }}
          className="w-full h-12 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 transition active:scale-[0.98]"
          style={{ touchAction: 'manipulation' }}
        >
          我完成了，下一步
        </button>
      </div>
    </div>
  );
}

function SessionResult({
  mode,
  intensity,
  requiredSeconds,
  didCompleteAction,
  onBack,
  onDelay,
  onProceed,
  onClose,
}: {
  mode: SessionMode;
  intensity: GuardIntensity;
  requiredSeconds: number;
  didCompleteAction: boolean;
  onBack: () => void;
  onDelay: () => void;
  onProceed: () => void;
  onClose: () => void;
}) {
  const proceedDisabled = mode === 'intercepted' && intensity !== 'standard';
  const proceedNeedsAction = mode === 'intercepted' && !didCompleteAction;

  return (
    <div className="flex flex-col h-full w-full bg-[#0A0A0C] text-white overflow-hidden">
      <div className="flex items-center justify-between px-6 pt-6 pb-2 shrink-0">
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onClose();
          }}
          className="text-white/40 hover:text-white/70 p-2 rounded-full hover:bg-white/5 active:scale-[0.98]"
          style={{ touchAction: 'manipulation' }}
          aria-label="Close"
        >
          <span className="material-symbols-outlined !text-[22px]">close</span>
        </button>
        <div className="text-xs font-bold tracking-[0.18em] uppercase text-white/50">{STRINGS.sessionResultTitle}</div>
        <div className="w-9" />
      </div>

      <div className="flex-1 flex flex-col justify-center px-6">
        <div className="text-center mb-8">
          <div className="text-2xl font-extrabold leading-tight">你想怎么做？</div>
          <div className="mt-2 text-sm text-white/45">
            {mode === 'intercepted' ? '这是一次系统拦截后的选择。' : '这是一次自助会话。'}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              onBack();
            }}
            className="w-full h-14 rounded-xl bg-[#1754cf] hover:bg-[#1347b1] transition active:scale-[0.98] font-bold"
            style={{ touchAction: 'manipulation' }}
          >
            回头（不吃了）
          </button>

          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              onDelay();
            }}
            className="w-full h-14 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition active:scale-[0.98] font-bold"
            style={{ touchAction: 'manipulation' }}
          >
            {STRINGS.sessionDelayTitle}
          </button>

          <button
            type="button"
            disabled={proceedDisabled || proceedNeedsAction}
            onPointerDown={(e) => {
              e.preventDefault();
              if (proceedDisabled || proceedNeedsAction) return;
              onProceed();
            }}
            className={[
              'w-full h-14 rounded-xl font-bold transition active:scale-[0.98]',
              proceedDisabled || proceedNeedsAction
                ? 'bg-white/5 border border-white/10 text-white/30 opacity-60 cursor-not-allowed'
                : 'bg-white/10 hover:bg-white/15 text-white',
            ].join(' ')}
            style={{ touchAction: 'manipulation' }}
          >
            继续
          </button>

          {(proceedDisabled || proceedNeedsAction) && (
            <div className="text-xs text-white/35 leading-relaxed">
              {proceedDisabled
                ? '当前为强力拦截：不提供继续按钮。'
                : STRINGS.proceedInfoDetailGateNeeded(requiredSeconds)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SessionDelay({
  seconds = 120,
  onBackToResult,
  onClose,
}: {
  seconds?: number;
  onBackToResult: () => void;
  onClose: () => void;
}) {
  const [remaining, setRemaining] = useState(() => clampInt(seconds, 5, 600));

  useEffect(() => {
    const t = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          window.clearInterval(t);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    if (remaining <= 0) onBackToResult();
  }, [onBackToResult, remaining]);

  return (
    <div className="flex flex-col h-full w-full bg-[#0A0A0C] text-white overflow-hidden">
      <div className="flex items-center justify-between px-6 pt-6 pb-2 shrink-0">
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onClose();
          }}
          className="text-white/40 hover:text-white/70 p-2 rounded-full hover:bg-white/5 active:scale-[0.98]"
          style={{ touchAction: 'manipulation' }}
          aria-label="Close"
        >
          <span className="material-symbols-outlined !text-[22px]">close</span>
        </button>
        <div className="text-xs font-bold tracking-[0.18em] uppercase text-white/50">{STRINGS.sessionDelayTitle}</div>
        <div className="w-9" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="text-6xl font-extrabold tabular-nums">{remaining}s</div>
        <div className="mt-3 text-sm text-white/45">再等一会儿也算赢。</div>
      </div>

      <div className="px-6 pb-8 shrink-0">
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onBackToResult();
          }}
          className="w-full h-12 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 transition active:scale-[0.98]"
          style={{ touchAction: 'manipulation' }}
        >
          我决定好了
        </button>
      </div>
    </div>
  );
}

function ProceedInfo({
  mode,
  didCompleteAction,
  requiredSeconds,
  onGoToTargetApp,
  onClose,
}: {
  mode: SessionMode;
  didCompleteAction: boolean;
  requiredSeconds: number;
  onGoToTargetApp: () => void;
  onClose: () => void;
}) {
  const detail =
    mode === 'intercepted'
      ? didCompleteAction
        ? STRINGS.proceedInfoDetailSafeDefault
        : STRINGS.proceedInfoDetailGateNeeded(requiredSeconds)
      : STRINGS.bubbleProceedSafe;

  return (
    <div className="flex flex-col h-full w-full bg-[#0A0A0C] text-white overflow-hidden">
      <div className="flex items-center justify-between px-6 pt-6 pb-2 shrink-0">
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onClose();
          }}
          className="text-white/40 hover:text-white/70 p-2 rounded-full hover:bg-white/5 active:scale-[0.98]"
          style={{ touchAction: 'manipulation' }}
          aria-label="Close"
        >
          <span className="material-symbols-outlined !text-[22px]">close</span>
        </button>
        <div className="text-xs font-bold tracking-[0.18em] uppercase text-white/50">{STRINGS.sessionProceedInfoTitle}</div>
        <div className="w-9" />
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 text-center">
        <div className="text-xl font-extrabold mb-3">{mode === 'intercepted' ? STRINGS.bubbleProceedGate : STRINGS.bubbleProceedSafe}</div>
        <div className="text-sm text-white/45 leading-relaxed">{detail}</div>
      </div>

      <div className="px-6 pb-8 shrink-0 flex flex-col gap-3">
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onGoToTargetApp();
          }}
          className="w-full h-12 rounded-xl bg-white/10 hover:bg-white/15 transition active:scale-[0.98] font-bold"
          style={{ touchAction: 'manipulation' }}
        >
          回到外卖 App
        </button>
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onClose();
          }}
          className="w-full h-12 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 transition active:scale-[0.98]"
          style={{ touchAction: 'manipulation' }}
        >
          留在喂喂
        </button>
      </div>
    </div>
  );
}

function TabBar({ active, onSelect }: { active: TabKey; onSelect: (tab: TabKey) => void }) {
  const tabBtn = (tab: TabKey, label: string, icon: string) => {
    const isActive = active === tab;
    return (
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          onSelect(tab);
        }}
        className="flex-1 h-[58px] grid place-items-center"
        style={{ touchAction: 'manipulation' }}
        aria-label={label}
      >
        <div
          className={[
            'w-[46px] h-[46px] rounded-full grid place-items-center transition',
            isActive
              ? 'bg-gradient-to-br from-[#FEDCFF] to-[#D1FAFF] text-[#222433] shadow-[0_12px_28px_rgba(255,255,255,0.14)]'
              : 'text-white/85',
          ].join(' ')}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
            {icon}
          </span>
        </div>
      </button>
    );
  };

  return (
    <div
      className="h-[58px] w-[280px] rounded-full border border-white/10 shadow-[0_14px_30px_rgba(0,0,0,0.28)] overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(34,36,51,1) 0%, rgba(13,16,40,1) 100%)',
      }}
    >
      <div className="h-full w-full flex items-center">
        {tabBtn('review', 'Review', 'bar_chart')}
        {tabBtn('home', 'Home', 'home')}
        {tabBtn('setup', 'Setup', 'shield')}
      </div>
    </div>
  );
}

export default function WeiweiApp({ state, onUpdate, onExit, onProceedToTargetApp }: Props) {
  const [tab, setTab] = useState<TabKey>('home');
  const [reviewStage, setReviewStage] = useState<'daily' | 'weekly'>('daily');
  const [sessionMode, setSessionMode] = useState<SessionMode | null>(null);
  const [sessionStep, setSessionStep] = useState<SessionStep>('action');
  const [didCompleteAction, setDidCompleteAction] = useState(false);

  const guard = state.guard;

  const requiredSeconds = useMemo(() => {
    if (sessionMode === 'intercepted') return guard.minActionSeconds;
    return 60;
  }, [guard.minActionSeconds, sessionMode]);

  useEffect(() => {
    if (!state.weiweiLaunchMode) return;
    const mode: SessionMode = state.weiweiLaunchMode === 'intercepted' ? 'intercepted' : 'selfInitiated';
    setTab('home');
    setSessionMode(mode);
    setSessionStep('action');
    setDidCompleteAction(false);
    onUpdate({ weiweiLaunchMode: undefined });
  }, [onUpdate, state.weiweiLaunchMode]);

  const openSession = (mode: SessionMode) => {
    setSessionMode(mode);
    setSessionStep('action');
    setDidCompleteAction(false);
  };

  const closeSession = () => {
    setSessionMode(null);
    setSessionStep('action');
    setDidCompleteAction(false);
  };

  const stageStatus = guard.enabled ? STRINGS.stageStatusActive : STRINGS.stageStatusNotEnabled;

  const content = useMemo(() => {
    if (tab === 'review') {
      if (reviewStage === 'daily') {
        return <DailyReview stats={state.stats} onNext={() => setReviewStage('weekly')} />;
      }
      return <WeeklyReview onRestart={() => setReviewStage('daily')} onBack={() => setReviewStage('daily')} />;
    }

    if (tab === 'setup') {
      return (
        <Settings
          state={state}
          onUpdate={(updates) => onUpdate(updates)}
          onBack={() => setTab('home')}
        />
      );
    }

    return (
      <div className="relative w-full h-full overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #FEDCFF 0%, #D1FAFF 100%)' }} />
        <div className="absolute rounded-full blur-[240px]" style={{ left: -120, top: 120, width: 320, height: 320, background: '#FFF8D9' }} />
        <div className="absolute rounded-full blur-[240px]" style={{ left: 220, top: 320, width: 260, height: 260, background: '#FFF8D9' }} />

        <div className="absolute inset-0 px-6 pt-10 pb-28 flex flex-col">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                onExit();
              }}
              className="w-10 h-10 rounded-full bg-white/50 hover:bg-white/70 active:scale-[0.98] transition grid place-items-center"
              style={{ touchAction: 'manipulation' }}
              aria-label="Exit"
            >
              <span className="material-symbols-outlined text-[#1D2547]">close</span>
            </button>

            <div className="px-4 h-10 rounded-full bg-white/55 border border-white/60 flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 rounded-full" style={{ background: guard.enabled ? '#2EAF74' : '#757575' }} />
              <div className="text-xs font-bold text-[#1D2547]">{stageStatus}</div>
            </div>

            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                setTab('setup');
              }}
              className="w-10 h-10 rounded-full bg-white/50 hover:bg-white/70 active:scale-[0.98] transition grid place-items-center"
              style={{ touchAction: 'manipulation' }}
              aria-label="Settings"
            >
              <span className="material-symbols-outlined text-[#1D2547]">settings</span>
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="text-2xl font-extrabold text-[#1D2547] leading-snug">{STRINGS.stageBubbleDefault}</div>
            <div className="mt-3 text-sm text-[#1D2547]/65 leading-relaxed">
              {guard.enabled ? '打开外卖 App 会触发拦截。' : '你也可以随时用 SOS 进入自助会话。'}
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 w-full max-w-[320px]">
              <div className="rounded-2xl bg-white/55 border border-white/70 p-4 shadow-sm">
                <div className="text-[10px] font-bold text-[#1D2547]/55 tracking-widest">冲动</div>
                <div className="mt-1 text-2xl font-extrabold text-[#1D2547] tabular-nums">{state.stats.attempts}</div>
              </div>
              <div className="rounded-2xl bg-white/55 border border-white/70 p-4 shadow-sm">
                <div className="text-[10px] font-bold text-[#1D2547]/55 tracking-widest">回头</div>
                <div className="mt-1 text-2xl font-extrabold text-[#1D2547] tabular-nums">{state.stats.returns}</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                openSession('selfInitiated');
              }}
              className="w-full h-12 rounded-xl bg-[#1D2547] text-white font-bold shadow-[0_10px_24px_rgba(29,37,71,0.25)] active:scale-[0.98] transition"
              style={{ touchAction: 'manipulation' }}
            >
              SOS：先停一下
            </button>

            {!guard.enabled && (
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  onUpdate({
                    guard: {
                      ...guard,
                      enabled: true,
                      updatedAt: Date.now(),
                    },
                  });
                }}
                className="w-full h-12 rounded-xl bg-white/55 border border-white/70 text-[#1D2547] font-bold active:scale-[0.98] transition"
                style={{ touchAction: 'manipulation' }}
              >
                启用守护
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }, [guard, onExit, onUpdate, reviewStage, state, tab]);

  const showSession = sessionMode != null;

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      {content}

      <div className="absolute left-0 right-0 bottom-6 flex justify-center pointer-events-none z-20">
        <div className="pointer-events-auto">
          <TabBar
            active={tab}
            onSelect={(next) => {
              if (showSession) return;
              setReviewStage('daily');
              setTab(next);
            }}
          />
        </div>
      </div>

      <AnimatePresence>
        {showSession && (
          <motion.div
            className="absolute inset-0 z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/55"
              onPointerDown={(e) => {
                e.preventDefault();
                closeSession();
              }}
            />

            <motion.div
              className="absolute inset-x-0 bottom-0"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 34 }}
              style={{ height: 'min(760px, 92vh)' }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <div className="h-full rounded-t-[28px] overflow-hidden shadow-[0_-20px_50px_rgba(0,0,0,0.55)]">
                {sessionStep === 'action' && (
                  <SessionAction
                    requiredSeconds={requiredSeconds}
                    onClose={closeSession}
                    onComplete={() => {
                      setDidCompleteAction(true);
                      setSessionStep('reflection');
                    }}
                  />
                )}

                {sessionStep === 'reflection' && (
                  <EmotionRecognition
                    onBack={() => closeSession()}
                    onSelectEmotion={(emotion: EmotionType) => {
                      onUpdate({ selectedEmotion: emotion });
                      setSessionStep('result');
                    }}
                  />
                )}

                {sessionStep === 'result' && (
                  <SessionResult
                    mode={sessionMode!}
                    intensity={guard.intensity}
                    requiredSeconds={requiredSeconds}
                    didCompleteAction={didCompleteAction}
                    onClose={closeSession}
                    onBack={() => closeSession()}
                    onDelay={() => setSessionStep('delay')}
                    onProceed={() => setSessionStep('proceedInfo')}
                  />
                )}

                {sessionStep === 'delay' && (
                  <SessionDelay
                    seconds={120}
                    onClose={closeSession}
                    onBackToResult={() => setSessionStep('result')}
                  />
                )}

                {sessionStep === 'proceedInfo' && (
                  <ProceedInfo
                    mode={sessionMode!}
                    didCompleteAction={didCompleteAction}
                    requiredSeconds={requiredSeconds}
                    onClose={closeSession}
                    onGoToTargetApp={() => {
                      closeSession();
                      onProceedToTargetApp();
                    }}
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
