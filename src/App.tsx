import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Don't import lucide icons globally, just use what we need
import {
    Settings, ChevronRight, X, TrendingUp, Circle, Check
} from 'lucide-react';
import clsx from 'clsx';
import confetti from 'canvas-confetti';

// --- Constants (SharedConstants) ---
const MIN_ACTION_SECONDS = 90;
const SEG1_END = Math.max(10, Math.floor(MIN_ACTION_SECONDS / 3)); // 30
const SEG2_END = Math.max(SEG1_END + 10, Math.floor((MIN_ACTION_SECONDS * 2) / 3)); // 60

// --- Types ---
type ViewMode = 'stage' | 'sos' | 'setup' | 'settings' | 'review';
type SOSMode = 'intercepted' | 'selfInitiated';
type SOSStep = 'checkIn1' | 'checkIn2' | 'moduleSelect' | 'moduleRun' | 'landing' | 'result' | 'delay' | 'proceedInfo';
type ModuleType = 'breathLight' | 'doodle' | 'listen';

export default function App() {
    const [view, setView] = useState<ViewMode>('stage');
    const [sosMode, setSosMode] = useState<SOSMode>('selfInitiated');
    const [configEnabled, setConfigEnabled] = useState(true);
    const [minimalMode, setMinimalMode] = useState(false);
    const [monster3D, setMonster3D] = useState(false);

    const goSOS = (mode: SOSMode) => {
        setSosMode(mode);
        setView('sos');
    };

    return (
        <>
            <ZKFXBackground activeGuard={configEnabled} />
            <div className="absolute inset-0 flex flex-col">
                <AnimatePresence mode="wait">
                    {view === 'stage' && (
                        <MonsterStageView
                            key="stage"
                            configEnabled={configEnabled}
                            minimalMode={minimalMode}
                            monster3D={monster3D}
                            onOpenSettings={() => setView('settings')}
                            onOpenSetup={() => setView('setup')}
                            onOpenReview={() => setView('review')}
                            onStartSOS={goSOS}
                        />
                    )}
                    {view === 'sos' && (
                        <SOSFlowView
                            key="sos"
                            mode={sosMode}
                            minimalMode={minimalMode}
                            onExit={() => setView('stage')}
                        />
                    )}
                    {view === 'setup' && <SetupView key="setup" onExit={() => setView('stage')} />}
                    {view === 'settings' && (
                        <SettingsView
                            key="settings"
                            minimalMode={minimalMode} setMinimalMode={setMinimalMode}
                            monster3D={monster3D} setMonster3D={setMonster3D}
                            onExit={() => setView('stage')}
                        />
                    )}
                    {view === 'review' && <ReviewView key="review" onExit={() => setView('stage')} />}
                </AnimatePresence>
            </div>
        </>
    );
}

function ZKFXBackground({ activeGuard }: { activeGuard: boolean }) {
    return (
        <div className="zkfx-bg">
            <div className="fluid-canvas">
                <div className="fluid-blob blob-1" style={{ animationDuration: activeGuard ? '10s' : '18s' }} />
                <div className="fluid-blob blob-2" style={{ animationDuration: activeGuard ? '12s' : '22s' }} />
                <div className="fluid-blob blob-3" style={{ animationDuration: activeGuard ? '14s' : '25s' }} />
            </div>
        </div>
    );
}

// --------------------------------------------------------------------------
// MonsterStageView.swift
// --------------------------------------------------------------------------
function MonsterStageView({
    configEnabled, minimalMode,
    onOpenSettings, onOpenSetup, onOpenReview, onStartSOS
}: any) {

    const [bubbleText, setBubbleText] = useState("");
    useEffect(() => {
        const hour = new Date().getHours();
        if (!configEnabled) {
            setBubbleText("我睡着了。需要守护时叫醒我。");
        } else if (hour >= 23 || hour < 5) {
            setBubbleText("全世界都睡了。\n把手机放下，我们也是。");
        } else if (hour >= 6 && hour < 9) {
            setBubbleText("早安。\n今天也要保护好注意力。");
        } else {
            setBubbleText("我在这里守着。\n你去忙重要的事情。");
        }
    }, [configEnabled]);

    // Sizing logic from MonsterStageView: min(geo.size.width * 0.92, geo.size.height * 0.72)
    // We approximate using vw/vh bounds
    const monsterSizeStyle = {
        width: 'min(92vw, 72vh)',
        height: 'min(92vw, 72vh)',
        maxWidth: 500, maxHeight: 500
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col h-full relative overflow-hidden"
        >
            {/* Top Bar: Padding 18pt horizontal, 10pt top */}
            <div className="flex justify-between items-center px-[18px] pt-[10px] z-10 w-full shrink-0">
                <button className="zkfx-pill" style={{ height: 32, paddingRight: 8 }}>
                    <div className={clsx("w-2 h-2 rounded-full mr-2", configEnabled ? "bg-[#34C759]" : "bg-white/20")} />
                    <span className="opacity-90 leading-none text-[13px] font-semibold">{configEnabled ? "守护生效中" : "守护暂停"}</span>
                    <ChevronRight size={12} className="opacity-50 ml-1" />
                </button>
                <button onClick={onOpenSettings} className="w-[38px] h-[38px] rounded-full bg-white/5 flex items-center justify-center text-white/50 box-border border border-white/10">
                    <Settings size={16} fill="currentColor" />
                </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center relative z-0">
                {/* Monster Area */}
                <div className="relative flex flex-col items-center justify-center" style={monsterSizeStyle}>
                    {!minimalMode && (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            className="absolute top-0 z-10 glass-card px-[14px] py-[12px] min-w-[180px] max-w-[280px]"
                            // Padding top -12 in swift means bubble is shifted up. we use top-0 here and translateY
                            style={{ transform: 'translateY(-20%)' }}
                        >
                            <div className="text-[13.5px] font-semibold text-white/90 text-center whitespace-pre-wrap leading-relaxed">
                                {bubbleText}
                            </div>
                            {/* Tail */}
                            <div className="absolute left-1/2 -translate-x-1/2 -bottom-[6px] w-3 h-3 bg-white/5 border-b border-r border-white/10 rotate-45 backdrop-blur-xl"></div>
                        </motion.div>
                    )}

                    <motion.img
                        src="/Monster_Happy.png"
                        className="object-contain filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.35)]"
                        style={{ width: '70%', height: '70%' }}
                        animate={{ y: [0, -6, 0] }}
                        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                    />
                </div>
            </div>

            <div className="px-[18px] pb-[10px] z-10 w-full shrink-0 safe-area-bottom">
                <div className="glass-card flex flex-col gap-[10px]">
                    <button className="btn-primary" onClick={() => onStartSOS('selfInitiated')}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="mr-2 text-white">
                            <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
                        </svg>
                        我现在想吃（先 90 秒）
                    </button>
                    <div className="flex gap-[10px]">
                        <button className="btn-secondary" onClick={onOpenSetup}>守护设置</button>
                        <button className="btn-secondary" onClick={onOpenReview}>
                            <TrendingUp size={16} className="mr-2 opacity-60" />
                            本周趋势
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// --------------------------------------------------------------------------
// SOSFlowView.swift
// --------------------------------------------------------------------------
function SOSFlowView({ mode, minimalMode, onExit }: any) {
    const [step, setStep] = useState<SOSStep>('checkIn1');
    const [elapsed, setElapsed] = useState(0);
    const [bubbleText, setBubbleText] = useState("发生什么了？");
    const [monsterImg, setMonsterImg] = useState("Monster_Concerned.png");
    // Phase state for wave progress
    const phaseIndex = (elapsed < SEG1_END) ? 0 : (elapsed < SEG2_END ? 1 : 2);

    // Timer: 1s tick
    useEffect(() => {
        const timer = setInterval(() => {
            setElapsed(e => {
                if (e >= MIN_ACTION_SECONDS) return e;
                return e + 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // State Transitions
    useEffect(() => {
        if (elapsed === SEG1_END && (step === 'checkIn1' || step === 'checkIn2')) {
            setStep('moduleSelect');
            setBubbleText("我们一起做点别的吧");
            setMonsterImg("Monster_Breathing.png");
        } else if (elapsed === SEG2_END && (step === 'moduleSelect' || step === 'moduleRun')) {
            setStep('landing');
            setBubbleText(`快 ${MIN_ACTION_SECONDS} 秒了。\n你现在感觉怎么样？`);
            setMonsterImg("Monster_Concerned.png");
        } else if (elapsed >= MIN_ACTION_SECONDS && step !== 'result' && step !== 'delay' && step !== 'proceedInfo') {
            setStep('result');
            setBubbleText("你做到了。");
            setMonsterImg("Monster_Happy.png");
            triggerConfetti();
        }
    }, [elapsed, step]);

    const progress = Math.min(1, Math.max(0, elapsed / MIN_ACTION_SECONDS));

    // Handlers
    const handleCheckIn1 = (choice: string, reply: string) => {
        setBubbleText(reply);
        setTimeout(() => {
            setStep('checkIn2');
            setBubbleText("现在最想做什么？");
        }, 1200);
    };

    const handleModuleRun = (m: ModuleType) => {
        setBubbleText("跟着光，慢慢呼吸。");
        setMonsterImg("Monster_Breathing.png");
        setStep('moduleRun');
    };

    return (
        <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: "spring", stiffness: 350, damping: 35 }}
            className="fixed inset-0 bg-[#08040a] z-50 flex flex-col"
        >
            <div className="zkfx-bg" />

            {/* Top Bar */}
            <div className="relative z-10 flex justify-between items-center px-[18px] pt-[14px]">
                <button onClick={onExit} className="w-[38px] h-[38px] rounded-full bg-white/10 flex items-center justify-center">
                    <X size={14} className="text-white/85" strokeWidth={3} />
                </button>

                {/* Title Text */}
                <div className="flex-1 flex justify-center">
                    <span className="text-[13px] font-semibold text-white/50 font-rounded">
                        {step === 'moduleRun' ? '我们做点别的' : step === 'result' ? '现在决定' : '先接住一下'}
                    </span>
                </div>

                {/* ZKFXWaveProgress - The critical piece */}
                <div className="w-[86px] h-[32px]">
                    <WaveProgressCanvas progress={progress} phaseIndex={phaseIndex} />
                </div>
            </div>

            {/* Stage Content */}
            <div className="flex-1 relative z-0 flex items-center justify-center">
                <div className="relative flex flex-col items-center justify-center w-full h-full">
                    {!minimalMode && (
                        <div className="mb-[-10px] z-10 glass-card px-[14px] py-[12px] max-w-[280px]">
                            <p className="text-[13.5px] font-semibold text-white/90 text-center whitespace-pre-wrap font-rounded tracking-wide leading-relaxed">
                                {bubbleText}
                            </p>
                            <div className="absolute left-1/2 -translate-x-1/2 -bottom-[6px] w-3 h-3 bg-white/5 border-b border-r border-white/10 rotate-45 backdrop-blur-xl"></div>
                        </div>
                    )}

                    {/* Dynamic Monster Image */}
                    <motion.img
                        key={monsterImg}
                        src={`/${monsterImg}`}
                        initial={{ opacity: 0.8 }} animate={{ opacity: 1 }}
                        className="object-contain filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.35)]"
                        style={{
                            // We use CSS keyframes for breath to match Swift: easeInOut(duration: 2.0).repeatForever(autoreverses)
                            // CSS animation-direction: alternate gives the autoreverse effect
                            // 4s total cycle = 2s in + 2s out
                            width: 'min(70vw, 40vh)',
                            animation: (step === 'moduleRun') ? 'breath 4s infinite ease-in-out alternate' : 'float 6s infinite ease-in-out'
                        }}
                    />
                </div>

                {/* Breath Light Overlay - Matches BreathLightModuleView.swift */}
                {step === 'moduleRun' && (
                    <div className="absolute inset-0 flex items-center justify-center z-[-1]">
                        {/* Swift: scaleEffect(breathe ? 1.10 : 0.86), blur(0.4), duration 2.0 autoreverses */}
                        <motion.div
                            className="w-[240px] h-[240px] rounded-full blur-[60px]"
                            style={{ background: 'radial-gradient(circle, rgba(89,179,255,0.72) 0%, rgba(89,179,255,0.22) 60%, transparent 100%)' }}
                            animate={{ scale: [0.86, 1.10] }}
                            transition={{ duration: 2.0, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                        />
                    </div>
                )}
            </div>

            {/* Bottom Card - strict layout */}
            <div className="px-[18px] pb-[10px] safe-area-bottom w-full shrink-0 z-20">
                <div className="glass-card flex flex-col gap-[10px] min-h-[160px] justify-center">
                    {step === 'checkIn1' && (
                        <>
                            <div className="text-white font-bold px-1 text-[14px] font-rounded">发生什么了？</div>
                            {['今天很糟糕', '压力太大了', '说不上来，很难受'].map((label, i) => (
                                <button key={i} className="option-row" onClick={() => handleCheckIn1('bad', "嗯…我懂的。")}>
                                    <Circle size={16} className="text-white/30" strokeWidth={2.5} />
                                    <span className="font-rounded font-bold text-[15px] text-white">{label}</span>
                                </button>
                            ))}
                        </>
                    )}

                    {step === 'checkIn2' && (
                        <>
                            <div className="text-white font-bold px-1 text-[14px] font-rounded">现在最想做什么？</div>
                            {['吃点东西', '安静待一会儿', '想哭'].map((label, i) => (
                                <button key={i} className="option-row" onClick={() => setTimeout(() => setStep('moduleSelect'), 500)}>
                                    <Circle size={16} className="text-white/30" strokeWidth={2.5} />
                                    <span className="font-rounded font-bold text-[15px] text-white">{label}</span>
                                </button>
                            ))}
                        </>
                    )}

                    {(step === 'moduleSelect') && (
                        <>
                            <div className="text-white font-bold px-1 text-[14px] font-rounded">我们做点别的</div>
                            <button className="module-row" onClick={() => handleModuleRun('breathLight')}>
                                <Circle className="text-white/50 w-6" />
                                <div className="flex-1 text-left">
                                    <div className="font-bold text-[15px] text-white font-rounded">呼吸灯</div>
                                    <div className="text-[12px] text-white/50 font-medium font-rounded">跟着光慢慢呼吸</div>
                                </div>
                                <ChevronRight size={14} className="text-white/30" />
                            </button>
                            <button className="module-row" onClick={() => handleModuleRun('doodle')}>
                                {/* Placeholder icon */}
                                <div className="w-6 h-6 rounded border border-white/50 flex items-center justify-center text-[10px] text-white/50">✏️</div>
                                <div className="flex-1 text-left">
                                    <div className="font-bold text-[15px] text-white font-rounded">涂一涂</div>
                                    <div className="text-[12px] text-white/50 font-medium font-rounded">随便画点什么</div>
                                </div>
                                <ChevronRight size={14} className="text-white/30" />
                            </button>
                        </>
                    )}

                    {step === 'moduleRun' && (
                        <>
                            <div className="text-white font-bold px-1 text-[14px] font-rounded">跟着我，慢慢来</div>
                            <div className="flex gap-[10px]">
                                <button className="btn-secondary" onClick={() => handleModuleRun('breathLight')}>呼吸灯</button>
                                <button className="btn-secondary" onClick={() => { }}>涂一涂</button>
                                <button className="btn-secondary" onClick={() => { }}>听一听</button>
                            </div>
                        </>
                    )}

                    {step === 'landing' && (
                        <>
                            <div className="text-white font-bold px-1 text-[14px] font-rounded">快到结束了，你现在感觉怎么样？</div>
                            {['好多了', '还是想吃', '不知道'].map(l => (
                                <button key={l} className="option-row" onClick={() => setStep('result')}>
                                    <Circle size={16} className="text-white/30" strokeWidth={2.5} />
                                    <span className="font-rounded font-bold text-[15px] text-white">{l}</span>
                                </button>
                            ))}
                        </>
                    )}

                    {step === 'result' && (
                        <>
                            <button className="btn-primary" onClick={onExit}>回到舞台</button>
                            <button className="btn-secondary" onClick={onExit}>延迟 2 分钟 (完成后算一次)</button>
                            <button className="h-[44px] flex items-center justify-center text-[13px] font-semibold text-white/50 font-rounded" onClick={onExit}>
                                我决定要吃（不奖励）
                            </button>
                        </>
                    )}
                </div>
            </div>

            <style>{`
         @keyframes breath {
           0% { transform: scale(0.9); }
           100% { transform: scale(1.08); }
         }
       `}</style>
        </motion.div>
    );
}

// --------------------------------------------------------------------------
// WaveProgressCanvas: 1:1 Implementation of ZKFXWaveFillCanvas.swift
// --------------------------------------------------------------------------
function WaveProgressCanvas({ progress, phaseIndex }: { progress: number, phaseIndex: number }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const timeRef = useRef(0);

    // Params from ZKFXWaveFillCanvas.swift
    const amp = 3.2;
    const freq = 10.0;
    const speed = 2.4;
    // y0 = height * 0.55

    useEffect(() => {
        let animationFrameId: number;
        const render = () => {
            const cvs = canvasRef.current;
            if (!cvs) return;
            const ctx = cvs.getContext('2d');
            if (!ctx) return;

            const width = cvs.width;
            const height = cvs.height;
            const y0 = height * 0.55;

            // Clear
            ctx.clearRect(0, 0, width, height);

            // Draw Timeline Wave
            const doneX = Math.min(1, Math.max(0, progress)) * width;
            const t = Date.now() / 1000; // time in seconds

            ctx.beginPath();
            ctx.moveTo(0, y0);

            // Sine wave loop
            for (let x = 0; x <= doneX; x += 1) {
                // let phase = (Double(x / w) * freq * Double.pi * 2.0) + (t * speed)
                // let y = y0 + CGFloat(sin(phase)) * amp
                const phase = (x / width) * freq * Math.PI * 2.0 + (t * speed);
                const y = y0 + Math.sin(phase) * amp;
                ctx.lineTo(x, y);
            }

            ctx.lineTo(doneX, height);
            ctx.lineTo(0, height);
            ctx.closePath();

            // Swift: context.fill(wave, with: .color(ZKFXTheme.brand.opacity(0.45)))
            ctx.fillStyle = "rgba(89, 179, 255, 0.45)";
            ctx.fill();

            animationFrameId = requestAnimationFrame(render);
        };
        render();
        return () => cancelAnimationFrame(animationFrameId);
    }, [progress]);

    return (
        <div className="w-full h-full relative rounded-full bg-white/5 border border-white/10 overflow-hidden">
            <canvas ref={canvasRef} width={86} height={32} className="w-full h-full block" />
            {/* Phase Dots */}
            <div className="absolute inset-0 flex items-center justify-center gap-[6px]">
                {[0, 1, 2].map(i => (
                    <div
                        key={i}
                        className={clsx(
                            "w-1 h-1 rounded-full transition-colors duration-300",
                            i <= phaseIndex ? "bg-white/90" : "bg-white/25"
                        )}
                    />
                ))}
            </div>
        </div>
    );
}

// --------------------------------------------------------------------------
// Settings and Setup Placeholders
// --------------------------------------------------------------------------
function SettingsView({ onExit, minimalMode, setMinimalMode, monster3D, setMonster3D }: any) {
    return (
        <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: "spring", stiffness: 350, damping: 35 }}
            className="fixed inset-0 bg-[#08040a] z-50 flex flex-col"
        >
            <div className="flex items-center px-4 py-3 border-b border-white/5">
                <button onClick={onExit} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10"><X size={16} /></button>
                <span className="flex-1 text-center font-semibold text-white/50 text-[13px]">设置</span>
                <div className="w-8" />
            </div>

            <div className="p-5 flex flex-col gap-4">
                <div className="glass-card flex flex-col gap-4">
                    <span className="font-bold text-[16px] text-white font-rounded">显示</span>
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="font-semibold text-[14px] text-white">极简模式</div>
                            <div className="text-[12px] text-white/50">隐藏怪兽动画/对话</div>
                        </div>
                        <Toggle checked={minimalMode} onChange={setMinimalMode} />
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

function Toggle({ checked, onChange }: any) {
    return (
        <button
            onClick={() => onChange(!checked)}
            className={clsx(
                "w-[51px] h-[31px] rounded-full p-[2px] transition-colors duration-200",
                checked ? "bg-[#34C759]" : "bg-white/10"
            )}
        >
            <div className={clsx(
                "w-[27px] h-[27px] rounded-full bg-white shadow-sm transition-transform duration-200",
                checked ? "translate-x-[20px]" : "translate-x-0"
            )} />
        </button>
    )
}

function SetupView({ onExit }: any) {
    return (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center text-white/50">
            Coming soon
            <button className="btn-secondary w-auto px-4 mt-4" onClick={onExit}>Close</button>
        </div>
    )
}

function ReviewView({ onExit }: any) {
    return (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center text-white/50">
            Coming soon
            <button className="btn-secondary w-auto px-4 mt-4" onClick={onExit}>Close</button>
        </div>
    )
}

function triggerConfetti() {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#59B3FF', '#ffffff']
    });
}
