import React, { useEffect, useRef, useState } from 'react';

export type FigmaHotspot = {
  id: string;
  ariaLabel: string;
  x: number;
  y: number;
  w: number;
  h: number;
  onClick: () => void;
};

type Props = {
  alt: string;
  src: string;
  hotspots?: FigmaHotspot[];
  designWidth?: number;
  designHeight?: number;
  fit?: 'fill' | 'contain';
};

export default function FigmaFrame({ alt, src, hotspots = [], designWidth = 393, designHeight = 852, fit = 'fill' }: Props) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [nextSrc, setNextSrc] = useState<string | null>(null);
  const [nextReady, setNextReady] = useState(false);
  const nextSrcRef = useRef<string | null>(null);

  useEffect(() => {
    if (src === currentSrc) return;
    let cancelled = false;
    setNextSrc(src);
    nextSrcRef.current = src;
    setNextReady(false);

    const img = new Image();
    img.src = src;
    img.onload = () => {
      if (cancelled) return;
      setNextReady(true);
    };
    img.onerror = () => {
      if (cancelled) return;
      setCurrentSrc(src);
      setNextSrc(null);
      nextSrcRef.current = null;
      setNextReady(false);
    };

    return () => {
      cancelled = true;
    };
  }, [src, currentSrc]);

  const commitNext = () => {
    const candidate = nextSrcRef.current;
    if (!candidate) return;
    if (!nextReady) return;
    setCurrentSrc(candidate);
    setNextSrc(null);
    nextSrcRef.current = null;
    setNextReady(false);
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      <img
        alt={alt}
        src={currentSrc}
        className="absolute inset-0 w-full h-full pointer-events-none select-none"
        style={{ objectFit: fit }}
        draggable={false}
      />
      {nextSrc && (
        <img
          alt={alt}
          src={nextSrc}
          className="absolute inset-0 w-full h-full pointer-events-none select-none transition-opacity duration-200"
          style={{ objectFit: fit, opacity: nextReady ? 1 : 0 }}
          onTransitionEnd={commitNext}
          draggable={false}
        />
      )}
      {hotspots.map((h) => (
        <button
          key={h.id}
          type="button"
          aria-label={h.ariaLabel}
          onClick={h.onClick}
          className="absolute bg-transparent cursor-pointer"
          style={{
            left: `${(h.x / designWidth) * 100}%`,
            top: `${(h.y / designHeight) * 100}%`,
            width: `${(h.w / designWidth) * 100}%`,
            height: `${(h.h / designHeight) * 100}%`,
          }}
        />
      ))}
    </div>
  );
}
