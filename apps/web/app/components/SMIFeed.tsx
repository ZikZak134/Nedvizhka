'use client';
import { useState } from 'react';

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
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div style={{
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(16px)',
            borderRadius: 'var(--radius-xl)',
            width: '100%',
            maxWidth: '340px',
            color: 'white',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            marginBottom: '10px'
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
                    <span style={{ fontWeight: 600, fontSize: '15px' }}>СМИ обзор</span>
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
                <div style={{ padding: '12px', maxHeight: '360px', overflowY: 'auto' }}>
                    {SMI_DATA.map((item) => (
                        <div
                            key={item.id}
                            style={{
                                marginBottom: '12px',
                                padding: '12px',
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: '12px',
                                border: `1px solid ${item.sentiment === 'positive'
                                        ? 'rgba(34, 197, 94, 0.2)'
                                        : item.sentiment === 'negative'
                                            ? 'rgba(239, 68, 68, 0.2)'
                                            : 'rgba(255,255,255,0.05)'
                                    }`
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <span style={{ fontSize: '14px' }}>{item.sourceIcon}</span>
                                <span style={{
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    color: 'var(--elite-accent-gold)'
                                }}>{item.source}</span>
                                <span style={{ fontSize: '10px', color: '#64748b' }}>{item.date}</span>
                            </div>
                            <div style={{
                                fontSize: '13px',
                                fontWeight: 600,
                                marginBottom: '6px',
                                lineHeight: 1.3
                            }}>
                                {item.title}
                            </div>
                            <div style={{
                                fontSize: '11px',
                                color: '#94a3b8',
                                lineHeight: 1.5
                            }}>
                                {item.excerpt}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
