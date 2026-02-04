import React, { useMemo, useState } from 'react';
import { WEIWEI_WZX_FRAMES } from '../figma/weiwei-wzx';

type Props = {
  onOpenFrame: (frameId: string) => void;
  onOpenVideos: () => void;
  onClose: () => void;
};

export default function FigmaGallery({ onOpenFrame, onOpenVideos, onClose }: Props) {
  const [query, setQuery] = useState('');
  const frames = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return WEIWEI_WZX_FRAMES;
    return WEIWEI_WZX_FRAMES.filter((f) => `${f.name} ${f.id}`.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="w-full h-full bg-black text-white flex flex-col">
      <div className="px-4 py-3 flex items-center gap-3 border-b border-white/10">
        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/15 active:scale-[0.98] transition flex items-center justify-center"
          aria-label="Close"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        <div className="font-semibold">Figma / weiwei-wzx</div>
        <div className="flex-1" />
        <button
          type="button"
          onClick={onOpenVideos}
          className="px-3 py-2 text-sm rounded-xl bg-white/10 hover:bg-white/15 active:scale-[0.99] transition"
        >
          Videos
        </button>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search frames…"
          className="w-[170px] bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-4">
          {frames.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onOpenFrame(f.id)}
              className="text-left rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 bg-white/5 active:scale-[0.99] transition"
            >
              <div className="relative w-full bg-black" style={{ aspectRatio: `${f.width} / ${f.height}` }}>
                <img alt={f.name} src={f.image2xPng} className="absolute inset-0 w-full h-full" style={{ objectFit: 'contain' }} />
              </div>
              <div className="px-3 py-2">
                <div className="text-sm font-semibold">{f.name}</div>
                <div className="text-xs text-white/60">{f.id}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
