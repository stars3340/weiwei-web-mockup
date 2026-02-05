import React, { useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { isFrameInCategory, WEIWEI_FRAMES } from '../figma/flow';
import { EmotionType } from '../types';

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

const UI = {
  pills: {
    status: '/figma/weiwei-wzx/ui/pills/status_pill.svg',
    top: '/figma/weiwei-wzx/ui/pills/top_pill.svg',
    avatarBadge: '/figma/weiwei-wzx/ui/pills/avatar_badge.svg',
  },
  nav: {
    home: '/figma/weiwei-wzx/ui/nav/bottom_home.svg',
    trends: '/figma/weiwei-wzx/ui/nav/bottom_trends.svg',
    guard: '/figma/weiwei-wzx/ui/nav/bottom_guard.svg',
  },
  bubbles: {
    home: '/figma/weiwei-wzx/ui/bubbles/home_question.svg',
    feeling: '/figma/weiwei-wzx/ui/bubbles/feeling_tip.svg',
    breathing: '/figma/weiwei-wzx/ui/bubbles/breathing_tip.svg',
    checkin: '/figma/weiwei-wzx/ui/bubbles/checkin_tip.svg',
    desire: '/figma/weiwei-wzx/ui/bubbles/desire_tip.svg',
    actions: '/figma/weiwei-wzx/ui/bubbles/actions_tip.svg',
    stage: '/figma/weiwei-wzx/ui/bubbles/stage_tip.svg',
  },
  text: {
    feeling1: '/figma/weiwei-wzx/ui/text/feeling_1.svg',
    feeling2: '/figma/weiwei-wzx/ui/text/feeling_2.svg',
    feeling3: '/figma/weiwei-wzx/ui/text/feeling_3.svg',
    feelingTip: '/figma/weiwei-wzx/ui/text/feeling_tip.svg',
    breathingTip: '/figma/weiwei-wzx/ui/text/breathing_tip.svg',
    checkinTip: '/figma/weiwei-wzx/ui/text/checkin_tip.svg',
    desireQ: '/figma/weiwei-wzx/ui/text/desire_q.svg',
    desire1: '/figma/weiwei-wzx/ui/text/desire_1.svg',
    desire2: '/figma/weiwei-wzx/ui/text/desire_2.svg',
    desire3: '/figma/weiwei-wzx/ui/text/desire_3.svg',
    actionsQ: '/figma/weiwei-wzx/ui/text/actions_q.svg',
    actions1: '/figma/weiwei-wzx/ui/text/actions_1.svg',
    actions2: '/figma/weiwei-wzx/ui/text/actions_2.svg',
    actions3: '/figma/weiwei-wzx/ui/text/actions_3.svg',
    stageTip: '/figma/weiwei-wzx/ui/text/stage_tip.svg',
    trendsTitle: '/figma/weiwei-wzx/ui/text/trends_title.svg',
    trendsDaily: '/figma/weiwei-wzx/ui/text/trends_daily.svg',
    guardTitle: '/figma/weiwei-wzx/ui/text/guard_title.svg',
    guardAuth: '/figma/weiwei-wzx/ui/text/guard_auth.svg',
    guardConfig: '/figma/weiwei-wzx/ui/text/guard_config.svg',
    guardAppLabel: '/figma/weiwei-wzx/ui/text/guard_app_label.svg',
    guardTimeLabel: '/figma/weiwei-wzx/ui/text/guard_time_label.svg',
    guardIntensityLabel: '/figma/weiwei-wzx/ui/text/guard_intensity_label.svg',
    guardAppMeituan: '/figma/weiwei-wzx/ui/text/guard_app_meituan.svg',
    guardTimeValue: '/figma/weiwei-wzx/ui/text/guard_time_value.svg',
    guardIntensityValue: '/figma/weiwei-wzx/ui/text/guard_intensity_value.svg',
    guardBlockDesc: '/figma/weiwei-wzx/ui/text/guard_block_desc.svg',
    guardBlockLast: '/figma/weiwei-wzx/ui/text/guard_block_last.svg',
  },
  icons: {
    feeling1: '/figma/weiwei-wzx/ui/feeling_icon_1.svg',
    feeling2: '/figma/weiwei-wzx/ui/feeling_icon_2.svg',
    feeling3: '/figma/weiwei-wzx/ui/feeling_icon_3.svg',
    desire1: '/figma/weiwei-wzx/ui/icons/desire_1.svg',
    desire2: '/figma/weiwei-wzx/ui/icons/desire_2.svg',
    desire3: '/figma/weiwei-wzx/ui/icons/desire_3.svg',
    actions1: '/figma/weiwei-wzx/ui/icons/actions_1.svg',
    actions2: '/figma/weiwei-wzx/ui/icons/actions_2.svg',
    actions3: '/figma/weiwei-wzx/ui/icons/actions_3.svg',
    settings: '/figma/weiwei-wzx/ui/settings_button.svg',
    chevronRight: '/figma/weiwei-wzx/ui/icons/chevron_right.svg',
  },
  buttons: {
    checkin1: '/figma/weiwei-wzx/ui/buttons/checkin_btn_1.svg',
    checkin2: '/figma/weiwei-wzx/ui/buttons/checkin_btn_2.svg',
    checkin3: '/figma/weiwei-wzx/ui/buttons/checkin_btn_3.svg',
    sos: '/figma/weiwei-wzx/ui/buttons/sos_fab.svg',
    guardClose: '/figma/weiwei-wzx/ui/buttons/guard_close.svg',
    guardPrimary: '/figma/weiwei-wzx/ui/buttons/guard_primary.svg',
    guardSecondary: '/figma/weiwei-wzx/ui/buttons/guard_secondary.svg',
  },
  breathing: {
    glow: '/figma/weiwei-wzx/ui/breathing/ellipse_glow.svg',
    ringOuter: '/figma/weiwei-wzx/ui/breathing/ring_outer.svg',
    ringInner: '/figma/weiwei-wzx/ui/breathing/ring_inner.svg',
    timerCircle: '/figma/weiwei-wzx/ui/breathing/timer_circle.svg',
    orbit: '/figma/weiwei-wzx/ui/breathing/orbit.svg',
    orbitDot: '/figma/weiwei-wzx/ui/breathing/orbit_dot.svg',
    squareBg: '/figma/weiwei-wzx/ui/breathing/circle_bg.svg',
    squareFg: '/figma/weiwei-wzx/ui/breathing/circle_fg.svg',
    squareTimer: '/figma/weiwei-wzx/ui/breathing/circle_timer.svg',
  },
  monsters: {
    home: '/figma/weiwei-wzx/ui/monster_home.png',
    main: '/figma/weiwei-wzx/ui/monsters/monster_main.png',
    small: '/figma/weiwei-wzx/ui/monsters/monster_small.png',
    stage: '/figma/weiwei-wzx/ui/monsters/monster_stage.png',
    guardBlock: '/figma/weiwei-wzx/ui/monsters/monster_guard_block.png',
  },
  trends: {
    chartTop: '/figma/weiwei-wzx/ui/trends/chart_top.svg',
    cardBottom: '/figma/weiwei-wzx/ui/trends/card_bottom.svg',
    dailyList: '/figma/weiwei-wzx/ui/trends/daily_list.svg',
    badgeLeft: '/figma/weiwei-wzx/ui/trends/badge_left.svg',
    badgeRight: '/figma/weiwei-wzx/ui/trends/badge_right.svg',
  },
  guard: {
    rowAuth: '/figma/weiwei-wzx/ui/guard/row_auth.svg',
    rowConfig: '/figma/weiwei-wzx/ui/guard/row_config.svg',
  },
  sheets: {
    settings: '/figma/weiwei-wzx/ui/sheets/settings_sheet.svg',
  },
} as const;

function Img({
  src,
  x,
  y,
  w,
  h,
  className,
  style,
  alt = '',
}: {
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
  className?: string;
  style?: React.CSSProperties;
  alt?: string;
}) {
  return (
    <img
      alt={alt}
      src={src}
      className={className}
      style={{ position: 'absolute', ...rect(x, y, w, h), ...style }}
      draggable={false}
      decoding="async"
      loading="eager"
    />
  );
}

function Pressable({
  x,
  y,
  w,
  h,
  ariaLabel,
  onPress,
  children,
  className,
  style,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  ariaLabel: string;
  onPress: () => void;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onPointerDown={(e) => {
        e.preventDefault();
        onPress();
      }}
      className={[
        'absolute border-0 bg-transparent p-0',
        'outline-none focus:outline-none focus-visible:outline-none',
        'active:scale-[0.99] transition-transform',
        className ?? '',
      ].join(' ')}
      style={{ ...rect(x, y, w, h), touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent', ...style }}
    >
      {children}
    </button>
  );
}

function DebugOverlay({ frameId }: { frameId: string }) {
  return (
    <img
      alt=""
      src={`/figma/weiwei-wzx/frames/${frameId.replace(/:/g, '-')}.svg`}
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      style={{ opacity: 0.35, mixBlendMode: 'difference' }}
      draggable={false}
    />
  );
}

function TopChrome({
  lv,
  onSettings,
  onAvatarPress,
}: {
  lv: string;
  onSettings?: () => void;
  onAvatarPress?: () => void;
}) {
  return (
    <>
      <Pressable x={18.05} y={33.05} w={75.9} h={75.9} ariaLabel="Profile" onPress={() => onAvatarPress?.()}>
        <img alt="" src={UI.pills.avatarBadge} className="w-full h-full" draggable={false} />
      </Pressable>
      <div
        className="absolute"
        style={{
          ...rect(94, 62, 48, 16),
          color: '#1D2547',
          fontFamily: '"Noto Sans SC","Manrope",system-ui,sans-serif',
          fontWeight: 700,
          fontSize: 12,
          lineHeight: '16px',
        }}
      >
        {lv}
      </div>

      <Img src={UI.pills.top} x={146} y={51} w={152} h={40} alt="" />

      {onSettings && (
        <Pressable x={325} y={51} w={40} h={40} ariaLabel="Settings" onPress={onSettings}>
          <img alt="" src={UI.icons.settings} className="w-full h-full" draggable={false} />
        </Pressable>
      )}
    </>
  );
}

function BottomNav({
  active,
  onTrends,
  onHome,
  onGuard,
}: {
  active: 'home' | 'trends' | 'guard';
  onTrends: () => void;
  onHome: () => void;
  onGuard: () => void;
}) {
  const bg = active === 'trends' ? UI.nav.trends : active === 'guard' ? UI.nav.guard : UI.nav.home;
  return (
    <>
      <Img src={bg} x={107} y={744} w={170} h={54} alt="" />
      <Pressable x={107} y={744} w={56} h={54} ariaLabel="Trends" onPress={onTrends} />
      <Pressable x={161} y={744} w={54} h={54} ariaLabel="Home" onPress={onHome} />
      <Pressable x={215} y={744} w={62} h={54} ariaLabel="Guard" onPress={onGuard} />
    </>
  );
}

function HomeFigma({
  frameId,
  debugOverlay,
  onStart,
}: {
  frameId: string;
  debugOverlay?: boolean;
  onStart: () => void;
}) {
  const isDark = frameId === '1:33';
  const moodY = frameId === '1:178' ? 634 : 672;
  return (
    <div className="relative w-full h-full overflow-hidden text-white" style={{ background: isDark ? '#101010' : 'linear-gradient(180deg,#FEDCFF 0%,#D1FAFF 100%)' }}>
      {isDark ? (
        <>
          <div className="absolute rounded-full blur-[300px]" style={{ ...rect(-80, 485, 554, 443), background: '#9D37D4', opacity: 0.30 }} />
          <div className="absolute rounded-full blur-[300px]" style={{ ...rect(-80, 519, 554, 443), background: '#5337DE', opacity: 0.40 }} />
          <div className="absolute rounded-full blur-[300px]" style={{ ...rect(-51, 650, 496, 326), background: '#B237DE', opacity: 0.20 }} />
          <div className="absolute rounded-full blur-[300px]" style={{ ...rect(-51, -230, 496, 326), background: '#374DDE', opacity: 0.20 }} />
        </>
      ) : (
        <>
          <div className="absolute rounded-full blur-[300px]" style={{ ...rect(-149, 138, 346, 352), background: '#FFF8D9' }} />
          <div className="absolute rounded-full blur-[300px]" style={{ ...rect(220, 294, 276, 281), background: '#FFF8D9' }} />
        </>
      )}

      {/* Avatar */}
      <Pressable x={29} y={44} w={54} h={54} ariaLabel="Profile" onPress={() => {}}>
        <div className="absolute inset-0 rounded-full" style={{ background: '#E1FCFF' }} />
        <img alt="Avatar" src="/figma/weiwei-wzx/ui/avatar.png" className="absolute inset-0 w-full h-full rounded-full" style={{ objectFit: 'cover' }} draggable={false} />
      </Pressable>

      {/* Greeting */}
      <div
        className="absolute"
        style={{
          ...rect(102, 58, 200, 26),
          fontFamily: '"Plus Jakarta Sans","Manrope","Noto Sans SC",system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
          fontWeight: 600,
          fontSize: 20,
          lineHeight: '25px',
          color: isDark ? '#fff' : '#1D2547',
        }}
      >
        Hi! Lilian
      </div>

      {/* Status pill (top right) */}
      <Img src={UI.pills.status} x={283} y={51} w={86} h={39} alt="" />

      {/* Question bubble */}
      <Img src={UI.bubbles.home} x={128} y={117} w={222} h={102} alt="" style={{ opacity: 0.999 }} />
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

      {/* Monster */}
      <Pressable x={65} y={196} w={263.93} h={265.58} ariaLabel="Start" onPress={onStart}>
        <img alt="Monster" src={UI.monsters.home} className="absolute inset-0 w-full h-full" style={{ objectFit: 'cover', opacity: 0.90 }} draggable={false} />
      </Pressable>
      <div className="absolute rounded-full" style={{ ...rect(74.9, 433.53, 243.31, 35.47), background: 'rgba(0,0,0,0.25)' }} />
      <div className="absolute rounded-full" style={{ ...rect(109.54, 433.53, 192.17, 28.04), background: 'rgba(0,0,0,0.25)' }} />

      <div
        className="absolute"
        style={{
          ...rect(144, moodY, 200, 20),
          fontFamily: '"Inria Serif","Noto Sans SC",serif',
          fontWeight: 700,
          fontSize: 16,
          lineHeight: '19px',
          color: isDark ? '#fff' : '#1D2547',
        }}
      >
        Feeling low ...
      </div>

      {/* Bottom nav (Home / SOS / User) */}
      <div className="absolute rounded-[27px] backdrop-blur-xl" style={{ ...rect(93, 744, 198, 54), background: 'rgba(255,255,255,0.60)' }} />
      <Pressable x={121} y={761} w={20} h={20} ariaLabel="Home" onPress={() => {}}>
        <img alt="" src="/figma/weiwei-wzx/ui/home_outlined.svg" className="w-[21px] h-[20px]" draggable={false} />
      </Pressable>
      <Pressable x={243} y={761} w={20} h={20} ariaLabel="User" onPress={() => {}}>
        <img alt="" src="/figma/weiwei-wzx/ui/user_outlined.svg" className="w-[17px] h-[18px]" draggable={false} />
      </Pressable>
      <Pressable
        x={165}
        y={744}
        w={54}
        h={54}
        ariaLabel="SOS"
        onPress={onStart}
        className="rounded-full"
        style={{ background: '#F5A6FE' }}
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
      </Pressable>

      {debugOverlay && <DebugOverlay frameId={frameId} />}
    </div>
  );
}

function FeelingFigma({
  frameId,
  debugOverlay,
  onPick,
  onSettings,
  onBottomNav,
}: {
  frameId: string;
  debugOverlay?: boolean;
  onPick: (choice: 0 | 1 | 2) => void;
  onSettings: () => void;
  onBottomNav: (tab: 'trends' | 'home' | 'guard') => void;
}) {
  const iconOffsetX = 6.785;
  const iconOffsetY = 0.679;

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: 'linear-gradient(180deg, #FEDCFF 0%, #D1FAFF 100%)' }}>
      <div className="absolute rounded-full blur-[300px]" style={{ ...rect(-149, 138, 346, 352), background: '#FFF8D9' }} />
      <div className="absolute rounded-full blur-[300px]" style={{ ...rect(220, 294, 276, 281), background: '#FFF8D9' }} />

      <TopChrome lv="LV.1" onSettings={onSettings} />

      <Img src={UI.bubbles.feeling} x={144} y={126} w={182} h={102} alt="" />
      <Img src={UI.text.feelingTip} x={164} y={157} w={146} h={15} alt="" />

      <Img src={UI.monsters.main} x={86} y={210} w={222} h={224} alt="Monster" style={{ opacity: 0.9 }} />
      <div className="absolute rounded-full" style={{ ...rect(94, 410, 205, 30), background: 'rgba(0,0,0,0.05)' }} />
      <div className="absolute rounded-full" style={{ ...rect(123, 410, 162, 24), background: 'rgba(0,0,0,0.05)' }} />

      {/* Options */}
      <Pressable x={80} y={468} w={300} h={86} ariaLabel="今天很糟糕" onPress={() => onPick(0)} />
      <Img src={UI.icons.feeling1} x={91 - iconOffsetX} y={478 - iconOffsetY} w={76} h={76} alt="" />
      <Img src={UI.text.feeling1} x={175} y={498} w={80} h={20} alt="" />

      <Pressable x={80} y={542} w={300} h={86} ariaLabel="说不上来，很难受" onPress={() => onPick(1)} />
      <Img src={UI.icons.feeling2} x={91 - iconOffsetX} y={552 - iconOffsetY} w={76} h={76} alt="" />
      <Img src={UI.text.feeling2} x={175} y={572} w={128} h={20} alt="" />

      <Pressable x={80} y={616} w={300} h={86} ariaLabel="压力太大了" onPress={() => onPick(2)} />
      <Img src={UI.icons.feeling3} x={90 - iconOffsetX} y={626 - iconOffsetY} w={76} h={76} alt="" />
      <Img src={UI.text.feeling3} x={175} y={646} w={80} h={20} alt="" />

      <BottomNav
        active="home"
        onTrends={() => onBottomNav('trends')}
        onHome={() => onBottomNav('home')}
        onGuard={() => onBottomNav('guard')}
      />

      {debugOverlay && <DebugOverlay frameId={frameId} />}
    </div>
  );
}

const BREATHING_RING = new Set(['1:415', '1:469', '1:1313']);
const BREATHING_ORBIT = new Set(['1:523', '1:580', '1:1367']);
const BREATHING_SQUARE = new Set(['1:637', '1:690', '1:1424']);

function BreathingFigma({
  frameId,
  debugOverlay,
  onComplete,
  onSettings,
  onBottomNav,
}: {
  frameId: string;
  debugOverlay?: boolean;
  onComplete: () => void;
  onSettings: () => void;
  onBottomNav: (tab: 'trends' | 'home' | 'guard') => void;
}) {
  const autoDone = useRef(false);
  useEffect(() => {
    autoDone.current = false;
    const t = window.setTimeout(() => {
      if (autoDone.current) return;
      autoDone.current = true;
      onComplete();
    }, 6500);
    return () => window.clearTimeout(t);
  }, [frameId, onComplete]);

  const variant: 'ring' | 'orbit' | 'square' = BREATHING_ORBIT.has(frameId) ? 'orbit' : BREATHING_SQUARE.has(frameId) ? 'square' : 'ring';

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: 'linear-gradient(180deg, #BEC1FB 0%, #1D2547 50%, #ABDCFF 100%)' }}>
      <div className="absolute rounded-full blur-[300px]" style={{ ...rect(-149, 138, 346, 352), background: 'rgba(209,250,255,0.90)' }} />
      <div className="absolute rounded-full blur-[300px]" style={{ ...rect(220, 294, 276, 281), background: 'rgba(209,250,255,0.90)' }} />

      <TopChrome lv="LV.1" onSettings={onSettings} />

      {/* Central breathing visual */}
      <Pressable x={50} y={120} w={293} h={320} ariaLabel="Continue" onPress={onComplete} />
      {variant === 'ring' && (
        <>
          <Img src={UI.breathing.ringInner} x={55} y={149} w={285} h={285} alt="" style={{ opacity: 0.95 }} />
          <Img src={UI.breathing.ringOuter} x={93} y={187} w={209} h={209} alt="" style={{ opacity: 0.95 }} />
          <Img src={UI.breathing.glow} x={97} y={191} w={201} h={201} alt="" style={{ opacity: 0.22 }} />
          <Img src={UI.breathing.timerCircle} x={117} y={211} w={161} h={161} alt="" />
        </>
      )}
      {variant === 'orbit' && (
        <>
          <Img src={UI.breathing.orbit} x={99} y={189} w={200} h={200} alt="" />
          <Img src={UI.breathing.orbitDot} x={226} y={192} w={13} h={13} alt="" />
        </>
      )}
      {variant === 'square' && (
        <>
          {/* bg has shadow padding (exported at 2x) */}
          <Img src={UI.breathing.squareBg} x={46} y={164} w={306} h={306} alt="" />
          <Img src={UI.breathing.squareFg} x={64} y={178} w={269} h={269} alt="" />
          <Img src={UI.breathing.squareTimer} x={116} y={232} w={161} h={161} alt="" />
        </>
      )}

      {/* Tip bubble */}
      <Img src={UI.bubbles.breathing} x={56} y={486} w={222} h={102} alt="" />
      <Img src={UI.text.breathingTip} x={94} y={518} w={146} h={15} alt="" />

      {/* Small monster */}
      <Img src={UI.monsters.small} x={223} y={566} w={120.93} h={121.68} alt="" style={{ opacity: 0.9 }} />
      <div className="absolute rounded-full" style={{ ...rect(227.5, 674.8, 111.5, 16.2), background: 'rgba(0,0,0,0.05)', filter: 'blur(12px)' }} />
      <div className="absolute rounded-full" style={{ ...rect(243.4, 674.8, 88.1, 12.8), background: 'rgba(0,0,0,0.05)', filter: 'blur(12px)' }} />

      <BottomNav
        active="home"
        onTrends={() => onBottomNav('trends')}
        onHome={() => onBottomNav('home')}
        onGuard={() => onBottomNav('guard')}
      />

      {debugOverlay && <DebugOverlay frameId={frameId} />}
    </div>
  );
}

function CheckinFigma({
  frameId,
  debugOverlay,
  onPick,
  onSettings,
  onBottomNav,
}: {
  frameId: string;
  debugOverlay?: boolean;
  onPick: (idx: 0 | 1 | 2) => void;
  onSettings: () => void;
  onBottomNav: (tab: 'trends' | 'home' | 'guard') => void;
}) {
  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: 'linear-gradient(180deg, #BEC1FB 0%, #1D2547 50%, #ABDCFF 100%)' }}>
      <div className="absolute rounded-full blur-[300px]" style={{ ...rect(-149, 138, 346, 352), background: 'rgba(209,250,255,0.90)' }} />
      <div className="absolute rounded-full blur-[300px]" style={{ ...rect(220, 294, 276, 281), background: 'rgba(209,250,255,0.90)' }} />

      <TopChrome lv="LV.1" onSettings={onSettings} />

      {/* Big square timer */}
      <Img src={UI.breathing.squareBg} x={46} y={164} w={306} h={306} alt="" />
      <Img src={UI.breathing.squareFg} x={64} y={178} w={269} h={269} alt="" />
      <Img src={UI.breathing.squareTimer} x={116} y={232} w={161} h={161} alt="" />

      {/* Tip bubble */}
      <Img src={UI.bubbles.checkin} x={56} y={486} w={222} h={102} alt="" />
      <Img src={UI.text.checkinTip} x={94} y={518} w={146} h={15} alt="" />

      {/* Small monster */}
      <Img src={UI.monsters.small} x={223} y={566} w={120.93} h={121.68} alt="" style={{ opacity: 0.9 }} />
      <div className="absolute rounded-full" style={{ ...rect(227.5, 674.8, 111.5, 16.2), background: 'rgba(0,0,0,0.05)', filter: 'blur(12px)' }} />
      <div className="absolute rounded-full" style={{ ...rect(243.4, 674.8, 88.1, 12.8), background: 'rgba(0,0,0,0.05)', filter: 'blur(12px)' }} />

      {/* Answers */}
      <Pressable x={121} y={596} w={151} h={31} ariaLabel="Answer 1" onPress={() => onPick(0)}>
        <img alt="" src={UI.buttons.checkin1} className="w-full h-full" draggable={false} />
      </Pressable>
      <Pressable x={121} y={637} w={151} h={31} ariaLabel="Answer 2" onPress={() => onPick(1)}>
        <img alt="" src={UI.buttons.checkin2} className="w-full h-full" draggable={false} />
      </Pressable>
      <Pressable x={121} y={678} w={151} h={31} ariaLabel="Answer 3" onPress={() => onPick(2)}>
        <img alt="" src={UI.buttons.checkin3} className="w-full h-full" draggable={false} />
      </Pressable>

      <BottomNav
        active="home"
        onTrends={() => onBottomNav('trends')}
        onHome={() => onBottomNav('home')}
        onGuard={() => onBottomNav('guard')}
      />

      {debugOverlay && <DebugOverlay frameId={frameId} />}
    </div>
  );
}

function DesireFigma({
  frameId,
  debugOverlay,
  onPick,
  onSettings,
  onBottomNav,
}: {
  frameId: string;
  debugOverlay?: boolean;
  onPick: (choice: 0 | 1 | 2) => void;
  onSettings: () => void;
  onBottomNav: (tab: 'trends' | 'home' | 'guard') => void;
}) {
  const iconOffsetX = 6.785;
  const iconOffsetY = 0.679;
  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: 'linear-gradient(180deg, #FEDCFF 0%, #D1FAFF 100%)' }}>
      <div className="absolute rounded-full blur-[300px]" style={{ ...rect(-149, 138, 346, 352), background: '#FFF8D9' }} />
      <div className="absolute rounded-full blur-[300px]" style={{ ...rect(220, 294, 276, 281), background: '#FFF8D9' }} />

      <TopChrome lv="LV.1" onSettings={onSettings} />

      <Img src={UI.bubbles.desire} x={144} y={126} w={182} h={102} alt="" />
      <Img src={UI.text.desireQ} x={164} y={157} w={146} h={15} alt="" />

      <Img src={UI.monsters.main} x={86} y={210} w={222} h={224} alt="Monster" style={{ opacity: 0.9 }} />
      <div className="absolute rounded-full" style={{ ...rect(94, 410, 205, 30), background: 'rgba(0,0,0,0.05)' }} />
      <div className="absolute rounded-full" style={{ ...rect(123, 410, 162, 24), background: 'rgba(0,0,0,0.05)' }} />

      <Pressable x={80} y={468} w={300} h={86} ariaLabel="吃点东西" onPress={() => onPick(0)} />
      <Img src={UI.icons.desire1} x={90 - iconOffsetX} y={478 - iconOffsetY} w={76} h={76} alt="" />
      <Img src={UI.text.desire1} x={175} y={498} w={64} h={20} alt="" />

      <Pressable x={80} y={542} w={300} h={86} ariaLabel="安静待一会" onPress={() => onPick(1)} />
      <Img src={UI.icons.desire2} x={91 - iconOffsetX} y={552 - iconOffsetY} w={76} h={76} alt="" />
      <Img src={UI.text.desire2} x={175} y={572} w={80} h={20} alt="" />

      <Pressable x={80} y={616} w={300} h={86} ariaLabel="想哭" onPress={() => onPick(2)} />
      <Img src={UI.icons.desire3} x={91 - iconOffsetX} y={626 - iconOffsetY} w={76} h={76} alt="" />
      <Img src={UI.text.desire3} x={175} y={646} w={32} h={20} alt="" />

      <BottomNav
        active="home"
        onTrends={() => onBottomNav('trends')}
        onHome={() => onBottomNav('home')}
        onGuard={() => onBottomNav('guard')}
      />

      {debugOverlay && <DebugOverlay frameId={frameId} />}
    </div>
  );
}

function ActionsFigma({
  frameId,
  debugOverlay,
  onPick,
  onSettings,
  onBottomNav,
}: {
  frameId: string;
  debugOverlay?: boolean;
  onPick: (choice: 0 | 1 | 2) => void;
  onSettings: () => void;
  onBottomNav: (tab: 'trends' | 'home' | 'guard') => void;
}) {
  const iconOffsetX = 6.785;
  const iconOffsetY = 0.679;
  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: 'linear-gradient(180deg, #FEDCFF 0%, #D1FAFF 100%)' }}>
      <div className="absolute rounded-full blur-[300px]" style={{ ...rect(-149, 138, 346, 352), background: '#FFF8D9' }} />
      <div className="absolute rounded-full blur-[300px]" style={{ ...rect(220, 294, 276, 281), background: '#FFF8D9' }} />

      <TopChrome lv="LV.1" onSettings={onSettings} />

      <Img src={UI.bubbles.actions} x={144} y={126} w={182} h={102} alt="" />
      <Img src={UI.text.actionsQ} x={164} y={157} w={146} h={15} alt="" />

      <Img src={UI.monsters.main} x={86} y={210} w={222} h={224} alt="Monster" style={{ opacity: 0.9 }} />
      <div className="absolute rounded-full" style={{ ...rect(94, 410, 205, 30), background: 'rgba(0,0,0,0.05)' }} />
      <div className="absolute rounded-full" style={{ ...rect(123, 410, 162, 24), background: 'rgba(0,0,0,0.05)' }} />

      <Pressable x={80} y={468} w={300} h={86} ariaLabel="呼吸灯" onPress={() => onPick(0)} />
      <Img src={UI.icons.actions1} x={90 - iconOffsetX} y={478 - iconOffsetY} w={76} h={76} alt="" />
      <Img src={UI.text.actions1} x={175} y={498} w={48} h={20} alt="" />

      <Pressable x={80} y={542} w={300} h={86} ariaLabel="涂一涂" onPress={() => onPick(1)} />
      <Img src={UI.icons.actions2} x={91 - iconOffsetX} y={552 - iconOffsetY} w={76} h={76} alt="" />
      <Img src={UI.text.actions2} x={175} y={572} w={48} h={20} alt="" />

      <Pressable x={80} y={616} w={300} h={86} ariaLabel="听一听" onPress={() => onPick(2)} />
      <Img src={UI.icons.actions3} x={91 - iconOffsetX} y={626 - iconOffsetY} w={76} h={76} alt="" />
      <Img src={UI.text.actions3} x={175} y={646} w={48} h={20} alt="" />

      <BottomNav
        active="home"
        onTrends={() => onBottomNav('trends')}
        onHome={() => onBottomNav('home')}
        onGuard={() => onBottomNav('guard')}
      />

      {debugOverlay && <DebugOverlay frameId={frameId} />}
    </div>
  );
}

function StageFigma({
  frameId,
  debugOverlay,
  stats,
  onOpenBreathing,
  onOpenSettingsSheet,
  onCloseSettingsSheet,
  onSettings,
  onBottomNav,
}: {
  frameId: string;
  debugOverlay?: boolean;
  stats: { attempts: number; returns: number };
  onOpenBreathing: () => void;
  onOpenSettingsSheet: () => void;
  onCloseSettingsSheet: () => void;
  onSettings: () => void;
  onBottomNav: (tab: 'trends' | 'home' | 'guard') => void;
}) {
  const showSheet = frameId === '1:1608';
  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: 'linear-gradient(180deg, #FEDCFF 0%, #D1FAFF 100%)' }}>
      <div className="absolute rounded-full blur-[300px]" style={{ ...rect(-149, 138, 346, 352), background: '#FFF8D9' }} />
      <div className="absolute rounded-full blur-[300px]" style={{ ...rect(220, 294, 276, 281), background: '#FFF8D9' }} />

      <TopChrome lv="LV.1" onSettings={showSheet ? onCloseSettingsSheet : onOpenSettingsSheet} />

      <Img src={UI.bubbles.stage} x={128} y={164} w={182} h={102} alt="" />
      <Img src={UI.text.stageTip} x={148} y={195} w={146} h={15} alt="" />

      <Pressable x={65} y={263} w={263.93} h={265.58} ariaLabel="Start breathing" onPress={onOpenBreathing}>
        <img alt="Monster" src={UI.monsters.stage} className="absolute inset-0 w-full h-full" style={{ objectFit: 'cover', opacity: 0.9 }} draggable={false} />
      </Pressable>
      <div className="absolute rounded-full" style={{ ...rect(75, 501, 243, 35), background: 'rgba(0,0,0,0.05)' }} />
      <div className="absolute rounded-full" style={{ ...rect(110, 501, 192, 28), background: 'rgba(0,0,0,0.05)' }} />

      {/* SOS FAB */}
      <Pressable x={276} y={641} w={81} h={81} ariaLabel="SOS" onPress={onOpenBreathing}>
        <img alt="" src={UI.buttons.sos} className="w-full h-full" draggable={false} />
      </Pressable>

      {/* Debug stats (invisible area) */}
      <div className="absolute" style={{ ...rect(18, 120, 130, 18), opacity: 0 }}>
        {stats.attempts}/{stats.returns}
      </div>

      <BottomNav
        active="home"
        onTrends={() => onBottomNav('trends')}
        onHome={() => onBottomNav('home')}
        onGuard={() => onBottomNav('guard')}
      />

      {showSheet && (
        <>
          <Pressable x={0} y={0} w={80} h={852} ariaLabel="Close sheet" onPress={onCloseSettingsSheet} className="active:scale-100" />
          <Img src={UI.sheets.settings} x={61} y={-10} w={338} h={872} alt="" />
          <Pressable x={75} y={0} w={318} h={852} ariaLabel="Settings sheet" onPress={() => {}} className="active:scale-100" />
        </>
      )}

      {debugOverlay && <DebugOverlay frameId={frameId} />}
    </div>
  );
}

function TrendsFigma({
  frameId,
  debugOverlay,
  onBottomNav,
}: {
  frameId: string;
  debugOverlay?: boolean;
  onBottomNav: (tab: 'trends' | 'home' | 'guard') => void;
}) {
  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: '#1D2547' }}>
      <div className="absolute rounded-full blur-[300px]" style={{ ...rect(185, 102, 346, 352), background: '#FEDCFF', opacity: 0.25 }} />

      <Img src={UI.text.trendsTitle} x={157} y={46} w={80} h={25} alt="" />

      <Img src={UI.trends.chartTop} x={14} y={102} w={365} h={256} alt="" />
      <Img src={UI.trends.cardBottom} x={14} y={377} w={365} h={134} alt="" />
      <Img src={UI.trends.badgeLeft} x={109} y={435} w={24} h={49} alt="" />
      <Img src={UI.trends.badgeRight} x={261} y={435} w={24} h={49} alt="" />

      <Img src={UI.text.trendsDaily} x={43} y={537} w={64} h={20} alt="" />
      <Img src={UI.trends.dailyList} x={43} y={583} w={325} h={225} alt="" />

      <BottomNav
        active="trends"
        onTrends={() => onBottomNav('trends')}
        onHome={() => onBottomNav('home')}
        onGuard={() => onBottomNav('guard')}
      />

      {debugOverlay && <DebugOverlay frameId={frameId} />}
    </div>
  );
}

function GuardConfigFigma({
  frameId,
  debugOverlay,
  onBottomNav,
  onOpenBlockPreview,
}: {
  frameId: string;
  debugOverlay?: boolean;
  onBottomNav: (tab: 'trends' | 'home' | 'guard') => void;
  onOpenBlockPreview: () => void;
}) {
  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: '#1D2547' }}>
      <div className="absolute rounded-full blur-[300px]" style={{ ...rect(185, 102, 346, 352), background: '#FEDCFF', opacity: 0.25 }} />

      <Img src={UI.text.guardTitle} x={157} y={46} w={80} h={25} alt="" />
      <Img src={UI.text.guardAuth} x={43} y={114} w={32} h={20} alt="" />
      <Img src={UI.guard.rowAuth} x={37} y={150} w={331} h={70} alt="" />

      <Img src={UI.text.guardConfig} x={43} y={352} w={32} h={20} alt="" />
      <Img src={UI.guard.rowConfig} x={37} y={226} w={331} h={81} alt="" />

      {/* Config rows */}
      <Img src={UI.text.guardAppLabel} x={43} y={398} w={69} h={15} alt="" />
      <Img src={UI.text.guardTimeLabel} x={43} y={439} w={48} h={15} alt="" />
      <Img src={UI.text.guardIntensityLabel} x={43} y={480} w={48} h={15} alt="" />

      <Pressable x={240} y={388} w={130} h={36} ariaLabel="App" onPress={onOpenBlockPreview} className="active:scale-100" />
      <Img src={UI.text.guardAppMeituan} x={285} y={398} w={48} h={15} alt="" />
      <Img src={UI.icons.chevronRight} x={348} y={396} w={20} h={20} alt="" />

      <Pressable x={240} y={429} w={130} h={36} ariaLabel="Time" onPress={() => {}} className="active:scale-100" />
      <Img src={UI.text.guardTimeValue} x={277} y={439} w={57} h={15} alt="" />
      <Img src={UI.icons.chevronRight} x={348} y={437} w={20} h={20} alt="" />

      <Pressable x={240} y={470} w={130} h={36} ariaLabel="Intensity" onPress={() => {}} className="active:scale-100" />
      <Img src={UI.text.guardIntensityValue} x={310} y={480} w={24} h={15} alt="" />
      <Img src={UI.icons.chevronRight} x={348} y={478} w={20} h={20} alt="" />

      <BottomNav
        active="guard"
        onTrends={() => onBottomNav('trends')}
        onHome={() => onBottomNav('home')}
        onGuard={() => onBottomNav('guard')}
      />

      {debugOverlay && <DebugOverlay frameId={frameId} />}
    </div>
  );
}

function GuardBlockFigma({
  frameId,
  debugOverlay,
  onPrimary,
  onSecondary,
  onClose,
  onBottomNav,
}: {
  frameId: string;
  debugOverlay?: boolean;
  onPrimary: () => void;
  onSecondary: () => void;
  onClose: () => void;
  onBottomNav: (tab: 'trends' | 'home' | 'guard') => void;
}) {
  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: 'linear-gradient(180deg, #FEDCFF 0%, #D1FAFF 100%)' }}>
      <div className="absolute rounded-full blur-[300px]" style={{ ...rect(-149, 138, 346, 352), background: '#FFF8D9' }} />
      <div className="absolute rounded-full blur-[300px]" style={{ ...rect(220, 294, 276, 281), background: '#FFF8D9' }} />

      <Img src={UI.pills.top} x={130} y={51} w={152} h={40} alt="" />

      <Pressable x={26} y={27} w={20} h={20} ariaLabel="Close" onPress={onClose} className="active:scale-100">
        <img alt="" src={UI.buttons.guardClose} className="w-full h-full" draggable={false} />
      </Pressable>

      <Img src={UI.text.guardBlockDesc} x={53} y={126} w={287} h={30} alt="" />
      <Img src={UI.text.guardBlockLast} x={53} y={166} w={279} h={15} alt="" />

      <Img src={UI.monsters.guardBlock} x={65} y={217} w={263.93} h={265.58} alt="Monster" style={{ opacity: 0.9 }} />
      <div className="absolute rounded-full" style={{ ...rect(75, 455, 243, 35), background: 'rgba(0,0,0,0.05)' }} />
      <div className="absolute rounded-full" style={{ ...rect(110, 455, 192, 28), background: 'rgba(0,0,0,0.05)' }} />

      <Pressable x={70} y={225} w={261} h={40} ariaLabel="Primary" onPress={onPrimary} className="active:scale-100">
        <img alt="" src={UI.buttons.guardPrimary} className="w-full h-full" draggable={false} />
      </Pressable>
      <Pressable x={70} y={278} w={261} h={40} ariaLabel="Secondary" onPress={onSecondary} className="active:scale-100">
        <img alt="" src={UI.buttons.guardSecondary} className="w-full h-full" draggable={false} />
      </Pressable>

      <BottomNav
        active="home"
        onTrends={() => onBottomNav('trends')}
        onHome={() => onBottomNav('home')}
        onGuard={() => onBottomNav('guard')}
      />

      {debugOverlay && <DebugOverlay frameId={frameId} />}
    </div>
  );
}

export default function WeiweiFigmaApp({
  frameId,
  cursor,
  navKind,
  stats,
  onSetEmotion,
  onOpen,
  debugOverlay,
}: Props) {
  const lastTapAt = useRef(0);
  const tap = (fn: () => void) => {
    const now = performance.now();
    if (now - lastTapAt.current < 60) return;
    lastTapAt.current = now;
    fn();
  };

  const bottomNav = (tab: 'trends' | 'home' | 'guard') => {
    tap(() => {
      if (tab === 'trends') onOpen(WEIWEI_FRAMES.trends[0], { replace: true });
      if (tab === 'home') onOpen(WEIWEI_FRAMES.feeling[0], { replace: true });
      if (tab === 'guard') onOpen(WEIWEI_FRAMES.guard[0], { replace: true });
    });
  };

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

  const node = useMemo(() => {
    if (isFrameInCategory(frameId, 'home')) {
      return <HomeFigma frameId={frameId} debugOverlay={debugOverlay} onStart={() => tap(() => onOpen(WEIWEI_FRAMES.feeling[0]))} />;
    }

    if (isFrameInCategory(frameId, 'stage')) {
      return (
        <StageFigma
          frameId={frameId}
          debugOverlay={debugOverlay}
          stats={stats}
          onOpenBreathing={() => tap(() => onOpen(WEIWEI_FRAMES.breathing[cursor % WEIWEI_FRAMES.breathing.length]))}
          onOpenSettingsSheet={() => tap(() => onOpen(WEIWEI_FRAMES.stage[1], { replace: true }))}
          onCloseSettingsSheet={() => tap(() => onOpen(WEIWEI_FRAMES.stage[0], { replace: true }))}
          onSettings={() => tap(() => onOpen(WEIWEI_FRAMES.guard[0], { replace: true }))}
          onBottomNav={bottomNav}
        />
      );
    }

    if (isFrameInCategory(frameId, 'feeling')) {
      return (
        <FeelingFigma
          frameId={frameId}
          debugOverlay={debugOverlay}
          onSettings={() => tap(() => onOpen(WEIWEI_FRAMES.guard[0], { replace: true }))}
          onBottomNav={bottomNav}
          onPick={(choice) => {
            const mapped: EmotionType = choice === 0 ? 'stress' : choice === 1 ? 'hunger' : 'habit';
            onSetEmotion(mapped);
            tap(() => onOpen(WEIWEI_FRAMES.breathing[(cursor + choice) % WEIWEI_FRAMES.breathing.length]));
          }}
        />
      );
    }

    if (isFrameInCategory(frameId, 'breathing')) {
      return (
        <BreathingFigma
          frameId={frameId}
          debugOverlay={debugOverlay}
          onSettings={() => tap(() => onOpen(WEIWEI_FRAMES.guard[0], { replace: true }))}
          onBottomNav={bottomNav}
          onComplete={() => tap(() => onOpen(WEIWEI_FRAMES.checkin[cursor % WEIWEI_FRAMES.checkin.length], { replace: true }))}
        />
      );
    }

    if (isFrameInCategory(frameId, 'checkin')) {
      return (
        <CheckinFigma
          frameId={frameId}
          debugOverlay={debugOverlay}
          onSettings={() => tap(() => onOpen(WEIWEI_FRAMES.guard[0], { replace: true }))}
          onBottomNav={bottomNav}
          onPick={(idx) => tap(() => onOpen(WEIWEI_FRAMES.desire[(cursor + idx) % WEIWEI_FRAMES.desire.length]))}
        />
      );
    }

    if (isFrameInCategory(frameId, 'desire')) {
      return (
        <DesireFigma
          frameId={frameId}
          debugOverlay={debugOverlay}
          onSettings={() => tap(() => onOpen(WEIWEI_FRAMES.guard[0], { replace: true }))}
          onBottomNav={bottomNav}
          onPick={(idx) => tap(() => onOpen(WEIWEI_FRAMES.actions[(cursor + idx) % WEIWEI_FRAMES.actions.length]))}
        />
      );
    }

    if (isFrameInCategory(frameId, 'actions')) {
      return (
        <ActionsFigma
          frameId={frameId}
          debugOverlay={debugOverlay}
          onSettings={() => tap(() => onOpen(WEIWEI_FRAMES.guard[0], { replace: true }))}
          onBottomNav={bottomNav}
          onPick={(idx) => tap(() => onOpen(WEIWEI_FRAMES.breathing[(cursor + idx) % WEIWEI_FRAMES.breathing.length]))}
        />
      );
    }

    if (isFrameInCategory(frameId, 'trends')) {
      return <TrendsFigma frameId={frameId} debugOverlay={debugOverlay} onBottomNav={bottomNav} />;
    }

    if (isFrameInCategory(frameId, 'guard')) {
      if (frameId === WEIWEI_FRAMES.guard[1]) {
        return (
          <GuardBlockFigma
            frameId={frameId}
            debugOverlay={debugOverlay}
            onBottomNav={bottomNav}
            onClose={() => tap(() => onOpen(WEIWEI_FRAMES.guard[0], { replace: true }))}
            onPrimary={() => tap(() => onOpen(WEIWEI_FRAMES.stage[0]))}
            onSecondary={() => tap(() => onOpen(WEIWEI_FRAMES.guard[0], { replace: true }))}
          />
        );
      }
      return (
        <GuardConfigFigma
          frameId={frameId}
          debugOverlay={debugOverlay}
          onBottomNav={bottomNav}
          onOpenBlockPreview={() => tap(() => onOpen(WEIWEI_FRAMES.guard[1]))}
        />
      );
    }

    return (
      <HomeFigma frameId={WEIWEI_FRAMES.home[0]} debugOverlay={debugOverlay} onStart={() => tap(() => onOpen(WEIWEI_FRAMES.feeling[0]))} />
    );
  }, [cursor, debugOverlay, frameId, onOpen, onSetEmotion, stats]);

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
