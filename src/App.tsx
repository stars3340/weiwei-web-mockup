import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles,
    Settings,
    ChevronRight,
    X,
    Bell,
    TrendingUp,
    HandHeart,
    Droplets,
    Pencil,
    Volume2,
    CheckCircle2
} from 'lucide-react';

// --- Types ---
type View = 'stage' | 'sos' | 'setup' | 'settings' | 'review';
type SOSStep = 'checkin1' | 'checkin2' | 'moduleSelect' | 'moduleRun' | 'landing' | 'result';
type SOSModule = 'breath' | 'doodle' | 'listen';

// --- Main App Component ---
export default function App() {
    const [view, setView] = useState<View>('stage');
    const [monsterState, setMonsterState] = useState({ level: 3, xp: 45, items: 12 });
    const [guardActive, setGuardActive] = useState(true);

    return (
        <div className="bg-fluid">
            <div className="app-container">
                <AnimatePresence mode="wait">
                    {view === 'stage' && (
                        <StageView
                            onNavigate={setView}
                            guardActive={guardActive}
                            monsterState={monsterState}
                        />
                    )}
                    {view === 'sos' && (
                        <SOSFlowView onExit={() => setView('stage')} />
                    )}
                    {view === 'setup' && (
                        <SetupView onExit={() => setView('stage')} />
                    )}
                    {view === 'settings' && (
                        <SettingsView onExit={() => setView('stage')} />
                    )}
                    {view === 'review' && (
                        <ReviewView onExit={() => setView('stage')} />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

// --- Sub-Views ---

function StageView({ onNavigate, guardActive, monsterState }: any) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col h-full"
            style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
        >
            {/* Top Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                <button className="glass-pill" onClick={() => onNavigate('settings')}>
                    <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        backgroundColor: guardActive ? 'var(--success)' : 'var(--text-tertiary)'
                    }} />
                    {guardActive ? '守护生效中' : '暂停守护'}
                    <ChevronRight size={12} opacity={0.5} />
                </button>
                <button
                    onClick={() => onNavigate('settings')}
                    style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--glass-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <Settings size={20} color="var(--text-tertiary)" />
                </button>
            </div>

            {/* Monster Stage */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <div className="monster-breath" style={{ position: 'relative' }}>
                    <div style={{
                        position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)',
                        minWidth: 140, textAlign: 'center'
                    }}>
                        <div className="glass-card" style={{ padding: '12px 18px', borderRadius: 20, fontSize: 14, fontWeight: 600 }}>
                            点开外卖前，<br />先见见我吧
                        </div>
                    </div>
                    <img
                        src="/monster.png"
                        alt="Monster"
                        style={{ width: 280, filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))' }}
                    />
                </div>
            </div>

            {/* Bottom Action Card */}
            <div className="glass-card" style={{ padding: 20, marginBottom: 10 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <button className="btn-primary" onClick={() => onNavigate('sos')}>
                        <Sparkles size={20} />
                        我现在想吃 (先 90 秒)
                    </button>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button className="btn-secondary" onClick={() => onNavigate('setup')}>守护设置</button>
                        <button className="btn-secondary" onClick={() => onNavigate('review')}>
                            <TrendingUp size={18} style={{ marginRight: 6 }} />
                            本周趋势
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function SOSFlowView({ onExit }: any) {
    const [step, setStep] = useState<SOSStep>('checkin1');
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress(p => Math.min(100, p + 0.2));
        }, 100);
        return () => clearInterval(timer);
    }, []);

    return (
        <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="flex flex-col h-full"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'var(--bg-deep)', padding: 20, zIndex: 100 }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button onClick={onExit} style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={20} />
                </button>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-tertiary)' }}>先接住情绪</div>
                <div style={{ width: 80, height: 32, borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${progress}%`, background: 'var(--brand)', opacity: 0.3 }} />
                    <div style={{ position: 'absolute', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                        {Math.floor(progress)}%
                    </div>
                </div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <img
                    src="/monster.png"
                    alt="Monster"
                    style={{ width: 220, opacity: 0.8 }}
                />
                <div style={{ marginTop: 20, textAlign: 'center' }}>
                    {step === 'checkin1' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <h2 style={{ fontSize: 24, marginBottom: 20 }}>发生什么了？</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 280 }}>
                                {['今天很糟糕', '压力太大了', '说不上来，很难受'].map(item => (
                                    <button key={item} onClick={() => setStep('checkin2')} className="btn-secondary" style={{ background: 'rgba(255,255,255,0.08)' }}>{item}</button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                    {step === 'checkin2' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <h2 style={{ fontSize: 24, marginBottom: 20 }}>现在最想？</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 280 }}>
                                {['吃点东西', '安静待一会儿', '想哭'].map(item => (
                                    <button key={item} onClick={() => setStep('moduleSelect')} className="btn-secondary" style={{ background: 'rgba(255,255,255,0.08)' }}>{item}</button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                    {step === 'moduleSelect' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <h2 style={{ fontSize: 24, marginBottom: 10 }}>我们做点别的</h2>
                            <p style={{ color: 'var(--text-tertiary)', fontSize: 14, marginBottom: 30 }}>跟随节奏，深呼吸 30 秒</p>
                            <button className="btn-primary" onClick={() => setStep('result')}>
                                <Droplets size={20} />
                                开始呼吸练习
                            </button>
                        </motion.div>
                    )}
                    {step === 'result' && (
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
                            <h2 style={{ fontSize: 28, marginBottom: 10 }}>90 秒完成了</h2>
                            <p style={{ color: 'var(--text-tertiary)', marginBottom: 40 }}>你现在感觉怎么样？</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 300 }}>
                                <button onClick={onExit} className="btn-primary">回到舞台</button>
                                <button onClick={onExit} className="btn-secondary">延迟 2 分钟决断</button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

function SetupView({ onExit }: any) {
    return (
        <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            className="flex flex-col h-full"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'var(--bg-deep)', padding: 20, zIndex: 100 }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
                <button onClick={onExit}><X /></button>
                <span style={{ fontSize: 14 }}>配置守护</span>
                <div style={{ width: 24 }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="glass-card" style={{ padding: 20 }}>
                    <h3 style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}><HandHeart size={20} color="var(--brand)" /> 守护范围</h3>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: 13, marginBottom: 20 }}>选择需要“暂停”的外卖或零食 App</p>
                    <button className="btn-secondary">已选 3 个 App</button>
                </div>

                <div className="glass-card" style={{ padding: 20 }}>
                    <h3 style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}><Bell size={20} color="var(--brand)" /> 提醒回流</h3>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: 13, marginBottom: 20 }}>拦截时发送 Time Sensitive 通知</p>
                    <button className="btn-secondary" style={{ background: 'var(--brand)', color: 'white' }}>已开启通知</button>
                </div>

                <button className="btn-primary" style={{ marginTop: 'auto' }} onClick={onExit}>保存并启用</button>
            </div>
        </motion.div>
    );
}

function SettingsView({ onExit }: any) {
    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col h-full overflow-y-auto"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'var(--bg-deep)', padding: 20, zIndex: 100 }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
                <button onClick={onExit}><X /></button>
                <span style={{ fontSize: 14 }}>设置</span>
                <div style={{ width: 24 }} />
            </div>

            <div className="glass-card" style={{ padding: 20, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 15 }}>
                <img src="/monster.png" style={{ width: 60 }} />
                <div>
                    <div style={{ fontWeight: 700, fontSize: 18 }}>Lv. 4</div>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>🍰 累积完成 18 次暂停</div>
                </div>
                <div style={{ marginLeft: 'auto', width: 44, height: 44, borderRadius: '50%', border: '4px solid var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800 }}>
                    65%
                </div>
            </div>
        </motion.div>
    )
}

function ReviewView({ onExit }: any) {
    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col h-full"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'var(--bg-deep)', padding: 20, zIndex: 100 }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
                <button onClick={onExit}><X /></button>
                <span style={{ fontSize: 14 }}>本周趋势</span>
                <div style={{ width: 24 }} />
            </div>

            <div className="glass-card" style={{ padding: 20, marginBottom: 20 }}>
                <h3 style={{ marginBottom: 20 }}>回头率分布</h3>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 120, padding: '0 10px' }}>
                    {[60, 85, 40, 95, 70, 30, 90].map((h, i) => (
                        <div
                            key={i}
                            style={{
                                width: 24,
                                height: `${h}%`,
                                background: h > 80 ? 'var(--brand)' : 'var(--glass-stroke)',
                                borderRadius: '6px 6px 0 0'
                            }}
                        />
                    ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, color: 'var(--text-tertiary)', fontSize: 10 }}>
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                </div>
            </div>
        </motion.div>
    )
}
