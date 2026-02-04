import React from 'react';

interface Props {
  onOpenApp: (appName: string) => void;
}

const HomeScreen: React.FC<Props> = ({ onOpenApp }) => {
  const currentTime = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <div className="relative w-full h-full bg-cover bg-center overflow-hidden animate-fade-in"
         style={{ backgroundImage: `url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')` }}>
      
      {/* iOS Status Bar */}
      <div className="absolute top-0 w-full px-6 py-3 flex justify-between items-center text-white z-20">
        <span className="font-bold text-sm tracking-wide">{currentTime}</span>
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px]">signal_cellular_alt</span>
          <span className="material-symbols-outlined text-[16px]">wifi</span>
          <span className="material-symbols-outlined text-[16px]">battery_full</span>
        </div>
      </div>

      {/* App Grid */}
      <div className="w-full h-full pt-16 px-6 grid grid-cols-4 gap-y-8 gap-x-4 content-start">
        
        {/* Meituan (Simulated) */}
        <div className="flex flex-col items-center gap-1.5 cursor-pointer group" onClick={() => onOpenApp('Meituan')}>
          <div className="size-[60px] rounded-[14px] bg-[#FFC300] flex items-center justify-center shadow-lg group-active:scale-90 transition-transform duration-200">
             <span className="material-symbols-outlined text-[#333] text-[32px]">lunch_dining</span>
          </div>
          <span className="text-white text-[11px] font-medium drop-shadow-md">美团外卖</span>
        </div>

        {/* WeiWei */}
        <div className="flex flex-col items-center gap-1.5 cursor-pointer group" onClick={() => onOpenApp('WeiWei')}>
          <div className="size-[60px] rounded-[14px] bg-[#1754cf] flex items-center justify-center shadow-lg group-active:scale-90 transition-transform duration-200 relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent"></div>
             <span className="material-symbols-outlined text-white text-[30px]">chat</span>
          </div>
          <span className="text-white text-[11px] font-medium drop-shadow-md">喂喂</span>
        </div>

        {/* Filler Apps */}
        {['Photos', 'Camera', 'Weather', 'Notes', 'Maps', 'Settings', 'App Store', 'Wallet'].map((app, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 cursor-pointer group">
            <div className={`size-[60px] rounded-[14px] flex items-center justify-center shadow-lg group-active:scale-90 transition-transform duration-200 ${
              ['bg-white', 'bg-gray-300', 'bg-blue-400', 'bg-yellow-100', 'bg-green-400', 'bg-gray-400', 'bg-blue-600', 'bg-black'][i]
            }`}>
              <div className="opacity-80 mix-blend-multiply"></div>
            </div>
            <span className="text-white text-[11px] font-medium drop-shadow-md">{app}</span>
          </div>
        ))}
      </div>

      {/* Dock */}
      <div className="absolute bottom-4 left-4 right-4 h-24 bg-white/20 backdrop-blur-xl rounded-[32px] flex items-center justify-around px-2 z-10">
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
        <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
      </div>
    </div>
  );
};

export default HomeScreen;
