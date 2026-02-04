import React, { useEffect, useRef, useState } from 'react';
import { AppState, AppView } from './types';
import FigmaFrame from './screens/FigmaFrame';
import FigmaGallery from './screens/FigmaGallery';
import DemoVideos from './screens/DemoVideos';
import HomeScreen from './screens/HomeScreen';
import ShieldOverlay from './screens/ShieldOverlay';
import SimulatedApp from './screens/SimulatedApp';
import WeiweiNative from './screens/WeiweiNative';
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
    weiweiNavKind: 'reset',
  });

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const navigateTo = (view: AppView) => setState((prev) => ({ ...prev, currentView: view }));
  const updateState = (updates: Partial<AppState>) => setState((prev) => ({ ...prev, ...updates }));

  const lastNavAtRef = useRef(0);
  const prefetchedUrlsRef = useRef<Set<string>>(new Set());

  const prefetchUrl = (url: string) => {
    if (!url) return;
    if (prefetchedUrlsRef.current.has(url)) return;
    prefetchedUrlsRef.current.add(url);
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
  };

  const prefetchFrame = (frameId: string) => {
    const f = WEIWEI_WZX_FRAMES_BY_ID[frameId];
    if (f?.image2xPng) prefetchUrl(f.image2xPng);
  };

  const openWeiweiFrame = (
    frameId: string,
    opts?: { replace?: boolean; resetStack?: boolean; advanceCursor?: boolean; cursorStep?: number },
  ) => {
    const now = performance.now();
    if (now - lastNavAtRef.current < 140) return;
    lastNavAtRef.current = now;
    prefetchFrame(frameId);
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
      const kind = opts?.resetStack ? 'reset' : opts?.replace ? 'replace' : 'push';
      return {
        ...prev,
        currentView: AppView.WEIWEI_FIGMA,
        weiweiFrameId: frameId,
        weiweiStack: nextStack,
        flowCursor: nextCursor,
        weiweiNavKind: kind,
      };
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
      return { ...prev, currentView: AppView.WEIWEI_FIGMA, weiweiFrameId: frameId, weiweiStack: stack, weiweiNavKind: 'pop' };
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
      openWeiweiFrame(nextCheckin);
    }, 16_000);
    return () => clearTimeout(t);
  }, [state.currentView, state.weiweiFrameId]);

  useEffect(() => {
    if (state.currentView !== AppView.WEIWEI_FIGMA) return;
    const frameId = state.weiweiFrameId;
    if (!frameId) return;

    prefetchFrame(frameId);

    const cursor = state.flowCursor ?? 0;
    const candidates: string[] = [];

    if (isFrameInCategory(frameId, 'home') || isFrameInCategory(frameId, 'stage')) {
      candidates.push(WEIWEI_FRAMES.feeling[0], WEIWEI_FRAMES.guard[0], WEIWEI_FRAMES.trends[0]);
    }
    if (isFrameInCategory(frameId, 'feeling')) {
      candidates.push(...WEIWEI_FRAMES.breathing, WEIWEI_FRAMES.guard[0], WEIWEI_FRAMES.trends[0], WEIWEI_FRAMES.home[0]);
    }
    if (isFrameInCategory(frameId, 'breathing')) {
      candidates.push(...WEIWEI_FRAMES.checkin);
    }
    if (isFrameInCategory(frameId, 'checkin')) {
      candidates.push(...WEIWEI_FRAMES.desire);
    }
    if (isFrameInCategory(frameId, 'desire')) {
      candidates.push(...WEIWEI_FRAMES.actions);
    }
    if (isFrameInCategory(frameId, 'actions')) {
      candidates.push(...WEIWEI_FRAMES.breathing, ...WEIWEI_FRAMES.checkin);
    }
    if (isFrameInCategory(frameId, 'guard')) {
      candidates.push(...WEIWEI_FRAMES.guard, WEIWEI_FRAMES.home[0], WEIWEI_FRAMES.trends[0]);
    }

    // Add a few direct next variants (fast path)
    candidates.push(
      nextFrameId(WEIWEI_FRAMES.checkin, cursor),
      nextFrameId(WEIWEI_FRAMES.desire, cursor),
      nextFrameId(WEIWEI_FRAMES.actions, cursor),
    );

    for (const id of candidates) prefetchFrame(id);
  }, [state.currentView, state.weiweiFrameId, state.flowCursor]);

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
                enterWeiweiAt(WEIWEI_FRAMES.home[0], { advanceCursor: true });
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
        const frameId = state.weiweiFrameId ?? WEIWEI_FRAMES.home[0];
        const cursor = state.flowCursor ?? 0;
        const stackLen = (state.weiweiStack ?? []).length;
        return (
          <WeiweiNative
            frameId={frameId}
            cursor={cursor}
            stackLen={stackLen}
            navKind={state.weiweiNavKind ?? 'replace'}
            onExit={() => navigateTo(AppView.OS_HOME)}
            onPop={popWeiweiFrame}
            onOpen={(id, opts) => openWeiweiFrame(id, { replace: opts?.replace })}
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
