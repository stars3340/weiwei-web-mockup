import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, Settings, ChevronRight, X, Bell, TrendingUp,
    HandHeart, Droplets, Pencil, Volume2, CheckCircle2, Circle, Check
} from 'lucide-react';
import clsx from 'clsx';
import confetti from 'canvas-confetti';

// --- Constants (SharedConstants) ---
const MIN_ACTION_SECONDS = 90;
const SEG1_END = Math.max(10, Math.floor(MIN_ACTION_SECONDS / 3)); // 30
const SEG2_END = Math.max(SEG1_END + 10, Math.floor((MIN_ACTION_SECONDS * 2) / 3)); // 60

// --- Types ---
type ViewMode = 'stage' | 'sos' | 'setup' | 'settings' | 'review' | 'diagnosis' | 'notificationHelper';
type SOSMode = 'intercepted' | 'selfInitiated';
type SOSStep = 'checkIn1' | 'checkIn2' | 'moduleSelect' | 'moduleRun' | 'landing' | 'result' | 'delay' | 'proceedInfo';
type ModuleType = 'breathLight' | 'doodle' | 'listen';

// --- App Component ---
export default function App() {
    const [view, setView] = useState<ViewMode>('stage');
    const [sosMode, setSosMode] = useState<SOSMode>('selfInitiated');

    // Mock State (AppModel)
    const [configEnabled, setConfigEnabled] = useState(true);
    const [minimalMode, setMinimalMode] = useState(false);
    const [monster3D, setMonster3D] = useState(false);

    // Navigation handlers
    const goSOS = (mode: SOSMode) => {
        setSosMode(mode);
        setView('sos');
    };

    return (
        <>
            <ZKFXBackground activeGuard={configEnabled} />
            <div className="app-container">
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
                            monster3D={monster3D}
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

// --- Components ---

function ZKFXBackground({ activeGuard }: { activeGuard: boolean }) {
    // CSS handles the gradient. We add the fluid blobs.
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

function MonsterStageView({
    configEnabled, minimalMode, monster3D,
    onOpenSettings, onOpenSetup, onOpenReview, onStartSOS
}: any) {

    // Logic from MonsterDialogService
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

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col h-full overflow-hidden relative"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
            {/* Top Bar */}
            <div className="flex justify-between items-center px-5 pt-4 z-10">
                <button className="glass-pill text-white" style={{ height: 32, paddingRight: 8 }}>
                    <div className={clsx("w-2 h-2 rounded-full mr-2", configEnabled ? "bg-[#34C759]" : "bg-white/20")} />
                    <span className="opacity-90">{configEnabled ? "守护生效中" : "守护暂停"}</span>
                    <ChevronRight size={14} className="opacity-50 ml-1" />
                </button>
                <button onClick={onOpenSettings} className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50">
                    <Settings size={18} fill="currentColor" />
                </button>
            </div>

            {/* Monster Area */}
            <div className="flex-1 flex flex-col items-center justify-center relative z-0">
                <div className="relative flex flex-col items-center">
                    {/* Bubble */}
                    {!minimalMode && (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            className="mb-[-10px] z-10 glass-card px-4 py-3 min-w-[180px] max-w-[280px]"
                            style={{ borderRadius: 20, background: 'rgba(255,255,255,0.1)' }}
                        >
                            <div className="text-[13.5px] font-semibold text-white/90 text-center whitespace-pre-wrap leading-relaxed">
                                {bubbleText}
                            </div>
                            {/* Triangle tail */}
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-[-6px] w-3 h-3 bg-white/10 border-b border-r border-white/10 rotate-45 backdrop-blur-md"></div>
                        </motion.div>
                    )}

                    {/* Monster Asset */}
                    <motion.img
                        key={minimalMode ? 'minimal' : 'full'}
                        src="/Monster_Happy.png"
                        className="object-contain filter drop-shadow-2xl"
                        style={{ width: minimalMode ? '56vw' : '70vw', maxWidth: 320 }}
                        animate={{
                            y: [0, -10, 0],
                            scale: [1, 1.02, 1]
                        }}
                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    />
                </div>
            </div>

            {/* Bottom Action Card */}
            <div className="px-5 pb-6 z-10">
                <div className="glass-card flex flex-col gap-3">
                    <button className="btn-primary" onClick={() => onStartSOS('selfInitiated')}>
                        <Sparkles size={18} fill="currentColor" className="mr-2" />
                        我现在想吃（先 90 秒）
                    </button>
                    <div className="flex gap-3">
                        <button className="btn-secondary" onClick={onOpenSetup}>守护设置</button>
                        <button className="btn-secondary" onClick={onOpenReview}>
                            <TrendingUp size={16} className="mr-2 opacity-50" />
                            本周趋势
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function SOSFlowView({ mode, minimalMode, onExit }: any) {
    const [step, setStep] = useState<SOSStep>('checkIn1');
    const [elapsed, setElapsed] = useState(0);
    const [bubbleText, setBubbleText] = useState("发生什么了？");
    const [monsterImg, setMonsterImg] = useState("Monster_Concerned.png");
    // Choices state
    const [checkIn1, setCheckIn1] = useState<string | null>(null);
    const [module, setModule] = useState<ModuleType | null>(null);

    // Timer
    useEffect(() => {
        const timer = setInterval(() => {
            setElapsed(e => {
                if (e >= MIN_ACTION_SECONDS) return e;
                return e + 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // State Machine logic from SOSFlowView.swift: tick()
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

    const progress = Math.min(1, elapsed / MIN_ACTION_SECONDS);

    // Handlers
    const handleCheckIn1 = (choice: string, reply: string) => {
        setCheckIn1(choice);
        setBubbleText(reply);
        // Auto advance
        setTimeout(() => {
            setStep('checkIn2');
            setBubbleText("现在最想做什么？");
        }, 1200);
    };

    const handleModuleSelect = (m: ModuleType, reply: string) => {
        setModule(m);
        setBubbleText(reply);
        setMonsterImg("Monster_Breathing.png");
        setTimeout(() => setStep('moduleRun'), 500);
    };

    return (
        <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-0 bg-black z-50 flex flex-col"
        >
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1A0D33] to-black" />

            {/* Top Bar */}
            <div className="relative z-10 flex justify-between items-center px-5 pt-5">
                <button onClick={onExit} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                    <X size={16} className="text-white/80" />
                </button>
                <div className="text-[13px] font-semibold text-white/50">
                    {step === 'moduleRun' ? '我们做点别的' : step === 'result' ? '现在决定' : '先接住一下'}
                </div>
                {/* Wave Progress Port */}
                <div className="w-[86px] h-[32px] rounded-full bg-white/5 border border-white/10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[#59B3FF]/20" style={{ width: `${progress * 100}%` }}></div>
                    <div className="absolute inset-0 flex items-center justify-center gap-1.5">
                        {[0, 1, 2].map(i => (
                            <div key={i} className={clsx("w-1 h-1 rounded-full", (i <= (elapsed < SEG1_END ? 0 : elapsed < SEG2_END ? 1 : 2)) ? "bg-white" : "bg-white/30")} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Stage Content */}
            <div className="flex-1 relative z-0 flex items-center justify-center">
                {/* Monster Layer */}
                <div className="relative flex flex-col items-center">
                    {!minimalMode && (
                        <div className="mb-[-10px] z-10 glass-card px-4 py-3 max-w-[280px]">
                            <p className="text-[14px] font-semibold text-white/90 text-center whitespace-pre-wrap">{bubbleText}</p>
                        </div>
                    )}
                    <motion.img
                        key={monsterImg}
                        src={`/${monsterImg}`}
                        initial={{ opacity: 0.8 }} animate={{ opacity: 1 }}
                        className="w-[70vw] max-w-[280px] drop-shadow-2xl"
                        style={{
                            // Breathing animation if module is breathLight
                            animation: (step === 'moduleRun' && module === 'breathLight') ? 'breath 4s infinite ease-in-out' : 'float 6s infinite ease-in-out'
                        }}
                    />
                </div>

                {/* Overlay Module */}
                {step === 'moduleRun' && module === 'breathLight' && (
                    <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/40 backdrop-blur-sm">
                        <BreathLightOverlay />
                    </div>
                )}
            </div>

            {/* Bottom Card */}
            <div className="p-5 pb-8 relative z-20">
                <div className="glass-card flex flex-col gap-3 min-h-[160px] justify-center">
                    {step === 'checkIn1' && (
                        <>
                            <div className="text-white font-bold px-1">发生什么了？</div>
                            <button className="option-row" onClick={() => handleCheckIn1('bad', "嗯…我懂的。")}>
                                <div className="w-4 h-4 rounded-full border border-white/30" />
                                <span className="font-rounded font-bold text-[15px]">今天很糟糕</span>
                            </button>
                            <button className="option-row" onClick={() => handleCheckIn1('stress', "辛苦了。先慢一点。")}>
                                <div className="w-4 h-4 rounded-full border border-white/30" />
                                <span className="font-rounded font-bold text-[15px]">压力太大了</span>
                            </button>
                        </>
                    )}

                    {step === 'checkIn2' && (
                        <>
                            <div className="text-white font-bold px-1">现在最想做什么？</div>
                            <button className="option-row" onClick={() => setTimeout(() => setStep('moduleSelect'), 500)}>
                                <div className="w-4 h-4 rounded-full border border-white/30" />
                                <span className="font-rounded font-bold text-[15px]">吃点东西</span>
                            </button>
                            <button className="option-row" onClick={() => setTimeout(() => setStep('moduleSelect'), 500)}>
                                <div className="w-4 h-4 rounded-full border border-white/30" />
                                <span className="font-rounded font-bold text-[15px]">安静待一会儿</span>
                            </button>
                        </>
                    )}

                    {(step === 'moduleSelect') && (
                        <>
                            <div className="text-white font-bold px-1">我们做点别的</div>
                            <button className="module-row" onClick={() => handleModuleSelect('breathLight', "跟着光，慢慢呼吸。")}>
                                <Circle className="text-white/50 w-6" />
                                <div className="flex-1">
                                    <div className="font-bold text-[15px]">呼吸灯</div>
                                    <div className="text-[12px] text-white/50">跟着光慢慢呼吸</div>
                                </div>
                                <ChevronRight size={14} className="text-white/30" />
                            </button>
                            <button className="module-row" onClick={() => handleModuleSelect('doodle', "随便画点什么。")}>
                                <Pencil className="text-white/50 w-6" />
                                <div className="flex-1">
                                    <div className="font-bold text-[15px]">涂一涂</div>
                                    <div className="text-[12px] text-white/50">随便画点什么</div>
                                </div>
                                <ChevronRight size={14} className="text-white/30" />
                            </button>
                        </>
                    )}

                    {step === 'moduleRun' && (
                        <div className="flex gap-2">
                            <button className="btn-secondary" onClick={() => setModule('breathLight')}>呼吸灯</button>
                            <button className="btn-secondary" onClick={() => setModule('doodle')}>涂一涂</button>
                            <button className="btn-secondary" onClick={() => setModule('listen')}>听一听</button>
                        </div>
                    )}

                    {step === 'landing' && (
                        <>
                            <div className="text-white font-bold px-1">快结束了...</div>
                            <div className="text-white/50 text-sm px-1">等待进度条走完...</div>
                        </>
                    )}

                    {step === 'result' && (
                        <>
                            <button className="btn-primary" onClick={onExit}>回到舞台</button>
                            <button className="btn-secondary" onClick={onExit}>延迟 2 分钟 (完成后算一次)</button>
                        </>
                    )}
                </div>
            </div>

            <style>{`
         @keyframes breath {
           0%, 100% { transform: scale(1); }
           50% { transform: scale(1.05); }
         }
       `}</style>
        </motion.div>
    );
}

// --- Helper Components ---

function BreathLightOverlay() {
    return (
        <motion.div
            animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-[240px] h-[240px] rounded-full bg-[#59B3FF] blur-[60px] opacity-60"
        />
    )
}

function SettingsView({ onExit, minimalMode, setMinimalMode, monster3D, setMonster3D }: any) {
    return (
        <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-0 bg-[#08040a] z-50 flex flex-col"
        >
            <div className="flex items-center px-4 py-3 border-b border-white/5">
                <button onClick={onExit} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10"><X size={16} /></button>
                <span className="flex-1 text-center font-semibold text-white/50 text-[13px]">设置</span>
                <div className="w-8" />
            </div>

            <div className="p-5 flex flex-col gap-4">
                {/* Toggle Card */}
                <div className="glass-card flex flex-col gap-4">
                    <span className="font-bold text-[16px]">显示</span>
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="font-semibold text-[14px]">极简模式</div>
                            <div className="text-[12px] text-white/50">隐藏怪兽动画/对话</div>
                        </div>
                        <Toggle checked={minimalMode} onChange={setMinimalMode} />
                    </div>
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="font-semibold text-[14px]">3D 怪兽 (实验)</div>
                            <div className="text-[12px] text-white/50">开启后使用 USDZ 渲染 (Simulation)</div>
                        </div>
                        <Toggle checked={monster3D} onChange={setMonster3D} />
                    </div>
                </div>

                {/* Growth Card */}
                <div className="glass-card">
                    <span className="font-bold text-[16px] block mb-3">怪兽成长</span>
                    <div className="flex items-center gap-4">
                        <img src="/Monster_Happy.png" className="w-[80px] h-[80px]" />
                        <div className="flex-1">
                            <div className="font-bold text-[15px]">Lv. 5</div>
                            <div className="text-[13px] text-white/85">🍰 24</div>
                            <div className="text-[12px] text-white/50">经验: 78%</div>
                        </div>
                        <div className="w-[80px] h-[80px] relative flex items-center justify-center">
                            <svg className="w-full h-full -rotate-90">
                                <circle cx="40" cy="40" r="32" stroke="rgba(255,255,255,0.1)" strokeWidth="6" fill="none" />
                                <circle cx="40" cy="40" r="32" stroke="#59B3FF" strokeWidth="6" fill="none" strokeDasharray="200" strokeDashoffset={200 * (1 - 0.78)} strokeLinecap="round" />
                            </svg>
                            <span className="absolute font-bold text-sm">78%</span>
                        </div>
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
            (Setup View Placeholder - Same as iOS)
            <br /> <button className="btn-secondary w-auto px-4 mt-4" onClick={onExit}>Close</button>
        </div>
    )
}

function ReviewView({ onExit }: any) {
    return (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center text-white/50">
            (Review View Placeholder - Same as iOS)
            <br /> <button className="btn-secondary w-auto px-4 mt-4" onClick={onExit}>Close</button>
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
