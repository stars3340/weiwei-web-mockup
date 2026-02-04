import React from 'react';
import { AppState } from '../types';

interface Props {
  state: AppState;
  onUpdate: (updates: Partial<AppState>) => void;
  onBack: () => void;
}

const Settings: React.FC<Props> = ({ state, onUpdate, onBack }) => {
  return (
    <div className="flex flex-col h-full w-full bg-background-dark animate-fade-in">
       {/* Header */}
       <div className="flex items-center p-4 shrink-0 bg-background-dark/95 backdrop-blur-sm sticky top-0 z-20">
        <button onClick={onBack} className="size-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
          <span className="material-symbols-outlined text-white">arrow_back_ios_new</span>
        </button>
        <h2 className="text-white text-lg font-bold flex-1 text-center pr-10">设置</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-2">
         {/* Mode Section */}
         <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">守护模式</h3>
            <div className="flex flex-col gap-3">
               <button 
                  onClick={() => onUpdate({ mode: 'night' })}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${state.mode === 'night' ? 'bg-primary/20 border-primary' : 'bg-surface-dark border-white/5'}`}
               >
                  <div className="flex items-center gap-3">
                     <span className="material-symbols-outlined text-blue-300">nightlight</span>
                     <div className="text-left">
                        <p className="text-white font-bold">深夜轻盈</p>
                        <p className="text-xs text-gray-400">21:30 - 01:30</p>
                     </div>
                  </div>
                  {state.mode === 'night' && <span className="material-symbols-outlined text-primary">check_circle</span>}
               </button>

               <button 
                  onClick={() => onUpdate({ mode: 'allDay' })}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${state.mode === 'allDay' ? 'bg-primary/20 border-primary' : 'bg-surface-dark border-white/5'}`}
               >
                  <div className="flex items-center gap-3">
                     <span className="material-symbols-outlined text-gray-300">schedule</span>
                     <div className="text-left">
                        <p className="text-white font-bold">全天戒断</p>
                        <p className="text-xs text-gray-400">24 小时</p>
                     </div>
                  </div>
                  {state.mode === 'allDay' && <span className="material-symbols-outlined text-primary">check_circle</span>}
               </button>
            </div>
         </div>

         {/* Intensity Section */}
         <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">拦截力度</h3>
            <div className="flex flex-col gap-3">
               <button 
                  onClick={() => onUpdate({ intensity: 'standard' })}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${state.intensity === 'standard' ? 'bg-primary/20 border-primary' : 'bg-surface-dark border-white/5'}`}
               >
                  <div className="text-left">
                     <p className="text-white font-bold">温柔提醒 (标准)</p>
                     <p className="text-xs text-gray-400 mt-1">允许“我非要吃”的选项</p>
                  </div>
                  {state.intensity === 'standard' && <span className="material-symbols-outlined text-primary">radio_button_checked</span>}
                  {state.intensity !== 'standard' && <span className="material-symbols-outlined text-gray-600">radio_button_unchecked</span>}
               </button>

               <button 
                  onClick={() => onUpdate({ intensity: 'strict' })}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${state.intensity === 'strict' ? 'bg-primary/20 border-primary' : 'bg-surface-dark border-white/5'}`}
               >
                  <div className="text-left">
                     <p className="text-white font-bold">强制阻断 (强力)</p>
                     <p className="text-xs text-gray-400 mt-1">没有忽略按钮</p>
                  </div>
                  {state.intensity === 'strict' && <span className="material-symbols-outlined text-primary">radio_button_checked</span>}
                  {state.intensity !== 'strict' && <span className="material-symbols-outlined text-gray-600">radio_button_unchecked</span>}
               </button>
            </div>
         </div>
         
         <div className="mt-8 p-4 rounded-xl bg-surface-dark border border-white/5">
            <h3 className="text-white font-bold mb-2">关于 喂喂</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
               Version 1.0.0 (Alpha)<br/>
               基于 iOS ScreenTime API 开发。<br/>
               隐私政策：数据仅存储于本地。
            </p>
         </div>
      </div>
    </div>
  );
};

export default Settings;
