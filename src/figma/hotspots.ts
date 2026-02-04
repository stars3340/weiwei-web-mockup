export type Rect = { x: number; y: number; w: number; h: number };

export type WeiweiFrameUi = {
  close?: Rect;
  settings?: Rect;
  bottomNav?: Rect;
  start?: Rect;
  optionRows?: [Rect, Rect, Rect];
  checkinAnswers?: [Rect, Rect, Rect];
  breatheTap?: Rect;
  guardTimeRow?: Rect;
};

// NOTE: All rects are in the frame's design coordinate space (393x852).
// Generated from the local cached Figma file JSON for `weiwei-wzx`.
export const WEIWEI_WZX_FRAME_UI: Record<string, WeiweiFrameUi> = {
  // In-app Home (How you feel today?)
  '1:33': {
    start: { x: 65, y: 196, w: 263.9, h: 265.6 },
  },
  '1:178': {
    start: { x: 65, y: 196, w: 263.9, h: 265.6 },
  },

  // Home / Dashboard
  '1:1768': {
    close: { x: 55, y: 240, w: 20, h: 20 },
    settings: { x: 325, y: 51, w: 40, h: 40 },
    bottomNav: { x: 107, y: 744, w: 170, h: 54 },
    start: { x: 276, y: 641, w: 81, h: 81 },
  },

  // Stage (after returning to focus)
  '1:1695': {
    settings: { x: 325, y: 51, w: 40, h: 40 },
    bottomNav: { x: 107, y: 744, w: 170, h: 54 },
    start: { x: 276, y: 641, w: 81, h: 81 },
  },
  '1:1608': {
    settings: { x: 325, y: 51, w: 40, h: 40 },
    bottomNav: { x: 107, y: 744, w: 170, h: 54 },
    start: { x: 276, y: 641, w: 81, h: 81 },
  },

  // Feeling selection
  '1:336': {
    settings: { x: 325, y: 51, w: 40, h: 40 },
    bottomNav: { x: 107, y: 744, w: 170, h: 54 },
    optionRows: [
      { x: 79, y: 466, w: 290, h: 84.985 },
      { x: 79, y: 540, w: 290, h: 84.98 },
      { x: 78, y: 614, w: 291, h: 84.985 },
    ],
  },

  // Breathing
  '1:415': {
    settings: { x: 325, y: 51, w: 40, h: 40 },
    bottomNav: { x: 107, y: 744, w: 170, h: 54 },
    breatheTap: { x: 79, y: 173, w: 237, h: 237 },
  },
  '1:523': {
    settings: { x: 325, y: 51, w: 40, h: 40 },
    bottomNav: { x: 107, y: 744, w: 170, h: 54 },
    breatheTap: { x: 85, y: 175, w: 228, h: 228 },
  },
  '1:637': {
    settings: { x: 325, y: 51, w: 40, h: 40 },
    bottomNav: { x: 107, y: 744, w: 170, h: 54 },
    breatheTap: { x: 50, y: 164, w: 297, h: 297 },
  },
  '1:469': {
    settings: { x: 325, y: 51, w: 40, h: 40 },
    bottomNav: { x: 107, y: 744, w: 170, h: 54 },
    breatheTap: { x: 79, y: 173, w: 237, h: 237 },
  },
  '1:580': {
    settings: { x: 325, y: 51, w: 40, h: 40 },
    bottomNav: { x: 107, y: 744, w: 170, h: 54 },
    breatheTap: { x: 85, y: 175, w: 228, h: 228 },
  },
  '1:690': {
    settings: { x: 325, y: 51, w: 40, h: 40 },
    bottomNav: { x: 107, y: 744, w: 170, h: 54 },
    breatheTap: { x: 50, y: 164, w: 297, h: 297 },
  },
  '1:1313': {
    settings: { x: 325, y: 51, w: 40, h: 40 },
    bottomNav: { x: 107, y: 744, w: 170, h: 54 },
    breatheTap: { x: 79, y: 173, w: 237, h: 237 },
  },
  '1:1367': {
    settings: { x: 325, y: 51, w: 40, h: 40 },
    bottomNav: { x: 107, y: 744, w: 170, h: 54 },
    breatheTap: { x: 85, y: 175, w: 228, h: 228 },
  },
  '1:1424': {
    settings: { x: 325, y: 51, w: 40, h: 40 },
    bottomNav: { x: 107, y: 744, w: 170, h: 54 },
    breatheTap: { x: 50, y: 164, w: 297, h: 297 },
  },

  // Check-in
  '1:743': {
    settings: { x: 325, y: 51, w: 40, h: 40 },
    bottomNav: { x: 107, y: 744, w: 170, h: 54 },
    checkinAnswers: [
      { x: 111, y: 586, w: 171, h: 51 },
      { x: 111, y: 627, w: 171, h: 51 },
      { x: 111, y: 668, w: 171, h: 51 },
    ],
  },
  '1:1477': {
    settings: { x: 325, y: 51, w: 40, h: 40 },
    bottomNav: { x: 107, y: 744, w: 170, h: 54 },
    checkinAnswers: [
      { x: 111, y: 586, w: 171, h: 51 },
      { x: 111, y: 627, w: 171, h: 51 },
      { x: 111, y: 668, w: 171, h: 51 },
    ],
  },
  '1:802': {
    settings: { x: 325, y: 51, w: 40, h: 40 },
    bottomNav: { x: 107, y: 744, w: 170, h: 54 },
    checkinAnswers: [
      { x: 111, y: 586, w: 171, h: 51 },
      { x: 111, y: 627, w: 171, h: 51 },
      { x: 111, y: 668, w: 171, h: 51 },
    ],
  },

  // Desire selection
  '1:861': {
    settings: { x: 325, y: 51, w: 40, h: 40 },
    bottomNav: { x: 107, y: 744, w: 170, h: 54 },
    optionRows: [
      { x: 78, y: 466, w: 291, h: 84.985 },
      { x: 79, y: 540, w: 290, h: 84.98 },
      { x: 79, y: 614, w: 290, h: 84.985 },
    ],
  },
  '1:938': {
    settings: { x: 325, y: 51, w: 40, h: 40 },
    bottomNav: { x: 107, y: 744, w: 170, h: 54 },
    optionRows: [
      { x: 78, y: 466, w: 291, h: 84.985 },
      { x: 79, y: 540, w: 290, h: 84.98 },
      { x: 79, y: 614, w: 290, h: 84.985 },
    ],
  },
  '1:1092': {
    settings: { x: 325, y: 51, w: 40, h: 40 },
    bottomNav: { x: 107, y: 744, w: 170, h: 54 },
    optionRows: [
      { x: 78, y: 466, w: 291, h: 84.985 },
      { x: 79, y: 540, w: 290, h: 84.98 },
      { x: 79, y: 614, w: 290, h: 84.985 },
    ],
  },
  '1:1015': {
    settings: { x: 325, y: 51, w: 40, h: 40 },
    bottomNav: { x: 107, y: 744, w: 170, h: 54 },
    optionRows: [
      { x: 78, y: 466, w: 291, h: 84.985 },
      { x: 79, y: 540, w: 290, h: 84.98 },
      { x: 79, y: 614, w: 290, h: 84.985 },
    ],
  },

  // Action suggestion
  '1:1169': {
    settings: { x: 325, y: 51, w: 40, h: 40 },
    bottomNav: { x: 107, y: 744, w: 170, h: 54 },
    optionRows: [
      { x: 78, y: 466, w: 291, h: 84.985 },
      { x: 79, y: 540, w: 290, h: 84.98 },
      { x: 79, y: 614, w: 290, h: 84.985 },
    ],
  },
  '1:1536': {
    settings: { x: 325, y: 51, w: 40, h: 40 },
    bottomNav: { x: 107, y: 744, w: 170, h: 54 },
    optionRows: [
      { x: 78, y: 466, w: 291, h: 84.985 },
      { x: 79, y: 540, w: 290, h: 84.98 },
      { x: 79, y: 614, w: 290, h: 84.985 },
    ],
  },
  '1:1241': {
    settings: { x: 325, y: 51, w: 40, h: 40 },
    bottomNav: { x: 107, y: 744, w: 170, h: 54 },
    optionRows: [
      { x: 78, y: 466, w: 291, h: 84.985 },
      { x: 79, y: 540, w: 290, h: 84.98 },
      { x: 79, y: 614, w: 290, h: 84.985 },
    ],
  },

  // Trends
  '1:1887': {
    bottomNav: { x: 107, y: 744, w: 170, h: 54 },
  },

  // Guard config + detail
  '1:1962': {
    bottomNav: { x: 107, y: 744, w: 170, h: 54 },
    guardTimeRow: { x: 20, y: 417, w: 353, h: 60 },
  },
  '1:1830': {
    close: { x: 26, y: 27, w: 20, h: 20 },
    bottomNav: { x: 107, y: 744, w: 170, h: 54 },
    start: { x: 276, y: 641, w: 81, h: 81 },
  },
};

export function getWeiweiFrameUi(frameId: string): WeiweiFrameUi {
  return WEIWEI_WZX_FRAME_UI[frameId] ?? {};
}
