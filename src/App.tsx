import React, { useEffect, useState } from 'react';
import { AppState, AppView } from './types';
import FigmaFrame, { type FigmaHotspot } from './screens/FigmaFrame';
import FigmaGallery from './screens/FigmaGallery';
import HomeScreen from './screens/HomeScreen';
import ShieldOverlay from './screens/ShieldOverlay';
import SimulatedApp from './screens/SimulatedApp';
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

  const navigateTo = (view: AppView) => setState((prev) => ({ ...prev, currentView: view }));
  const updateState = (updates: Partial<AppState>) => setState((prev) => ({ ...prev, ...updates }));

  const openWeiweiFrame = (frameId: string, opts?: { replace?: boolean }) => {
    setState((prev) => {
      const nextStack = [...(prev.weiweiStack ?? [])];
      if (opts?.replace) {
        if (nextStack.length > 0) nextStack[nextStack.length - 1] = frameId;
        else nextStack.push(frameId);
      } else {
        nextStack.push(frameId);
      }
      return { ...prev, currentView: AppView.WEIWEI_FIGMA, weiweiFrameId: frameId, weiweiStack: nextStack, flowCursor: (prev.flowCursor ?? 0) + 1 };
    });
  };

  const enterWeiwei = () => {
    setState((prev) => ({
      ...prev,
      currentView: AppView.WEIWEI_FIGMA,
      weiweiFrameId: WEIWEI_FRAMES.home[0],
      weiweiStack: [WEIWEI_FRAMES.home[0]],
      flowCursor: (prev.flowCursor ?? 0) + 1,
    }));
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
    const t = setTimeout(() => {
      const cursor = (state.flowCursor ?? 0) + 1;
      const nextCheckin = nextFrameId(WEIWEI_FRAMES.checkin, cursor);
      openWeiweiFrame(nextCheckin);
    }, 16_000);
    return () => clearTimeout(t);
  }, [state.currentView, state.weiweiFrameId, state.flowCursor]);

  const getWeiweiHotspots = () => {
    const frameId = state.weiweiFrameId ?? WEIWEI_FRAMES.home[0];
    const cursor = state.flowCursor ?? 0;

    const hotspots: FigmaHotspot[] = [];

    // Top nav
    const isHome = isFrameInCategory(frameId, 'home');
    if (!isHome) {
      hotspots.push({ id: 'back', ariaLabel: 'Back', x: 0, y: 0, w: 120, h: 120, onClick: popWeiweiFrame });
    } else {
      hotspots.push({ id: 'exit', ariaLabel: 'Exit', x: 40, y: 220, w: 80, h: 80, onClick: () => navigateTo(AppView.OS_HOME) });
    }
    hotspots.push({ id: 'settings', ariaLabel: 'Guard settings', x: 315, y: 35, w: 78, h: 90, onClick: () => openWeiweiFrame(nextFrameId(WEIWEI_FRAMES.guard, cursor), { replace: true }) });

    // Bottom tabs (common placement across iPhone frames)
    hotspots.push({ id: 'tab_trends', ariaLabel: 'Trends', x: 107, y: 744, w: 56, h: 90, onClick: () => openWeiweiFrame(WEIWEI_FRAMES.trends[0], { replace: true }) });
    hotspots.push({ id: 'tab_home', ariaLabel: 'Home', x: 163, y: 744, w: 67, h: 90, onClick: () => openWeiweiFrame(WEIWEI_FRAMES.home[0], { replace: true }) });
    hotspots.push({ id: 'tab_guard', ariaLabel: 'Guard', x: 230, y: 744, w: 47, h: 90, onClick: () => openWeiweiFrame(WEIWEI_FRAMES.guard[0], { replace: true }) });

    // Main flow actions by category
    if (isFrameInCategory(frameId, 'home')) {
      hotspots.push({ id: 'start', ariaLabel: 'Start', x: 245, y: 600, w: 110, h: 120, onClick: () => openWeiweiFrame(nextFrameId(WEIWEI_FRAMES.feeling, cursor)) });
    }

    if (isFrameInCategory(frameId, 'feeling')) {
      hotspots.push({ id: 'feeling_1', ariaLabel: 'Feeling 1', x: 70, y: 460, w: 280, h: 95, onClick: () => openWeiweiFrame(nextFrameId(WEIWEI_FRAMES.breathing, cursor)) });
      hotspots.push({ id: 'feeling_2', ariaLabel: 'Feeling 2', x: 70, y: 535, w: 280, h: 95, onClick: () => openWeiweiFrame(nextFrameId(WEIWEI_FRAMES.breathing, cursor + 1)) });
      hotspots.push({ id: 'feeling_3', ariaLabel: 'Feeling 3', x: 70, y: 610, w: 280, h: 95, onClick: () => openWeiweiFrame(nextFrameId(WEIWEI_FRAMES.breathing, cursor + 2)) });
    }

    if (isFrameInCategory(frameId, 'breathing')) {
      hotspots.push({ id: 'breathe_center', ariaLabel: 'Continue', x: 50, y: 120, w: 300, h: 520, onClick: () => openWeiweiFrame(nextFrameId(WEIWEI_FRAMES.checkin, cursor)) });
    }

    if (isFrameInCategory(frameId, 'checkin')) {
      hotspots.push({ id: 'ans_1', ariaLabel: 'Answer 1', x: 115, y: 585, w: 180, h: 48, onClick: () => openWeiweiFrame(nextFrameId(WEIWEI_FRAMES.desire, cursor)) });
      hotspots.push({ id: 'ans_2', ariaLabel: 'Answer 2', x: 115, y: 626, w: 180, h: 48, onClick: () => openWeiweiFrame(nextFrameId(WEIWEI_FRAMES.desire, cursor + 1)) });
      hotspots.push({ id: 'ans_3', ariaLabel: 'Answer 3', x: 115, y: 668, w: 180, h: 48, onClick: () => openWeiweiFrame(nextFrameId(WEIWEI_FRAMES.desire, cursor + 2)) });
    }

    if (isFrameInCategory(frameId, 'desire')) {
      hotspots.push({ id: 'desire_1', ariaLabel: 'Desire 1', x: 70, y: 460, w: 280, h: 95, onClick: () => openWeiweiFrame(nextFrameId(WEIWEI_FRAMES.actions, cursor)) });
      hotspots.push({ id: 'desire_2', ariaLabel: 'Desire 2', x: 70, y: 535, w: 280, h: 95, onClick: () => openWeiweiFrame(nextFrameId(WEIWEI_FRAMES.actions, cursor + 1)) });
      hotspots.push({ id: 'desire_3', ariaLabel: 'Desire 3', x: 70, y: 610, w: 280, h: 95, onClick: () => openWeiweiFrame(nextFrameId(WEIWEI_FRAMES.actions, cursor + 2)) });
    }

    if (isFrameInCategory(frameId, 'actions')) {
      hotspots.push({ id: 'action_1', ariaLabel: 'Action 1', x: 70, y: 460, w: 280, h: 95, onClick: () => openWeiweiFrame(nextFrameId(WEIWEI_FRAMES.breathing, cursor)) });
      hotspots.push({ id: 'action_2', ariaLabel: 'Action 2', x: 70, y: 535, w: 280, h: 95, onClick: () => openWeiweiFrame(nextFrameId(WEIWEI_FRAMES.checkin, cursor)) });
      hotspots.push({ id: 'action_3', ariaLabel: 'Action 3', x: 70, y: 610, w: 280, h: 95, onClick: () => openWeiweiFrame(nextFrameId(WEIWEI_FRAMES.checkin, cursor + 1)) });
    }

    if (isFrameInCategory(frameId, 'guard')) {
      hotspots.push({ id: 'guard_toggle', ariaLabel: 'Toggle', x: 30, y: 100, w: 330, h: 220, onClick: () => openWeiweiFrame(nextFrameId(WEIWEI_FRAMES.guard, cursor + 1), { replace: true }) });
    }

    return hotspots;
  };

  const renderView = () => {
    switch (state.currentView) {
      case AppView.FIGMA_GALLERY:
        return (
          <FigmaGallery
            onClose={() => navigateTo(AppView.OS_HOME)}
            onOpenFrame={(frameId) => setState((prev) => ({ ...prev, currentView: AppView.FIGMA_FRAME, figmaFrameId: frameId }))}
          />
        );
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
                enterWeiwei();
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
              openWeiweiFrame(nextFrameId(WEIWEI_FRAMES.feeling, state.flowCursor ?? 0));
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
            onBackToSafety={() => openWeiweiFrame(nextFrameId(WEIWEI_FRAMES.feeling, state.flowCursor ?? 0))}
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
