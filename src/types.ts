export enum AppView {
  FIGMA_GALLERY = 'FIGMA_GALLERY',
  FIGMA_FRAME = 'FIGMA_FRAME',
  DEMO_VIDEOS = 'DEMO_VIDEOS',

  OS_HOME = 'OS_HOME',
  MEITUAN_SHIELD = 'MEITUAN_SHIELD',
  MEITUAN_APP = 'MEITUAN_APP',

  WEIWEI_FIGMA = 'WEIWEI_FIGMA',
}

export interface AppState {
  currentView: AppView;
  intensity: 'standard' | 'strict';
  mode?: 'night' | 'allDay';
  stats: {
    attempts: number;
    returns: number;
    savedMoney?: number;
  };
  selectedEmotion?: string;
  figmaFrameId?: string;
  weiweiFrameId?: string;
  weiweiStack?: string[];
  flowCursor?: number;
}

export type EmotionType = 'hunger' | 'stress' | 'reward' | 'habit';
