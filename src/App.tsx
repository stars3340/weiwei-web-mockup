import React, { useEffect, useState } from 'react';
import { AppState, AppView } from './types';
import FigmaFrame from './screens/FigmaFrame';
import FigmaGallery from './screens/FigmaGallery';
import HomeScreen from './screens/HomeScreen';
import ShieldOverlay from './screens/ShieldOverlay';
import SimulatedApp from './screens/SimulatedApp';
import { WEIWEI_WZX_FRAMES_BY_ID } from './figma/weiwei-wzx';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    currentView: AppView.OS_HOME,
    intensity: 'standard',
    stats: {
      attempts: 3,
      returns: 3
    },
  });

  const navigateTo = (view: AppView) => setState((prev) => ({ ...prev, currentView: view }));
  const updateState = (updates: Partial<AppState>) => setState((prev) => ({ ...prev, ...updates }));

  useEffect(() => {
    if (state.currentView !== AppView.SESSION_BREATHING) return;
    const t = setTimeout(() => {
      setState((prev) => ({ ...prev, currentView: AppView.SESSION_CHECKIN }));
    }, 16_000);
    return () => clearTimeout(t);
  }, [state.currentView]);

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
        return (
          <FigmaFrame
            alt={f?.name ?? 'Figma Frame'}
            src={f?.image2xPng ?? WEIWEI_WZX_FRAMES_BY_ID['1:1768'].image2xPng}
            designWidth={f?.width ?? 393}
            designHeight={f?.height ?? 852}
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
                navigateTo(AppView.WEIWEI_HOME);
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
              navigateTo(AppView.SESSION_FEELING);
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
            onBackToSafety={() => navigateTo(AppView.SESSION_FEELING)}
            onHome={() => navigateTo(AppView.OS_HOME)}
          />
        );
      case AppView.WEIWEI_HOME:
        return (
          <FigmaFrame
            alt="WeiWei Home"
            src={WEIWEI_WZX_FRAMES_BY_ID['1:1768'].image2xPng}
            hotspots={[
              { id: 'close', ariaLabel: 'Close', x: 55, y: 240, w: 44, h: 44, onClick: () => navigateTo(AppView.OS_HOME) },
              { id: 'start', ariaLabel: 'Start session', x: 260, y: 620, w: 90, h: 90, onClick: () => navigateTo(AppView.SESSION_FEELING) },
              { id: 'tab_trends', ariaLabel: 'Trends', x: 107, y: 744, w: 56, h: 54, onClick: () => navigateTo(AppView.TRENDS) },
              { id: 'tab_home', ariaLabel: 'Home', x: 163, y: 744, w: 67, h: 54, onClick: () => navigateTo(AppView.SESSION_FEELING) },
              { id: 'tab_guard', ariaLabel: 'Guard settings', x: 230, y: 744, w: 47, h: 54, onClick: () => navigateTo(AppView.GUARD_SETTINGS) },
            ]}
          />
        );
      case AppView.SESSION_FEELING:
        return (
          <FigmaFrame
            alt="Feeling selection"
            src={WEIWEI_WZX_FRAMES_BY_ID['1:336'].image2xPng}
            hotspots={[
              { id: 'back', ariaLabel: 'Back', x: 18, y: 33, w: 90, h: 90, onClick: () => navigateTo(AppView.WEIWEI_HOME) },
              { id: 'settings', ariaLabel: 'Guard settings', x: 325, y: 51, w: 40, h: 40, onClick: () => navigateTo(AppView.GUARD_SETTINGS) },
              { id: 'opt1', ariaLabel: 'Option 1', x: 80, y: 470, w: 260, h: 75, onClick: () => navigateTo(AppView.SESSION_BREATHING) },
              { id: 'opt2', ariaLabel: 'Option 2', x: 80, y: 545, w: 260, h: 75, onClick: () => navigateTo(AppView.SESSION_BREATHING) },
              { id: 'opt3', ariaLabel: 'Option 3', x: 80, y: 620, w: 260, h: 75, onClick: () => navigateTo(AppView.SESSION_BREATHING) },
              { id: 'tab_trends', ariaLabel: 'Trends', x: 107, y: 744, w: 56, h: 54, onClick: () => navigateTo(AppView.TRENDS) },
              { id: 'tab_home', ariaLabel: 'Home', x: 163, y: 744, w: 67, h: 54, onClick: () => navigateTo(AppView.SESSION_FEELING) },
              { id: 'tab_guard', ariaLabel: 'Guard settings', x: 230, y: 744, w: 47, h: 54, onClick: () => navigateTo(AppView.GUARD_SETTINGS) },
            ]}
          />
        );
      case AppView.SESSION_BREATHING:
        return (
          <FigmaFrame
            alt="Breathing"
            src={WEIWEI_WZX_FRAMES_BY_ID['1:415'].image2xPng}
            hotspots={[
              { id: 'back', ariaLabel: 'Back', x: 18, y: 33, w: 90, h: 90, onClick: () => navigateTo(AppView.SESSION_FEELING) },
              { id: 'skip', ariaLabel: 'Skip', x: 55, y: 149, w: 285, h: 285, onClick: () => navigateTo(AppView.SESSION_CHECKIN) },
              { id: 'tab_trends', ariaLabel: 'Trends', x: 107, y: 744, w: 56, h: 54, onClick: () => navigateTo(AppView.TRENDS) },
              { id: 'tab_home', ariaLabel: 'Home', x: 163, y: 744, w: 67, h: 54, onClick: () => navigateTo(AppView.SESSION_FEELING) },
              { id: 'tab_guard', ariaLabel: 'Guard settings', x: 230, y: 744, w: 47, h: 54, onClick: () => navigateTo(AppView.GUARD_SETTINGS) },
            ]}
          />
        );
      case AppView.SESSION_CHECKIN:
        return (
          <FigmaFrame
            alt="Check-in"
            src={WEIWEI_WZX_FRAMES_BY_ID['1:743'].image2xPng}
            hotspots={[
              { id: 'back', ariaLabel: 'Back', x: 18, y: 33, w: 90, h: 90, onClick: () => navigateTo(AppView.SESSION_FEELING) },
              { id: 'ans1', ariaLabel: 'Answer 1', x: 115, y: 590, w: 170, h: 42, onClick: () => navigateTo(AppView.SESSION_DESIRE) },
              { id: 'ans2', ariaLabel: 'Answer 2', x: 115, y: 632, w: 170, h: 42, onClick: () => navigateTo(AppView.SESSION_DESIRE) },
              { id: 'ans3', ariaLabel: 'Answer 3', x: 115, y: 674, w: 170, h: 42, onClick: () => navigateTo(AppView.SESSION_DESIRE) },
              { id: 'tab_trends', ariaLabel: 'Trends', x: 107, y: 744, w: 56, h: 54, onClick: () => navigateTo(AppView.TRENDS) },
              { id: 'tab_home', ariaLabel: 'Home', x: 163, y: 744, w: 67, h: 54, onClick: () => navigateTo(AppView.SESSION_FEELING) },
              { id: 'tab_guard', ariaLabel: 'Guard settings', x: 230, y: 744, w: 47, h: 54, onClick: () => navigateTo(AppView.GUARD_SETTINGS) },
            ]}
          />
        );
      case AppView.SESSION_DESIRE:
        return (
          <FigmaFrame
            alt="Desire"
            src={WEIWEI_WZX_FRAMES_BY_ID['1:861'].image2xPng}
            hotspots={[
              { id: 'back', ariaLabel: 'Back', x: 18, y: 33, w: 90, h: 90, onClick: () => navigateTo(AppView.SESSION_FEELING) },
              { id: 'settings', ariaLabel: 'Guard settings', x: 325, y: 51, w: 40, h: 40, onClick: () => navigateTo(AppView.GUARD_SETTINGS) },
              { id: 'eat', ariaLabel: 'Eat', x: 80, y: 470, w: 260, h: 75, onClick: () => navigateTo(AppView.SESSION_ACTIONS) },
              { id: 'wait', ariaLabel: 'Wait', x: 80, y: 545, w: 260, h: 75, onClick: () => navigateTo(AppView.SESSION_ACTIONS) },
              { id: 'cry', ariaLabel: 'Cry', x: 80, y: 620, w: 260, h: 75, onClick: () => navigateTo(AppView.SESSION_ACTIONS) },
              { id: 'tab_trends', ariaLabel: 'Trends', x: 107, y: 744, w: 56, h: 54, onClick: () => navigateTo(AppView.TRENDS) },
              { id: 'tab_home', ariaLabel: 'Home', x: 163, y: 744, w: 67, h: 54, onClick: () => navigateTo(AppView.SESSION_FEELING) },
              { id: 'tab_guard', ariaLabel: 'Guard settings', x: 230, y: 744, w: 47, h: 54, onClick: () => navigateTo(AppView.GUARD_SETTINGS) },
            ]}
          />
        );
      case AppView.SESSION_ACTIONS:
        return (
          <FigmaFrame
            alt="Actions"
            src={WEIWEI_WZX_FRAMES_BY_ID['1:1169'].image2xPng}
            hotspots={[
              { id: 'back', ariaLabel: 'Back', x: 18, y: 33, w: 90, h: 90, onClick: () => navigateTo(AppView.SESSION_DESIRE) },
              { id: 'act1', ariaLabel: 'Action 1', x: 80, y: 470, w: 260, h: 75, onClick: () => navigateTo(AppView.SESSION_BREATHING) },
              { id: 'act2', ariaLabel: 'Action 2', x: 80, y: 545, w: 260, h: 75, onClick: () => navigateTo(AppView.SESSION_CHECKIN) },
              { id: 'act3', ariaLabel: 'Action 3', x: 80, y: 620, w: 260, h: 75, onClick: () => navigateTo(AppView.SESSION_CHECKIN) },
              { id: 'tab_trends', ariaLabel: 'Trends', x: 107, y: 744, w: 56, h: 54, onClick: () => navigateTo(AppView.TRENDS) },
              { id: 'tab_home', ariaLabel: 'Home', x: 163, y: 744, w: 67, h: 54, onClick: () => navigateTo(AppView.SESSION_FEELING) },
              { id: 'tab_guard', ariaLabel: 'Guard settings', x: 230, y: 744, w: 47, h: 54, onClick: () => navigateTo(AppView.GUARD_SETTINGS) },
            ]}
          />
        );
      case AppView.TRENDS:
        return (
          <FigmaFrame
            alt="Trends"
            src={WEIWEI_WZX_FRAMES_BY_ID['1:1887'].image2xPng}
            hotspots={[
              { id: 'tab_trends', ariaLabel: 'Trends', x: 107, y: 744, w: 56, h: 54, onClick: () => navigateTo(AppView.TRENDS) },
              { id: 'tab_home', ariaLabel: 'Home', x: 163, y: 744, w: 67, h: 54, onClick: () => navigateTo(AppView.SESSION_FEELING) },
              { id: 'tab_guard', ariaLabel: 'Guard settings', x: 230, y: 744, w: 47, h: 54, onClick: () => navigateTo(AppView.GUARD_SETTINGS) },
              { id: 'back', ariaLabel: 'Back', x: 0, y: 0, w: 120, h: 120, onClick: () => navigateTo(AppView.WEIWEI_HOME) },
            ]}
          />
        );
      case AppView.GUARD_SETTINGS:
        return (
          <FigmaFrame
            alt="Guard settings"
            src={WEIWEI_WZX_FRAMES_BY_ID['1:1962'].image2xPng}
            hotspots={[
              { id: 'tab_trends', ariaLabel: 'Trends', x: 107, y: 744, w: 56, h: 54, onClick: () => navigateTo(AppView.TRENDS) },
              { id: 'tab_home', ariaLabel: 'Home', x: 163, y: 744, w: 67, h: 54, onClick: () => navigateTo(AppView.SESSION_FEELING) },
              { id: 'tab_guard', ariaLabel: 'Guard settings', x: 230, y: 744, w: 47, h: 54, onClick: () => navigateTo(AppView.GUARD_SETTINGS) },
              { id: 'back', ariaLabel: 'Back', x: 0, y: 0, w: 120, h: 120, onClick: () => navigateTo(AppView.WEIWEI_HOME) },
            ]}
          />
        );
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
