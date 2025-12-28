'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Theme = 'current' | 'dark-prestige' | 'champagne';

interface EffectSettings {
    enabled: boolean;
    // Общие настройки
    size?: number; // 1-100
    speed?: number; // 1-100
    intensity?: number; // 1-100
    color?: string;
}

const DEFAULT_SETTINGS: Record<string, EffectSettings> = {
    'magnetic-buttons': { enabled: true, size: 50, speed: 50, intensity: 30 },
    'glow-trail': { enabled: false, size: 20, speed: 60, intensity: 70, color: '#d4af37' },
    'glassmorphism': { enabled: true, intensity: 60 },
    'ripple-effect': { enabled: true, size: 40, speed: 60 },
    'animated-bg': { enabled: true, speed: 30 },
    'glowing-cards': { enabled: false, intensity: 80, color: '#d4af37' },
    'pull-to-refresh': { enabled: false, size: 50 },
    'floating-action': { enabled: false, size: 60 },
    'preloader-spinner': { enabled: false, size: 50, speed: 50 },
    'preloader-dots': { enabled: false, size: 40, speed: 60 },
    'preloader-gradient': { enabled: false, speed: 40 },
};

const THEMES = {
    current: { name: 'Current (Blue)', bg: '#0f172a', accent: '#3b82f6', text: '#ffffff' },
    'dark-prestige': { name: 'Dark Prestige (Rolls-Royce)', bg: '#0a0a0a', accent: '#d4af37', text: '#ffffff' },
    champagne: { name: 'Champagne Minimal (The Agency)', bg: '#faf8f5', accent: '#8b7355', text: '#1a1a1a' },
};

export default function ShowcasePage() {
    const [theme, setTheme] = useState<Theme>('dark-prestige');
    const [settings, setSettings] = useState<Record<string, EffectSettings>>(DEFAULT_SETTINGS);
    const currentTheme = THEMES[theme];

    const updateSetting = (id: string, key: keyof EffectSettings, value: any) => {
        setSettings(prev => ({
            ...prev,
            [id]: { ...prev[id], [key]: value }
        }));
    };

    const handleExport = () => {
        const enabled = Object.entries(settings)
            .filter(([_, s]) => s.enabled)
            .map(([id, s]) => ({ id, ...s }));

        console.log('Экспорт настроек:', JSON.stringify(enabled, null, 2));
        alert(`✅ Экспортировано ${enabled.length} эффектов!\n\nСмотрите консоль (F12) для полного JSON`);
    };

    return (
        <div style={{ minHeight: '100vh', background: currentTheme.bg, color: currentTheme.text, padding: '40px 20px' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
                    <h1 style={{ fontSize: '36px', fontWeight: 800, margin: 0 }}>🎨 Showcase + Settings</h1>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{
                            background: currentTheme.accent,
                            color: theme === 'champagne' ? '#fff' : currentTheme.bg,
                            padding: '10px 20px',
                            borderRadius: '50px',
                            fontWeight: 700,
                            fontSize: '14px',
                        }}>
                            Выбрано: {Object.values(settings).filter(s => s.enabled).length}
                        </div>
                        <button onClick={handleExport} style={{
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '50px',
                            color: '#fff',
                            fontWeight: 700,
                            cursor: 'pointer',
                        }}>
                            📤 Экспорт JSON
                        </button>
                        <Link href="/" style={{
                            background: 'rgba(255,255,255,0.1)',
                            color: currentTheme.text,
                            padding: '12px 24px',
                            borderRadius: '50px',
                            textDecoration: 'none',
                            fontWeight: 700,
                        }}>← Назад</Link>
                    </div>
                </div>

                {/* Theme Selector */}
                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>0️⃣ Тема</h2>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        {Object.entries(THEMES).map(([key, t]) => (
                            <button key={key} onClick={() => setTheme(key as Theme)} style={{
                                padding: '16px 24px',
                                borderRadius: '12px',
                                border: theme === key ? `2px solid ${t.accent}` : '2px solid transparent',
                                background: t.bg,
                                color: t.text,
                                cursor: 'pointer',
                                fontWeight: 600,
                            }}>{t.name}</button>
                        ))}
                    </div>
                </section>

                {/* Cursor Effects */}
                <CategoryHeader>💫 Курсор</CategoryHeader>

                <EffectCard
                    id="magnetic-buttons"
                    title="Magnetic Buttons"
                    description="Кнопки притягивают курсор"
                    settings={settings['magnetic-buttons']}
                    onUpdate={(key, val) => updateSetting('magnetic-buttons', key, val)}
                    theme={theme}
                    settingsConfig={[
                        { key: 'size', label: 'Размер', min: 10, max: 100 },
                        { key: 'speed', label: 'Скорость', min: 1, max: 100 },
                        { key: 'intensity', label: 'Сила притяжения', min: 1, max: 100 },
                    ]}
                >
                    <MagneticButtonDemo settings={settings['magnetic-buttons']} accentColor={currentTheme.accent} theme={theme} />
                </EffectCard>

                <EffectCard
                    id="glow-trail"
                    title="Glow Trail"
                    description="Световой след за курсором"
                    settings={settings['glow-trail']}
                    onUpdate={(key, val) => updateSetting('glow-trail', key, val)}
                    theme={theme}
                    settingsConfig={[
                        { key: 'size', label: 'Размер частиц', min: 10, max: 50 },
                        { key: 'speed', label: 'Скорость затухания', min: 1, max: 100 },
                        { key: 'intensity', label: 'Яркость', min: 1, max: 100 },
                        { key: 'color', label: 'Цвет', type: 'color' },
                    ]}
                >
                    <GlowTrailDemo settings={settings['glow-trail']} />
                </EffectCard>

                {/* Materials */}
                <CategoryHeader>✨ Материалы</CategoryHeader>

                <EffectCard
                    id="glassmorphism"
                    title="Glassmorphism ⭐"
                    description="Эффект матового стекла"
                    settings={settings['glassmorphism']}
                    onUpdate={(key, val) => updateSetting('glassmorphism', key, val)}
                    theme={theme}
                    settingsConfig={[
                        { key: 'intensity', label: 'Blur интенсивность', min: 1, max: 100 },
                    ]}
                >
                    <GlassCard settings={settings['glassmorphism']} theme={theme} accentColor={currentTheme.accent} />
                </EffectCard>

                <EffectCard
                    id="ripple-effect"
                    title="Ripple Effect ⭐"
                    description="Волны от клика"
                    settings={settings['ripple-effect']}
                    onUpdate={(key, val) => updateSetting('ripple-effect', key, val)}
                    theme={theme}
                    settingsConfig={[
                        { key: 'size', label: 'Размер волны', min: 10, max: 100 },
                        { key: 'speed', label: 'Скорость распространения', min: 1, max: 100 },
                    ]}
                >
                    <RippleButton settings={settings['ripple-effect']} accentColor={currentTheme.accent} theme={theme} />
                </EffectCard>

                {/* NEW: Glowing Cards */}
                <EffectCard
                    id="glowing-cards"
                    title="🆕 Glowing Cards"
                    description="Светящиеся карточки с градиентами"
                    settings={settings['glowing-cards']}
                    onUpdate={(key, val) => updateSetting('glowing-cards', key, val)}
                    theme={theme}
                    settingsConfig={[
                        { key: 'intensity', label: 'Интенсивность свечения', min: 1, max: 100 },
                        { key: 'color', label: 'Цвет свечения', type: 'color' },
                    ]}
                >
                    <GlowingCardDemo settings={settings['glowing-cards']} theme={theme} />
                </EffectCard>

                {/* Mobile Effects */}
                <CategoryHeader>📱 Мобильные</CategoryHeader>

                <EffectCard
                    id="pull-to-refresh"
                    title="🆕 Pull to Refresh"
                    description="Потянуть вниз для обновления"
                    settings={settings['pull-to-refresh']}
                    onUpdate={(key, val) => updateSetting('pull-to-refresh', key, val)}
                    theme={theme}
                    settingsConfig={[
                        { key: 'size', label: 'Размер индикатора', min: 20, max: 80 },
                    ]}
                >
                    <PullToRefreshDemo settings={settings['pull-to-refresh']} accentColor={currentTheme.accent} />
                </EffectCard>

                <EffectCard
                    id="floating-action"
                    title="🆕 Floating Action Button"
                    description="Плавающая кнопка действия (FAB)"
                    settings={settings['floating-action']}
                    onUpdate={(key, val) => updateSetting('floating-action', key, val)}
                    theme={theme}
                    settingsConfig={[
                        { key: 'size', label: 'Размер кнопки', min: 40, max: 100 },
                    ]}
                >
                    <FloatingActionDemo settings={settings['floating-action']} accentColor={currentTheme.accent} />
                </EffectCard>

                {/* Backgrounds */}
                <CategoryHeader>🎨 Фоны</CategoryHeader>

                <EffectCard
                    id="animated-bg"
                    title="Animated Background ⭐"
                    description="Плавно меняющийся gradient"
                    settings={settings['animated-bg']}
                    onUpdate={(key, val) => updateSetting('animated-bg', key, val)}
                    theme={theme}
                    settingsConfig={[
                        { key: 'speed', label: 'Скорость анимации', min: 1, max: 100 },
                    ]}
                >
                    <AnimatedBgPreview settings={settings['animated-bg']} />
                </EffectCard>

                {/* Preloaders */}
                <CategoryHeader>⏳ Загрузка (Preloaders)</CategoryHeader>

                <EffectCard
                    id="preloader-spinner"
                    title="🆕 Spinner Loader"
                    description="Классический спиннер"
                    settings={settings['preloader-spinner']}
                    onUpdate={(key, val) => updateSetting('preloader-spinner', key, val)}
                    theme={theme}
                    settingsConfig={[
                        { key: 'size', label: 'Размер', min: 20, max: 100 },
                        { key: 'speed', label: 'Скорость вращения', min: 1, max: 100 },
                    ]}
                >
                    <SpinnerLoader settings={settings['preloader-spinner']} accentColor={currentTheme.accent} />
                </EffectCard>

                <EffectCard
                    id="preloader-dots"
                    title="🆕 Pulse Dots"
                    description="Пульсирующие точки"
                    settings={settings['preloader-dots']}
                    onUpdate={(key, val) => updateSetting('preloader-dots', key, val)}
                    theme={theme}
                    settingsConfig={[
                        { key: 'size', label: 'Размер точек', min: 10, max: 60 },
                        { key: 'speed', label: 'Скорость пульсации', min: 1, max: 100 },
                    ]}
                >
                    <PulseDotsLoader settings={settings['preloader-dots']} accentColor={currentTheme.accent} />
                </EffectCard>

                <EffectCard
                    id="preloader-gradient"
                    title="🆕 Gradient Wave"
                    description="Градиентная волна (элитная)"
                    settings={settings['preloader-gradient']}
                    onUpdate={(key, val) => updateSetting('preloader-gradient', key, val)}
                    theme={theme}
                    settingsConfig={[
                        { key: 'speed', label: 'Скорость волны', min: 1, max: 100 },
                    ]}
                >
                    <GradientWaveLoader settings={settings['preloader-gradient']} accentColor={currentTheme.accent} />
                </EffectCard>

                {/* Export Section */}
                <div style={{
                    marginTop: '60px',
                    padding: '40px',
                    background: `linear-gradient(135deg, ${currentTheme.accent}20, ${currentTheme.accent}10)`,
                    borderRadius: '20px',
                    textAlign: 'center',
                    border: `2px solid ${currentTheme.accent}40`,
                }}>
                    <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px' }}>
                        Готово к экспорту: {Object.values(settings).filter(s => s.enabled).length} эффектов
                    </h2>
                    <p style={{ opacity: 0.7, marginBottom: '24px' }}>
                        Нажмите кнопку ниже чтобы экспортировать настройки в JSON
                    </p>
                    <button onClick={handleExport} style={{
                        background: `linear-gradient(135deg, ${currentTheme.accent}, ${currentTheme.accent}dd)`,
                        border: 'none',
                        padding: '18px 48px',
                        borderRadius: '50px',
                        color: theme === 'champagne' ? '#fff' : currentTheme.bg,
                        fontWeight: 700,
                        fontSize: '18px',
                        cursor: 'pointer',
                        boxShadow: `0 8px 24px ${currentTheme.accent}40`,
                    }}>
                        📤 Экспорт в JSON (F12 Console)
                    </button>
                </div>
            </div>
        </div>
    );
}

// Components
function CategoryHeader({ children }: { children: React.ReactNode }) {
    return <h2 style={{ fontSize: '28px', fontWeight: 800, marginTop: '60px', marginBottom: '24px' }}>{children}</h2>;
}

function EffectCard({ id, title, description, settings, onUpdate, theme, settingsConfig, children }: any) {
    return (
        <section style={{
            background: theme === 'champagne' ? '#fff' : 'rgba(255,255,255,0.05)',
            padding: '32px',
            borderRadius: '20px',
            marginBottom: '24px',
            border: settings.enabled ? `2px solid #10b981` : `1px solid ${theme === 'champagne' ? '#e5e5e5' : 'rgba(255,255,255,0.1)'}`,
            boxShadow: settings.enabled ? '0 8px 24px rgba(16, 185, 129, 0.2)' : 'none',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>{title}</h3>
                    <p style={{ opacity: 0.7, fontSize: '14px' }}>{description}</p>
                </div>
                <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    padding: '12px 20px',
                    borderRadius: '50px',
                    background: settings.enabled ? '#10b981' : 'rgba(255,255,255,0.05)',
                }}>
                    <input
                        type="checkbox"
                        checked={settings.enabled}
                        onChange={(e) => onUpdate('enabled', e.target.checked)}
                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                    <span style={{ fontWeight: 600, fontSize: '14px', color: settings.enabled ? '#fff' : 'inherit' }}>
                        {settings.enabled ? 'Выбрано ✓' : 'Выбрать'}
                    </span>
                </label>
            </div>

            {/* Settings Controls */}
            {settings.enabled && settingsConfig && (
                <div style={{
                    background: 'rgba(0,0,0,0.2)',
                    padding: '20px',
                    borderRadius: '12px',
                    marginBottom: '20px',
                }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px', opacity: 0.8 }}>⚙️ Настройки:</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                        {settingsConfig.map((config: any) => (
                            <div key={config.key}>
                                <label style={{ display: 'block', fontSize: '12px', marginBottom: '8px', opacity: 0.7 }}>
                                    {config.label}
                                </label>
                                {config.type === 'color' ? (
                                    <input
                                        type="color"
                                        value={settings[config.key] || '#d4af37'}
                                        onChange={(e) => onUpdate(config.key, e.target.value)}
                                        style={{ width: '100%', height: '40px', cursor: 'pointer', borderRadius: '8px' }}
                                    />
                                ) : (
                                    <>
                                        <input
                                            type="range"
                                            min={config.min}
                                            max={config.max}
                                            value={settings[config.key] || config.min}
                                            onChange={(e) => onUpdate(config.key, parseInt(e.target.value))}
                                            style={{ width: '100%' }}
                                        />
                                        <div style={{ textAlign: 'right', fontSize: '12px', marginTop: '4px', opacity: 0.6 }}>
                                            {settings[config.key] || config.min}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Demo */}
            {children}
        </section>
    );
}

// Effect Demos
function MagneticButtonDemo({ settings, accentColor, theme }: any) {
    const [transform, setTransform] = useState('translate(0, 0)');
    const intensity = (settings.intensity || 30) / 100;
    const size = (settings.size || 50) / 100;

    return (
        <button
            onMouseMove={(e) => {
                if (!settings.enabled) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                setTransform(`translate(${x * intensity}px, ${y * intensity}px) scale(${1 + size * 0.1})`);
            }}
            onMouseLeave={() => setTransform('translate(0, 0) scale(1)')}
            style={{
                padding: `${12 * size}px ${24 * size}px`,
                borderRadius: '50px',
                border: 'none',
                background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`,
                color: theme === 'champagne' ? '#fff' : '#0a0a0a',
                fontWeight: 700,
                fontSize: `${14 * size}px`,
                cursor: 'pointer',
                transform,
                transition: settings.enabled ? `transform ${0.3 - (settings.speed || 50) / 500}s ease-out` : 'none',
                boxShadow: `0 8px 24px ${accentColor}40`,
            }}
        >
            Наведите мышь
        </button>
    );
}

function GlowTrailDemo({ settings }: any) {
    const [trails, setTrails] = useState<Array<{ x: number, y: number, id: number }>>([]);
    const size = (settings.size || 20);
    const fadeSpeed = 1200 - (settings.speed || 60) * 10;
    const opacity = (settings.intensity || 70) / 100;

    return (
        <div
            onMouseMove={(e) => {
                if (!settings.enabled) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const id = Date.now();
                setTrails(prev => [...prev.slice(-10), { x, y, id }]);
                setTimeout(() => setTrails(prev => prev.filter(t => t.id !== id)), fadeSpeed);
            }}
            style={{
                position: 'relative',
                width: '100%',
                height: '200px',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '12px',
                overflow: 'hidden',
                cursor: 'crosshair',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
            }}
        >
            <div style={{ fontSize: '14px', opacity: 0.6 }}>Подвигайте мышью ✨</div>
            {trails.map(trail => (
                <div
                    key={trail.id}
                    style={{
                        position: 'absolute',
                        left: trail.x,
                        top: trail.y,
                        width: `${size}px`,
                        height: `${size}px`,
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${settings.color || '#d4af37'}${Math.floor(opacity * 255).toString(16)}, transparent)`,
                        boxShadow: `0 0 30px ${settings.color || '#d4af37'}`,
                        pointerEvents: 'none',
                        animation: `fadeOut ${fadeSpeed}ms ease-out forwards`,
                    }}
                />
            ))}
            <style jsx>{`
                @keyframes fadeOut {
                    from { opacity: 1; transform: scale(1); }
                    to { opacity: 0; transform: scale(2); }
                }
            `}</style>
        </div>
    );
}

function GlassCard({ settings, theme, accentColor }: any) {
    const blurAmount = (settings.intensity || 60) / 5;
    return (
        <div style={{
            position: 'relative',
            height: '200px',
            background: `linear-gradient(135deg, ${accentColor}40, ${accentColor}10)`,
            borderRadius: '16px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <div style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
            }} />
            <div style={{
                padding: '32px',
                borderRadius: '20px',
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: `blur(${blurAmount}px) saturate(180%)`,
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                color: '#fff',
            }}>
                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Glassmorphism</h3>
                <p style={{ fontSize: '14px', opacity: 0.8 }}>Blur: {blurAmount}px</p>
            </div>
        </div>
    );
}

function RippleButton({ settings, accentColor, theme }: any) {
    const [ripples, setRipples] = useState<Array<{ x: number, y: number, id: number }>>([]);
    const duration = 1000 - (settings.speed || 60) * 5;
    const scale = (settings.size || 40) / 10;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = Date.now();
        setRipples(prev => [...prev, { x, y, id }]);
        setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), duration);
    };

    return (
        <button
            onClick={handleClick}
            style={{
                position: 'relative',
                padding: '16px 40px',
                borderRadius: '50px',
                border: 'none',
                background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`,
                color: theme === 'champagne' ? '#fff' : '#0a0a0a',
                fontWeight: 700,
                fontSize: '16px',
                cursor: 'pointer',
                overflow: 'hidden',
                boxShadow: `0 8px 24px ${accentColor}40`,
            }}
        >
            Кликните меня
            {ripples.map(ripple => (
                <span
                    key={ripple.id}
                    style={{
                        position: 'absolute',
                        left: ripple.x,
                        top: ripple.y,
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.6)',
                        transform: 'translate(-50%, -50%)',
                        animation: `ripple ${duration}ms ease-out`,
                        pointerEvents: 'none',
                    }}
                />
            ))}
            <style jsx>{`
                @keyframes ripple {
                    from { transform: translate(-50%, -50%) scale(0); opacity: 1; }
                    to { transform: translate(-50%, -50%) scale(${scale * 10}); opacity: 0; }
                }
            `}</style>
        </button>
    );
}

// NEW Effects
function GlowingCardDemo({ settings, theme }: any) {
    const glowIntensity = (settings.intensity || 80) / 100;
    const glowColor = settings.color || '#d4af37';

    return (
        <div style={{
            padding: '32px',
            borderRadius: '20px',
            background: theme === 'champagne' ? '#fff' : 'rgba(255,255,255,0.05)',
            border: `2px solid ${glowColor}`,
            boxShadow: `0 0 ${40 * glowIntensity}px ${glowColor}, inset 0 0 ${20 * glowIntensity}px ${glowColor}40`,
            position: 'relative',
            overflow: 'hidden',
        }}>
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, transparent, ${glowColor}, transparent)`,
                animation: 'shimmer 2s infinite',
            }} />
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: glowColor }}>Glowing Card</h3>
            <p style={{ opacity: 0.7 }}>Светящаяся карточка с градиентной анимацией</p>
            <style jsx>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                }
            `}</style>
        </div>
    );
}

function PullToRefreshDemo({ settings, accentColor }: any) {
    const [pullDistance, setPullDistance] = useState(0);
    const size = (settings.size || 50) / 100;

    return (
        <div
            onMouseDown={(e) => {
                const startY = e.clientY;
                const onMove = (moveE: MouseEvent) => {
                    const distance = Math.max(0, Math.min(100, moveE.clientY - startY));
                    setPullDistance(distance);
                };
                const onUp = () => {
                    setPullDistance(0);
                    document.removeEventListener('mousemove', onMove);
                    document.removeEventListener('mouseup', onUp);
                };
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup', onUp);
            }}
            style={{
                position: 'relative',
                height: '200px',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '12px',
                overflow: 'hidden',
                cursor: 'grab',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                paddingTop: `${pullDistance}px`,
                transition: pullDistance === 0 ? 'padding-top 0.3s ease-out' : 'none',
            }}
        >
            <div style={{
                width: `${40 * size}px`,
                height: `${40 * size}px`,
                borderRadius: '50%',
                border: `3px solid ${accentColor}`,
                borderTopColor: 'transparent',
                animation: pullDistance > 50 ? 'spin 0.8s linear infinite' : 'none',
                transform: `rotate(${pullDistance * 3.6}deg)`,
            }} />
            <div style={{ position: 'absolute', bottom: '20px', fontSize: '12px', opacity: 0.6, color: '#fff' }}>
                Потяните вниз
            </div>
            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

function FloatingActionDemo({ settings, accentColor }: any) {
    const size = (settings.size || 60);

    return (
        <div style={{
            position: 'relative',
            height: '200px',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <button style={{
                position: 'absolute',
                bottom: '20px',
                right: '20px',
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: '50%',
                border: 'none',
                background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`,
                color: '#fff',
                fontSize: `${size / 3}px`,
                cursor: 'pointer',
                boxShadow: `0 6px 20px ${accentColor}60`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                +
            </button>
            <div style={{ fontSize: '14px', opacity: 0.6, color: '#fff' }}>
                Floating Action Button →
            </div>
        </div>
    );
}

function AnimatedBgPreview({ settings }: any) {
    const [hue, setHue] = useState(0);
    const speed = (settings.speed || 30);

    useEffect(() => {
        const timer = setInterval(() => {
            setHue(prev => (prev + 1) % 360);
        }, 100 - speed);
        return () => clearInterval(timer);
    }, [speed]);

    return (
        <div style={{
            height: '200px',
            borderRadius: '12px',
            background: `linear-gradient(135deg, 
                hsl(${hue}, 70%, 50%) 0%, 
                hsl(${(hue + 60) % 360}, 70%, 50%) 50%, 
                hsl(${(hue + 120) % 360}, 70%, 50%) 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            textShadow: '0 2px 10px rgba(0,0,0,0.3)',
        }}>
            Animated Gradient
        </div>
    );
}

function SpinnerLoader({ settings, accentColor }: any) {
    const size = (settings.size || 50);
    const speed = 2 - (settings.speed || 50) / 50;

    return (
        <div style={{
            height: '150px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '12px',
        }}>
            <div style={{
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: '50%',
                border: `${size / 10}px solid rgba(255,255,255,0.2)`,
                borderTopColor: accentColor,
                animation: `spin ${speed}s linear infinite`,
            }} />
            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

function PulseDotsLoader({ settings, accentColor }: any) {
    const size = (settings.size || 40) / 4;
    const speed = 2 - (settings.speed || 60) / 50;

    return (
        <div style={{
            height: '150px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: `${size}px`,
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '12px',
        }}>
            {[0, 1, 2].map(i => (
                <div
                    key={i}
                    style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        borderRadius: '50%',
                        background: accentColor,
                        animation: `pulse ${speed}s ease-in-out infinite`,
                        animationDelay: `${i * speed / 3}s`,
                    }}
                />
            ))}
            <style jsx>{`
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.5); opacity: 0.5; }
                }
            `}</style>
        </div>
    );
}

function GradientWaveLoader({ settings, accentColor }: any) {
    const [offset, setOffset] = useState(0);
    const speed = (settings.speed || 40);

    useEffect(() => {
        const timer = setInterval(() => {
            setOffset(prev => (prev + 1) % 100);
        }, 100 - speed);
        return () => clearInterval(timer);
    }, [speed]);

    return (
        <div style={{
            height: '150px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '12px',
            overflow: 'hidden',
            position: 'relative',
        }}>
            <div style={{
                position: 'absolute',
                top: 0,
                left: `-${100 - offset}%`,
                width: '200%',
                height: '100%',
                background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
            }} />
            <div style={{ position: 'relative', zIndex: 1, color: '#fff', fontWeight: 700 }}>
                Loading...
            </div>
        </div>
    );
}
