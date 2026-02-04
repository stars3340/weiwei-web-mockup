import React, { useEffect, useState } from 'react';
import { AppState, AppView } from './types';
import FigmaFrame from './screens/FigmaFrame';
import HomeScreen from './screens/HomeScreen';
import ShieldOverlay from './screens/ShieldOverlay';
import SimulatedApp from './screens/SimulatedApp';

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

  const FIGMA = {
    weweiHome: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/5803d9a7-0186-4be5-89c9-554dc1edf140',
    feeling: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/6050534e-e04f-4a6f-9a4c-d4e9e8f93f1d',
    breathing: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/6e0d63e2-67e1-4145-9c32-aedf6b55be3b',
    desire: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/8838c6db-0748-47db-baf0-37b2ebf4e5da',
    actions: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/c0f08753-c6fc-4304-9021-9543e4ea3013',
    checkin: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/78d30bcb-0892-4322-b23e-9b7bae4f018c',
    trends: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/bf2f6ec1-065e-41ce-a806-42738794adf6',
    guard: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/4d024f65-5ccd-41cd-95e6-6cea478d1199',
  } as const;

  useEffect(() => {
    if (state.currentView !== AppView.SESSION_BREATHING) return;
    const t = setTimeout(() => {
      setState((prev) => ({ ...prev, currentView: AppView.SESSION_CHECKIN }));
    }, 16_000);
    return () => clearTimeout(t);
  }, [state.currentView]);

  const renderView = () => {
    switch (state.currentView) {
      case AppView.OS_HOME:
        return (
          <HomeScreen 
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
            src={FIGMA.weweiHome}
            hotspots={[
              { id: 'close', ariaLabel: 'Close', x: 55, y: 240, w: 44, h: 44, onClick: () => navigateTo(AppView.OS_HOME) },
              { id: 'start', ariaLabel: 'Start session', x: 250, y: 600, w: 120, h: 160, onClick: () => navigateTo(AppView.SESSION_FEELING) },
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
            src={FIGMA.feeling}
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
            src={FIGMA.breathing}
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
            src={FIGMA.checkin}
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
            src={FIGMA.desire}
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
            src={FIGMA.actions}
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
            src={FIGMA.trends}
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
            src={FIGMA.guard}
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
      {/* 
        Fixed Container to simulate mobile view.
        overflow-hidden here ensures no outer scroll.
        Inner components must handle their own scrolling via flex-1 overflow-y-auto 
      */}
      <div className="w-[393px] h-[852px] max-w-[95vw] max-h-[90vh] bg-black relative shadow-2xl rounded-[48px] border-[8px] border-[#1a1a1a] ring-1 ring-gray-700 overflow-hidden flex flex-col">
        {renderView()}
        
        {/* iOS Home Indicator */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full z-[100] pointer-events-none"></div>
      </div>
    </div>
  );
};

export default App;
