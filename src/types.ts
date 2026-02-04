export enum AppView {
  HOME = 'HOME', // Simulated iOS Home Screen
  SHIELD = 'SHIELD', // Simulated System Shield Overlay
  SIMULATED_APP = 'SIMULATED_APP', // The "Forbidden" App (Meituan)
  ONBOARDING = 'ONBOARDING',
  MODE_SELECTION = 'MODE_SELECTION',
  INTENSITY_SELECTION = 'INTENSITY_SELECTION',
  DASHBOARD = 'DASHBOARD',
  SETTINGS = 'SETTINGS',
  RE_ENTRY = 'RE_ENTRY',
  EMOTION_RECOGNITION = 'EMOTION_RECOGNITION',
  ACTION_SUGGESTION = 'ACTION_SUGGESTION',
  BREATHING = 'BREATHING',
  DAILY_REVIEW = 'DAILY_REVIEW',
  WEEKLY_REVIEW = 'WEEKLY_REVIEW'
}

export interface AppState {
  currentView: AppView;
  mode: 'night' | 'allDay';
  intensity: 'standard' | 'strict';
  stats: {
    attempts: number;
    returns: number;
    savedMoney: number;
  };
  selectedEmotion?: string;
}

export type EmotionType = 'hunger' | 'stress' | 'reward' | 'habit';
