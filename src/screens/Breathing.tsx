import React, { useEffect } from 'react';

interface Props {
  onComplete: () => void;
}

const Breathing: React.FC<Props> = ({ onComplete }) => {
  // Auto-finish after 8 seconds * 2 cycles for demo purposes
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 16000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="h-full w-full bg-[#0a0a0c] text-white flex flex-col items-center justify-center relative animate-fade-in">
       {/* Top Controls */}
       <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-20">
         <button
           type="button"
           onPointerDown={(e) => {
             e.preventDefault();
             onComplete();
           }}
           className="text-white/30 hover:text-white/60 p-2 rounded-full hover:bg-white/5 active:scale-[0.98]"
           style={{ touchAction: 'manipulation' }}
           aria-label="Close"
         >
           <span className="material-symbols-outlined !text-[28px]">expand_more</span>
         </button>
         <button type="button" className="text-white/30 hover:text-white/60 p-2 rounded-full hover:bg-white/5 active:scale-[0.98]" style={{ touchAction: 'manipulation' }}>
           <span className="material-symbols-outlined !text-[24px]">volume_up</span>
         </button>
       </div>

       <div className="flex flex-col items-center justify-center flex-grow w-full px-6 relative z-10">
         <div className="relative flex items-center justify-center w-64 h-64 mb-16">
           <div className="absolute w-full h-full rounded-full bg-primary/5 blur-3xl animate-pulse-glow"></div>
           <div className="absolute w-48 h-48 rounded-full border border-primary/20 animate-breathe" style={{ animationDelay: '0.2s' }}></div>
           <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 backdrop-blur-sm border border-white/5 shadow-[0_0_60px_rgba(23,84,207,0.3)] animate-breathe flex items-center justify-center">
             <div className="w-full h-full rounded-full bg-white/5 blur-md"></div>
           </div>
         </div>

         <div className="text-center space-y-2 animate-slide-up" style={{ animationDelay: '0.5s' }}>
           <h1 className="text-white/90 text-xl md:text-2xl font-light tracking-[0.15em] leading-relaxed select-none drop-shadow-lg">
             不用做对，只要在这里。
           </h1>
           <p className="text-white/30 text-sm font-light tracking-wider mt-4">
             吸气 ... 呼气
           </p>
         </div>
       </div>

       <div className="absolute bottom-10 w-full flex justify-center opacity-20 hover:opacity-80 transition-opacity duration-500">
          <button className="text-xs text-white tracking-widest uppercase font-medium flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:bg-white/5">
            <span className="material-symbols-outlined !text-[16px]">emergency_home</span>
             我需要帮助
          </button>
       </div>
    </div>
  );
};

export default Breathing;
