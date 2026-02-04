import React, { useEffect, useRef, useState } from 'react';
import { AppState, AppView } from './types';
import FigmaFrame, { type FigmaHotspot } from './screens/FigmaFrame';
import FigmaGallery from './screens/FigmaGallery';
import DemoVideos from './screens/DemoVideos';
import HomeScreen from './screens/HomeScreen';
import ShieldOverlay from './screens/ShieldOverlay';
import SimulatedApp from './screens/SimulatedApp';
import { getWeiweiFrameUi } from './figma/hotspots';
import { WEIWEI_WZX_FRAMES_BY_ID } from './figma/weiwei-wzx';
import { WEIWEI_FRAMES, isFrameInCategory, nextFrameId } from './figma/flow';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    currentView: AppView.OS_HOME,
    intensity: 'standard',
    stats: {
      attempts: 3,
      returns: 3,
    },
    weiweiFrameId: WEIWEI_FRAMES.home[0],
    weiweiStack: [WEIWEI_FRAMES.home[0]],
    flowCursor: 0,
  });

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const navigateTo = (view: AppView) => setState((prev) => ({ ...prev, currentView: view }));
  const updateState = (updates: Partial<AppState>) => setState((prev) => ({ ...prev, ...updates }));

  const openWeiweiFrame = (
    frameId: string,
    opts?: { replace?: boolean; resetStack?: boolean; advanceCursor?: boolean; cursorStep?: number },
  ) => {
    setState((prev) => {
      const nextStack = opts?.resetStack ? [] : [...(prev.weiweiStack ?? [])];
      if (opts?.replace) {
        if (nextStack.length > 0) nextStack[nextStack.length - 1] = frameId;
        else nextStack.push(frameId);
      } else {
        nextStack.push(frameId);
      }
      const cursor = prev.flowCursor ?? 0;
      const nextCursor = opts?.advanceCursor ? cursor + (opts.cursorStep ?? 1) : cursor;
      return { ...prev, currentView: AppView.WEIWEI_FIGMA, weiweiFrameId: frameId, weiweiStack: nextStack, flowCursor: nextCursor };
    });
  };

  const enterWeiweiAt = (frameId: string, opts?: { advanceCursor?: boolean; cursorStep?: number }) => {
    openWeiweiFrame(frameId, { resetStack: true, advanceCursor: opts?.advanceCursor, cursorStep: opts?.cursorStep });
  };

  const popWeiweiFrame = () => {
    setState((prev) => {
      const stack = [...(prev.weiweiStack ?? [])];
      if (stack.length <= 1) return { ...prev, currentView: AppView.OS_HOME };
      stack.pop();
      const frameId = stack[stack.length - 1];
      return { ...prev, currentView: AppView.WEIWEI_FIGMA, weiweiFrameId: frameId, weiweiStack: stack };
    });
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'g') {
        setState((prev) => ({ ...prev, currentView: AppView.FIGMA_GALLERY }));
        return;
      }
      if (e.key.toLowerCase() === 'v') {
        setState((prev) => ({ ...prev, currentView: AppView.DEMO_VIDEOS }));
        return;
      }
      if (e.key === 'Escape') {
        setState((prev) => ({ ...prev, currentView: AppView.OS_HOME }));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (state.currentView !== AppView.WEIWEI_FIGMA) return;
    if (!state.weiweiFrameId) return;
    if (!isFrameInCategory(state.weiweiFrameId, 'breathing')) return;
    const frameId = state.weiweiFrameId;
    const t = setTimeout(() => {
      const s = stateRef.current;
      if (s.currentView !== AppView.WEIWEI_FIGMA) return;
      if (s.weiweiFrameId !== frameId) return;
      if (!isFrameInCategory(frameId, 'breathing')) return;
      const cursor = s.flowCursor ?? 0;
      const nextCheckin = nextFrameId(WEIWEI_FRAMES.checkin, cursor);
      openWeiweiFrame(nextCheckin, { advanceCursor: true });
    }, 16_000);
    return () => clearTimeout(t);
  }, [state.currentView, state.weiweiFrameId]);

  const getWeiweiHotspots = () => {
    const frameId = state.weiweiFrameId ?? WEIWEI_FRAMES.home[0];
    const cursor = state.flowCursor ?? 0;
    const stackLen = (state.weiweiStack ?? []).length;
    const ui = getWeiweiFrameUi(frameId);

    const hotspots: FigmaHotspot[] = [];

    // Close/back (only when it exists in the design)
    if (ui.close) {
      hotspots.push({
        id: 'close',
        ariaLabel: 'Close',
        ...ui.close,
        onClick: () => {
          if (stackLen <= 1) {
            navigateTo(AppView.OS_HOME);
            return;
          }
          popWeiweiFrame();
        },
      });
    }

    // Settings (only when the icon exists)
    if (ui.settings) {
      hotspots.push({
        id: 'settings',
        ariaLabel: 'Guard settings',
        ...ui.settings,
        onClick: () => openWeiweiFrame(WEIWEI_FRAMES.guard[0], { replace: true }),
      });
    }

    // Bottom tabs (only when the tab bar exists)
    if (ui.bottomNav) {
      const segmentW = ui.bottomNav.w / 3;
      hotspots.push({
        id: 'tab_trends',
        ariaLabel: 'Trends',
        x: ui.bottomNav.x,
        y: ui.bottomNav.y,
        w: segmentW,
        h: ui.bottomNav.h,
        onClick: () => openWeiweiFrame(WEIWEI_FRAMES.trends[0], { replace: true }),
      });
      hotspots.push({
        id: 'tab_home',
        ariaLabel: 'Home',
        x: ui.bottomNav.x + segmentW,
        y: ui.bottomNav.y,
        w: segmentW,
        h: ui.bottomNav.h,
        onClick: () => openWeiweiFrame(WEIWEI_FRAMES.home[0], { replace: true }),
      });
      hotspots.push({
        id: 'tab_guard',
        ariaLabel: 'Guard',
        x: ui.bottomNav.x + segmentW * 2,
        y: ui.bottomNav.y,
        w: segmentW,
        h: ui.bottomNav.h,
        onClick: () => openWeiweiFrame(WEIWEI_FRAMES.guard[0], { replace: true }),
      });
    }

    // Start button (home / stage / guard detail)
    if (ui.start) {
      const isGuardDetail = frameId === WEIWEI_FRAMES.guard[1];
      hotspots.push({
        id: 'start',
        ariaLabel: isGuardDetail ? 'Back to guard settings' : 'Start',
        ...ui.start,
        onClick: () => {
          if (isGuardDetail) {
            popWeiweiFrame();
            return;
          }
          openWeiweiFrame(WEIWEI_FRAMES.feeling[0], { advanceCursor: true });
        },
      });
    }

    // Feeling / Desire / Actions (3 option rows)
    if (ui.optionRows && isFrameInCategory(frameId, 'feeling')) {
      ui.optionRows.forEach((r, idx) => {
        hotspots.push({
          id: `feeling_${idx + 1}`,
          ariaLabel: `Feeling option ${idx + 1}`,
          ...r,
          onClick: () => openWeiweiFrame(nextFrameId(WEIWEI_FRAMES.breathing, cursor + idx), { advanceCursor: true }),
        });
      });
    }
    if (ui.optionRows && isFrameInCategory(frameId, 'desire')) {
      ui.optionRows.forEach((r, idx) => {
        hotspots.push({
          id: `desire_${idx + 1}`,
          ariaLabel: `Desire option ${idx + 1}`,
          ...r,
          onClick: () => openWeiweiFrame(nextFrameId(WEIWEI_FRAMES.actions, cursor + idx), { advanceCursor: true }),
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
            if (idx === 0) {
              openWeiweiFrame(nextFrameId(WEIWEI_FRAMES.breathing, cursor), { advanceCursor: true });
              return;
            }
            openWeiweiFrame(nextFrameId(WEIWEI_FRAMES.checkin, cursor + (idx - 1)), { advanceCursor: true });
          },
        });
      });
    }

    // Breathing tap-to-skip
    if (ui.breatheTap && isFrameInCategory(frameId, 'breathing')) {
      hotspots.push({
        id: 'breathing_tap',
        ariaLabel: 'Continue',
        ...ui.breatheTap,
        onClick: () => openWeiweiFrame(nextFrameId(WEIWEI_FRAMES.checkin, cursor), { advanceCursor: true }),
      });
    }

    // Check-in answers
    if (ui.checkinAnswers && isFrameInCategory(frameId, 'checkin')) {
      ui.checkinAnswers.forEach((r, idx) => {
        hotspots.push({
          id: `ans_${idx + 1}`,
          ariaLabel: `Answer ${idx + 1}`,
          ...r,
          onClick: () => openWeiweiFrame(nextFrameId(WEIWEI_FRAMES.desire, cursor + idx), { advanceCursor: true }),
        });
      });
    }

    // Guard config -> time detail
    if (ui.guardTimeRow && frameId === WEIWEI_FRAMES.guard[0]) {
      hotspots.push({
        id: 'guard_time',
        ariaLabel: 'Adjust guard schedule',
        ...ui.guardTimeRow,
        onClick: () => openWeiweiFrame(WEIWEI_FRAMES.guard[1]),
      });
    }

    return hotspots;
  };

  const renderView = () => {
    switch (state.currentView) {
      case AppView.FIGMA_GALLERY:
        return (
          <FigmaGallery
            onClose={() => navigateTo(AppView.OS_HOME)}
            onOpenVideos={() => navigateTo(AppView.DEMO_VIDEOS)}
            onOpenFrame={(frameId) => setState((prev) => ({ ...prev, currentView: AppView.FIGMA_FRAME, figmaFrameId: frameId }))}
          />
        );
      case AppView.DEMO_VIDEOS:
        return <DemoVideos onClose={() => navigateTo(AppView.FIGMA_GALLERY)} />;
      case AppView.FIGMA_FRAME: {
        const f = state.figmaFrameId ? WEIWEI_WZX_FRAMES_BY_ID[state.figmaFrameId] : undefined;
        const fit = f && (f.width !== 393 || f.height !== 852) ? 'contain' : 'fill';
        return (
          <FigmaFrame
            alt={f?.name ?? 'Figma Frame'}
            src={f?.image2xPng ?? WEIWEI_WZX_FRAMES_BY_ID['1:1768'].image2xPng}
            designWidth={f?.width ?? 393}
            designHeight={f?.height ?? 852}
            fit={fit}
            hotspots={[
              { id: 'back', ariaLabel: 'Back to gallery', x: 12, y: 12, w: 120, h: 80, onClick: () => navigateTo(AppView.FIGMA_GALLERY) },
            ]}
          />
        );
      }
      case AppView.OS_HOME:
        return (
          <HomeScreen 
            onOpenGallery={() => navigateTo(AppView.FIGMA_GALLERY)}
            onOpenApp={(appName) => {
              if (appName === 'Meituan') {
                navigateTo(AppView.MEITUAN_SHIELD);
              } else if (appName === 'WeiWei') {
                enterWeiweiAt(WEIWEI_FRAMES.home[0]);
              }
            }}
          />
        );
      case AppView.MEITUAN_SHIELD:
        return (
          <ShieldOverlay 
            intensity={state.intensity}
            onReturnToFocus={() => {
              updateState({ stats: { ...state.stats, returns: state.stats.returns + 1 } });
              enterWeiweiAt(nextFrameId(WEIWEI_FRAMES.stage, (state.flowCursor ?? 0) + 1), { advanceCursor: true });
            }}
            onIgnore={() => {
              updateState({ stats: { ...state.stats, attempts: state.stats.attempts + 1 } });
              navigateTo(AppView.MEITUAN_APP);
            }}
          />
        );
      case AppView.MEITUAN_APP:
        return (
          <SimulatedApp 
            onBackToSafety={() => enterWeiweiAt(nextFrameId(WEIWEI_FRAMES.stage, (state.flowCursor ?? 0) + 1), { advanceCursor: true })}
            onHome={() => navigateTo(AppView.OS_HOME)}
          />
        );
      case AppView.WEIWEI_FIGMA: {
        const f = state.weiweiFrameId ? WEIWEI_WZX_FRAMES_BY_ID[state.weiweiFrameId] : undefined;
        const fit = f && (f.width !== 393 || f.height !== 852) ? 'contain' : 'fill';
        return (
          <FigmaFrame
            alt={f?.name ?? 'WeiWei'}
            src={f?.image2xPng ?? WEIWEI_WZX_FRAMES_BY_ID[WEIWEI_FRAMES.home[0]].image2xPng}
            designWidth={f?.width ?? 393}
            designHeight={f?.height ?? 852}
            fit={fit}
            hotspots={getWeiweiHotspots()}
          />
        );
      }
      default:
        return <HomeScreen onOpenApp={() => {}} />;
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#111] text-white flex justify-center items-center overflow-hidden py-4 sm:py-8">
      <div className="relative" style={{ width: 'min(393px, 95vw)', aspectRatio: '393 / 852' }}>
        <div className="absolute inset-0 bg-black rounded-[40px] overflow-hidden shadow-2xl">{renderView()}</div>
        <div className="absolute -inset-2 rounded-[48px] border-[8px] border-[#1a1a1a] ring-1 ring-gray-700 pointer-events-none"></div>
      </div>
    </div>
  );
};

export default App;
