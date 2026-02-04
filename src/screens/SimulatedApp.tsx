import React from 'react';

interface Props {
  onBackToSafety: () => void;
  onHome: () => void;
}

const SimulatedApp: React.FC<Props> = ({ onBackToSafety, onHome }) => {
  return (
    <div className="flex flex-col h-full w-full bg-[#f4f4f4] text-black relative animate-fade-in overflow-hidden">
       {/* Fake App Status Bar */}
       <div className="h-12 bg-[#FFC300] shrink-0"></div>
       
       {/* Fake App Header */}
       <div className="bg-[#FFC300] px-4 pb-2 flex items-center gap-3 shrink-0">
          <div className="flex-1 bg-white rounded-full h-8 flex items-center px-3 gap-2">
             <span className="material-symbols-outlined text-gray-400 text-[18px]">search</span>
             <span className="text-sm text-gray-400">想吃点什么？</span>
          </div>
          <span className="material-symbols-outlined text-[#333]">notifications</span>
          <span className="material-symbols-outlined text-[#333]">add_circle</span>
       </div>

       {/* Floating "Safety" Button - The "Return to NightGuard" path */}
       <button 
         onPointerDown={(e) => {
           e.preventDefault();
           onBackToSafety();
         }}
         className="absolute bottom-24 right-4 z-50 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center border-2 border-white/40 active:scale-90 transition-transform duration-150"
         style={{ background: '#1D2547' }}
       >
          <span className="material-symbols-outlined text-white text-[32px]">chat</span>
       </button>
       <div className="absolute bottom-12 right-4 z-50 text-[10px] text-[#1D2547] font-semibold bg-white/85 px-2 py-1 rounded-[10px] backdrop-blur-sm border border-white/60">
          回到喂喂
       </div>

       {/* Fake Content - Scrollable */}
       <div className="flex-1 overflow-y-auto">
          {/* Banner */}
          <div className="p-3">
             <div className="w-full h-32 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl mb-4 flex items-center justify-center text-white font-bold text-xl shadow-sm">
                深夜食堂
             </div>
             
             {/* Icons Grid */}
             <div className="grid grid-cols-5 gap-2 mb-4">
                {[...Array(10)].map((_, i) => (
                   <div key={i} className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                      <div className="w-8 h-2 bg-gray-200 rounded"></div>
                   </div>
                ))}
             </div>
          </div>

          {/* Fake Feed */}
          <div className="bg-white rounded-t-xl p-3 flex flex-col gap-4 min-h-[600px]">
             <h3 className="font-bold text-lg">附近推荐</h3>
             {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-3">
                   <div className="w-24 h-24 bg-gray-200 rounded-lg shrink-0"></div>
                   <div className="flex-1 flex flex-col gap-2">
                      <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                      <div className="w-1/2 h-3 bg-gray-100 rounded"></div>
                      <div className="mt-auto flex justify-between">
                         <div className="w-10 h-4 bg-red-100 rounded"></div>
                         <div className="w-16 h-4 bg-gray-100 rounded"></div>
                      </div>
                   </div>
                </div>
             ))}
          </div>
       </div>

       {/* Fake Tab Bar */}
       <div className="h-14 bg-white border-t border-gray-200 shrink-0 flex justify-around items-center pb-2">
          <div className="flex flex-col items-center">
             <span className="material-symbols-outlined text-[24px] text-black font-bold">home</span>
             <span className="text-[10px] font-bold">首页</span>
          </div>
          <div className="flex flex-col items-center opacity-40">
             <span className="material-symbols-outlined text-[24px]">explore</span>
             <span className="text-[10px]">逛逛</span>
          </div>
          <div className="flex flex-col items-center opacity-40">
             <span className="material-symbols-outlined text-[24px]">receipt_long</span>
             <span className="text-[10px]">订单</span>
          </div>
          <div className="flex flex-col items-center opacity-40">
             <span className="material-symbols-outlined text-[24px]">person</span>
             <span className="text-[10px]">我的</span>
          </div>
       </div>
    </div>
  );
};

export default SimulatedApp;
