import React from 'react';

interface Props {
  intensity: 'standard' | 'strict';
  onReturnToFocus: () => void;
  onIgnore: () => void;
}

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
    top: '/figma/weiwei-wzx/ui/pills/top_pill.svg',
  },
  buttons: {
    close: '/figma/weiwei-wzx/ui/buttons/guard_close.svg',
    primary: '/figma/weiwei-wzx/ui/buttons/guard_primary.svg',
    secondary: '/figma/weiwei-wzx/ui/buttons/guard_secondary.svg',
  },
  text: {
    desc: '/figma/weiwei-wzx/ui/text/guard_block_desc.svg',
    last: '/figma/weiwei-wzx/ui/text/guard_block_last.svg',
  },
  monsters: {
    guard: '/figma/weiwei-wzx/ui/monsters/monster_guard_block.png',
  },
  nav: {
    home: '/figma/weiwei-wzx/ui/nav/bottom_home.svg',
  },
} as const;

function Img({
  src,
  x,
  y,
  w,
  h,
  alt = '',
  style,
}: {
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
  alt?: string;
  style?: React.CSSProperties;
}) {
  return (
    <img
      alt={alt}
      src={src}
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
  disabled,
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
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onPointerDown={(e) => {
        e.preventDefault();
        if (!disabled) onPress();
      }}
      className={[
        'absolute border-0 bg-transparent p-0',
        'outline-none focus:outline-none focus-visible:outline-none',
        disabled ? 'opacity-40' : 'active:scale-[0.99] transition-transform',
        className ?? '',
      ].join(' ')}
      style={{ ...rect(x, y, w, h), touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent', ...style }}
    >
      {children}
    </button>
  );
}

const ShieldOverlay: React.FC<Props> = ({ intensity, onReturnToFocus, onIgnore }) => {
  return (
    <div className="relative w-full h-full overflow-hidden animate-fade-in">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #FEDCFF 0%, #D1FAFF 100%)' }} />
      <div className="absolute rounded-full blur-[300px]" style={{ ...rect(-149, 138, 346, 352), background: '#FFF8D9' }} />
      <div className="absolute rounded-full blur-[300px]" style={{ ...rect(220, 294, 276, 281), background: '#FFF8D9' }} />

      {/* Top pill */}
      <Img src={UI.pills.top} x={130} y={51} w={152} h={40} alt="" />

      {/* Close */}
      <Pressable x={26} y={27} w={20} h={20} ariaLabel="Close" onPress={onIgnore}>
        <img alt="" src={UI.buttons.close} className="w-full h-full" draggable={false} />
      </Pressable>

      {/* Copy */}
      <Img src={UI.text.desc} x={53} y={126} w={287} h={30} alt="" />
      <Img src={UI.text.last} x={53} y={166} w={279} h={15} alt="" />

      {/* Monster */}
      <Img src={UI.monsters.guard} x={65} y={217} w={263.93} h={265.58} alt="Monster" style={{ opacity: 0.9 }} />
      <div className="absolute rounded-full" style={{ ...rect(75, 455, 243, 35), background: 'rgba(0,0,0,0.05)' }} />
      <div className="absolute rounded-full" style={{ ...rect(110, 455, 192, 28), background: 'rgba(0,0,0,0.05)' }} />

      {/* Actions */}
      <Pressable x={70} y={225} w={261} h={40} ariaLabel="Return to focus" onPress={onReturnToFocus}>
        <img alt="" src={UI.buttons.primary} className="w-full h-full" draggable={false} />
      </Pressable>
      <Pressable
        x={70}
        y={278}
        w={261}
        h={40}
        ariaLabel="Ignore"
        onPress={onIgnore}
        disabled={intensity === 'strict'}
      >
        <img alt="" src={UI.buttons.secondary} className="w-full h-full" draggable={false} />
      </Pressable>

      {/* Bottom nav (home selected) */}
      <Img src={UI.nav.home} x={107} y={744} w={170} h={54} alt="" style={{ opacity: 0.95 }} />
    </div>
  );
};

export default ShieldOverlay;

