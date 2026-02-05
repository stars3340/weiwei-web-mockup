import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppState, AppView } from './types';
import FigmaFrame from './screens/FigmaFrame';
import FigmaGallery from './screens/FigmaGallery';
import DemoVideos from './screens/DemoVideos';
import HomeScreen from './screens/HomeScreen';
import ShieldOverlay from './screens/ShieldOverlay';
import SimulatedApp from './screens/SimulatedApp';
import WeiweiApp from './screens/WeiweiApp';
import { getWeiweiWzxFrameSvg } from './figma/weiwei-wzx-svgs';
import { WEIWEI_WZX_FRAMES_BY_ID } from './figma/weiwei-wzx';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    currentView: AppView.OS_HOME,
    guard: {
      enabled: false,
      intensity: 'standard',
      window: { startMinutes: 21 * 60 + 30, endMinutes: 1 * 60 + 30 },
      minActionSeconds: 90,
      updatedAt: Date.now(),
    },
    stats: {
      attempts: 3,
      returns: 3,
    },
  });

  const navigateTo = (view: AppView) => setState((prev) => ({ ...prev, currentView: view }));
  const updateState = (updates: Partial<AppState>) => setState((prev) => ({ ...prev, ...updates }));

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

  // NOTE: WeiWei main demo uses real components, not frame images.
  // Keep Figma frame rendering inside the gallery only.

  const renderView = () => {
    switch (state.currentView) {
      case AppView.FIGMA_GALLERY:
        return { key: 'FIGMA_GALLERY', node: (
          <FigmaGallery
            onClose={() => navigateTo(AppView.OS_HOME)}
            onOpenVideos={() => navigateTo(AppView.DEMO_VIDEOS)}
            onOpenFrame={(frameId) => setState((prev) => ({ ...prev, currentView: AppView.FIGMA_FRAME, figmaFrameId: frameId }))}
          />
        ) };
      case AppView.DEMO_VIDEOS:
        return { key: 'DEMO_VIDEOS', node: <DemoVideos onClose={() => navigateTo(AppView.FIGMA_GALLERY)} /> };
      case AppView.FIGMA_FRAME: {
        const f = state.figmaFrameId ? WEIWEI_WZX_FRAMES_BY_ID[state.figmaFrameId] : undefined;
        const fit = f && (f.width !== 393 || f.height !== 852) ? 'contain' : 'fill';
        return { key: `FIGMA_FRAME:${f?.id ?? 'unknown'}`, node: (
          <FigmaFrame
            alt={f?.name ?? 'Figma Frame'}
            src={getWeiweiWzxFrameSvg(f?.id ?? '') ?? f?.image2xPng ?? WEIWEI_WZX_FRAMES_BY_ID['1:1768'].image2xPng}
            designWidth={f?.width ?? 393}
            designHeight={f?.height ?? 852}
            fit={fit}
            hotspots={[
              { id: 'back', ariaLabel: 'Back to gallery', x: 12, y: 12, w: 120, h: 80, onClick: () => navigateTo(AppView.FIGMA_GALLERY) },
            ]}
          />
        ) };
      }
      case AppView.OS_HOME:
        return { key: 'OS_HOME', node: (
          <HomeScreen 
            onOpenGallery={() => navigateTo(AppView.FIGMA_GALLERY)}
            onOpenApp={(appName) => {
              if (appName === 'Meituan') {
                if (state.guard.enabled) navigateTo(AppView.MEITUAN_SHIELD);
                else navigateTo(AppView.MEITUAN_APP);
              } else if (appName === 'WeiWei') {
                updateState({ currentView: AppView.WEIWEI_APP, weiweiLaunchMode: undefined });
              }
            }}
          />
        ) };
      case AppView.MEITUAN_SHIELD:
        return { key: 'MEITUAN_SHIELD', node: (
          <ShieldOverlay 
            intensity={state.guard.intensity}
            onReturnToFocus={() => {
              updateState({
                stats: { ...state.stats, returns: state.stats.returns + 1 },
                currentView: AppView.WEIWEI_APP,
                weiweiLaunchMode: 'intercepted',
              });
            }}
            onIgnore={() => {
              updateState({ stats: { ...state.stats, attempts: state.stats.attempts + 1 } });
              navigateTo(AppView.MEITUAN_APP);
            }}
          />
        ) };
      case AppView.MEITUAN_APP:
        return { key: 'MEITUAN_APP', node: (
          <SimulatedApp 
            onBackToSafety={() => updateState({ currentView: AppView.WEIWEI_APP, weiweiLaunchMode: 'intercepted' })}
            onHome={() => navigateTo(AppView.OS_HOME)}
          />
        ) };
      case AppView.WEIWEI_APP:
        return { key: 'WEIWEI', node: (
          <WeiweiApp
            state={state}
            onUpdate={updateState}
            onExit={() => navigateTo(AppView.OS_HOME)}
            onProceedToTargetApp={() => {
              updateState({
                currentView: AppView.MEITUAN_APP,
                stats: { ...state.stats, attempts: state.stats.attempts + 1 },
              });
            }}
          />
        ) };
      default:
        return { key: 'DEFAULT', node: <HomeScreen onOpenApp={() => {}} /> };
    }
  };

  const view = useMemo(() => renderView(), [state]);

  const viewAnim = view.anim ?? { type: 'fade' as const, dir: 0 };

  const screenVariants = {
    initial: (custom: { type: 'fade' | 'slide'; dir: number }) => {
      if (custom.type === 'slide') {
        return { x: custom.dir > 0 ? 28 : -28, opacity: 0.0 };
      }
      return { opacity: 0.0, scale: 0.995 };
    },
    animate: { x: 0, opacity: 1, scale: 1 },
    exit: (custom: { type: 'fade' | 'slide'; dir: number }) => {
      if (custom.type === 'slide') {
        return { x: custom.dir > 0 ? -28 : 28, opacity: 0.0 };
      }
      return { opacity: 0.0, scale: 1.005 };
    },
  } as const;

  return (
    <div className="min-h-screen w-full bg-[#111] text-white flex justify-center items-center overflow-hidden py-4 sm:py-8">
      <div className="relative" style={{ width: 'min(393px, 95vw)', aspectRatio: '393 / 852' }}>
        <div className="absolute inset-0 bg-black rounded-[40px] overflow-hidden shadow-2xl">
          <AnimatePresence mode="sync" initial={false}>
            <motion.div
              key={view.key}
              className="w-full h-full"
              custom={viewAnim}
              variants={screenVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.16, ease: 'easeOut' }}
            >
              {view.node}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="absolute -inset-2 rounded-[48px] border-[8px] border-[#1a1a1a] ring-1 ring-gray-700 pointer-events-none"></div>
      </div>
    </div>
  );
};

export default App;
