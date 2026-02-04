import React from 'react';
import { getWeiweiFrameUi } from '../figma/hotspots';
import { WEIWEI_FRAMES, isFrameInCategory, nextFrameId } from '../figma/flow';
import { WEIWEI_WZX_FRAMES_BY_ID } from '../figma/weiwei-wzx';
import { getWeiweiWzxFrameSvg } from '../figma/weiwei-wzx-svgs';

type Hotspot = {
  id: string;
  ariaLabel: string;
  x: number;
  y: number;
  w: number;
  h: number;
  onClick: () => void;
};

type Props = {
  frameId: string;
  cursor: number;
  stackLen: number;
  navKind: 'push' | 'pop' | 'replace' | 'reset';
  onExit: () => void;
  onPop: () => void;
  onOpen: (frameId: string, opts?: { replace?: boolean }) => void;
};

export default function WeiweiNative({ frameId, cursor, stackLen, onExit, onPop, onOpen }: Props) {
  const ui = getWeiweiFrameUi(frameId);

  const src = getWeiweiWzxFrameSvg(frameId) ?? WEIWEI_WZX_FRAMES_BY_ID[frameId]?.image2xPng;

  const hotspots: Hotspot[] = [];

  if (ui.close) {
    hotspots.push({
      id: 'close',
      ariaLabel: 'Close',
      ...ui.close,
      onClick: () => {
        if (stackLen <= 1) onExit();
        else onPop();
      },
    });
  }

  if (ui.settings) {
    hotspots.push({
      id: 'settings',
      ariaLabel: 'Guard settings',
      ...ui.settings,
      onClick: () => onOpen(WEIWEI_FRAMES.guard[0], { replace: true }),
    });
  }

  if (ui.bottomNav) {
    const w = ui.bottomNav.w / 3;
    hotspots.push({
      id: 'tab_trends',
      ariaLabel: 'Trends',
      x: ui.bottomNav.x,
      y: ui.bottomNav.y,
      w,
      h: ui.bottomNav.h,
      onClick: () => onOpen(WEIWEI_FRAMES.trends[0], { replace: true }),
    });
    hotspots.push({
      id: 'tab_home',
      ariaLabel: 'Home',
      x: ui.bottomNav.x + w,
      y: ui.bottomNav.y,
      w,
      h: ui.bottomNav.h,
      onClick: () => onOpen(WEIWEI_FRAMES.home[0], { replace: true }),
    });
    hotspots.push({
      id: 'tab_guard',
      ariaLabel: 'Guard',
      x: ui.bottomNav.x + w * 2,
      y: ui.bottomNav.y,
      w,
      h: ui.bottomNav.h,
      onClick: () => onOpen(WEIWEI_FRAMES.guard[0], { replace: true }),
    });
  }

  if (ui.start) {
    const isGuardDetail = frameId === WEIWEI_FRAMES.guard[1];
    hotspots.push({
      id: 'start',
      ariaLabel: isGuardDetail ? 'Back to guard settings' : 'Start',
      ...ui.start,
      onClick: () => {
        if (isGuardDetail) {
          onPop();
          return;
        }
        onOpen(WEIWEI_FRAMES.feeling[0]);
      },
    });
  }

  if (ui.optionRows && isFrameInCategory(frameId, 'feeling')) {
    ui.optionRows.forEach((r, idx) => {
      hotspots.push({
        id: `feeling_${idx + 1}`,
        ariaLabel: `Feeling option ${idx + 1}`,
        ...r,
        onClick: () => onOpen(nextFrameId(WEIWEI_FRAMES.breathing, cursor + idx)),
      });
    });
  }
  if (ui.optionRows && isFrameInCategory(frameId, 'desire')) {
    ui.optionRows.forEach((r, idx) => {
      hotspots.push({
        id: `desire_${idx + 1}`,
        ariaLabel: `Desire option ${idx + 1}`,
        ...r,
        onClick: () => onOpen(nextFrameId(WEIWEI_FRAMES.actions, cursor + idx)),
      });
    });
  }
  if (ui.optionRows && isFrameInCategory(frameId, 'actions')) {
    ui.optionRows.forEach((r, idx) => {
      hotspots.push({
        id: `action_${idx + 1}`,
        ariaLabel: `Action option ${idx + 1}`,
        ...r,
        onClick: () => {
          if (idx === 0) onOpen(nextFrameId(WEIWEI_FRAMES.breathing, cursor));
          else onOpen(nextFrameId(WEIWEI_FRAMES.checkin, cursor + (idx - 1)));
        },
      });
    });
  }

  if (ui.breatheTap && isFrameInCategory(frameId, 'breathing')) {
    hotspots.push({
      id: 'breathing_tap',
      ariaLabel: 'Continue',
      ...ui.breatheTap,
      onClick: () => onOpen(nextFrameId(WEIWEI_FRAMES.checkin, cursor)),
    });
  }

  if (ui.checkinAnswers && isFrameInCategory(frameId, 'checkin')) {
    ui.checkinAnswers.forEach((r, idx) => {
      hotspots.push({
        id: `ans_${idx + 1}`,
        ariaLabel: `Answer ${idx + 1}`,
        ...r,
        onClick: () => onOpen(nextFrameId(WEIWEI_FRAMES.desire, cursor + idx)),
      });
    });
  }

  if (ui.guardTimeRow && frameId === WEIWEI_FRAMES.guard[0]) {
    hotspots.push({
      id: 'guard_time',
      ariaLabel: 'Adjust guard schedule',
      ...ui.guardTimeRow,
      onClick: () => onOpen(WEIWEI_FRAMES.guard[1]),
    });
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      {src ? (
        <img
          alt={WEIWEI_WZX_FRAMES_BY_ID[frameId]?.name ?? 'WeiWei'}
          src={src}
          className="absolute inset-0 w-full h-full pointer-events-none select-none"
          style={{ objectFit: 'fill' }}
          draggable={false}
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center text-white/60 text-sm">Missing frame</div>
      )}

      {/* Fallback exit (home frames have no close button) */}
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

      {hotspots.map((h) => (
        <button
          key={h.id}
          type="button"
          aria-label={h.ariaLabel}
          onClick={h.onClick}
          className="absolute bg-transparent cursor-pointer"
          style={{ left: h.x, top: h.y, width: h.w, height: h.h }}
        />
      ))}
    </div>
  );
}

