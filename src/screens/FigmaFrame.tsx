import React from 'react';

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
  return (
    <div className="relative w-full h-full overflow-hidden">
      <img
        alt={alt}
        src={src}
        className="absolute inset-0 w-full h-full pointer-events-none select-none"
        style={{ objectFit: fit }}
        draggable={false}
      />
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
