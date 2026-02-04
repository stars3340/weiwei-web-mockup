import React from 'react';
import { WEIWEI_WZX_LOGO_SVG } from '../figma/weiwei-wzx';

export type AppIconName = 'meituan' | 'weiwei' | 'photos' | 'camera' | 'weather' | 'notes' | 'maps' | 'settings' | 'appstore' | 'wallet';

const iconLabel: Record<AppIconName, string> = {
  meituan: '美团外卖',
  weiwei: '喂喂',
  photos: 'Photos',
  camera: 'Camera',
  weather: 'Weather',
  notes: 'Notes',
  maps: 'Maps',
  settings: 'Settings',
  appstore: 'App Store',
  wallet: 'Wallet',
};

function IconInner({ name }: { name: AppIconName }) {
  switch (name) {
    case 'weiwei':
      return (
        <div className="w-full h-full relative overflow-hidden">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1D2547 0%, #0E1426 100%)' }} />
          <div className="absolute -inset-10" style={{ background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.16), rgba(255,255,255,0) 55%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0))' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              alt="weiwei"
              src={WEIWEI_WZX_LOGO_SVG}
              className="w-[46px] h-[20px]"
              style={{ filter: 'invert(1) brightness(1.1) contrast(1.1)' }}
              draggable={false}
            />
          </div>
          <div className="absolute inset-0" style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -10px 24px rgba(0,0,0,0.25)' }} />
        </div>
      );
    case 'meituan':
      return (
        <div className="w-full h-full relative overflow-hidden">
          <div className="absolute inset-0" style={{ background: '#FFC300' }} />
          <div className="absolute -inset-10" style={{ background: 'radial-gradient(circle at 25% 20%, rgba(255,255,255,0.55), rgba(255,255,255,0) 52%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.40), rgba(255,255,255,0))' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[38px] h-[38px] rounded-full bg-white/55 border border-white/60 grid place-items-center shadow-[0_8px_18px_rgba(0,0,0,0.14)]">
              <span className="text-[#1D2547] text-[18px] font-[800]">团</span>
            </div>
          </div>
          <div className="absolute inset-0" style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.24), inset 0 -10px 24px rgba(0,0,0,0.18)' }} />
        </div>
      );
    default: {
      const glyph: Record<string, string> = {
        photos: 'photo_library',
        camera: 'photo_camera',
        weather: 'partly_cloudy_day',
        notes: 'description',
        maps: 'map',
        settings: 'settings',
        appstore: 'apps',
        wallet: 'account_balance_wallet',
      };
      const bg: Record<string, string> = {
        photos: 'linear-gradient(135deg,#ff5ea8,#ffd166)',
        camera: 'linear-gradient(135deg,#2b2b2b,#0f0f0f)',
        weather: 'linear-gradient(135deg,#4cc9f0,#4361ee)',
        notes: 'linear-gradient(135deg,#fff8d6,#ffd60a)',
        maps: 'linear-gradient(135deg,#80ed99,#38b000)',
        settings: 'linear-gradient(135deg,#d1d5db,#6b7280)',
        appstore: 'linear-gradient(135deg,#60a5fa,#2563eb)',
        wallet: 'linear-gradient(135deg,#111827,#000000)',
      };
      return (
        <div className="w-full h-full relative overflow-hidden">
          <div className="absolute inset-0" style={{ background: bg[name] ?? '#ddd' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.35), rgba(255,255,255,0))' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-[30px]">{glyph[name]}</span>
          </div>
          <div className="absolute inset-0" style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -10px 24px rgba(0,0,0,0.18)' }} />
        </div>
      );
    }
  }
}

export default function AppIcon({ name, onClick }: { name: AppIconName; onClick?: () => void }) {
  const isInteractive = typeof onClick === 'function';
  const Root: React.ElementType = isInteractive ? 'button' : 'div';

  return (
    <Root
      {...(isInteractive ? { type: 'button' } : {})}
      aria-label={iconLabel[name]}
      {...(isInteractive
        ? {
            onPointerDown: (e: React.PointerEvent) => {
              e.preventDefault();
              onClick?.();
            },
            onKeyDown: (e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            },
          }
        : {})}
      className={[
        'flex flex-col items-center gap-1.5 group select-none',
        isInteractive ? 'cursor-pointer' : 'cursor-default',
        'outline-none focus:outline-none focus-visible:outline-none',
      ].join(' ')}
      style={{ touchAction: 'manipulation' }}
    >
      <div
        className={[
          'size-[60px] rounded-[14px] overflow-hidden',
          'shadow-[0_14px_28px_rgba(0,0,0,0.18)]',
          'ring-1 ring-white/55',
          isInteractive ? 'group-active:scale-[0.92] transition-transform duration-150' : '',
        ].join(' ')}
      >
        <IconInner name={name} />
      </div>
      <span className="text-[#1D2547] text-[11px] font-medium drop-shadow-[0_1px_0_rgba(255,255,255,0.45)]">
        {iconLabel[name]}
      </span>
    </Root>
  );
}
