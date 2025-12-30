'use client';

/**
 * PropertySurroundings — Вкладка «Окружение» в боковой панели объекта
 * Показывает экологию, уровень шума, зелёные зоны и качество жизни
 * Адаптировано для светлой темы luxury-дизайна
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
        <div className="lux-surroundings fade-in">
            {/* Общий рейтинг */}
            <div className="lux-surroundings-score-card">
                <div className="lux-surroundings-label">
                    Качество окружения
                </div>
                <div className="lux-surroundings-score-val">
                    {avgScore}
                    <span className="lux-surroundings-score-max">/5</span>
                </div>
                <div className="lux-surroundings-stars">
                    {[1, 2, 3, 4, 5].map(star => (
                        <span key={star} style={{
                            opacity: star <= Math.round(parseFloat(avgScore)) ? 1 : 0.25
                        }}>
                            ⭐
                        </span>
                    ))}
                </div>
            </div>

            {/* Показатели окружения */}
            <div className="lux-surroundings-section">
                <h4 className="lux-surroundings-title">
                    🎯 Показатели
                </h4>
                <div className="lux-surroundings-list">
                    {MOCK_ENVIRONMENT.map((env, idx) => (
                        <EnvironmentRow key={idx} item={env} />
                    ))}
                </div>
            </div>

            {/* Зелёные зоны */}
            <div className="lux-surroundings-section">
                <h4 className="lux-surroundings-title">
                    🌲 Зелёные зоны рядом
                </h4>
                <div className="lux-green-zones-grid">
                    {MOCK_GREEN_ZONES.map((zone, idx) => (
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
                <div className="lux-surroundings-label" style={{ color: '#7c3aed' }}>
                    ✨ Особенности
                </div>
                <div className="lux-surroundings-text">
                    Объект расположен в элитном курортном районе с видом на море.
                    Закрытая охраняемая территория, развитая инфраструктура для отдыха.
                </div>
            </div>
        </div>
    );
}

function EnvironmentRow({ item }: { item: EnvironmentScore }) {
    const getScoreColor = (score: number) => {
        if (score >= 4) return '#16a34a';
        if (score >= 3) return '#ca8a04';
        return '#ea580c';
    };

    return (
        <div className="lux-env-row">
            <div className="lux-env-row-left">
                <span className="lux-env-icon">{item.icon}</span>
                <div>
                    <div className="lux-env-name">{item.name}</div>
                    <div className="lux-env-desc">{item.description}</div>
                </div>
            </div>
            <div className="lux-env-dots">
                {[1, 2, 3, 4, 5].map(n => (
                    <div key={n}
                        className="lux-env-dot"
                        style={{
                            background: n <= item.score ? getScoreColor(item.score) : 'rgba(0,0,0,0.1)'
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
