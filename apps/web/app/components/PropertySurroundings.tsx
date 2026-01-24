'use client';
import { toArray } from '../utils/safeArray';

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

interface GreenZone {
    name: string;
    distance: string;
    type: string;
}

interface PropertySurroundingsProps {
    propertyId: string;
    environment?: EnvironmentScore[];
    greenZones?: GreenZone[];
    description?: string;
}

const DEFAULT_ENVIRONMENT: EnvironmentScore[] = [
    { name: 'Экология', icon: '🌿', score: 5, description: 'Отличное качество воздуха' },
    { name: 'Тишина', icon: '🔇', score: 4, description: 'Низкий уровень шума' },
    { name: 'Озеленение', icon: '🌳', score: 5, description: 'Много парков и скверов' },
];

const DEFAULT_GREEN_ZONES = [
    { name: 'Парк «Ривьера»', distance: '400 м', type: 'park' },
    { name: 'Набережная', distance: '200 м', type: 'promenade' },
];

export function PropertySurroundings({ 
    propertyId, 
    environment = DEFAULT_ENVIRONMENT, 
    greenZones = DEFAULT_GREEN_ZONES,
    description = "Объект расположен в элитном курортном районе с видом на море. Закрытая охраняемая территория."
}: PropertySurroundingsProps) {
    
    const safeEnvironment = toArray<EnvironmentScore>(environment);
    const avgScore = (safeEnvironment.length > 0
        ? safeEnvironment.reduce((sum, e) => sum + e.score, 0) / safeEnvironment.length
        : 0).toFixed(1);

    return (
        <div className="lux-surroundings fade-in">
            {/* Общий рейтинг */}
            <div className="lux-surroundings-score-card">
                <div className="lux-surroundings-label">Качество окружения</div>
                <div className="lux-surroundings-score-val">
                    {avgScore}
                    <span className="lux-surroundings-score-max">/5</span>
                </div>
                <div className="lux-surroundings-stars">
                    {[1, 2, 3, 4, 5].map(star => (
                        <span key={star} style={{ opacity: star <= Math.round(parseFloat(avgScore)) ? 1 : 0.25 }}>
                            ⭐
                        </span>
                    ))}
                </div>
            </div>

            {/* Показатели окружения */}
            <div className="lux-surroundings-section">
                <h4 className="lux-surroundings-title">🎯 Показатели</h4>
                <div className="lux-surroundings-list">
                    {safeEnvironment.map((env, idx) => (
                        <EnvironmentRow key={idx} item={env} />
                    ))}
                </div>
            </div>

            {/* Зелёные зоны */}
            <div className="lux-surroundings-section">
                <h4 className="lux-surroundings-title">🌲 Зелёные зоны рядом</h4>
                <div className="lux-green-zones-grid">
                    {toArray(greenZones).map((zone, idx) => (
                        <div key={idx} className="lux-green-zone-tag">
                            <span className="lux-green-zone-icon">
                                {zone.type === 'park' ? '🌳' : zone.type === 'garden' ? '🌺' : '🌊'}
                            </span>
                            <span className="lux-green-zone-name">{zone.name}</span>
                            <span className="lux-green-zone-dist">({zone.distance})</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Особенности локации */}
            <div className="lux-surroundings-features">
                <div className="lux-surroundings-label lux-surroundings-label--features">✨ Особенности</div>
                <div className="lux-surroundings-text">{description}</div>
            </div>
        </div>
    );
}

function EnvironmentRow({ item }: { item: EnvironmentScore }) {
    const getScoreClass = (score: number) => {
        if (score >= 4) return 'lux-dot-success';
        if (score >= 3) return 'lux-dot-warning';
        return 'lux-dot-danger';
    };
    const scoreClass = getScoreClass(item.score);

    return (
        <div className="lux-env-row" style={{
            background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px',
            marginBottom: '8px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span className="lux-env-icon">{item.icon}</span>
                <div>
                    <div style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>{item.name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>{item.description}</div>
                </div>
            </div>
            <div className="lux-env-dots" style={{ display: 'flex', gap: '4px' }}>
                {[1, 2, 3, 4, 5].map(n => (
                    <div key={n} className={`lux-env-dot ${n <= item.score ? scoreClass : ''}`} style={{
                        width: '8px', height: '8px', borderRadius: '50%', background: n <= item.score ? '' : '#334155'
                    }} />
                ))}
            </div>
        </div>
    );
}
