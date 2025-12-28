'use client';
import { useMemo } from 'react';

interface DistrictDetailsProps {
    district: {
        name: string;
        avg_price_sqm: number;
        growth_5y: number;
        growth_10y: number;
        roi: number;
        risk: string;
    };
    onClose: () => void;
}

export function DistrictDetails({ district, onClose }: DistrictDetailsProps) {
    const chartData = useMemo(() => {
        // Generate trend based on growth_10y
        const points = [];
        const startPrice = district.avg_price_sqm / (1 + district.growth_10y / 100);
        const endPrice = district.avg_price_sqm;

        for (let i = 0; i <= 10; i++) {
            const year = 2015 + i;
            // Linear growth with some random noise
            const progress = i / 10;
            const noise = (Math.random() - 0.5) * 0.1; // +/- 5% noise
            const price = startPrice + (endPrice - startPrice) * (progress * progress) * (1 + noise); // Exponential-ish
            points.push({ year, price });
        }
        return points;
    }, [district]);

    // Graph Dimensions
    const width = 280;
    const height = 120;
    const padding = 20;

    // Scales
    const minPrice = Math.min(...chartData.map(d => d.price));
    const maxPrice = Math.max(...chartData.map(d => d.price));

    const getX = (i: number) => padding + (i / 10) * (width - 2 * padding);
    const getY = (price: number) => height - padding - ((price - minPrice) / (maxPrice - minPrice)) * (height - 2 * padding);

    const pathD = chartData.map((d, i) =>
        `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.price)}`
    ).join(' ');

    const areaD = `${pathD} L ${width - padding} ${height} L ${padding} ${height} Z`;

    return (
        <div className={`district-panel ${district ? 'active' : ''}`} style={{
            position: 'absolute',
            top: '80px',
            right: '16px',
            width: '320px',
            background: 'var(--navy-light)',
            backdropFilter: 'blur(16px)',
            borderRadius: 'var(--radius-xl)',
            padding: '24px',
            color: 'var(--white)',
            zIndex: 2000,
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid rgba(255,255,255,0.1)',
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>{district.name}</h2>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Аналитика района</div>
                </div>
                <button
                    onClick={onClose}
                    style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '20px', cursor: 'pointer' }}
                >
                    ✕
                </button>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>Цена за м²</div>
                    <div style={{ fontSize: '16px', fontWeight: 700 }}>{(district.avg_price_sqm / 1000).toFixed(0)}K ₽</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>Рост (10 лет)</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#22c55e' }}>+{district.growth_10y}%</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>ROI (Аренда)</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#eab308' }}>{district.roi}%</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>Риски</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: district.risk === 'low' ? '#22c55e' : district.risk === 'medium' ? '#f97316' : '#ef4444' }}>
                        {district.risk === 'low' ? 'Низкие' : district.risk === 'medium' ? 'Средние' : 'Высокие'}
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '12px' }}>Динамика цен (2015-2025)</div>
                <div style={{ height: '140px', width: '100%', position: 'relative' }}>
                    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
                        <defs>
                            <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                            </linearGradient>
                        </defs>

                        {/* Grid lines */}
                        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.1)" />
                        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />

                        {/* Area */}
                        <path d={areaD} fill="url(#chartGradient)" />

                        {/* Line */}
                        <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                        {/* Points */}
                        {chartData.map((d, i) => (
                            <circle key={i} cx={getX(i)} cy={getY(d.price)} r="3" fill="#fff" />
                        ))}

                        {/* Labels */}
                        <text x={padding} y={height} fill="#64748b" fontSize="10" textAnchor="middle">2015</text>
                        <text x={width / 2} y={height} fill="#64748b" fontSize="10" textAnchor="middle">2020</text>
                        <text x={width - padding} y={height} fill="#64748b" fontSize="10" textAnchor="middle">2025</text>
                    </svg>
                </div>
            </div>

            <button style={{
                width: '100%',
                padding: '12px',
                background: '#3b82f6',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s'
            }}>
                Смотреть объекты в районе
            </button>

            <style jsx>{`
                .district-panel {
                    animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }

                @media (max-width: 768px) {
                    .district-panel {
                        position: fixed !important;
                        top: auto !important;
                        bottom: 0 !important;
                        left: 0 !important;
                        right: 0 !important;
                        width: 100% !important;
                        border-radius: 24px 24px 0 0 !important;
                        padding: 24px 20px 40px !important;
                        max-height: 85vh;
                        overflow-y: auto;
                        animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
                        z-index: 10002 !important;
                    }
                }

                @keyframes slideInRight {
                    from { transform: translateX(20px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }

                @keyframes slideUp {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
