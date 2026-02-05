export enum AppView {
  FIGMA_GALLERY = 'FIGMA_GALLERY',
  FIGMA_FRAME = 'FIGMA_FRAME',
  DEMO_VIDEOS = 'DEMO_VIDEOS',

  OS_HOME = 'OS_HOME',
  MEITUAN_SHIELD = 'MEITUAN_SHIELD',
  MEITUAN_APP = 'MEITUAN_APP',

  WEIWEI_APP = 'WEIWEI_APP',
}

export type GuardIntensity = 'standard' | 'strict';

export type ActionType = 'breathing' | 'delay' | 'challenge';

export type EmotionType = 'stress' | 'hunger' | 'habit' | 'comfort';

export interface GuardWindow {
  startMinutes: number; // 0...1439
  endMinutes: number; // 0...1439
}

export interface GuardConfig {
  enabled: boolean;
  intensity: GuardIntensity;
  window: GuardWindow;
  minActionSeconds: number;
  updatedAt: number; // epoch ms
}

export interface GateTicket {
  id: string;
  issuedAt: number; // epoch ms
  validUntil: number; // epoch ms
  consumed: boolean;
  minActionSeconds: number;
}

export interface PendingGateRequest {
  requestedAt: number; // epoch ms
  requiredSeconds: number;
}

export interface AppState {
  currentView: AppView;
  guard: GuardConfig;
  stats: {
    attempts: number;
    returns: number;
    savedMoney?: number;
  };
  selectedEmotion?: EmotionType;
  figmaFrameId?: string;
  weiweiLaunchMode?: 'intercepted' | 'selfInitiated';
  gateTicket?: GateTicket;
  pendingGateRequest?: PendingGateRequest;
}
