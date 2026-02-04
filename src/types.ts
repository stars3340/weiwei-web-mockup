export enum AppView {
  OS_HOME = 'OS_HOME',
  MEITUAN_SHIELD = 'MEITUAN_SHIELD',
  MEITUAN_APP = 'MEITUAN_APP',

  WEIWEI_HOME = 'WEIWEI_HOME',
  SESSION_FEELING = 'SESSION_FEELING',
  SESSION_BREATHING = 'SESSION_BREATHING',
  SESSION_DESIRE = 'SESSION_DESIRE',
  SESSION_ACTIONS = 'SESSION_ACTIONS',
  SESSION_CHECKIN = 'SESSION_CHECKIN',

  TRENDS = 'TRENDS',
  GUARD_SETTINGS = 'GUARD_SETTINGS',
}

export interface AppState {
  currentView: AppView;
  intensity: 'standard' | 'strict';
  stats: {
    attempts: number;
    returns: number;
  };
}

export type EmotionType = 'hunger' | 'stress' | 'reward' | 'habit';
