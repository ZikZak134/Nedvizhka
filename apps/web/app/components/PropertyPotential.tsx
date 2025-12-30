'use client';

/**
 * PropertyPotential — Вкладка «Потенциал» в боковой панели объекта
 * Показывает прогнозы развития, планы застройки района и ценовые тренды
 * Адаптировано для светлой темы luxury-дизайна
 */

interface GrowthForecast {
    period: string;
    growth: number;
    confidence: 'high' | 'medium' | 'low';
}

interface DevelopmentProject {
    name: string;
    status: 'planned' | 'in_progress' | 'completed';
    year: string;
    impact: 'positive' | 'neutral' | 'negative';
}

interface PropertyPotentialProps {
    propertyId: string;
    currentGrowth?: number;
}

// Mock-данные прогнозов
const MOCK_FORECASTS: GrowthForecast[] = [
    { period: '1 год', growth: 12, confidence: 'high' },
    { period: '3 года', growth: 38, confidence: 'high' },
    { period: '5 лет', growth: 65, confidence: 'medium' },
    { period: '10 лет', growth: 127, confidence: 'medium' },
];

// Mock-данные проектов развития
const MOCK_PROJECTS: DevelopmentProject[] = [
    { name: 'Новая набережная', status: 'in_progress', year: '2025', impact: 'positive' },
    { name: 'Метробус до центра', status: 'planned', year: '2026', impact: 'positive' },
    { name: 'Реновация парка', status: 'completed', year: '2024', impact: 'positive' },
];

export function PropertyPotential({ propertyId, currentGrowth = 127 }: PropertyPotentialProps) {
    return (
        <div className="property-potential fade-in">
            {/* Текущий рейтинг */}
            <div style={{
                background: 'rgba(22, 163, 74, 0.08)',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '24px',
                border: '1px solid rgba(22, 163, 74, 0.15)',
                textAlign: 'center'
            }}>
                <div style={{ color: '#666666', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Инвестиционный потенциал
                </div>
                <div style={{
                    color: '#16a34a',
                    fontSize: '42px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontFamily: 'var(--font-serif, Georgia, serif)'
                }}>
                    <span style={{ fontSize: '32px' }}>📈</span>
                    +{currentGrowth}%
                </div>
                <div style={{ color: '#666666', fontSize: '12px', marginTop: '6px' }}>
                    Прогноз роста на 10 лет
                </div>
            </div>

            {/* Прогноз по периодам */}
            <div style={{ marginBottom: '28px' }}>
                <h4 style={{ color: '#1a1a1a', fontSize: '13px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '16px' }}>
                    🎯 Прогноз роста стоимости
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    {MOCK_FORECASTS.map((forecast, idx) => (
                        <div key={idx} style={{
                            background: '#ffffff',
                            padding: '16px',
                            borderRadius: '8px',
                            border: '1px solid rgba(0,0,0,0.08)'
                        }}>
                            <div style={{ color: '#666666', fontSize: '12px', marginBottom: '6px' }}>
                                {forecast.period}
                            </div>
                            <div style={{
                                color: forecast.growth >= 50 ? '#16a34a' : forecast.growth >= 20 ? '#65a30d' : '#ca8a04',
                                fontSize: '22px',
                                fontWeight: 700,
                                fontFamily: 'var(--font-serif, Georgia, serif)'
                            }}>
                                +{forecast.growth}%
                            </div>
                            <ConfidenceBadge level={forecast.confidence} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Проекты развития */}
            <div style={{ marginBottom: '24px' }}>
                <h4 style={{ color: '#1a1a1a', fontSize: '13px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '16px' }}>
                    🏗️ Развитие района
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {MOCK_PROJECTS.map((project, idx) => (
                        <ProjectRow key={idx} project={project} />
                    ))}
                </div>
            </div>

            {/* Факторы роста */}
            <div style={{
                background: 'rgba(37, 99, 235, 0.06)',
                padding: '18px',
                borderRadius: '8px',
                border: '1px solid rgba(37, 99, 235, 0.12)'
            }}>
                <div style={{ color: '#2563eb', fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '12px' }}>
                    💡 Ключевые факторы роста
                </div>
                <ul style={{ color: '#333333', fontSize: '14px', margin: 0, paddingLeft: '20px', lineHeight: 1.8 }}>
                    <li>Развитие курортной инфраструктуры</li>
                    <li>Ограниченное предложение на первой линии</li>
                    <li>Рост туристического потока</li>
                </ul>
            </div>
        </div>
    );
}

function ConfidenceBadge({ level }: { level: 'high' | 'medium' | 'low' }) {
    const colors = {
        high: { bg: 'rgba(22, 163, 74, 0.1)', text: '#16a34a', label: '●●●' },
        medium: { bg: 'rgba(202, 138, 4, 0.1)', text: '#ca8a04', label: '●●○' },
        low: { bg: 'rgba(220, 38, 38, 0.1)', text: '#dc2626', label: '●○○' },
    };
    const style = colors[level];

    return (
        <span style={{
            background: style.bg,
            color: style.text,
            padding: '3px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 600,
            marginTop: '6px',
            display: 'inline-block'
        }}>
            {style.label}
        </span>
    );
}

function ProjectRow({ project }: { project: DevelopmentProject }) {
    const statusColors = {
        planned: { bg: 'rgba(37, 99, 235, 0.1)', text: '#2563eb', label: 'Планируется' },
        in_progress: { bg: 'rgba(202, 138, 4, 0.1)', text: '#ca8a04', label: 'В процессе' },
        completed: { bg: 'rgba(22, 163, 74, 0.1)', text: '#16a34a', label: 'Завершён' },
    };
    const status = statusColors[project.status];

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            background: '#ffffff',
            borderRadius: '8px',
            border: '1px solid rgba(0,0,0,0.08)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                    fontSize: '16px',
                    color: project.impact === 'positive' ? '#16a34a' : '#666666'
                }}>
                    {project.impact === 'positive' ? '↗️' : '➡️'}
                </span>
                <div>
                    <div style={{ color: '#1a1a1a', fontSize: '14px', fontWeight: 500 }}>{project.name}</div>
                    <div style={{ color: '#666666', fontSize: '12px' }}>{project.year}</div>
                </div>
            </div>
            <span style={{
                background: status.bg,
                color: status.text,
                padding: '5px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600
            }}>
                {status.label}
            </span>
        </div>
    );
}
