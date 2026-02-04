import React from 'react';
import AppIcon from './AppIcon';

interface Props {
  onOpenApp: (appName: string) => void;
  onOpenGallery?: () => void;
}

const HomeScreen: React.FC<Props> = ({ onOpenApp, onOpenGallery }) => {
  const currentTime = '21:30';

  return (
    <div className="relative w-full h-full overflow-hidden animate-fade-in">
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(180deg, #FEDCFF 0%, #D1FAFF 100%)' }}
      />
      <div
        className="absolute"
        style={{ left: -149, top: 138, width: 346, height: 352, background: '#FFF8D9', filter: 'blur(300px)' }}
      />
      <div
        className="absolute"
        style={{ left: 220, top: 294, width: 276, height: 281, background: '#FFF8D9', filter: 'blur(300px)' }}
      />
      
      {/* iOS Status Bar */}
      <div className="absolute top-0 w-full px-6 py-3 flex justify-between items-center text-[#1D2547] z-20">
        <button type="button" onClick={onOpenGallery} className="font-bold text-sm tracking-wide">
          {currentTime}
        </button>
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px]">signal_cellular_alt</span>
          <span className="material-symbols-outlined text-[16px]">wifi</span>
          <span className="material-symbols-outlined text-[16px]">battery_full</span>
        </div>
      </div>

      {/* App Grid */}
      <div className="w-full h-full pt-16 px-6 grid grid-cols-4 gap-y-8 gap-x-4 content-start">
        <AppIcon name="meituan" onClick={() => onOpenApp('Meituan')} />
        <AppIcon name="weiwei" onClick={() => onOpenApp('WeiWei')} />
        <AppIcon name="photos" />
        <AppIcon name="camera" />
        <AppIcon name="weather" />
        <AppIcon name="notes" />
        <AppIcon name="maps" />
        <AppIcon name="settings" />
        <AppIcon name="appstore" />
        <AppIcon name="wallet" />
      </div>

      {/* Dock */}
      <div className="absolute bottom-4 left-4 right-4 h-24 bg-white/35 backdrop-blur-xl rounded-[32px] flex items-center justify-around px-2 z-10 border border-white/40">
        {['Phone', 'Safari', 'Messages', 'Music'].map((app, i) => (
           <div key={i} className="flex flex-col items-center cursor-pointer group">
             <div className={`size-[60px] rounded-[14px] flex items-center justify-center shadow-lg group-active:scale-90 transition-transform duration-200 ${
               ['bg-green-500', 'bg-blue-500', 'bg-green-500', 'bg-red-500'][i]
             }`}>
               <span className="material-symbols-outlined text-white text-[28px]">
                 {['call', 'public', 'chat_bubble', 'music_note'][i]}
               </span>
             </div>
           </div>
        ))}
      </div>
      
      {/* Page Dots */}
      <div className="absolute bottom-[120px] left-0 right-0 flex justify-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-[#1D2547]"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-[#1D2547]/30"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-[#1D2547]/30"></div>
      </div>
    </div>
  );
};

export default HomeScreen;
