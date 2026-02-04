export const WEIWEI_FRAMES = {
  home: ['1:33', '1:178'],
  stage: ['1:1695', '1:1608'],
  feeling: ['1:336'],
  breathing: ['1:415', '1:523', '1:637', '1:469', '1:580', '1:690', '1:1313', '1:1367', '1:1424'],
  checkin: ['1:743', '1:1477', '1:802'],
  desire: ['1:861', '1:938', '1:1092', '1:1015'],
  actions: ['1:1169', '1:1536', '1:1241'],
  trends: ['1:1887'],
  guard: ['1:1962', '1:1830'],
} as const;

export type WeiweiCategory = keyof typeof WEIWEI_FRAMES;

export function isFrameInCategory(frameId: string, category: WeiweiCategory) {
  return (WEIWEI_FRAMES[category] as readonly string[]).includes(frameId);
}

export function nextFrameId(list: readonly string[], cursor: number) {
  if (list.length === 0) return '';
  return list[cursor % list.length];
}
