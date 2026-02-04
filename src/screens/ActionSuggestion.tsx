import React from 'react';
import { EmotionType } from '../types';

interface Props {
  emotion: EmotionType;
  onActionSelect: (action: string) => void;
  onSurrender: () => void;
  onBack: () => void;
}

const ActionSuggestion: React.FC<Props> = ({ emotion, onActionSelect, onSurrender, onBack }) => {
  
  interface ActionItem {
    label: string;
    id: string;
    icon?: string;
  }

  interface EmotionData {
    icon: string;
    color: string;
    title: string;
    desc: string;
    primaryAction: ActionItem;
    secondaryAction: ActionItem;
  }

  // Pivot copy: No money saving, focus on calories/health/sleep
  const content: Record<string, EmotionData> = {
    hunger: {
      icon: 'local_dining',
      color: 'text-orange-400',
      title: '给身体一点轻负担能量',
      desc: '如果胃很难受，吃点温和的。外卖高油高盐，会让你明早脸肿得像个包子。',
      primaryAction: { label: '热牛奶 / 全麦面包 / 水果', id: 'rule_card' },
      secondaryAction: { label: '喝杯温水，等 10 分钟', id: 'delay' }
    },
    stress: {
      icon: 'spa',
      color: 'text-[#CC8F5E]',
      title: '你不是饿，你是累了',
      desc: '食物不仅不能解决压力，还会因为暴食带来新的焦虑。让大脑休息一下吧。',
      primaryAction: { label: '2分钟呼吸解压 (很有效)', id: 'breathing', icon: 'air' },
      secondaryAction: { label: '去洗个热水澡', id: 'delay', icon: 'shower' }
    },
    reward: {
      icon: 'redeem',
      color: 'text-purple-400',
      title: '快乐不只有“吃”这一种',
      desc: '多巴胺可以通过很多方式获得。不要让“奖励”变成身体的“惩罚”。',
      primaryAction: { label: '做个拉伸 / 听首喜欢的歌', id: 'wishlist' },
      secondaryAction: { label: '只吃一小口 (定个量)', id: 'small_portion' }
    },
    habit: {
      icon: 'touch_app',
      color: 'text-emerald-400',
      title: '打破“手滑”的惯性',
      desc: '你只是无聊了。放下手机一分钟，去睡个好觉，明天皮肤会发光。',
      primaryAction: { label: '挑战：放下手机 30秒', id: 'challenge' },
      secondaryAction: { label: '直接去睡觉', id: 'return' }
    }
  };

  const data = content[emotion] || content.stress;

  return (
    <div className="flex flex-col h-full w-full bg-background-dark relative overflow-hidden animate-fade-in">
       {/* Ambient BG */}
       <div className="absolute top-[-15%] left-[-20%] w-[70%] h-[50%] bg-primary/5 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>
       <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[40%] bg-accent-warm/5 rounded-full blur-[80px] pointer-events-none mix-blend-screen"></div>

       <div className="flex items-center p-6 justify-between z-10 shrink-0">
         <button
           type="button"
           onPointerDown={(e) => {
             e.preventDefault();
             onBack();
           }}
           className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/5 text-white/70 hover:text-white transition-colors active:scale-[0.98]"
           style={{ touchAction: 'manipulation' }}
           aria-label="Back"
         >
           <span className="material-symbols-outlined text-[20px]">close</span>
         </button>
         <h2 className="text-white text-xs font-bold tracking-[0.15em] uppercase">行动建议</h2>
         <div className="w-10" />
       </div>

       <div className="flex-1 flex flex-col justify-center px-6 relative z-10 pb-8 overflow-y-auto">
         <div className="flex-1 flex flex-col justify-center items-center text-center pb-10">
           <div className="mb-8 relative">
             <div className="absolute inset-0 bg-accent-warm/20 blur-xl rounded-full transform scale-150"></div>
             <span className={`material-symbols-outlined text-5xl relative z-10 ${data.color}`}>{data.icon}</span>
           </div>
           
           <h1 className={`text-[32px] md:text-4xl font-bold leading-[1.15] mb-4 tracking-[-0.02em] ${data.color} whitespace-pre-line`}>
             {data.title}
           </h1>
           <p className="text-gray-300 text-lg font-normal leading-relaxed max-w-[280px]">
             {data.desc}
           </p>
         </div>

         <div className="flex flex-col gap-4 w-full animate-slide-up shrink-0">
           <button 
             type="button"
             onPointerDown={(e) => {
               e.preventDefault();
               onActionSelect(data.primaryAction.id);
             }}
             className="group w-full text-left relative overflow-hidden rounded-2xl bg-primary p-0 shadow-lg shadow-primary/25 transition-transform active:scale-[0.98]"
             style={{ touchAction: 'manipulation' }}
           >
             <div className="absolute right-[-20px] top-[-20px] w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
             <div className="flex items-center justify-between p-5 relative z-10">
               <div className="flex flex-col gap-1.5">
                 <h3 className="text-white text-xl font-bold leading-tight">{data.primaryAction.label}</h3>
                 <p className="text-blue-100/90 text-sm font-medium">推荐方案</p>
               </div>
               <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10 group-hover:bg-white/20 transition-colors">
                 <span className="material-symbols-outlined text-white text-[28px]">{data.primaryAction.icon || 'arrow_forward'}</span>
               </div>
             </div>
           </button>

           <button 
             type="button"
             onPointerDown={(e) => {
               e.preventDefault();
               onActionSelect(data.secondaryAction.id);
             }}
             className="flex w-full cursor-pointer items-center justify-center rounded-xl h-14 px-5 bg-surface-highlight border border-white/5 hover:bg-surface-highlight/80 text-white transition-all active:scale-[0.98]"
             style={{ touchAction: 'manipulation' }}
           >
             <span className="material-symbols-outlined text-gray-400 mr-2.5 text-[20px]">{data.secondaryAction.icon || 'timer'}</span>
             <span className="text-base font-bold tracking-[0.015em]">{data.secondaryAction.label}</span>
           </button>

           <button
             type="button"
             onPointerDown={(e) => {
               e.preventDefault();
               onSurrender();
             }}
             className="mt-4 flex w-full cursor-pointer items-center justify-center h-10 px-5 text-red-400/60 hover:text-red-400 transition-colors"
             style={{ touchAction: 'manipulation' }}
           >
             <span className="text-xs font-medium border-b border-red-400/30 pb-0.5">我都不想做，解除拦截</span>
           </button>
         </div>
         <div className="h-6"></div>
       </div>
    </div>
  );
};

export default ActionSuggestion;
