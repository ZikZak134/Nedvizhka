'use client';
import { useState } from 'react';

/**
 * SMIFeed — Лента новостей из СМИ о рынке недвижимости
 * Стилизована под темную тему (glassmorphism)
 */

const SMI_DATA = [
    {
        id: 1,
        source: 'РБК',
        sourceIcon: '📊',
        date: 'Дек 2025',
        title: 'Объём предложения в Сочи упал на 41%',
        excerpt: 'Количество новостроек снизилось с 3122 до 1900 объектов. Эксперты прогнозируют дефицит.',
        sentiment: 'negative',
    },
    {
        id: 2,
        source: 'Циан',
        sourceIcon: '🏠',
        date: 'Дек 2025',
        title: 'Прогноз: +15% к ценам в 2026',
        excerpt: 'Аналитики Циан считают, что снижение ключевой ставки и дефицит приведут к росту цен.',
        sentiment: 'positive',
    },
    {
        id: 3,
        source: 'Forbes',
        sourceIcon: '💼',
        date: 'Ноя 2025',
        title: 'Олимпийский парк: +200% за 10 лет',
        excerpt: 'Район показал максимальный рост стоимости среди всех локаций черноморского побережья.',
        sentiment: 'positive',
    },
];

export function SMIFeed() {
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
                    <span style={{ fontWeight: 600, fontSize: '15px', color: 'white' }}>СМИ обзор</span>
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
                    {SMI_DATA.map((item) => (
                        <div
                            key={item.id}
                            style={{
                                marginBottom: '16px',
                            }}
                        >
                            <div style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
                                <span style={{
                                    background: item.sentiment === 'positive' ? '#22c55e' : item.sentiment === 'negative' ? '#ef4444' : '#eab308',
                                    fontSize: '9px',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontWeight: 700,
                                    color: 'white',
                                    textTransform: 'uppercase'
                                }}>
                                    {item.source}
                                </span>
                                <span style={{ color: '#94a3b8', fontSize: '10px' }}>{item.date}</span>
                            </div>
                            <h4 style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 600, color: 'white' }}>{item.title}</h4>
                            <p style={{ margin: 0, fontSize: '11px', color: '#cbd5e1', lineHeight: 1.4 }}>
                                {item.excerpt}
                            </p>
                        </div>
                    ))}
                    <div style={{ fontSize: '10px', color: '#64748b', fontStyle: 'italic', marginTop: '12px' }}>
                        Агрегатор новостей EstateAnalytics
                    </div>
                </div>
            )}
        </div>
    );
}
