import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AudioWaveform, Bell, CheckCircle2, ChevronRight, Circle, CircleDashed, Pencil, Settings, Sparkles, X } from 'lucide-react';
import clsx from 'clsx';

type GuardIntensity = 'standard' | 'strict';
type AuthStatus = 'approved' | 'denied' | 'notDetermined';

type GuardWindow = {
  startMinutes: number; // 0..1439
  endMinutes: number; // 0..1439
};

type GuardConfig = {
  enabled: boolean;
  intensity: GuardIntensity;
  window: GuardWindow;
  minActionSeconds: number;
};

type MonsterState = {
  cakeCount: number;
  totalXp: number;
  level: number;
};

type LoggedEvent = {
  id: string;
  timestamp: number;
  type: string;
  payload?: Record<string, string>;
};

type Sheet =
  | null
  | { type: 'setup'; initialStep: number }
  | { type: 'settings' }
  | { type: 'review' }
  | { type: 'diagnosis' }
  | { type: 'notifications'; context: 'setup' | 'intercepted' | 'stage' }
  | { type: 'sos'; mode: 'intercepted' | 'selfInitiated' };

const ZKFXStrings = {
  stageStatusNotEnabled: '未守护',
  stageStatusNotAuthorized: '未生效：未授权',
  stageStatusNoSelection: '未生效：未选择 App',
  stageStatusNotWithinWindow: '未生效：不在时段',
  stageStatusActive: '守护中',

  stageBubbleNotEnabled: (seconds: number) => `想吃的时候，先来这 ${seconds} 秒。`,
  stageBubbleConfigNeeded: '先把守护设置好。',
  stageBubbleDefault: '冲动很正常，我们先慢下来。',

  diagnosisNotEnabled: (seconds: number) => `守护当前未开启。你仍可以用首页的“先 ${seconds} 秒”进入自助会话。`,
  diagnosisNotAuthorized: '守护未生效：需要系统授权（屏幕使用时间相关）。完成授权后才能拦截目标 App。',
  diagnosisNoSelection: '守护未生效：你还没有选择要守护的 App。建议先选外卖类。',
  diagnosisNotWithinWindow: (window: string) => `守护当前不在时段内（${window}）。你可以调整时段或保持不变。`,
  diagnosisActive: '守护已生效。你可以打开一次被守护 App 验证拦截是否出现。',

  proceedInfoDetailSafe: '回到刚才的 App，再点一次“继续”。这次会放行一次。',
  proceedInfoDetailGate: (seconds: number) => `你还没有获得放行票据。先完成 ${seconds} 秒门槛，再回来继续。`,
  proceedInfoDetailGateNeeded: (seconds: number) => `要继续进入刚才的 App，需要先完成 ${seconds} 秒门槛。`,
};

const DEFAULT_CONFIG: GuardConfig = {
  enabled: false,
  intensity: 'standard',
  window: { startMinutes: 21 * 60 + 30, endMinutes: 1 * 60 + 30 },
  minActionSeconds: 90,
};

const INITIAL_MONSTER: MonsterState = { cakeCount: 0, totalXp: 0, level: 1 };

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function formatMinutes(minutes: number) {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${pad2(h)}:${pad2(m)}`;
}

function timeValueToMinutes(value: string) {
  const [hRaw, mRaw] = value.split(':');
  const h = Number(hRaw);
  const m = Number(mRaw);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return 0;
  return Math.max(0, Math.min(23, h)) * 60 + Math.max(0, Math.min(59, m));
}

function windowContains(window: GuardWindow, date: Date) {
  const minutes = date.getHours() * 60 + date.getMinutes();
  const isCrossMidnight = window.endMinutes < window.startMinutes;
  if (isCrossMidnight) return minutes >= window.startMinutes || minutes < window.endMinutes;
  return minutes >= window.startMinutes && minutes < window.endMinutes;
}

function relativeTime(ts: number, now = Date.now()) {
  const seconds = Math.floor((now - ts) / 1000);
  if (seconds < 10) return '刚刚';
  if (seconds < 60) return `${seconds} 秒前`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  return `${days} 天前`;
}

function safeId() {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return (globalThis.crypto?.randomUUID?.() as string | undefined) ?? `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function useLocalStorageState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return initial;
      return JSON.parse(raw) as T;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  }, [key, value]);

  return [value, setValue] as const;
}

type Rgb = { r: number; g: number; b: number };
const COLORS = {
  brand: { r: 26, g: 77, b: 204 } satisfies Rgb,
  brandGlow: { r: 46, g: 133, b: 255 } satisfies Rgb,
  defaultBlue: { r: 31, g: 64, b: 140 } satisfies Rgb,
  purple: { r: 82, g: 51, b: 153 } satisfies Rgb,
};

function rgba(c: Rgb, a: number) {
  return `rgba(${c.r}, ${c.g}, ${c.b}, ${a})`;
}

function ZKFXBackground({ variant }: { variant: 'default' | 'activeGuard' }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    let w = 0;
    let h = 0;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      w = Math.max(1, Math.floor(rect.width));
      h = Math.max(1, Math.floor(rect.height));
      dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
    };

    const draw = (tMs: number) => {
      const t = (tMs / 1000) * (variant === 'activeGuard' ? 0.8 : 0.3);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const x1 = w * (0.5 + 0.3 * Math.sin(t * 0.7));
      const y1 = h * (0.4 + 0.2 * Math.cos(t * 0.5));
      const color1 = variant === 'activeGuard' ? COLORS.brand : COLORS.defaultBlue;
      ctx.save();
      ctx.filter = 'blur(50px)';
      ctx.fillStyle = rgba(color1, 0.25);
      ctx.beginPath();
      ctx.ellipse(x1, y1, 150, 150, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      const x2 = w * (0.2 + 0.3 * Math.cos(t * 0.4 + 2.0));
      const y2 = h * (0.7 + 0.2 * Math.sin(t * 0.6));
      ctx.save();
      ctx.filter = 'blur(60px)';
      ctx.fillStyle = rgba(COLORS.purple, variant === 'activeGuard' ? 0.2 : 0.15);
      ctx.beginPath();
      ctx.ellipse(x2, y2, 180, 180, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      const x3 = w * (0.8 + 0.2 * Math.sin(t * 0.3 + 4.0));
      const y3 = h * (0.2 + 0.3 * Math.cos(t * 0.4));
      ctx.save();
      ctx.filter = 'blur(40px)';
      ctx.fillStyle = rgba(COLORS.brandGlow, 0.1);
      ctx.beginPath();
      ctx.ellipse(x3, y3, 100, 100, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      raf = requestAnimationFrame(draw);
    };

    resize();
    raf = requestAnimationFrame(draw);
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [variant]);

  return (
    <div className="zkfx-bg" ref={containerRef}>
      <canvas className="zkfx-fluid" ref={canvasRef} />
    </div>
  );
}

function ZKFXCard({ children }: { children: React.ReactNode }) {
  return <div className="zkfx-card">{children}</div>;
}

function ZKFXPill({ text, tone }: { text: string; tone: 'neutral' | 'good' | 'warn' | 'bad' }) {
  return <span className={clsx('zkfx-pill', `pill-${tone}`)}>{text}</span>;
}

function ZKFXSwitch({ checked, onChange, disabled }: { checked: boolean; onChange: (next: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      className="zkfx-switch"
      aria-checked={checked}
      aria-disabled={disabled ? 'true' : 'false'}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      style={{
        backgroundColor: checked ? 'var(--brand)' : 'rgba(255,255,255,0.10)',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <span className="zkfx-switch-thumb" style={{ transform: checked ? 'translateX(20px)' : 'translateX(0px)' }} />
    </button>
  );
}

function ZKFXSpeechBubble({ text, maxWidth }: { text: string; maxWidth: string }) {
  return (
    <div className="zkfx-bubble" style={{ maxWidth }}>
      <div className="zkfx-bubble-text" aria-label={text.replace(/\n/g, ' ')}>
        {text}
      </div>
    </div>
  );
}

function WaveProgressCanvas({ progress, phaseIndex }: { progress: number; phaseIndex: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let raf = 0;
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    if (!ctx) return;

    const amp = 3.2;
    const freq = 10.0;
    const speed = 2.4;

    const render = () => {
      const width = cvs.width;
      const height = cvs.height;
      const y0 = height * 0.55;

      ctx.clearRect(0, 0, width, height);

      const doneX = clamp01(progress) * width;
      const t = Date.now() / 1000;

      ctx.beginPath();
      ctx.moveTo(0, y0);
      for (let x = 0; x <= doneX; x += 1) {
        const phase = (x / width) * freq * Math.PI * 2.0 + t * speed;
        const y = y0 + Math.sin(phase) * amp;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(doneX, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fillStyle = rgba(COLORS.brand, 0.45);
      ctx.fill();

      raf = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(raf);
  }, [progress]);

  return (
    <div className="zkfx-wave">
      <canvas ref={canvasRef} width={86} height={32} style={{ width: '100%', height: '100%', display: 'block' }} />
      <div className="zkfx-wave-dots">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="zkfx-wave-dot"
            style={{ backgroundColor: i <= phaseIndex ? 'rgba(255,255,255,0.90)' : 'rgba(255,255,255,0.25)' }}
          />
        ))}
      </div>
    </div>
  );
}

function ZKFXProgressRing({ value, label, sublabel }: { value: number; label: string; sublabel: string }) {
  const size = 86;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = clamp01(value);
  const dash = c * pct;
  const gap = c - dash;

  return (
    <div className="zkfx-progress-ring" aria-label={`${label} ${sublabel}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.10)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={rgba(COLORS.brand, 1)}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${dash} ${gap}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ filter: `drop-shadow(0 0 12px ${rgba(COLORS.brandGlow, 0.35)})` }}
        />
      </svg>
      <div className="zkfx-progress-ring-center">
        <div style={{ fontSize: 26, fontWeight: 700, color: 'rgba(255,255,255,1)' }}>{label}</div>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)' }}>{sublabel}</div>
      </div>
    </div>
  );
}

function SheetShell({
  children,
  variant,
  radialOpacity,
}: {
  children: React.ReactNode;
  variant: 'default' | 'activeGuard';
  radialOpacity: number;
}) {
  return (
    <motion.div
      className="zkfx-sheet"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 350, damping: 35 }}
    >
      <ZKFXBackground variant={variant} />
      <div className="zkfx-radial" style={{ opacity: radialOpacity }} />
      {children}
    </motion.div>
  );
}

export default function App() {
  const [config, setConfig] = useLocalStorageState<GuardConfig>('zkfx.config', DEFAULT_CONFIG);
  const [authStatus, setAuthStatus] = useLocalStorageState<AuthStatus>('zkfx.authStatus', 'notDetermined');
  const [selectedApps, setSelectedApps] = useLocalStorageState<string[]>('zkfx.selectedApps', []);
  const [minimalMode, setMinimalMode] = useLocalStorageState<boolean>('zkfx.minimalMode', false);
  const [monster3DEnabled, setMonster3DEnabled] = useLocalStorageState<boolean>('zkfx.monster3d', false);
  const [notificationNudgeEnabled, setNotificationNudgeEnabled] = useLocalStorageState<boolean>('zkfx.notificationNudge', false);
  const [notificationPrepromptShown, setNotificationPrepromptShown] = useLocalStorageState<boolean>('zkfx.notificationPrepromptShown', false);
  const [monsterState, setMonsterState] = useLocalStorageState<MonsterState>('zkfx.monsterState', INITIAL_MONSTER);
  const [runtimeLastAppliedAt, setRuntimeLastAppliedAt] = useLocalStorageState<number | null>('zkfx.runtime.lastAppliedAt', null);
  const [events, setEvents] = useLocalStorageState<LoggedEvent[]>('zkfx.events', []);

  const appendEvent = (type: string, payload?: Record<string, string>) => {
    setEvents((prev) => [...prev, { id: safeId(), timestamp: Date.now(), type, payload }]);
  };

  const selectionCount = selectedApps.length;
  const withinWindow = windowContains(config.window, new Date());
  const canEnable = authStatus === 'approved' && selectionCount > 0;

  const statusText = useMemo(() => {
    if (!config.enabled) return ZKFXStrings.stageStatusNotEnabled;
    if (authStatus !== 'approved') return ZKFXStrings.stageStatusNotAuthorized;
    if (selectionCount === 0) return ZKFXStrings.stageStatusNoSelection;
    if (!withinWindow) return ZKFXStrings.stageStatusNotWithinWindow;
    return ZKFXStrings.stageStatusActive;
  }, [authStatus, config.enabled, selectionCount, withinWindow]);

  const statusTone = useMemo<'neutral' | 'good' | 'warn' | 'bad'>(() => {
    if (!config.enabled) return 'neutral';
    if (authStatus !== 'approved') return 'warn';
    if (selectionCount === 0) return 'warn';
    if (!withinWindow) return 'neutral';
    return 'good';
  }, [authStatus, config.enabled, selectionCount, withinWindow]);

  const stageBubbleText = useMemo<string | null>(() => {
    if (minimalMode) return null;
    if (!config.enabled) return ZKFXStrings.stageBubbleNotEnabled(config.minActionSeconds);
    if (config.enabled && !canEnable) return ZKFXStrings.stageBubbleConfigNeeded;
    return ZKFXStrings.stageBubbleDefault;
  }, [canEnable, config.enabled, config.minActionSeconds, minimalMode]);

  const diagnosisDetail = useMemo(() => {
    if (!config.enabled) return ZKFXStrings.diagnosisNotEnabled(config.minActionSeconds);
    if (authStatus !== 'approved') return ZKFXStrings.diagnosisNotAuthorized;
    if (selectionCount === 0) return ZKFXStrings.diagnosisNoSelection;
    if (!withinWindow) return ZKFXStrings.diagnosisNotWithinWindow(`${formatMinutes(config.window.startMinutes)}–${formatMinutes(config.window.endMinutes)}`);
    return ZKFXStrings.diagnosisActive;
  }, [authStatus, config, selectionCount, withinWindow]);

  const suggestedSetupStep = useMemo(() => {
    if (authStatus !== 'approved' || selectionCount === 0) return 0;
    if (!withinWindow) return 1;
    return 2;
  }, [authStatus, selectionCount, withinWindow]);

  const [sheet, setSheet] = useState<Sheet>(null);

  useEffect(() => {
    if (!notificationNudgeEnabled) return;
    if (notificationPrepromptShown) return;
    if (!config.enabled) return;
    if (typeof Notification === 'undefined') return;
    if (Notification.permission === 'default') {
      setSheet({ type: 'notifications', context: 'stage' });
    } else {
      setNotificationPrepromptShown(true);
    }
  }, [config.enabled, notificationNudgeEnabled, notificationPrepromptShown, setNotificationPrepromptShown]);

  const openSetup = (initialStep: number) => setSheet({ type: 'setup', initialStep });
  const openSOS = (mode: 'intercepted' | 'selfInitiated') => setSheet({ type: 'sos', mode });

  return (
    <>
      <ZKFXBackground variant={config.enabled ? 'activeGuard' : 'default'} />
      <div className="zkfx-radial" style={{ opacity: minimalMode ? 0.35 : 0.8 }} />
      <div className="zkfx-app">
        <MonsterStageView
          statusText={statusText}
          statusTone={statusTone}
          stageBubbleText={stageBubbleText}
          minimalMode={minimalMode}
          configEnabled={config.enabled}
          gateSeconds={config.minActionSeconds}
          onOpenDiagnosis={() => setSheet({ type: 'diagnosis' })}
          onOpenSettings={() => setSheet({ type: 'settings' })}
          onOpenSetup={() => openSetup(0)}
          onOpenReview={() => setSheet({ type: 'review' })}
          onStartSOS={() => openSOS('selfInitiated')}
        />

        <AnimatePresence>
          {sheet?.type === 'sos' && (
            <SheetShell key="sos" variant="activeGuard" radialOpacity={minimalMode ? 0.35 : 0.8}>
              <SOSFlowView
                mode={sheet.mode}
                minimalMode={minimalMode}
                totalSeconds={config.minActionSeconds}
                canProceedWithTicket={sheet.mode !== 'intercepted'}
                appendEvent={appendEvent}
                onDismiss={() => setSheet(null)}
              />
            </SheetShell>
          )}

          {sheet?.type === 'setup' && (
            <SheetShell key="setup" variant="default" radialOpacity={0.8}>
              <SetupView
                initialStep={sheet.initialStep}
                authStatus={authStatus}
                setAuthStatus={setAuthStatus}
                selectedApps={selectedApps}
                setSelectedApps={setSelectedApps}
                config={config}
                setConfig={setConfig}
                notificationNudgeEnabled={notificationNudgeEnabled}
                setNotificationNudgeEnabled={setNotificationNudgeEnabled}
                onOpenNotificationSheet={() => setSheet({ type: 'notifications', context: 'setup' })}
                onDismiss={() => setSheet(null)}
                onSavedAndEnabled={() => setRuntimeLastAppliedAt(Date.now())}
              />
            </SheetShell>
          )}

          {sheet?.type === 'settings' && (
            <SheetShell key="settings" variant="default" radialOpacity={0.8}>
              <SettingsView
                minimalMode={minimalMode}
                setMinimalMode={setMinimalMode}
                monster3DEnabled={monster3DEnabled}
                setMonster3DEnabled={setMonster3DEnabled}
                notificationNudgeEnabled={notificationNudgeEnabled}
                setNotificationNudgeEnabled={setNotificationNudgeEnabled}
                onRequestNotifications={() => setSheet({ type: 'notifications', context: 'setup' })}
                monsterState={monsterState}
                setMonsterState={setMonsterState}
                onDismiss={() => setSheet(null)}
              />
            </SheetShell>
          )}

          {sheet?.type === 'review' && (
            <SheetShell key="review" variant="default" radialOpacity={0.8}>
              <ReviewView events={events} onDismiss={() => setSheet(null)} />
            </SheetShell>
          )}

          {sheet?.type === 'diagnosis' && (
            <SheetShell key="diagnosis" variant="default" radialOpacity={0.8}>
              <DiagnosisView
                statusText={statusText}
                statusTone={statusTone}
                diagnosisDetail={diagnosisDetail}
                runtimeLastAppliedAt={runtimeLastAppliedAt}
                configEnabled={config.enabled}
                canEnable={canEnable}
                suggestedSetupStep={suggestedSetupStep}
                onOpenSetup={(initialStep) => openSetup(initialStep)}
                onEnable={() => {
                  if (!canEnable) {
                    openSetup(0);
                    return;
                  }
                  setConfig((prev) => ({ ...prev, enabled: true }));
                  setRuntimeLastAppliedAt(Date.now());
                  setSheet(null);
                }}
                onDisable={() => {
                  setConfig((prev) => ({ ...prev, enabled: false }));
                  setSheet(null);
                }}
                onDismiss={() => setSheet(null)}
              />
            </SheetShell>
          )}

          {sheet?.type === 'notifications' && (
            <SheetShell key="notifications" variant="default" radialOpacity={0.8}>
              <NotificationPermissionView
                context={sheet.context}
                onDismiss={() => {
                  setNotificationPrepromptShown(true);
                  setSheet(null);
                }}
                onEnabled={() => {
                  setNotificationNudgeEnabled(true);
                  setNotificationPrepromptShown(true);
                  setSheet(null);
                }}
              />
            </SheetShell>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

function MonsterStageView({
  statusText,
  statusTone,
  stageBubbleText,
  minimalMode,
  configEnabled,
  gateSeconds,
  onOpenDiagnosis,
  onOpenSettings,
  onOpenSetup,
  onOpenReview,
  onStartSOS,
}: {
  statusText: string;
  statusTone: 'neutral' | 'good' | 'warn' | 'bad';
  stageBubbleText: string | null;
  minimalMode: boolean;
  configEnabled: boolean;
  gateSeconds: number;
  onOpenDiagnosis: () => void;
  onOpenSettings: () => void;
  onOpenSetup: () => void;
  onOpenReview: () => void;
  onStartSOS: () => void;
}) {
  const monsterSizeStyle: React.CSSProperties = {
    width: 'min(92vw, 72vh)',
    height: 'min(92vw, 72vh)',
    maxWidth: 520,
    maxHeight: 520,
  };

  return (
    <div className="zkfx-screen">
      <div className="zkfx-topbar">
        <button type="button" className="zkfx-capsule" onClick={onOpenDiagnosis}>
          <ZKFXPill text={statusText} tone={statusTone} />
          <ChevronRight size={12} style={{ color: 'var(--text-tertiary)' }} />
        </button>

        <div style={{ width: 38 }} />

        <button type="button" className="zkfx-icon-btn" onClick={onOpenSettings} aria-label="设置">
          <Settings size={16} style={{ color: 'var(--text-tertiary)' }} />
        </button>
      </div>

      <div className="zkfx-main">
        <div className="zkfx-monster-frame" style={monsterSizeStyle} aria-label="怪兽舞台">
          {!minimalMode && stageBubbleText && (
            <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translate(-50%, 0)', zIndex: 2 }}>
              <ZKFXSpeechBubble text={stageBubbleText} maxWidth={'min(calc(100vw - 72px), 300px)'} />
            </div>
          )}

          <motion.img
            src="/Monster_Happy.png"
            className="zkfx-monster-img"
            style={{
              width: minimalMode ? '62%' : '70%',
              height: minimalMode ? '62%' : '70%',
            }}
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
          />
        </div>
      </div>

      <div className="zkfx-bottom safe-area-bottom">
        <ZKFXCard>
          <div className="zkfx-bottom-card">
            <button type="button" className="btn-primary" onClick={onStartSOS}>
              <Sparkles size={18} style={{ marginRight: 10 }} />
              {`我现在想吃（先 ${gateSeconds} 秒）`}
            </button>
            <div className="zkfx-row">
              <button type="button" className="btn-secondary" onClick={onOpenSetup}>
                守护设置
              </button>
	              <button type="button" className="btn-secondary" onClick={onOpenReview}>
	                本周趋势
	              </button>
            </div>

            {!configEnabled && (
              <div className="zkfx-caption" style={{ marginTop: 2 }}>
                你也可以先不用守护，只用“先 90 秒”。
              </div>
            )}
          </div>
        </ZKFXCard>
      </div>
    </div>
  );
}

type SOSStep = 'checkIn1' | 'checkIn2' | 'moduleSelect' | 'moduleRun' | 'landing' | 'result' | 'delay' | 'proceedInfo';
type ModuleType = 'breathLight' | 'doodle' | 'listen';

type CheckIn1Choice = 'badDay' | 'hardToSay' | 'stressed';
type CheckIn2Choice = 'eat' | 'stayQuiet' | 'cry';
type LandingChoice = 'better' | 'stillWant' | 'notSure';

const CHECKIN1: { key: CheckIn1Choice; label: string; reply: string }[] = [
  { key: 'badDay', label: '今天很糟糕', reply: '嗯…我懂的。' },
  { key: 'hardToSay', label: '说不上来，很难受', reply: '说不清也没关系。' },
  { key: 'stressed', label: '压力太大了', reply: '辛苦了。先慢一点。' },
];

const CHECKIN2: { key: CheckIn2Choice; label: string; reply: string }[] = [
  { key: 'eat', label: '吃点东西', reply: '我知道你想吃。\n我们先等等？' },
  { key: 'stayQuiet', label: '安静待一会儿', reply: '好。\n我就静静陪着你。' },
  { key: 'cry', label: '想哭', reply: '哭吧。\n哭出来会好一点。' },
];

const MODULES: { key: ModuleType; title: string; subtitle: string; symbol: React.ReactNode }[] = [
  { key: 'breathLight', title: '呼吸灯', subtitle: '跟着光慢慢呼吸', symbol: <CircleDashed size={16} /> },
  { key: 'doodle', title: '涂一涂', subtitle: '随便画点什么', symbol: <Pencil size={16} /> },
  { key: 'listen', title: '听一听', subtitle: '白噪音陪你一下', symbol: <AudioWaveform size={16} /> },
];

const LANDING: { key: LandingChoice; label: string }[] = [
  { key: 'better', label: '好多了' },
  { key: 'stillWant', label: '还是想吃' },
  { key: 'notSure', label: '不知道' },
];

function SOSFlowView({
  mode,
  minimalMode,
  totalSeconds,
  canProceedWithTicket,
  appendEvent,
  onDismiss,
}: {
  mode: 'intercepted' | 'selfInitiated';
  minimalMode: boolean;
  totalSeconds: number;
  canProceedWithTicket: boolean;
  appendEvent: (type: string, payload?: Record<string, string>) => void;
  onDismiss: () => void;
}) {
  const seg1End = Math.max(10, Math.floor(totalSeconds / 3));
  const seg2End = Math.max(seg1End + 10, Math.floor((totalSeconds * 2) / 3));

  const [step, setStep] = useState<SOSStep>('checkIn1');
  const [elapsed, setElapsed] = useState(0);
  const [bubbleText, setBubbleText] = useState<string>('发生什么了？');
  const [lockInputs, setLockInputs] = useState(false);
  const [checkIn1Choice, setCheckIn1Choice] = useState<CheckIn1Choice | null>(null);
  const [checkIn2Choice, setCheckIn2Choice] = useState<CheckIn2Choice | null>(null);
  const [module, setModule] = useState<ModuleType | null>(null);
  const [landingChoice, setLandingChoice] = useState<LandingChoice | null>(null);
  const [delaySecondsRemaining, setDelaySecondsRemaining] = useState(120);
  const [proceedInfoDetail, setProceedInfoDetail] = useState<string | null>(null);

  const timeoutsRef = useRef<number[]>([]);
  const delayTimerRef = useRef<number | null>(null);

  const phaseIndex = elapsed < seg1End ? 0 : elapsed < seg2End ? 1 : 2;
  const progress = clamp01(elapsed / Math.max(1, totalSeconds));

  const monsterImage = useMemo(() => {
    switch (step) {
      case 'checkIn1':
      case 'checkIn2':
      case 'landing':
      case 'proceedInfo':
        return 'Monster_Concerned.png';
      case 'moduleSelect':
      case 'moduleRun':
        return 'Monster_Breathing.png';
      case 'result':
      case 'delay':
        return 'Monster_Happy.png';
    }
  }, [step]);

  const titleText = useMemo(() => {
    switch (step) {
      case 'checkIn1':
      case 'checkIn2':
        return '先接住一下';
      case 'moduleSelect':
      case 'moduleRun':
        return '我们做点别的';
      case 'landing':
        return '快结束了';
      case 'result':
        return '现在决定';
      case 'delay':
        return '延迟 2 分钟';
      case 'proceedInfo':
        return '好的';
    }
  }, [step]);

  const clearTimeouts = () => {
    for (const id of timeoutsRef.current) window.clearTimeout(id);
    timeoutsRef.current = [];
  };

  const schedule = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timeoutsRef.current.push(id);
  };

  const scheduleAutoAdvance = () => {
    clearTimeouts();
    if (step === 'checkIn1') {
      schedule(() => {
        if (step === 'checkIn1' && checkIn1Choice == null) selectCheckIn1('hardToSay', true);
      }, 12_000);
    } else if (step === 'checkIn2') {
      schedule(() => {
        if (step === 'checkIn2' && checkIn2Choice == null) selectCheckIn2('stayQuiet', true);
      }, 12_000);
    } else if (step === 'moduleSelect') {
      schedule(() => {
        if (step === 'moduleSelect' && module == null) selectModule('breathLight', true);
      }, 10_000);
    } else if (step === 'landing') {
      schedule(() => {
        if (step === 'landing' && landingChoice == null) selectLanding('notSure', true);
      }, 12_000);
    }
  };

  const selectCheckIn1 = (choice: CheckIn1Choice, auto = false) => {
    const picked = CHECKIN1.find((c) => c.key === choice);
    if (!picked) return;
    setCheckIn1Choice(choice);
    setBubbleText(picked.reply);
    setLockInputs(true);
    appendEvent('sos_checkin1_selected', { choice, auto: auto ? 'true' : 'false' });
    schedule(() => {
      setLockInputs(false);
      setStep((prev) => {
        if (prev !== 'checkIn1') return prev;
        setBubbleText('现在最想做什么？');
        scheduleAutoAdvance();
        return 'checkIn2';
      });
    }, 1200);
  };

  const selectCheckIn2 = (choice: CheckIn2Choice, auto = false) => {
    const picked = CHECKIN2.find((c) => c.key === choice);
    if (!picked) return;
    setCheckIn2Choice(choice);
    setBubbleText(picked.reply);
    setLockInputs(true);
    appendEvent('sos_checkin2_selected', { choice, auto: auto ? 'true' : 'false' });
    schedule(() => {
      setLockInputs(false);
      setStep((prev) => {
        if (prev !== 'checkIn2') return prev;
        setBubbleText('我们一起做点别的吧');
        scheduleAutoAdvance();
        return 'moduleSelect';
      });
    }, 1200);
  };

  const selectModule = (m: ModuleType, auto = false) => {
    setModule(m);
    setBubbleText(m === 'breathLight' ? '跟着光，慢慢呼吸。' : '就做这一个小动作。');
    appendEvent('sos_module_selected', { module: m, auto: auto ? 'true' : 'false' });
    setLockInputs(true);
    schedule(() => {
      setLockInputs(false);
      setStep('moduleRun');
    }, 200);
  };

  const selectLanding = (choice: LandingChoice, auto = false) => {
    setLandingChoice(choice);
    appendEvent('sos_landing_selected', { choice, auto: auto ? 'true' : 'false' });

    if (choice === 'better') setBubbleText('很好。\n你做到了暂停。');
    if (choice === 'stillWant') setBubbleText('那就吃吧。\n我陪你，但慢一点。');
    if (choice === 'notSure') setBubbleText('没关系。\n我们先照顾一下自己。');

    setLockInputs(true);
    schedule(() => {
      setLockInputs(false);
      setStep('result');
    }, 1000);
  };

  const stopDelayTimer = () => {
    if (delayTimerRef.current != null) window.clearInterval(delayTimerRef.current);
    delayTimerRef.current = null;
  };

  const startDelay = () => {
    stopDelayTimer();
    delayTimerRef.current = window.setInterval(() => {
      setDelaySecondsRemaining((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
  };

  const formatDelay = (s: number) => {
    const mm = Math.floor(Math.max(0, s) / 60);
    const ss = Math.max(0, s) % 60;
    return `${mm}:${pad2(ss)}`;
  };

  const finish = (choice: 'back' | 'delay' | 'proceed') => {
    if (choice === 'back') {
      appendEvent('result_back', { mode });
      if (mode === 'selfInitiated') appendEvent('self_initiated_session_completed', { result: 'back' });
      schedule(() => onDismiss(), 600);
      return;
    }

    if (choice === 'delay') {
      setDelaySecondsRemaining(120);
      setBubbleText('我们再等两分钟。\n你不需要立刻决定。');
      setStep('delay');
      startDelay();
      return;
    }

    appendEvent('result_proceed', { mode });
    if (mode === 'selfInitiated') appendEvent('self_initiated_session_completed', { result: 'proceed' });
    setProceedInfoDetail(mode === 'intercepted' && !canProceedWithTicket ? ZKFXStrings.proceedInfoDetailGateNeeded(totalSeconds) : null);
    setStep('proceedInfo');
  };

  const completeDelayIfNeeded = () => {
    if (delaySecondsRemaining > 0) return;
    stopDelayTimer();
    appendEvent('result_delay', { mode });
    if (mode === 'selfInitiated') appendEvent('self_initiated_session_completed', { result: 'delay' });
    schedule(() => onDismiss(), 600);
  };

  useEffect(() => {
    appendEvent(mode === 'selfInitiated' ? 'self_initiated_session_started' : 'intercepted_sos_opened');

    const timer = window.setInterval(() => {
      setElapsed((e) => (e < totalSeconds ? e + 1 : e));
    }, 1000);

    scheduleAutoAdvance();
    return () => {
      window.clearInterval(timer);
      clearTimeouts();
      stopDelayTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (elapsed === seg1End) {
      if (step === 'checkIn1' || step === 'checkIn2') {
        setStep('moduleSelect');
        setBubbleText('我们一起做点别的吧');
        scheduleAutoAdvance();
      }
    } else if (elapsed === seg2End) {
      if (step === 'moduleSelect' || step === 'moduleRun') {
        setStep('landing');
        setBubbleText(`快 ${totalSeconds} 秒了。\n你现在感觉怎么样？`);
        scheduleAutoAdvance();
      }
    } else if (elapsed >= totalSeconds) {
      if (step !== 'result' && step !== 'delay' && step !== 'proceedInfo') {
        setStep('result');
      }
    }
  }, [elapsed, seg1End, seg2End, step, totalSeconds]);

  useEffect(() => {
    if (step === 'delay') {
      startDelay();
      return () => stopDelayTimer();
    }
    return;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const monsterSizeStyle: React.CSSProperties = {
    width: 'min(88vw, 58vh)',
    height: 'min(88vw, 58vh)',
    maxWidth: 520,
    maxHeight: 520,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div className="zkfx-screen">
      <div className="zkfx-topbar" style={{ paddingTop: 10 }}>
        <button type="button" className="zkfx-icon-btn" onClick={onDismiss} aria-label="关闭">
          <X size={14} style={{ color: 'rgba(255,255,255,0.85)' }} />
        </button>

        <div className="zkfx-title">{titleText}</div>

        <div className="zkfx-row" style={{ justifyContent: 'flex-end', width: 86 }}>
          <WaveProgressCanvas progress={progress} phaseIndex={phaseIndex} />
        </div>
      </div>

      <div className="zkfx-main">
        <div style={monsterSizeStyle}>
          {!minimalMode && (
            <div style={{ position: 'absolute', top: -6, left: '50%', transform: 'translate(-50%, 0)', zIndex: 2 }}>
              <ZKFXSpeechBubble text={bubbleText} maxWidth={'min(calc(100vw - 72px), 300px)'} />
            </div>
          )}

          <motion.img
            key={monsterImage}
            src={`/${monsterImage}`}
            className="zkfx-monster-img"
            style={{
              width: '70%',
              height: '70%',
              animation: step === 'moduleRun' && module === 'breathLight' ? 'zkfx-breath 4s infinite ease-in-out alternate' : 'none',
            }}
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
          />

          {step === 'moduleRun' && module && (
            <div style={{ position: 'absolute', bottom: 140, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
              <ModuleOverlay module={module} />
            </div>
          )}
        </div>
      </div>

      <div className="zkfx-bottom safe-area-bottom">
        <ZKFXCard>
          <div className="zkfx-bottom-card">
            {step === 'checkIn1' && (
              <>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,1)' }}>发生什么了？</div>
                <div style={{ display: 'grid', gap: 10 }}>
                  {CHECKIN1.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      className={clsx('option-row', checkIn1Choice === item.key && 'selected')}
                      onClick={() => !lockInputs && selectCheckIn1(item.key)}
                      disabled={lockInputs}
                      style={{ opacity: lockInputs ? 0.75 : 1 }}
                    >
                      {checkIn1Choice === item.key ? (
                        <CheckCircle2 size={16} style={{ color: 'var(--brand)' }} />
                      ) : (
                        <Circle size={16} style={{ color: 'var(--text-tertiary)' }} />
                      )}
                      <span style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,1)' }}>{item.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 'checkIn2' && (
              <>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,1)' }}>现在最想做什么？</div>
                <div style={{ display: 'grid', gap: 10 }}>
                  {CHECKIN2.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      className={clsx('option-row', checkIn2Choice === item.key && 'selected')}
                      onClick={() => !lockInputs && selectCheckIn2(item.key)}
                      disabled={lockInputs}
                      style={{ opacity: lockInputs ? 0.75 : 1 }}
                    >
                      {checkIn2Choice === item.key ? (
                        <CheckCircle2 size={16} style={{ color: 'var(--brand)' }} />
                      ) : (
                        <Circle size={16} style={{ color: 'var(--text-tertiary)' }} />
                      )}
                      <span style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,1)' }}>{item.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 'moduleSelect' && (
              <>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,1)' }}>我们一起做点别的吧</div>
                <div style={{ display: 'grid', gap: 10 }}>
                  {MODULES.map((m) => (
                    <button
                      key={m.key}
                      type="button"
                      className={clsx('module-row', module === m.key && 'selected')}
                      onClick={() => !lockInputs && selectModule(m.key)}
                      disabled={lockInputs}
                      style={{ opacity: lockInputs ? 0.75 : 1 }}
                    >
                      <span style={{ width: 24, display: 'inline-flex', justifyContent: 'center', color: module === m.key ? 'var(--brand)' : 'var(--text-tertiary)' }}>
                        {m.symbol}
                      </span>
                      <span style={{ flex: 1, textAlign: 'left' }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,1)' }}>{m.title}</div>
                        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-tertiary)' }}>{m.subtitle}</div>
                      </span>
                      <ChevronRight size={14} style={{ color: 'var(--text-tertiary)' }} />
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 'moduleRun' && (
              <>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,1)' }}>跟着我，慢慢来</div>
                <div className="zkfx-row">
                  <button type="button" className="btn-secondary" onClick={() => selectModule('breathLight')}>
                    呼吸灯
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => selectModule('doodle')}>
                    涂一涂
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => selectModule('listen')}>
                    听一听
                  </button>
                </div>
              </>
            )}

            {step === 'landing' && (
              <>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,1)' }}>快到结束了，你现在感觉怎么样？</div>
                <div style={{ display: 'grid', gap: 10 }}>
                  {LANDING.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      className={clsx('option-row', landingChoice === item.key && 'selected')}
                      onClick={() => !lockInputs && selectLanding(item.key)}
                      disabled={lockInputs}
                      style={{ opacity: lockInputs ? 0.75 : 1 }}
                    >
                      {landingChoice === item.key ? (
                        <CheckCircle2 size={16} style={{ color: 'var(--brand)' }} />
                      ) : (
                        <Circle size={16} style={{ color: 'var(--text-tertiary)' }} />
                      )}
                      <span style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,1)' }}>{item.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 'result' && (
              <>
                <button type="button" className="btn-primary" onClick={() => finish('back')}>
                  回到舞台
                </button>
                <button type="button" className="btn-secondary" onClick={() => finish('delay')}>
                  延迟 2 分钟（完成后算一次）
                </button>
                <button
                  type="button"
                  onClick={() => finish('proceed')}
                  style={{ height: 44, background: 'transparent', border: 'none', color: 'var(--text-tertiary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  {mode === 'intercepted' ? '我仍要继续（不奖励）' : '我决定要吃（不奖励）'}
                </button>
              </>
            )}

            {step === 'delay' && (
              <>
                <div className={clsx('zkfx-caption', 'tabular')}>{`还剩 ${formatDelay(delaySecondsRemaining)}`}</div>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={completeDelayIfNeeded}
                  disabled={delaySecondsRemaining > 0}
                  style={{ opacity: delaySecondsRemaining > 0 ? 0.5 : 1 }}
                >
                  {delaySecondsRemaining > 0 ? '先等完再继续' : mode === 'intercepted' ? '时间到了，下一步' : '时间到了，结束'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    stopDelayTimer();
                    setStep('result');
                  }}
                  style={{ height: 40, background: 'transparent', border: 'none', color: 'var(--text-tertiary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  我现在就做决定（不算一次延迟）
                </button>
              </>
            )}

            {step === 'proceedInfo' && (
              <>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: 1.35 }}>
                  {canProceedWithTicket ? ZKFXStrings.proceedInfoDetailSafe : proceedInfoDetail ?? ZKFXStrings.proceedInfoDetailGate(totalSeconds)}
                </div>
                <button type="button" className="btn-primary" onClick={onDismiss}>
                  {canProceedWithTicket ? '我知道了' : '退出'}
                </button>
              </>
            )}
          </div>
        </ZKFXCard>
      </div>

      <style>{`
        @keyframes zkfx-breath {
          0% { transform: scale(0.9); }
          100% { transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
}

function BreathLightModule() {
  const [hue, setHue] = useState(0.58);
  const [pressed, setPressed] = useState(false);

  return (
    <div
      role="button"
      aria-label="呼吸灯"
      onPointerDown={() => {
        setPressed(true);
        setHue(0.46 + Math.random() * (0.78 - 0.46));
      }}
      onPointerUp={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      style={{
        width: 240,
        height: 240,
        borderRadius: 999,
        position: 'relative',
        touchAction: 'none',
        transform: pressed ? 'scale(0.99)' : 'scale(1)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 999,
          background: `radial-gradient(circle at 50% 50%, hsla(${hue * 360}, 35%, 98%, 0.72) 0%, hsla(${hue * 360}, 55%, 95%, 0.22) 38%, rgba(0,0,0,0) 75%)`,
          filter: 'blur(0.4px)',
          animation: 'zkfx-breathe-2s 2s ease-in-out infinite alternate',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 10,
          borderRadius: 999,
          border: '1px solid rgba(255,255,255,0.10)',
          animation: 'zkfx-breathe-2s 2s ease-in-out infinite alternate',
        }}
      />
      <style>{`
        @keyframes zkfx-breathe-2s {
          0% { transform: scale(0.86); }
          100% { transform: scale(1.10); }
        }
      `}</style>
    </div>
  );
}

function DoodleModule() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const strokesRef = useRef<{ points: { x: number; y: number }[]; color: string; width: number }[]>([]);
  const currentRef = useRef<{ points: { x: number; y: number }[]; color: string; width: number } | null>(null);

  const redraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const drawStroke = (s: { points: { x: number; y: number }[]; color: string; width: number }) => {
      if (s.points.length < 2) return;
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(s.points[0]!.x, s.points[0]!.y);
      for (const p of s.points.slice(1)) ctx.lineTo(p.x, p.y);
      ctx.stroke();
    };
    for (const s of strokesRef.current) drawStroke(s);
    if (currentRef.current) drawStroke(currentRef.current);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    redraw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ width: 340, height: 220, borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none' }}
        aria-label="涂鸦墙"
        onPointerDown={(e) => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const rect = canvas.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const hue = 0.5 + Math.random() * (0.78 - 0.5);
          currentRef.current = {
            points: [{ x, y }],
            color: `hsla(${hue * 360}, 40%, 98%, 0.90)`,
            width: 3 + Math.random() * 2,
          };
          (e.currentTarget as HTMLCanvasElement).setPointerCapture(e.pointerId);
          redraw();
        }}
        onPointerMove={(e) => {
          if (!currentRef.current) return;
          const canvas = canvasRef.current;
          if (!canvas) return;
          const rect = canvas.getBoundingClientRect();
          currentRef.current.points.push({ x: e.clientX - rect.left, y: e.clientY - rect.top });
          redraw();
        }}
        onPointerUp={() => {
          if (currentRef.current) strokesRef.current.push(currentRef.current);
          currentRef.current = null;
          redraw();
        }}
        onPointerCancel={() => {
          currentRef.current = null;
          redraw();
        }}
      />
    </div>
  );
}

function ListenModule() {
  const [playing, setPlaying] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const stop = () => {
    try {
      sourceRef.current?.stop();
    } catch {
      // ignore
    }
    sourceRef.current = null;
    setPlaying(false);
  };

  const start = async () => {
    if (playing) return;
    const ctx = ctxRef.current ?? new AudioContext();
    ctxRef.current = ctx;
    await ctx.resume();

    const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * 0.3;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 220;

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 9000;

    const gain = ctx.createGain();
    gain.gain.value = 0.18;

    source.connect(hp);
    hp.connect(lp);
    lp.connect(gain);
    gain.connect(ctx.destination);

    source.start();

    sourceRef.current = source;
    setPlaying(true);
  };

  useEffect(() => () => stop(), []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
      <div style={{ width: 240, height: 120, borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }} />
      <button type="button" className="btn-secondary" onClick={() => (playing ? stop() : void start())} style={{ width: 220 }}>
        {playing ? '暂停' : '播放白噪音'}
      </button>
      <div className="zkfx-caption">轻一点就好。</div>
    </div>
  );
}

function ModuleOverlay({ module }: { module: ModuleType }) {
  if (module === 'breathLight') return <BreathLightModule />;
  if (module === 'doodle') return <DoodleModule />;
  return <ListenModule />;
}

function SetupView({
  initialStep,
  authStatus,
  setAuthStatus,
  selectedApps,
  setSelectedApps,
  config,
  setConfig,
  notificationNudgeEnabled,
  setNotificationNudgeEnabled,
  onOpenNotificationSheet,
  onDismiss,
  onSavedAndEnabled,
}: {
  initialStep: number;
  authStatus: AuthStatus;
  setAuthStatus: (next: AuthStatus) => void;
  selectedApps: string[];
  setSelectedApps: (next: string[]) => void;
  config: GuardConfig;
  setConfig: React.Dispatch<React.SetStateAction<GuardConfig>>;
  notificationNudgeEnabled: boolean;
  setNotificationNudgeEnabled: (next: boolean) => void;
  onOpenNotificationSheet: () => void;
  onDismiss: () => void;
  onSavedAndEnabled: () => void;
}) {
  const [step, setStep] = useState(0);
  const [didApplyInitialStep, setDidApplyInitialStep] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [intensity, setIntensity] = useState<GuardIntensity>(config.intensity);
  const [startTime, setStartTime] = useState(formatMinutes(config.window.startMinutes));
  const [endTime, setEndTime] = useState(formatMinutes(config.window.endMinutes));

  useEffect(() => {
    if (didApplyInitialStep) return;
    setStep(Math.max(0, Math.min(2, initialStep)));
    setDidApplyInitialStep(true);
  }, [didApplyInitialStep, initialStep]);

  const selectionCount = selectedApps.length;
  const canSave = authStatus === 'approved' && selectionCount > 0;
  const canGoNext = step === 0 ? canSave : true;

  const stepTitle = step === 0 ? '先完成基础配置' : step === 1 ? '选一个最脆弱的时段' : '定下你的防线力度';
  const stepSubtitle = step === 0 ? '授权 + 选择 App。完成后才会真正拦截。' : step === 1 ? '深夜是默认值，你也可以自定义。' : '你始终可以在首页关闭守护。';

  const authPill = authStatus === 'approved' ? { text: '已授权', tone: 'good' as const } : authStatus === 'denied' ? { text: '已拒绝', tone: 'bad' as const } : { text: '未授权', tone: 'warn' as const };

  const availableApps = ['美团', '饿了么', '京东到家', '小红书', '抖音', '淘宝', '微博'];

  const toggleApp = (name: string) => {
    if (selectedApps.includes(name)) setSelectedApps(selectedApps.filter((x) => x !== name));
    else setSelectedApps([...selectedApps, name]);
  };

  const saveAndEnable = () => {
    const start = timeValueToMinutes(startTime);
    const end = timeValueToMinutes(endTime);
    setConfig((prev) => ({
      ...prev,
      enabled: true,
      intensity,
      window: { startMinutes: start, endMinutes: end },
      minActionSeconds: 90,
    }));
    onSavedAndEnabled();
    onDismiss();
  };

  return (
    <div className="zkfx-screen">
      <div className="zkfx-topbar">
        <button type="button" className="zkfx-icon-btn" onClick={onDismiss} aria-label="关闭">
          <X size={14} style={{ color: 'rgba(255,255,255,0.85)' }} />
        </button>
        <div className="zkfx-title">配置守护</div>
        <div style={{ width: 38 }} />
      </div>

      <div className="zkfx-page" style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
        <div style={{ display: 'grid', gap: 8 }}>
          <div className="zkfx-h2">{stepTitle}</div>
          <div className="zkfx-subtitle">{stepSubtitle}</div>
        </div>

        <div className="zkfx-step-dots">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="zkfx-step-dot"
              style={{
                width: i === step ? 26 : 8,
                backgroundColor: i === step ? 'var(--brand)' : 'rgba(255,255,255,0.12)',
              }}
            />
          ))}
          <div style={{ flex: 1 }} />
        </div>

        {step === 0 && (
          <div style={{ display: 'grid', gap: 12 }}>
            <ZKFXCard>
              <div style={{ display: 'grid', gap: 12 }}>
                <div className="zkfx-row-spread">
                  <ZKFXPill text={authPill.text} tone={authPill.tone} />
                  <div />
                </div>
                <div className="zkfx-subtitle">需要系统授权，才能在你打开外卖等 App 时显示拦截。</div>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setAuthStatus('approved')}
                  disabled={authStatus === 'approved'}
                  style={{ opacity: authStatus === 'approved' ? 0.55 : 1 }}
                >
                  {authStatus === 'approved' ? '已授权' : '去授权'}
                </button>
                {authStatus === 'denied' && (
                  <button type="button" className="btn-secondary" onClick={() => setAuthStatus('notDetermined')}>
                    去系统设置打开权限
                  </button>
                )}
              </div>
            </ZKFXCard>

            <ZKFXCard>
              <div style={{ display: 'grid', gap: 12 }}>
                <div className="zkfx-row-spread">
                  <div className="zkfx-h3">提醒回流（强烈推荐）</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: notificationNudgeEnabled ? 'var(--success)' : 'var(--warning)' }}>
                    {notificationNudgeEnabled ? '已开启' : '未开启'}
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: 1.35 }}>
                  iOS 不允许从拦截页直接跳回喂喂。开启通知后，你打开被守护 App 会立刻收到提醒，点一下就能回到喂喂完成 90 秒。
                </div>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    if (typeof Notification !== 'undefined') onOpenNotificationSheet();
                    setNotificationNudgeEnabled(true);
                  }}
                  disabled={notificationNudgeEnabled}
                  style={{ opacity: notificationNudgeEnabled ? 0.6 : 1 }}
                >
                  {notificationNudgeEnabled ? '已开启' : '开启通知'}
                </button>
              </div>
            </ZKFXCard>

            <ZKFXCard>
              <div style={{ display: 'grid', gap: 12 }}>
                <div className="zkfx-row-spread">
                  <div className="zkfx-h3">选择要守护的 App</div>
                  <div className="zkfx-caption">{selectionCount === 0 ? '未选择' : `已选 ${selectionCount}`}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>建议先选外卖类 App。你可以随时回来调整。</div>
                <button type="button" className="btn-secondary" onClick={() => setPickerOpen(true)}>
                  打开选择器
                </button>
              </div>
            </ZKFXCard>
          </div>
        )}

        {step === 1 && (
          <ZKFXCard>
            <div style={{ display: 'grid', gap: 14 }}>
              <div className="zkfx-h3">守护时段</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>你最容易失控的那段时间，就是喂喂最该出现的时候。</div>

              <div className="zkfx-row-spread" style={{ padding: '6px 0' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>开始</div>
                <input className="zkfx-time-input" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
              <div className="zkfx-row-spread" style={{ padding: '6px 0' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>结束</div>
                <input className="zkfx-time-input" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>

              <div className="zkfx-caption" style={{ marginTop: 4 }}>
                支持跨天（例如 21:30–01:30）。
              </div>
            </div>
          </ZKFXCard>
        )}

        {step === 2 && (
          <div style={{ display: 'grid', gap: 12 }}>
            <ZKFXCard>
              <div style={{ display: 'grid', gap: 10 }}>
                <div className="zkfx-h3">拦截力度</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                  标准模式允许继续，但需要先完成 {config.minActionSeconds} 秒动作。强力模式不提供继续按钮。
                </div>

                <IntensityRow selected={intensity === 'standard'} title="标准" subtitle="可继续，但必须先完成动作门槛" onClick={() => setIntensity('standard')} />
                <IntensityRow selected={intensity === 'strict'} title="强力" subtitle="不提供继续按钮（可在首页关闭守护）" onClick={() => setIntensity('strict')} />
              </div>
            </ZKFXCard>

            <ZKFXCard>
              <div style={{ display: 'grid', gap: 10 }}>
                <div className="zkfx-h3">准备好了</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                  保存后会立即启动守护。建议真机试一次：配置完成后，打开外卖 App 验证拦截。
                </div>
              </div>
            </ZKFXCard>
          </div>
        )}

        <div style={{ flex: 1 }} />

        <div style={{ display: 'grid', gap: 10 }}>
          {step === 2 ? (
            <button type="button" className="btn-primary" onClick={saveAndEnable} disabled={!canSave} style={{ opacity: canSave ? 1 : 0.45 }}>
              保存并启用
            </button>
          ) : (
            <button type="button" className="btn-primary" onClick={() => setStep((s) => Math.min(2, s + 1))} disabled={!canGoNext} style={{ opacity: canGoNext ? 1 : 0.45 }}>
              下一步
            </button>
          )}

          <button type="button" className="btn-secondary" onClick={() => (step === 0 ? onDismiss() : setStep((s) => Math.max(0, s - 1)))}>
            {step === 0 ? '稍后再说' : '上一步'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {pickerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'flex-end' }}
            onClick={() => setPickerOpen(false)}
          >
            <motion.div
              initial={{ y: 40 }}
              animate={{ y: 0 }}
              exit={{ y: 40 }}
              style={{ width: '100%', padding: 18, paddingBottom: `max(18px, env(safe-area-inset-bottom))` }}
              onClick={(e) => e.stopPropagation()}
            >
              <ZKFXCard>
                <div style={{ display: 'grid', gap: 10 }}>
                  <div className="zkfx-row-spread">
                    <div className="zkfx-h3">选择 App</div>
                    <button type="button" className="zkfx-icon-btn" onClick={() => setPickerOpen(false)} aria-label="关闭">
                      <X size={14} style={{ color: 'rgba(255,255,255,0.85)' }} />
                    </button>
                  </div>
                  <div className="zkfx-caption">模拟 FamilyActivityPicker（Web 版）</div>
                  <div className="zkfx-divider" />
                  <div style={{ display: 'grid', gap: 10 }}>
                    {availableApps.map((name) => {
                      const selected = selectedApps.includes(name);
                      return (
                        <button key={name} type="button" className={clsx('option-row', selected && 'selected')} onClick={() => toggleApp(name)}>
                          {selected ? <CheckCircle2 size={16} style={{ color: 'var(--brand)' }} /> : <Circle size={16} style={{ color: 'var(--text-tertiary)' }} />}
                          <span style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,1)' }}>{name}</span>
                          <span style={{ marginLeft: 'auto', color: 'var(--text-tertiary)', fontSize: 12, fontWeight: 600 }}>{selected ? '已选' : ''}</span>
                        </button>
                      );
                    })}
                  </div>
                  <button type="button" className="btn-primary" onClick={() => setPickerOpen(false)} disabled={selectedApps.length === 0} style={{ opacity: selectedApps.length === 0 ? 0.6 : 1 }}>
                    完成（{selectedApps.length}）
                  </button>
                </div>
              </ZKFXCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function IntensityRow({ selected, title, subtitle, onClick }: { selected: boolean; title: string; subtitle: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="module-row"
      style={{
        height: 58,
        borderRadius: 16,
        background: selected ? rgba(COLORS.brand, 0.25) : 'rgba(255,255,255,0.04)',
        boxShadow: `inset 0 0 0 1px ${selected ? rgba(COLORS.brand, 0.75) : 'rgba(255,255,255,0.08)'}`,
      }}
    >
      <span style={{ width: 24, display: 'inline-flex', justifyContent: 'center' }}>
        {selected ? <CheckCircle2 size={18} style={{ color: 'var(--brand)' }} /> : <Circle size={18} style={{ color: 'var(--text-tertiary)' }} />}
      </span>
      <span style={{ flex: 1, textAlign: 'left' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,1)' }}>{title}</div>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-tertiary)' }}>{subtitle}</div>
      </span>
    </button>
  );
}

function SettingsView({
  minimalMode,
  setMinimalMode,
  monster3DEnabled,
  setMonster3DEnabled,
  notificationNudgeEnabled,
  setNotificationNudgeEnabled,
  onRequestNotifications,
  monsterState,
  setMonsterState,
  onDismiss,
}: {
  minimalMode: boolean;
  setMinimalMode: (next: boolean) => void;
  monster3DEnabled: boolean;
  setMonster3DEnabled: (next: boolean) => void;
  notificationNudgeEnabled: boolean;
  setNotificationNudgeEnabled: (next: boolean) => void;
  onRequestNotifications: () => void;
  monsterState: MonsterState;
  setMonsterState: (next: MonsterState) => void;
  onDismiss: () => void;
}) {
  const permission =
    typeof Notification === 'undefined' ? '未知' : Notification.permission === 'granted' ? '已开启' : Notification.permission === 'denied' ? '已关闭（可去系统设置打开）' : '未请求';
  const notificationsAuthorized = typeof Notification !== 'undefined' && Notification.permission === 'granted';

  const xpForNextLevel = monsterState.level * 100;
  const progress = xpForNextLevel > 0 ? clamp01(monsterState.totalXp / xpForNextLevel) : 0;

  return (
    <div className="zkfx-screen">
      <div className="zkfx-topbar">
        <button type="button" className="zkfx-icon-btn" onClick={onDismiss} aria-label="关闭">
          <X size={14} style={{ color: 'rgba(255,255,255,0.85)' }} />
        </button>
        <div className="zkfx-title">设置</div>
        <div style={{ width: 38 }} />
      </div>

      <div className="zkfx-scroll">
        <div className="zkfx-page" style={{ display: 'grid', gap: 14, paddingBottom: 24 }}>
          <ZKFXCard>
            <div style={{ display: 'grid', gap: 12 }}>
              <div className="zkfx-h3">显示</div>

              <div className="zkfx-row-spread">
                <div style={{ display: 'grid', gap: 4 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,1)' }}>极简模式</div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-tertiary)' }}>隐藏怪兽动画/对话，只保留按钮与状态。</div>
                </div>
                <ZKFXSwitch checked={minimalMode} onChange={setMinimalMode} />
              </div>

              <div className="zkfx-row-spread">
                <div style={{ display: 'grid', gap: 4 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,1)' }}>3D 怪兽（实验）</div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-tertiary)' }}>开启后用 3D 渲染怪兽（Web 版仅做 UI 复现）。</div>
                </div>
                <ZKFXSwitch checked={monster3DEnabled} onChange={setMonster3DEnabled} />
              </div>
            </div>
          </ZKFXCard>

          <ZKFXCard>
            <div style={{ display: 'grid', gap: 12 }}>
              <div className="zkfx-h3">怪兽成长</div>
              <div className="zkfx-row" style={{ gap: 12 }}>
                <img src="/Monster_Happy.png" alt="" style={{ width: 92, height: 92, objectFit: 'contain', filter: 'drop-shadow(0 14px 28px rgba(0,0,0,0.35))' }} />
                <div style={{ display: 'grid', gap: 6 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,1)' }}>{`Lv.${monsterState.level}`}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{`🍰 ${monsterState.cakeCount}`}</div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-tertiary)' }}>{`经验：${Math.round(progress * 100)}%`}</div>
                </div>
                <div style={{ flex: 1 }} />
                <ZKFXProgressRing value={progress} label={`${Math.round(progress * 100)}%`} sublabel="成长" />
              </div>
              <div className="zkfx-caption">🍰 主要来自“回头/延迟”的选择，而不是“继续”。</div>

              <button
                type="button"
                className="btn-secondary"
                onClick={() =>
                  setMonsterState({
                    ...monsterState,
                    totalXp: monsterState.totalXp + 10,
                    cakeCount: monsterState.cakeCount + 1,
                  })
                }
              >
                模拟投入成长（+10 经验）
              </button>
            </div>
          </ZKFXCard>

          <ZKFXCard>
            <div style={{ display: 'grid', gap: 10 }}>
              <div className="zkfx-h3">隐私</div>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>所有数据默认仅存储在本地。</div>
            </div>
          </ZKFXCard>

          <ZKFXCard>
            <div style={{ display: 'grid', gap: 12 }}>
              <div className="zkfx-h3">提醒</div>
              <div className="zkfx-caption">{`通知权限：${permission}`}</div>
              <div className="zkfx-row-spread">
                <div style={{ display: 'grid', gap: 4 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,1)' }}>当我打开被守护 App 时提醒我</div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-tertiary)' }}>提醒你打开喂喂完成 90 秒门槛动作。</div>
                </div>
                <ZKFXSwitch checked={notificationNudgeEnabled} onChange={setNotificationNudgeEnabled} disabled={!notificationsAuthorized} />
              </div>

              {!notificationsAuthorized && (
                <button type="button" className="btn-secondary" onClick={onRequestNotifications}>
                  开启通知权限
                </button>
              )}
            </div>
          </ZKFXCard>
        </div>
      </div>
    </div>
  );
}

function ReviewView({ events, onDismiss }: { events: LoggedEvent[]; onDismiss: () => void }) {
  const rows = useMemo(() => {
    const dayStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const todayStart = dayStart(new Date());
    const since = todayStart - 6 * 24 * 60 * 60 * 1000;
    const days = Array.from({ length: 7 }, (_, i) => since + i * 24 * 60 * 60 * 1000);

    return days.map((dayTs) => {
      const next = dayTs + 24 * 60 * 60 * 1000;
      const slice = events.filter((e) => e.timestamp >= dayTs && e.timestamp < next);
      const intercepts = slice.filter((e) => e.type === 'shield_shown').length;
      const backs = slice.filter((e) => e.type === 'shield_back').length + slice.filter((e) => e.type === 'result_back' && e.payload?.mode === 'intercepted').length;
      const backRate = intercepts === 0 ? 0 : Math.round((backs / intercepts) * 100);
      return { dayTs, intercepts, backs, backRate };
    });
  }, [events]);

  const selfRows = useMemo(() => {
    const dayStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const todayStart = dayStart(new Date());
    const since = todayStart - 6 * 24 * 60 * 60 * 1000;
    const days = Array.from({ length: 7 }, (_, i) => since + i * 24 * 60 * 60 * 1000);
    return days.map((dayTs) => {
      const next = dayTs + 24 * 60 * 60 * 1000;
      const slice = events.filter((e) => e.timestamp >= dayTs && e.timestamp < next);
      const completed = slice.filter((e) => e.type === 'self_initiated_session_completed').length;
      const back = slice.filter((e) => e.type === 'self_initiated_session_completed' && e.payload?.result === 'back').length;
      return { dayTs, completed, back };
    });
  }, [events]);

  const dayLabel = (ts: number) => {
    const d = new Date(ts);
    return `${pad2(d.getMonth() + 1)}/${pad2(d.getDate())}`;
  };

  const totalCompleted = selfRows.reduce((sum, r) => sum + r.completed, 0);
  const totalBack = selfRows.reduce((sum, r) => sum + r.back, 0);

  const maxRate = Math.max(10, ...rows.map((r) => r.backRate));

  return (
    <div className="zkfx-screen">
      <div className="zkfx-topbar">
        <button type="button" className="zkfx-icon-btn" onClick={onDismiss} aria-label="关闭">
          <X size={14} style={{ color: 'rgba(255,255,255,0.85)' }} />
        </button>
        <div className="zkfx-title">本周趋势</div>
        <div style={{ width: 38 }} />
      </div>

      <div className="zkfx-scroll">
        <div className="zkfx-page" style={{ display: 'grid', gap: 14, paddingBottom: 24 }}>
          <ZKFXCard>
            <div style={{ display: 'grid', gap: 12 }}>
              <div className="zkfx-row-spread">
                <div className="zkfx-h3">本周拦截回头率</div>
                <ZKFXPill text="7 天" tone="neutral" />
              </div>

              <div style={{ height: 140, display: 'flex', alignItems: 'flex-end', gap: 6, padding: '0 12px 8px' }}>
                {rows.map((r) => {
                  const barHeight = (r.backRate / maxRate) * (140 - 16);
                  const good = r.backRate >= 80;
                  return (
                    <div
                      key={r.dayTs}
                      style={{
                        width: 14,
                        height: Math.max(4, barHeight),
                        borderRadius: 4,
                        background: good ? 'var(--brand)' : 'rgba(255,255,255,0.12)',
                      }}
                    />
                  );
                })}
              </div>

              <div className="zkfx-caption">仅统计被系统拦截后的“回头”（不包含首页自助入口）。</div>
            </div>
          </ZKFXCard>

          <ZKFXCard>
            <div style={{ display: 'grid', gap: 10 }}>
              <div className="zkfx-h3">自助（非拦截）</div>
              <div className="zkfx-caption">{`7 天内：完成 ${totalCompleted} 次，回头 ${totalBack} 次`}</div>

              {selfRows.filter((r) => r.completed > 0).length === 0 ? (
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', paddingTop: 6 }}>暂无记录</div>
              ) : (
                <div style={{ display: 'grid' }}>
                  {selfRows
                    .filter((r) => r.completed > 0)
                    .slice()
                    .reverse()
                    .map((r, idx, arr) => (
                      <div key={r.dayTs}>
                        <div className="zkfx-row-spread" style={{ padding: '6px 0' }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{dayLabel(r.dayTs)}</div>
                          <div style={{ display: 'flex', gap: 10 }}>
                            <div className="zkfx-caption">{`完成 ${r.completed}`}</div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{`回头 ${r.back}`}</div>
                          </div>
                        </div>
                        {idx !== arr.length - 1 && <div className="zkfx-divider" />}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </ZKFXCard>

          <ZKFXCard>
            <div style={{ display: 'grid', gap: 10 }}>
              <div className="zkfx-h3">每日明细</div>
              <div style={{ display: 'grid' }}>
                {rows
                  .slice()
                  .reverse()
                  .map((r, idx) => (
                    <div key={r.dayTs}>
                      <div className="zkfx-row-spread" style={{ padding: '6px 0' }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{dayLabel(r.dayTs)}</div>
                        <div className="zkfx-caption">{`${r.backs}/${r.intercepts}`}</div>
                        <div
                          style={{
                            width: 52,
                            textAlign: 'right',
                            fontSize: 14,
                            fontWeight: 700,
                            color: r.backRate >= 80 ? 'var(--success)' : 'rgba(255,255,255,0.85)',
                          }}
                        >
                          {`${r.backRate}%`}
                        </div>
                      </div>
                      {idx !== rows.length - 1 && <div className="zkfx-divider" />}
                    </div>
                  ))}
              </div>
            </div>
          </ZKFXCard>
        </div>
      </div>
    </div>
  );
}

function DiagnosisView({
  statusText,
  statusTone,
  diagnosisDetail,
  runtimeLastAppliedAt,
  configEnabled,
  canEnable,
  suggestedSetupStep,
  onOpenSetup,
  onEnable,
  onDisable,
  onDismiss,
}: {
  statusText: string;
  statusTone: 'neutral' | 'good' | 'warn' | 'bad';
  diagnosisDetail: string;
  runtimeLastAppliedAt: number | null;
  configEnabled: boolean;
  canEnable: boolean;
  suggestedSetupStep: number;
  onOpenSetup: (initialStep: number) => void;
  onEnable: () => void;
  onDisable: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="zkfx-screen">
      <div className="zkfx-topbar">
        <button type="button" className="zkfx-icon-btn" onClick={onDismiss} aria-label="关闭">
          <X size={14} style={{ color: 'rgba(255,255,255,0.85)' }} />
        </button>
        <div className="zkfx-title">守护诊断</div>
        <div style={{ width: 38 }} />
      </div>

      <div className="zkfx-page" style={{ display: 'grid', gap: 14 }}>
        <ZKFXCard>
          <div style={{ display: 'grid', gap: 10 }}>
            <div className="zkfx-row-spread">
              <ZKFXPill text={statusText} tone={statusTone} />
              <div />
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', lineHeight: 1.35, whiteSpace: 'pre-wrap' }}>{diagnosisDetail}</div>
            {runtimeLastAppliedAt && configEnabled && <div className="zkfx-caption">{`最近一次开始拦截：${relativeTime(runtimeLastAppliedAt)}`}</div>}
          </div>
        </ZKFXCard>

        <ZKFXCard>
          <div style={{ display: 'grid', gap: 10 }}>
            <button type="button" className="btn-primary" onClick={() => onOpenSetup(suggestedSetupStep)}>
              打开配置
            </button>

            {configEnabled ? (
              <button type="button" className="btn-secondary" onClick={onDisable}>
                暂停守护
              </button>
            ) : (
              <button type="button" className="btn-secondary" onClick={onEnable}>
                {canEnable ? '开启守护' : '开启守护（需先配置）'}
              </button>
            )}
          </div>
        </ZKFXCard>
      </div>
    </div>
  );
}

function NotificationPermissionView({
  context,
  onDismiss,
  onEnabled,
}: {
  context: 'setup' | 'intercepted' | 'stage';
  onDismiss: () => void;
  onEnabled: () => void;
}) {
  const [statusText, setStatusText] = useState('检查中…');
  const [isRequesting, setIsRequesting] = useState(false);

  const title =
    context === 'setup' ? '开启提醒，会更容易“回流”' : context === 'intercepted' ? '需要提醒把你拉回喂喂' : '打开外卖时，喂喂要能提醒你';

  const subtitle = 'iOS 不允许从拦截页直接跳转回喂喂。\n开启通知后，你打开被守护 App 时会立刻收到提醒：先 90 秒，再决定。';

  const refreshStatus = () => {
    if (typeof Notification === 'undefined') {
      setStatusText('当前浏览器不支持');
      return;
    }
    if (Notification.permission === 'granted') setStatusText('已开启');
    else if (Notification.permission === 'denied') setStatusText('已拒绝（需去系统设置打开）');
    else setStatusText('未请求');
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  const primaryTitle = statusText.includes('已拒绝') ? '去系统设置开启通知' : '开启通知';

  const requestOrOpen = async () => {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission === 'denied') {
      refreshStatus();
      return;
    }
    if (Notification.permission === 'default') {
      setIsRequesting(true);
      try {
        const permission = await Notification.requestPermission();
        setIsRequesting(false);
        refreshStatus();
        if (permission === 'granted') onEnabled();
      } catch {
        setIsRequesting(false);
        refreshStatus();
      }
      return;
    }
    onEnabled();
  };

  return (
    <div className="zkfx-screen">
      <div className="zkfx-topbar">
        <button type="button" className="zkfx-icon-btn" onClick={onDismiss} aria-label="关闭">
          <X size={14} style={{ color: 'rgba(255,255,255,0.85)' }} />
        </button>
        <div className="zkfx-title">提醒设置</div>
        <div style={{ width: 38 }} />
      </div>

      <div className="zkfx-page" style={{ display: 'grid', gap: 14 }}>
        <ZKFXCard>
          <div style={{ display: 'grid', gap: 10 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'rgba(255,255,255,1)' }}>{title}</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: 1.35 }}>{subtitle}</div>
            <div className="zkfx-caption">{`当前：${statusText}`}</div>
          </div>
        </ZKFXCard>

        <ZKFXCard>
          <div style={{ display: 'grid', gap: 10 }}>
            <button type="button" className="btn-primary" onClick={requestOrOpen} disabled={isRequesting} style={{ opacity: isRequesting ? 0.6 : 1 }}>
              <Bell size={18} style={{ marginRight: 10 }} />
              {primaryTitle}
            </button>
            <button type="button" onClick={onDismiss} style={{ height: 42, border: 'none', background: 'transparent', color: 'var(--text-tertiary)', fontSize: 14, fontWeight: 600 }}>
              稍后再说
            </button>
          </div>
        </ZKFXCard>
      </div>
    </div>
  );
}
