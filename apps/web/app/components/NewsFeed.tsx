'use client';
import { useState } from 'react';

export function NewsFeed() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div style={{
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(16px)',
            borderRadius: '12px',
            width: '100%',
            color: 'white',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
        }}>
            {/* Header */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="touch-ripple"
                style={{
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    background: 'rgba(255,255,255,0.03)',
                    borderBottom: isOpen ? '1px solid rgba(255,255,255,0.1)' : 'none',
                    minHeight: '56px'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '20px' }}>📰</span>
                    <span style={{ fontWeight: 600, fontSize: '15px' }}>Тренды 2025</span>
                </div>
                <button
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: '8px',
                        minWidth: '44px',
                        minHeight: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '8px',
                        transition: 'background 0.2s'
                    }}
                    aria-label={isOpen ? 'Свернуть' : 'Развернуть'}
                >
                    <span style={{
                        transition: 'transform 0.3s ease',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        display: 'inline-block'
                    }}>▼</span>
                </button>
            </div>

            {/* Content */}
            {isOpen && (
                <div style={{ padding: '16px', maxHeight: '400px', overflowY: 'auto' }}>
                    {/* Item 1 */}
                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
                            <span style={{ background: '#ef4444', fontSize: '9px', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>ДЕФИЦИТ</span>
                            <span style={{ color: '#94a3b8', fontSize: '10px' }}>Дек 2025</span>
                        </div>
                        <h4 style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 600 }}>Снижение новостроек на 41%</h4>
                        <p style={{ margin: 0, fontSize: '11px', color: '#cbd5e1', lineHeight: 1.4 }}>
                            Предложение упало с 3122 до 1900 объектов. Эксперты прогнозируют дефицит апартаментов и рост конкуренции за студии.
                        </p>
                    </div>

                    {/* Item 2 */}
                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
                            <span style={{ background: '#22c55e', fontSize: '9px', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>РОСТ ЦЕН</span>
                            <span style={{ color: '#94a3b8', fontSize: '10px' }}>Аналитика</span>
                        </div>
                        <h4 style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 600 }}>Прогноз +15% в 2026</h4>
                        <p style={{ margin: 0, fontSize: '11px', color: '#cbd5e1', lineHeight: 1.4 }}>
                            Снижение ставки ЦБ и дефицит проектов подтолкнут цены вверх. Аренда подорожает на 7–12%.
                        </p>
                    </div>

                    {/* Item 3 */}
                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
                            <span style={{ background: '#eab308', fontSize: '9px', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>СКИДКИ</span>
                            <span style={{ color: '#94a3b8', fontSize: '10px' }}>Рынок</span>
                        </div>
                        <h4 style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 600 }}>Вторичка: Скидки до 30%</h4>
                        <p style={{ margin: 0, fontSize: '11px', color: '#cbd5e1', lineHeight: 1.4 }}>
                            Максимальные скидки по России. Отличное время для входа перед новым циклом роста.
                        </p>
                    </div>

                    <div style={{ fontSize: '10px', color: '#64748b', fontStyle: 'italic', marginTop: '12px' }}>
                        Источники: Коммерсантъ, РБК, Циан
                    </div>
                </div>
            )}
        </div>
    );
}
