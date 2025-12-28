'use client';

/**
 * PropertySurroundings — Вкладка «Окружение» в боковой панели объекта
 * Показывает экологию, уровень шума, зелёные зоны и качество жизни
 */

interface EnvironmentScore {
    name: string;
    icon: string;
    score: number; // 1-5
    description: string;
}

interface PropertySurroundingsProps {
    propertyId: string;
}

// Mock-данные экологии
const MOCK_ENVIRONMENT: EnvironmentScore[] = [
    { name: 'Экология', icon: '🌿', score: 5, description: 'Отличное качество воздуха' },
    { name: 'Тишина', icon: '🔇', score: 4, description: 'Низкий уровень шума' },
    { name: 'Озеленение', icon: '🌳', score: 5, description: 'Много парков и скверов' },
    { name: 'Безопасность', icon: '🛡️', score: 4, description: 'Охраняемая территория' },
    { name: 'Вид', icon: '🌅', score: 5, description: 'Панорама моря и гор' },
];

// Ближайшие зелёные зоны
const MOCK_GREEN_ZONES = [
    { name: 'Парк «Ривьера»', distance: '400 м', type: 'park' },
    { name: 'Дендрарий', distance: '1.2 км', type: 'garden' },
    { name: 'Набережная', distance: '200 м', type: 'promenade' },
];

export function PropertySurroundings({ propertyId }: PropertySurroundingsProps) {
    // Средний балл
    const avgScore = (MOCK_ENVIRONMENT.reduce((sum, e) => sum + e.score, 0) / MOCK_ENVIRONMENT.length).toFixed(1);

    return (
        <div className="property-surroundings fade-in">
            {/* Общий рейтинг */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(34, 197, 94, 0.1))',
                padding: '16px',
                borderRadius: '12px',
                marginBottom: '16px',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                textAlign: 'center'
            }}>
                <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>
                    Качество окружения
                </div>
                <div style={{
                    color: '#10b981',
                    fontSize: '36px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                }}>
                    {avgScore}
                    <span style={{ fontSize: '20px', color: '#64748b' }}>/5</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginTop: '8px' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                        <span key={star} style={{
                            fontSize: '16px',
                            opacity: star <= Math.round(parseFloat(avgScore)) ? 1 : 0.3
                        }}>
                            ⭐
                        </span>
                    ))}
                </div>
            </div>

            {/* Показатели окружения */}
            <div style={{ marginBottom: '20px' }}>
                <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>
                    🎯 Показатели
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {MOCK_ENVIRONMENT.map((env, idx) => (
                        <EnvironmentRow key={idx} item={env} />
                    ))}
                </div>
            </div>

            {/* Зелёные зоны */}
            <div style={{ marginBottom: '16px' }}>
                <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>
                    🌲 Зелёные зоны рядом
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {MOCK_GREEN_ZONES.map((zone, idx) => (
                        <div key={idx} style={{
                            background: 'rgba(34, 197, 94, 0.1)',
                            padding: '8px 12px',
                            borderRadius: '20px',
                            border: '1px solid rgba(34, 197, 94, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            <span style={{ fontSize: '14px' }}>
                                {zone.type === 'park' ? '🌳' : zone.type === 'garden' ? '🌺' : '🌊'}
                            </span>
                            <span style={{ color: '#e2e8f0', fontSize: '12px' }}>{zone.name}</span>
                            <span style={{ color: '#64748b', fontSize: '11px' }}>({zone.distance})</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Особенности локации */}
            <div style={{
                background: 'rgba(139, 92, 246, 0.1)',
                padding: '14px',
                borderRadius: '12px',
                border: '1px solid rgba(139, 92, 246, 0.2)'
            }}>
                <div style={{ color: '#a78bfa', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
                    ✨ Особенности
                </div>
                <div style={{ color: '#cbd5e1', fontSize: '12px', lineHeight: 1.6 }}>
                    Объект расположен в элитном курортном районе с видом на море.
                    Закрытая охраняемая территория, развитая инфраструктура для отдыха.
                </div>
            </div>
        </div>
    );
}

function EnvironmentRow({ item }: { item: EnvironmentScore }) {
    const getScoreColor = (score: number) => {
        if (score >= 4) return '#22c55e';
        if (score >= 3) return '#eab308';
        return '#f97316';
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 12px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.05)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                <div>
                    <div style={{ color: '#e2e8f0', fontSize: '13px' }}>{item.name}</div>
                    <div style={{ color: '#64748b', fontSize: '11px' }}>{item.description}</div>
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {[1, 2, 3, 4, 5].map(n => (
                    <div key={n} style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: n <= item.score ? getScoreColor(item.score) : 'rgba(255,255,255,0.1)'
                    }} />
                ))}
            </div>
        </div>
    );
}
