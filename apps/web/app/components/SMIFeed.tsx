'use client';
import { useState } from 'react';

/**
 * SMIFeed — Лента новостей из СМИ о рынке недвижимости
 * Адаптировано для светлой темы luxury-дизайна
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
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div style={{
            background: '#ffffff',
            borderRadius: '8px',
            width: '100%',
            maxWidth: '100%',
            color: '#1a1a1a',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            border: '1px solid rgba(0,0,0,0.1)',
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
                    background: 'rgba(0,0,0,0.02)',
                    borderBottom: isOpen ? '1px solid rgba(0,0,0,0.08)' : 'none',
                    minHeight: '56px'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '20px' }}>📰</span>
                    <span style={{ fontWeight: 600, fontSize: '15px', color: '#1a1a1a' }}>СМИ обзор</span>
                </div>
                <button
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#666666',
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
                                marginBottom: '12px',
                                padding: '16px',
                                background: item.sentiment === 'positive'
                                    ? 'rgba(22, 163, 74, 0.04)'
                                    : item.sentiment === 'negative'
                                        ? 'rgba(220, 38, 38, 0.04)'
                                        : 'rgba(0,0,0,0.02)',
                                borderRadius: '8px',
                                border: `1px solid ${item.sentiment === 'positive'
                                    ? 'rgba(22, 163, 74, 0.15)'
                                    : item.sentiment === 'negative'
                                        ? 'rgba(220, 38, 38, 0.15)'
                                        : 'rgba(0,0,0,0.08)'
                                    }`
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                <span style={{ fontSize: '14px' }}>{item.sourceIcon}</span>
                                <span style={{
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    color: '#b8860b'
                                }}>{item.source}</span>
                                <span style={{ fontSize: '11px', color: '#666666' }}>{item.date}</span>
                            </div>
                            <div style={{
                                fontSize: '14px',
                                fontWeight: 600,
                                marginBottom: '8px',
                                lineHeight: 1.4,
                                color: '#1a1a1a'
                            }}>
                                {item.title}
                            </div>
                            <div style={{
                                fontSize: '13px',
                                color: '#666666',
                                lineHeight: 1.6
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
