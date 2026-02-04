import React, { useState } from 'react';
import { AppView, AppState } from './types';
import HomeScreen from './screens/HomeScreen';
import ShieldOverlay from './screens/ShieldOverlay';
import SimulatedApp from './screens/SimulatedApp';
import Onboarding from './screens/Onboarding';
import ModeSelection from './screens/ModeSelection';
import IntensitySelection from './screens/IntensitySelection';
import FocusDashboard from './screens/FocusDashboard';
import Settings from './screens/Settings';
import ReEntry from './screens/ReEntry';
import EmotionRecognition from './screens/EmotionRecognition';
import ActionSuggestion from './screens/ActionSuggestion';
import Breathing from './screens/Breathing';
import DailyReview from './screens/DailyReview';
import WeeklyReview from './screens/WeeklyReview';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    currentView: AppView.HOME, // Start at simulated iOS Home
    mode: 'night',
    intensity: 'standard',
    stats: {
      attempts: 3,
      returns: 3,
      savedMoney: 300
    }
  });

  const navigateTo = (view: AppView) => {
    setState(prev => ({ ...prev, currentView: view }));
  };

  const updateState = (updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const renderView = () => {
    switch (state.currentView) {
      case AppView.HOME:
        return (
          <HomeScreen 
            onOpenApp={(appName) => {
              if (appName === 'Meituan') {
                // If dashboard is active (simulated), show shield.
                // For MVP simplicity, we assume the guard is always "on" if they try to open it
                navigateTo(AppView.SHIELD);
              } else if (appName === 'WeiWei' || appName === 'NightGuard') {
                // Determine if we should show onboarding or dashboard
                // For demo, always onboarding if not set up, but let's shortcut to dashboard for dev flow if needed
                navigateTo(AppView.ONBOARDING);
              }
            }}
          />
        );
      case AppView.SHIELD:
        return (
          <ShieldOverlay 
            intensity={state.intensity}
            onReturnToFocus={() => {
              // Success: User chose to sleep immediately at the shield
              updateState({ stats: { ...state.stats, returns: state.stats.returns + 1 } });
              navigateTo(AppView.HOME);
            }}
            onIgnore={() => {
              // Friction: User clicked "Ignore", but we intercept them with the ReEntry flow
              // We log an attempt here
              updateState({ stats: { ...state.stats, attempts: state.stats.attempts + 1 } });
              navigateTo(AppView.RE_ENTRY);
            }}
          />
        );
      case AppView.SIMULATED_APP:
        return (
          <SimulatedApp 
            onBackToSafety={() => navigateTo(AppView.DASHBOARD)}
            onHome={() => navigateTo(AppView.HOME)}
          />
        );
      case AppView.ONBOARDING:
        return <Onboarding onComplete={() => navigateTo(AppView.MODE_SELECTION)} />;
      case AppView.MODE_SELECTION:
        return (
          <ModeSelection 
            selectedMode={state.mode}
            onSelect={(mode) => updateState({ mode })}
            onNext={() => navigateTo(AppView.INTENSITY_SELECTION)}
            onBack={() => navigateTo(AppView.ONBOARDING)}
          />
        );
      case AppView.INTENSITY_SELECTION:
        return (
          <IntensitySelection
            selectedIntensity={state.intensity}
            onSelect={(intensity) => updateState({ intensity })}
            onNext={() => navigateTo(AppView.DASHBOARD)}
            onBack={() => navigateTo(AppView.MODE_SELECTION)}
          />
        );
      case AppView.DASHBOARD:
        return (
          <FocusDashboard 
            stats={state.stats}
            onSimulateInterruption={() => navigateTo(AppView.SHIELD)}
            onEndFocus={() => navigateTo(AppView.DAILY_REVIEW)}
            onHome={() => navigateTo(AppView.HOME)}
            onSettings={() => navigateTo(AppView.SETTINGS)}
          />
        );
      case AppView.SETTINGS:
        return (
          <Settings 
            state={state}
            onUpdate={updateState}
            onBack={() => navigateTo(AppView.DASHBOARD)}
          />
        );
      case AppView.RE_ENTRY:
        return (
          <ReEntry 
            onReturnToFocus={() => {
               // Success: User was intercepted and chose to go back
               updateState({ stats: { ...state.stats, returns: state.stats.returns + 1 } });
               navigateTo(AppView.HOME); // Or Dashboard, but HOME feels like "putting phone down"
            }}
            onNeedToEat={() => navigateTo(AppView.EMOTION_RECOGNITION)}
            onEndFocus={() => navigateTo(AppView.DAILY_REVIEW)}
          />
        );
      case AppView.EMOTION_RECOGNITION:
        return (
          <EmotionRecognition 
            onSelectEmotion={(emotion) => {
              updateState({ selectedEmotion: emotion });
              navigateTo(AppView.ACTION_SUGGESTION);
            }}
            onBack={() => navigateTo(AppView.RE_ENTRY)}
          />
        );
      case AppView.ACTION_SUGGESTION:
        return (
          <ActionSuggestion 
            emotion={state.selectedEmotion as any}
            onActionSelect={(action) => {
              if (action === 'breathing') navigateTo(AppView.BREATHING);
              else navigateTo(AppView.DASHBOARD); 
            }}
            onSurrender={() => {
              // Failure Path: User went through all steps and still wants to eat
              navigateTo(AppView.SIMULATED_APP);
            }}
            onBack={() => navigateTo(AppView.EMOTION_RECOGNITION)}
          />
        );
      case AppView.BREATHING:
        return (
          <Breathing 
            onComplete={() => navigateTo(AppView.DASHBOARD)}
          />
        );
      case AppView.DAILY_REVIEW:
        return (
          <DailyReview 
            stats={state.stats}
            onNext={() => navigateTo(AppView.WEEKLY_REVIEW)}
          />
        );
      case AppView.WEEKLY_REVIEW:
        return (
          <WeeklyReview 
            onRestart={() => navigateTo(AppView.DASHBOARD)}
            onBack={() => navigateTo(AppView.DAILY_REVIEW)}
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
      <div className="w-full max-w-[390px] h-[844px] bg-black relative shadow-2xl rounded-[48px] border-[8px] border-[#1a1a1a] ring-1 ring-gray-700 overflow-hidden flex flex-col">
        {renderView()}
        
        {/* iOS Home Indicator */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full z-[100] pointer-events-none"></div>
      </div>
    </div>
  );
};

export default App;
