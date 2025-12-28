'use client';

interface PriceChartProps {
    type: 'distribution' | 'trend';
}

// Mock data for charts - in production would use real data from API
const distributionData = [
    { range: '< 10M', count: 15 },
    { range: '10-20M', count: 35 },
    { range: '20-30M', count: 28 },
    { range: '30-50M', count: 18 },
    { range: '50-100M', count: 12 },
    { range: '> 100M', count: 5 },
];

const trendData = [
    { month: 'Июл', price: 185000 },
    { month: 'Авг', price: 192000 },
    { month: 'Сен', price: 188000 },
    { month: 'Окт', price: 195000 },
    { month: 'Ноя', price: 205000 },
    { month: 'Дек', price: 212000 },
];

export function PriceChart({ type }: PriceChartProps) {
    if (type === 'distribution') {
        const maxCount = Math.max(...distributionData.map(d => d.count));

        return (
            <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: 'var(--space-2)' }}>
                {distributionData.map((item, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <div
                            style={{
                                width: '100%',
                                height: `${(item.count / maxCount) * 150}px`,
                                background: `linear-gradient(180deg, var(--gold), var(--gold-dark))`,
                                borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                                transition: 'all var(--transition-normal)',
                                opacity: 0.8
                            }}
                            title={`${item.count} объектов`}
                        />
                        <span className="caption" style={{ fontSize: '12px', textAlign: 'center', lineHeight: '1.2', color: 'var(--elite-text-secondary)', fontWeight: 500 }}>{item.range}</span>
                    </div>
                ))}
            </div>
        );
    }

    if (type === 'trend') {
        const maxPrice = Math.max(...trendData.map(d => d.price));
        const minPrice = Math.min(...trendData.map(d => d.price));
        const range = maxPrice - minPrice;

        // Create SVG path for line chart
        const points = trendData.map((item, i) => {
            const x = (i / (trendData.length - 1)) * 100;
            const y = 100 - ((item.price - minPrice) / range) * 80;
            return `${x},${y}`;
        }).join(' ');

        return (
            <div style={{ height: '200px', position: 'relative' }}>
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '160px' }}>
                    {/* Grid lines */}
                    {[0, 25, 50, 75, 100].map(y => (
                        <line
                            key={y}
                            x1="0" y1={y} x2="100" y2={y}
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="0.5"
                            strokeDasharray="4,4"
                        />
                    ))}

                    {/* Area fill */}
                    <polygon
                        points={`0,100 ${points} 100,100`}
                        fill="url(#gradient)"
                        opacity="0.3"
                    />

                    {/* Line */}
                    <polyline
                        points={points}
                        fill="none"
                        stroke="var(--gold)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Points */}
                    {trendData.map((item, i) => {
                        const x = (i / (trendData.length - 1)) * 100;
                        const y = 100 - ((item.price - minPrice) / range) * 80;
                        return (
                            <circle
                                key={i}
                                cx={x} cy={y} r="2.5"
                                fill="var(--gold)"
                            />
                        );
                    })}

                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* X-axis labels */}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 'var(--space-2)' }}>
                    {trendData.map((item, i) => (
                        <span key={i} style={{ fontSize: '12px', color: 'var(--elite-text-secondary)', fontWeight: 500 }}>{item.month}</span>
                    ))}
                </div>
            </div>
        );
    }

    return null;
}
