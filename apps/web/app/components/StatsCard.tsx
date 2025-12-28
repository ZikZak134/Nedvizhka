interface StatsCardProps {
    title: string;
    value: string;
    icon: string;
    trend?: number;
}

export function StatsCard({ title, value, icon, trend }: StatsCardProps) {
    return (
        <div className="card" style={{ padding: 'var(--space-lg)' }}>
            <div className="flex items-start justify-between mb-4">
                <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'rgba(212, 175, 55, 0.1)',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    border: '1px solid rgba(212, 175, 55, 0.2)'
                }}>
                    {icon}
                </div>
                {trend !== undefined && (
                    <span
                        className="badge"
                        style={{
                            backgroundColor: trend > 0 ? 'oklch(90% 0.08 145)' : 'oklch(90% 0.08 25)',
                            color: trend > 0 ? 'var(--color-success-600)' : 'var(--color-error-500)'
                        }}
                    >
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                )}
            </div>
            <div className="label mb-1" style={{ color: 'var(--elite-text-secondary)' }}>{title}</div>
            <div className="heading-4" style={{ color: 'var(--elite-text-primary)' }}>{value}</div>
        </div>
    );
}
