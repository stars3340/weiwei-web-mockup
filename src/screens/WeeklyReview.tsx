import React from 'react';

interface Props {
  onRestart: () => void;
  onBack: () => void;
}

const WeeklyReview: React.FC<Props> = ({ onRestart, onBack }) => {
  const chartData = [
    { day: 'Mon', val: 80 },
    { day: 'Tue', val: 65 },
    { day: 'Wed', val: 90 },
    { day: 'Thu', val: 85 },
    { day: 'Fri', val: 40 },
    { day: 'Sat', val: 30 },
    { day: 'Sun', val: 95 },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-background-dark text-white animate-fade-in relative overflow-hidden">
       <header className="sticky top-0 z-50 flex items-center justify-between px-4 pt-6 pb-4 bg-background-dark/80 backdrop-blur-md shrink-0">
         <button
           type="button"
           onPointerDown={(e) => {
             e.preventDefault();
             onBack();
           }}
           className="flex items-center justify-center text-white size-10 rounded-full hover:bg-surface-highlight transition-colors active:scale-[0.98]"
           style={{ touchAction: 'manipulation' }}
         >
           <span className="material-symbols-outlined">arrow_back_ios_new</span>
         </button>
         <h1 className="text-sm font-bold tracking-wide uppercase text-gray-400">Weekly Report</h1>
         <div className="size-10"></div>
       </header>

       <main className="flex-1 flex flex-col px-6 gap-8 overflow-y-auto pb-24">
         
         <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-extrabold text-white">本周表现</h2>
            <p className="text-gray-400">10月23日 - 10月29日</p>
         </div>

         {/* Hero Stat */}
         <div className="flex items-end gap-4">
            <div className="flex-1 bg-surface-dark border border-white/5 rounded-2xl p-5 relative overflow-hidden">
               <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">平均自控力</p>
               <div className="flex items-baseline gap-1">
                 <span className="text-4xl font-bold text-white">85%</span>
                 <span className="text-xs text-green-400 font-bold">↑ 12%</span>
               </div>
               {/* Progress Bar */}
               <div className="w-full h-1.5 bg-gray-800 rounded-full mt-4 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-purple-500 w-[85%] rounded-full"></div>
               </div>
            </div>
         </div>

         {/* Chart */}
         <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
               意志力评分趋势
            </h3>
            <div className="h-48 w-full bg-surface-dark/50 border border-white/5 rounded-2xl p-4">
              <div className="w-full h-full flex flex-col justify-end">
                <div className="flex-1 flex items-end justify-between gap-2">
                  {chartData.map((entry) => (
                    <div key={entry.day} className="flex-1 flex flex-col items-center justify-end gap-2">
                      <div className="w-full flex items-end justify-center h-full">
                        <div
                          className="w-3 rounded-[4px]"
                          style={{
                            height: `${Math.max(6, Math.min(100, entry.val))}%`,
                            backgroundColor: entry.val > 80 ? '#1754cf' : '#374151',
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-500">{entry.day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
         </div>

         {/* Achievement Badges */}
         <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-gray-300">本周成就</h3>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
               
               <div className="min-w-[140px] p-4 bg-gradient-to-br from-surface-highlight to-surface-dark border border-white/5 rounded-2xl flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center">
                     <span className="material-symbols-outlined">hotel_class</span>
                  </div>
                  <div>
                     <p className="text-white font-bold text-sm">自律冠军</p>
                     <p className="text-gray-500 text-xs">连续 3 天未破戒</p>
                  </div>
               </div>

               <div className="min-w-[140px] p-4 bg-gradient-to-br from-surface-highlight to-surface-dark border border-white/5 rounded-2xl flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center">
                     <span className="material-symbols-outlined">water_drop</span>
                  </div>
                  <div>
                     <p className="text-white font-bold text-sm">消肿达人</p>
                     <p className="text-gray-500 text-xs">阻断 5 次夜宵</p>
                  </div>
               </div>

               <div className="min-w-[140px] p-4 bg-gradient-to-br from-surface-highlight to-surface-dark border border-white/5 rounded-2xl flex flex-col gap-3 opacity-50">
                  <div className="w-10 h-10 rounded-full bg-gray-700 text-gray-400 flex items-center justify-center">
                     <span className="material-symbols-outlined">lock</span>
                  </div>
                  <div>
                     <p className="text-gray-400 font-bold text-sm">7天全勤</p>
                     <p className="text-gray-600 text-xs">还差 2 天</p>
                  </div>
               </div>

            </div>
         </div>

       </main>

       <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background-dark via-background-dark to-transparent pt-12 flex justify-center pointer-events-none">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              onRestart();
            }}
            className="w-full bg-primary hover:bg-blue-600 text-white font-bold text-lg py-4 rounded-xl shadow-[0_4px_20px_rgba(23,84,207,0.4)] transition-all pointer-events-auto flex items-center justify-center gap-2 active:scale-[0.98]"
            style={{ touchAction: 'manipulation' }}
          >
             <span className="material-symbols-outlined">refresh</span>
             开启新的一周
          </button>
       </div>
    </div>
  );
};

export default WeeklyReview;
