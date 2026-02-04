import React from 'react';

interface Props {
  onComplete: () => void;
}

const Onboarding: React.FC<Props> = ({ onComplete }) => {
  return (
    <div className="flex flex-col h-full w-full bg-background-dark animate-fade-in relative overflow-hidden">
      {/* Top Nav (Fixed) */}
      <div className="flex items-center justify-between p-4 pb-2 shrink-0 bg-background-dark/95 backdrop-blur-sm z-20">
        <div className="size-12 flex items-center justify-start opacity-0">
           <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </div>
        <h2 className="text-white text-lg font-bold opacity-0">功能介绍</h2>
        <button onClick={onComplete} className="text-gray-400 font-bold hover:text-white transition-colors">跳过</button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto w-full px-6 pb-4">
        {/* Hero Image */}
        <div className="w-full py-4">
          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden ring-1 ring-white/5 shadow-[0_0_20px_-5px_rgba(23,84,207,0.3)] group">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: `url("https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2000&auto=format&fit=crop")` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/20 to-transparent"></div>
            <div className="absolute bottom-6 left-0 right-0 flex justify-center">
              <div className="bg-primary/20 backdrop-blur-md p-4 rounded-full border border-primary/30 shadow-lg animate-pulse-glow">
                <span className="material-symbols-outlined text-primary text-4xl">fitness_center</span>
              </div>
            </div>
          </div>
        </div>

        {/* Headline */}
        <div className="text-center mb-8">
          <h1 className="text-[28px] font-extrabold leading-tight mb-3">
            每一次拒绝诱惑<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">都是在为身材投票</span>
          </h1>
          <p className="text-gray-400 text-base font-medium leading-relaxed max-w-xs mx-auto">
            喂喂 是一道系统的防线，<br/>帮你拦截那个“稍微吃一口”的念头。
          </p>
        </div>

        {/* Feature List - Pivoted to Health/Beauty */}
        <div className="w-full flex flex-col gap-3 mb-8">
          {[
            { icon: 'face_retouching_natural', title: '告别清晨水肿', desc: '夜间进食的高盐高油，是你明天脸肿的元凶。' },
            { icon: 'psychology_alt', title: '切断多巴胺成瘾', desc: '你不是饿，是焦虑。别用食物填补情绪黑洞。' },
            { icon: 'lock_person', title: '系统级硬核阻断', desc: '利用 iOS 权限锁死外卖软件，把选择权交还给你。' }
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-4 bg-surface-dark/50 border border-white/5 p-4 rounded-xl hover:bg-surface-dark transition-colors">
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              </div>
              <div>
                <p className="text-[17px] font-bold mb-1">{item.title}</p>
                <p className="text-[13px] text-gray-400 leading-normal">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Bottom (Fixed) */}
      <div className="p-6 pb-10 bg-gradient-to-t from-background-dark via-background-dark to-transparent shrink-0 mt-auto z-20">
        <button 
          onClick={onComplete}
          className="w-full h-14 bg-primary hover:bg-blue-600 active:scale-[0.98] rounded-full text-[17px] font-bold shadow-lg shadow-blue-900/20 transition-all mb-3"
        >
          开启身材守护
        </button>
        <p className="text-center text-[11px] text-gray-600">
          点击即代表同意使用条款，我们利用系统 ScreenTime API 运行
        </p>
      </div>
    </div>
  );
};

export default Onboarding;
