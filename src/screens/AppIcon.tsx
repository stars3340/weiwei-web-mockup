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
          <div className="absolute inset-0" style={{ background: '#1D2547' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0))' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <img alt="weiwei" src={WEIWEI_WZX_LOGO_SVG} className="w-[44px] h-[18px]" style={{ filter: 'invert(1)' }} />
          </div>
        </div>
      );
    case 'meituan':
      return (
        <div className="w-full h-full relative overflow-hidden">
          <div className="absolute inset-0" style={{ background: '#FFC300' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.45), rgba(255,255,255,0))' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#1D2547] text-[34px]">lunch_dining</span>
          </div>
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
        </div>
      );
    }
  }
}

export default function AppIcon({ name, onClick }: { name: AppIconName; onClick?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-1.5 cursor-pointer group" onClick={onClick}>
      <div className="size-[60px] rounded-[14px] shadow-[0_10px_22px_rgba(0,0,0,0.18)] overflow-hidden ring-1 ring-white/40 group-active:scale-90 transition-transform duration-150">
        <IconInner name={name} />
      </div>
      <span className="text-[#1D2547] text-[11px] font-medium drop-shadow-sm">{iconLabel[name]}</span>
    </div>
  );
}

