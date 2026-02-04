import React from 'react';

type VideoItem = {
  title: string;
  src: string;
};

const VIDEOS: VideoItem[] = [
  { title: 'Monster · Idle Calm', src: '/ww_monster_idle_calm.mp4' },
  { title: 'Monster · Idle Coach', src: '/ww_monster_idle_coach.mp4' },
  { title: 'Monster · Act Blink', src: '/ww_monster_act_blink.mp4' },
  { title: 'Monster · Act Happy Pop', src: '/ww_monster_act_happy_pop.mp4' },
];

export default function DemoVideos({ onClose }: { onClose: () => void }) {
  return (
    <div className="w-full h-full bg-black text-white flex flex-col">
      <div className="px-4 py-3 flex items-center gap-3 border-b border-white/10">
        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/15 active:scale-[0.98] transition flex items-center justify-center"
          aria-label="Close"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="font-semibold">Demo Videos</div>
        <div className="flex-1" />
        <div className="text-xs text-white/60">Muted autoplay · Tap for controls</div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 gap-4">
          {VIDEOS.map((v) => (
            <div key={v.src} className="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
              <div className="px-3 py-2 flex items-center justify-between">
                <div className="text-sm font-semibold">{v.title}</div>
                <div className="text-xs text-white/50">{v.src}</div>
              </div>
              <div className="bg-black">
                <video
                  src={v.src}
                  className="w-full h-auto"
                  muted
                  loop
                  playsInline
                  autoPlay
                  controls
                  preload="metadata"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

