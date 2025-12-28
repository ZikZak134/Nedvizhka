'use client';
import { useState } from 'react';

interface NewsItem {
    id: string;
    tag: string;
    tagColor: string;
    date: string;
    title: string;
    description: string;
}

const NEWS_DATA: NewsItem[] = [
    {
        id: '1',
        tag: 'ДЕФИЦИТ',
        tagColor: '#ef4444',
        date: 'Дек 2025',
        title: 'Снижение новостроек на 41%',
        description: 'Предложение упало с 3122 до 1900 объектов. Эксперты прогнозируют дефицит апартаментов.',
    },
    {
        id: '2',
        tag: 'РОСТ ЦЕН',
        tagColor: '#22c55e',
        date: 'Аналитика',
        title: 'Прогноз +15% в 2026',
        description: 'Снижение ставки ЦБ и дефицит подтолкнут цены вверх. Аренда +7–12%.',
    },
    {
        id: '3',
        tag: 'СКИДКИ',
        tagColor: '#eab308',
        date: 'Рынок',
        title: 'Вторичка: Скидки до 30%',
        description: 'Максимальные скидки по России. Отличное время для входа.',
    },
    {
        id: '4',
        tag: 'ИНСАЙТ',
        tagColor: '#3b82f6',
        date: 'Эксклюзив',
        title: 'Олимпийский парк: +200%',
        description: 'За 10 лет район показал максимальный рост среди всех локаций.',
    },
];

export function MobileNewsCarousel() {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    return (
        <div style={{
            display: 'flex',
            gap: '12px',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            padding: '8px 16px 16px',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
        }}>
            {NEWS_DATA.map((item) => (
                <div
                    key={item.id}
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    style={{
                        minWidth: expandedId === item.id ? '280px' : '160px',
                        maxWidth: expandedId === item.id ? '280px' : '160px',
                        background: 'rgba(15, 23, 42, 0.95)',
                        backdropFilter: 'blur(16px)',
                        borderRadius: '16px',
                        padding: '14px',
                        color: 'white',
                        scrollSnapAlign: 'start',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        border: expandedId === item.id
                            ? '1px solid rgba(212, 175, 55, 0.4)'
                            : '1px solid rgba(255,255,255,0.1)',
                        boxShadow: expandedId === item.id
                            ? '0 8px 32px rgba(212, 175, 55, 0.2)'
                            : '0 4px 16px rgba(0,0,0,0.3)',
                        cursor: 'pointer',
                        flexShrink: 0,
                    }}
                >
                    {/* Header */}
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{
                            background: item.tagColor,
                            fontSize: '8px',
                            padding: '3px 6px',
                            borderRadius: '4px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                        }}>
                            {item.tag}
                        </span>
                        <span style={{ color: '#94a3b8', fontSize: '10px' }}>{item.date}</span>
                    </div>

                    {/* Title */}
                    <h4 style={{
                        margin: '0 0 6px',
                        fontSize: expandedId === item.id ? '14px' : '12px',
                        fontWeight: 600,
                        lineHeight: 1.3,
                        display: '-webkit-box',
                        WebkitLineClamp: expandedId === item.id ? 3 : 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                    }}>
                        {item.title}
                    </h4>

                    {/* Description - visible when expanded */}
                    {expandedId === item.id && (
                        <p style={{
                            margin: '0',
                            fontSize: '11px',
                            color: '#cbd5e1',
                            lineHeight: 1.5,
                            animation: 'fadeIn 0.3s ease',
                        }}>
                            {item.description}
                        </p>
                    )}

                    {/* Expand indicator */}
                    {expandedId !== item.id && (
                        <div style={{
                            fontSize: '10px',
                            color: '#64748b',
                            marginTop: '4px',
                        }}>
                            Подробнее →
                        </div>
                    )}
                </div>
            ))}

            {/* Source footer card */}
            <div style={{
                minWidth: '100px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(15, 23, 42, 0.6)',
                borderRadius: '16px',
                padding: '14px',
                flexShrink: 0,
                scrollSnapAlign: 'start',
            }}>
                <div style={{
                    textAlign: 'center',
                    color: '#64748b',
                    fontSize: '10px',
                }}>
                    <div style={{ marginBottom: '4px' }}>📰</div>
                    <div>Источники:</div>
                    <div style={{ color: '#94a3b8' }}>РБК, Циан</div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
