import React from 'react';
import { motion } from 'framer-motion';
import { getWeiweiFrameUi, type Rect } from '../figma/hotspots';
import { WEIWEI_FRAMES, isFrameInCategory, nextFrameId } from '../figma/flow';

type Props = {
  frameId: string;
  cursor: number;
  stackLen: number;
  navKind: 'push' | 'pop' | 'replace' | 'reset';
  onExit: () => void;
  onPop: () => void;
  onOpen: (frameId: string, opts?: { replace?: boolean }) => void;
};

function abs(rect: Rect): React.CSSProperties {
  return { position: 'absolute', left: rect.x, top: rect.y, width: rect.w, height: rect.h };
}

function Text({
  x,
  y,
  children,
  className,
}: {
  x: number;
  y: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className} style={{ position: 'absolute', left: x, top: y }}>
      {children}
    </div>
  );
}

function IconButton({
  rect,
  ariaLabel,
  icon,
  onClick,
  className,
}: {
  rect: Rect;
  ariaLabel: string;
  icon: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={[
        'absolute grid place-items-center rounded-full',
        'active:scale-[0.98] transition',
        className ?? '',
      ].join(' ')}
      style={abs(rect)}
    >
      <span className="material-symbols-outlined text-[22px]">{icon}</span>
    </button>
  );
}

function PillButton({
  rect,
  onClick,
  children,
  variant = 'outline',
}: {
  rect: Rect;
  onClick: () => void;
  children?: React.ReactNode;
  variant?: 'outline' | 'filled';
}) {
  const base =
    'absolute rounded-full flex items-center justify-center text-white text-[13px] tracking-wide active:scale-[0.99] transition';
  const style =
    variant === 'filled'
      ? 'bg-[#1d2547]/80 border border-transparent'
      : 'bg-transparent border border-[#1d2547]';
  return (
    <button type="button" onClick={onClick} className={`${base} ${style}`} style={abs(rect)}>
      {children}
    </button>
  );
}

function OptionRow({
  rect,
  text,
  onClick,
  icon,
}: {
  rect: Rect;
  text: string;
  icon: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute rounded-[22px] border border-white/10 bg-white/5 backdrop-blur-[10px] active:scale-[0.99] transition text-left"
      style={abs(rect)}
    >
      <div className="absolute" style={{ left: 14, top: 12, width: 61, height: 61 }}>
        <div className="w-[61px] h-[61px] rounded-full bg-white/10 border border-white/10 grid place-items-center">
          <span className="material-symbols-outlined text-[26px] text-white/90">{icon}</span>
        </div>
      </div>
      <div className="absolute left-[96px] top-[26px] text-[16px] font-[300] text-white/95">{text}</div>
    </button>
  );
}

function BottomTabs({
  rect,
  active,
  onTrends,
  onHome,
  onGuard,
  tone = 'dark',
}: {
  rect: Rect;
  active: 'trends' | 'home' | 'guard';
  onTrends: () => void;
  onHome: () => void;
  onGuard: () => void;
  tone?: 'dark' | 'light';
}) {
  const bg = tone === 'light' ? 'bg-black/5 border border-black/10' : 'bg-white/5 border border-white/10';
  const textBase = tone === 'light' ? 'text-black/60' : 'text-white/60';
  const textActive = tone === 'light' ? 'text-black' : 'text-white';

  const w = rect.w / 3;
  const item = (key: 'trends' | 'home' | 'guard', label: string, icon: string, onClick: () => void) => (
    <button
      key={key}
      type="button"
      onClick={onClick}
      className="h-full grid place-items-center"
      style={{ width: w }}
    >
      <div className="grid place-items-center gap-0.5">
        <span className={`material-symbols-outlined text-[18px] ${key === active ? textActive : textBase}`}>{icon}</span>
        <div className={`text-[10px] ${key === active ? textActive : textBase}`}>{label}</div>
      </div>
    </button>
  );

  return (
    <div className={`absolute rounded-[18px] ${bg}`} style={abs(rect)}>
      <div className="w-full h-full flex">
        {item('trends', '成长', 'trending_up', onTrends)}
        {item('home', '主页', 'home', onHome)}
        {item('guard', '守护', 'shield', onGuard)}
      </div>
    </div>
  );
}

export default function WeiweiNative({ frameId, cursor, stackLen, navKind, onExit, onPop, onOpen }: Props) {
  const ui = getWeiweiFrameUi(frameId);
  const isLight = frameId === '1:1887' || frameId === '1:1962';
  const bg = isLight ? '#FFF5F9' : '#000000';

  const variants = {
    push: { initial: { x: 20, opacity: 0.0 }, animate: { x: 0, opacity: 1 }, exit: { x: -20, opacity: 0 } },
    pop: { initial: { x: -20, opacity: 0.0 }, animate: { x: 0, opacity: 1 }, exit: { x: 20, opacity: 0 } },
    replace: { initial: { opacity: 0.0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
    reset: { initial: { opacity: 0.0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
  } as const;

  const v = variants[navKind] ?? variants.replace;

  const openFeeling = () => onOpen(WEIWEI_FRAMES.feeling[0]);
  const openGuard = () => onOpen(WEIWEI_FRAMES.guard[0], { replace: true });
  const openHome = () => onOpen(WEIWEI_FRAMES.home[0], { replace: true });
  const openTrends = () => onOpen(WEIWEI_FRAMES.trends[0], { replace: true });

  const titleColor = isLight ? 'text-black' : 'text-white';
  const subColor = isLight ? 'text-black/70' : 'text-white/70';

  return (
    <motion.div
      key={frameId}
      className="relative w-full h-full overflow-hidden"
      style={{ background: bg }}
      initial={v.initial}
      animate={v.animate}
      exit={v.exit}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      {/* Home (iPhone 16 - 1/2) */}
      {(frameId === '1:33' || frameId === '1:178') && (
        <>
          <Text x={102} y={58} className="text-white text-[20px] font-[600]">
            Hi! Lilian
          </Text>
          <Text x={165} y={147} className="text-black text-[16px] font-[700]">
            <span style={{ fontFamily: "'Inria Serif', serif" }}>How you feel today?</span>
          </Text>
          {ui.start && (
            <button type="button" onClick={openFeeling} className="absolute active:scale-[0.99] transition" style={abs(ui.start)}>
              <img src="/monster.png" alt="Monster" className="w-full h-full object-cover select-none pointer-events-none" draggable={false} />
            </button>
          )}
          <Text x={144} y={672} className="text-white/75 text-[16px] font-[400]">
            Feeling low ...
          </Text>
          <Text x={175} y={761} className="text-white/80 text-[16px] font-[600] tracking-wide">
            SOS
          </Text>
        </>
      )}

      {/* Stage screens (slow down) */}
      {(frameId === '1:1695' || frameId === '1:1608') && (
        <>
          <Text x={94} y={62} className="text-white text-[12px] font-[700]">
            LV.1
          </Text>
          <Text x={148} y={195} className="text-white/75 text-[12px] font-[300]">
            冲动很正常，我们先慢下来
          </Text>
          {ui.start && (
            <button
              type="button"
              onClick={openFeeling}
              className="absolute rounded-full bg-white/10 border border-white/10 grid place-items-center active:scale-[0.99] transition"
              style={abs(ui.start)}
            >
              <span className="material-symbols-outlined text-white text-[28px]">play_arrow</span>
            </button>
          )}
        </>
      )}

      {/* Growth card screen (iPhone 16 - 7) */}
      {frameId === '1:1768' && (
        <>
          <Text x={94} y={62} className="text-white text-[12px] font-[700]">
            LV.1
          </Text>
          <Text x={165} y={168} className="text-white text-[16px] font-[600]">
            Hi! Lilian
          </Text>
          <Text x={175} y={240} className="text-white/85 text-[16px] font-[600]">
            成长
          </Text>
          {ui.close && (
            <IconButton rect={ui.close} ariaLabel="Close" icon="close" onClick={() => (stackLen <= 1 ? onExit() : onPop())} className="bg-white/10 text-white" />
          )}
          <div
            className="absolute rounded-[40px] bg-white/50 border border-white/10 backdrop-blur-[15px]"
            style={{ left: 28, top: 206, width: 338, height: 373 }}
          />
          <div className="absolute" style={{ left: 100, top: 295, width: 188, height: 190 }}>
            <img src="/monster.png" alt="Monster" className="w-full h-full object-cover select-none pointer-events-none" draggable={false} />
          </div>
          {ui.start && (
            <button
              type="button"
              onClick={openFeeling}
              className="absolute rounded-full bg-white/10 border border-white/10 grid place-items-center active:scale-[0.99] transition"
              style={abs(ui.start)}
            >
              <span className="material-symbols-outlined text-white text-[28px]">play_arrow</span>
            </button>
          )}
        </>
      )}

      {/* Feeling / Desire / Actions (option list) */}
      {(isFrameInCategory(frameId, 'feeling') || isFrameInCategory(frameId, 'desire') || isFrameInCategory(frameId, 'actions')) && (
        <>
          <Text x={94} y={62} className="text-white text-[12px] font-[700]">
            LV.1
          </Text>
          {isFrameInCategory(frameId, 'feeling') && (
            <Text x={164} y={157} className="text-white/75 text-[12px] font-[300]">
              冲动很正常，我们先慢下来
            </Text>
          )}
          {isFrameInCategory(frameId, 'desire') && (
            <Text x={164} y={157} className="text-white/75 text-[12px] font-[300]">
              现在最想做什么？
            </Text>
          )}
          {isFrameInCategory(frameId, 'actions') && (
            <Text x={164} y={157} className="text-white/75 text-[12px] font-[300]">
              我们一起做点别的吧
            </Text>
          )}

          {ui.optionRows &&
            isFrameInCategory(frameId, 'feeling') &&
            ui.optionRows.map((r, idx) => (
              <OptionRow
                key={idx}
                rect={r}
                text={['今天很糟糕', '说不上来，很难受', '压力太大了'][idx] ?? ''}
                icon={['sentiment_very_dissatisfied', 'healing', 'psychology'][idx] ?? 'circle'}
                onClick={() => onOpen(nextFrameId(WEIWEI_FRAMES.breathing, cursor + idx))}
              />
            ))}

          {ui.optionRows &&
            isFrameInCategory(frameId, 'desire') &&
            ui.optionRows.map((r, idx) => (
              <OptionRow
                key={idx}
                rect={r}
                text={['吃点东西', '安静待一会', '想哭'][idx] ?? ''}
                icon={['restaurant', 'self_improvement', 'water_drop'][idx] ?? 'circle'}
                onClick={() => onOpen(nextFrameId(WEIWEI_FRAMES.actions, cursor + idx))}
              />
            ))}

          {ui.optionRows &&
            isFrameInCategory(frameId, 'actions') &&
            ui.optionRows.map((r, idx) => (
              <OptionRow
                key={idx}
                rect={r}
                text={['呼吸灯', '涂一涂', '听一听'][idx] ?? ''}
                icon={['flare', 'draw', 'headphones'][idx] ?? 'circle'}
                onClick={() => {
                  if (idx === 0) onOpen(nextFrameId(WEIWEI_FRAMES.breathing, cursor));
                  else onOpen(nextFrameId(WEIWEI_FRAMES.checkin, cursor + (idx - 1)));
                }}
              />
            ))}
        </>
      )}

      {/* Breathing */}
      {isFrameInCategory(frameId, 'breathing') && (
        <>
          <Text x={94} y={62} className="text-white text-[12px] font-[700]">
            LV.1
          </Text>
          <Text x={94} y={518} className="text-white/75 text-[12px] font-[300]">
            跟着光，慢慢呼吸
          </Text>
          {ui.breatheTap && (
            <button
              type="button"
              aria-label="Continue"
              onClick={() => onOpen(nextFrameId(WEIWEI_FRAMES.checkin, cursor))}
              className="absolute rounded-full"
              style={abs(ui.breatheTap)}
            >
              <div className="absolute inset-0 rounded-full bg-white/5 border border-white/10" />
              <motion.div
                className="absolute inset-4 rounded-full"
                animate={{ boxShadow: ['0 0 0px rgba(82,163,255,0.0)', '0 0 28px rgba(82,163,255,0.45)', '0 0 0px rgba(82,163,255,0.0)'] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute inset-10 rounded-full bg-[#111621]/60"
                animate={{ scale: [1, 1.07, 1] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
              />
            </button>
          )}
        </>
      )}

      {/* Check-in */}
      {isFrameInCategory(frameId, 'checkin') && (
        <>
          <Text x={94} y={62} className="text-white text-[12px] font-[700]">
            LV.1
          </Text>
          <Text x={94} y={518} className="text-white/75 text-[12px] font-[300]">
            快90秒了，你现在感觉怎样
          </Text>
          {ui.checkinAnswers && (
            <>
              <PillButton rect={ui.checkinAnswers[0]} onClick={() => onOpen(nextFrameId(WEIWEI_FRAMES.desire, cursor))} variant="outline" />
              <PillButton rect={ui.checkinAnswers[1]} onClick={() => onOpen(nextFrameId(WEIWEI_FRAMES.desire, cursor + 1))} variant="filled" />
              <PillButton rect={ui.checkinAnswers[2]} onClick={() => onOpen(nextFrameId(WEIWEI_FRAMES.desire, cursor + 2))} variant="outline" />
            </>
          )}
        </>
      )}

      {/* Trends */}
      {frameId === '1:1887' && (
        <>
          <Text x={157} y={46} className={`${titleColor} text-[20px] font-[600]`}>
            本周趋势
          </Text>
          <div className="absolute left-[28px] top-[102px] w-[337px] h-[256px] rounded-[22px] bg-white border border-black/10 shadow-sm" />
          <div className="absolute left-[28px] top-[377px] w-[337px] h-[134px] rounded-[22px] bg-white border border-black/10 shadow-sm" />
          <Text x={43} y={537} className={`${subColor} text-[16px] font-[500]`}>
            每日明细
          </Text>
          <div className="absolute left-[28px] top-[574px] w-[337px] h-[215px] rounded-[22px] bg-white border border-black/10 shadow-sm" />
        </>
      )}

      {/* Guard config */}
      {frameId === '1:1962' && (
        <>
          <Text x={157} y={46} className={`${titleColor} text-[20px] font-[600]`}>
            配置守护
          </Text>
          <Text x={43} y={114} className={`${subColor} text-[16px] font-[500]`}>
            授权
          </Text>
          <div className="absolute left-[37px] top-[150px] w-[331px] h-[70px] rounded-[22px] bg-white border border-black/10 shadow-sm" />
          <Text x={43} y={352} className={`${subColor} text-[16px] font-[500]`}>
            配置
          </Text>
          <div className="absolute left-[37px] top-[386px] w-[331px] h-[81px] rounded-[22px] bg-white border border-black/10 shadow-sm" />
          <Text x={43} y={398} className={`${subColor} text-[12px] font-[500]`}>
            要守护的app
          </Text>
          <Text x={285} y={398} className={`${subColor} text-[12px] font-[500]`}>
            美团外卖
          </Text>
          <Text x={43} y={439} className={`${subColor} text-[12px] font-[500]`}>
            守护时段
          </Text>
          <Text x={277} y={439} className={`${subColor} text-[12px] font-[500]`}>
            9:30 - 1:30
          </Text>
          <Text x={43} y={480} className={`${subColor} text-[12px] font-[500]`}>
            拦截力度
          </Text>
          <Text x={310} y={480} className={`${subColor} text-[12px] font-[500]`}>
            标准
          </Text>
        </>
      )}

      {/* Guard out-of-time detail */}
      {frameId === '1:1830' && (
        <>
          {ui.close && (
            <IconButton rect={ui.close} ariaLabel="Close" icon="close" onClick={() => (stackLen <= 1 ? onExit() : onPop())} className="bg-white/10 text-white" />
          )}
          <Text x={53} y={126} className="text-white/85 text-[14px] font-[400] w-[287px]">
            守护当前不在时间段内（21:30 - 01:30），你可以调整时段或保持不变。
          </Text>
          <Text x={53} y={166} className="text-white/70 text-[12px] font-[400] w-[279px]">
            最近一次开始拦截：2小时前
          </Text>
          {ui.start && (
            <button
              type="button"
              onClick={() => onOpen(WEIWEI_FRAMES.guard[0])}
              className="absolute rounded-full bg-white/10 border border-white/10 grid place-items-center active:scale-[0.99] transition"
              style={abs(ui.start)}
            >
              <span className="material-symbols-outlined text-white text-[28px]">arrow_back</span>
            </button>
          )}
        </>
      )}

      {/* Shared nav chrome */}
      {ui.settings && !isLight && (
        <IconButton rect={ui.settings} ariaLabel="Guard settings" icon="settings" onClick={openGuard} className="bg-white/10 text-white" />
      )}

      {ui.bottomNav && (
        <BottomTabs
          rect={ui.bottomNav}
          active={frameId === WEIWEI_FRAMES.trends[0] ? 'trends' : frameId === WEIWEI_FRAMES.guard[0] || frameId === WEIWEI_FRAMES.guard[1] ? 'guard' : 'home'}
          onTrends={openTrends}
          onHome={openHome}
          onGuard={openGuard}
          tone={isLight ? 'light' : 'dark'}
        />
      )}

      {/* Guard time row interaction (only on guard config) */}
      {ui.guardTimeRow && frameId === WEIWEI_FRAMES.guard[0] && (
        <button
          type="button"
          aria-label="Adjust guard schedule"
          onClick={() => onOpen(WEIWEI_FRAMES.guard[1])}
          className="absolute rounded-[16px] active:scale-[0.99] transition"
          style={abs(ui.guardTimeRow)}
        />
      )}

      {/* Exit affordance when nothing else exists */}
      {!ui.close && stackLen <= 1 && (
        <button
          type="button"
          aria-label="Exit"
          onClick={onExit}
          className="absolute left-4 top-4 w-10 h-10 rounded-full bg-white/10 text-white grid place-items-center active:scale-[0.98] transition"
        >
          <span className="material-symbols-outlined text-[22px]">arrow_back</span>
        </button>
      )}
    </motion.div>
  );
}
