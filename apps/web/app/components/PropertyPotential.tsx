'use client';

/**
 * PropertyPotential — Вкладка «Потенциал» в боковой панели объекта
 * Показывает прогнозы развития, планы застройки района и ценовые тренды
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
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(16, 185, 129, 0.1))',
                padding: '16px',
                borderRadius: '12px',
                marginBottom: '16px',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                textAlign: 'center'
            }}>
                <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>
                    Инвестиционный потенциал
                </div>
                <div style={{
                    color: '#22c55e',
                    fontSize: '32px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                }}>
                    <span style={{ fontSize: '28px' }}>📈</span>
                    +{currentGrowth}%
                </div>
                <div style={{ color: '#64748b', fontSize: '11px', marginTop: '4px' }}>
                    Прогноз роста на 10 лет
                </div>
            </div>

            {/* Прогноз по периодам */}
            <div style={{ marginBottom: '20px' }}>
                <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>
                    🎯 Прогноз роста стоимости
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                    {MOCK_FORECASTS.map((forecast, idx) => (
                        <div key={idx} style={{
                            background: 'rgba(255,255,255,0.03)',
                            padding: '12px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <div style={{ color: '#94a3b8', fontSize: '11px', marginBottom: '4px' }}>
                                {forecast.period}
                            </div>
                            <div style={{
                                color: forecast.growth >= 50 ? '#22c55e' : forecast.growth >= 20 ? '#84cc16' : '#eab308',
                                fontSize: '18px',
                                fontWeight: 700
                            }}>
                                +{forecast.growth}%
                            </div>
                            <ConfidenceBadge level={forecast.confidence} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Проекты развития */}
            <div style={{ marginBottom: '16px' }}>
                <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>
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
                background: 'rgba(59, 130, 246, 0.1)',
                padding: '14px',
                borderRadius: '12px',
                border: '1px solid rgba(59, 130, 246, 0.2)'
            }}>
                <div style={{ color: '#3b82f6', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
                    💡 Ключевые факторы роста
                </div>
                <ul style={{ color: '#cbd5e1', fontSize: '12px', margin: 0, paddingLeft: '16px', lineHeight: 1.6 }}>
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
        high: { bg: 'rgba(34, 197, 94, 0.15)', text: '#22c55e', label: '●●●' },
        medium: { bg: 'rgba(234, 179, 8, 0.15)', text: '#eab308', label: '●●○' },
        low: { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', label: '●○○' },
    };
    const style = colors[level];

    return (
        <span style={{
            background: style.bg,
            color: style.text,
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: 600,
            marginTop: '4px',
            display: 'inline-block'
        }}>
            {style.label}
        </span>
    );
}

function ProjectRow({ project }: { project: DevelopmentProject }) {
    const statusColors = {
        planned: { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6', label: 'Планируется' },
        in_progress: { bg: 'rgba(234, 179, 8, 0.15)', text: '#eab308', label: 'В процессе' },
        completed: { bg: 'rgba(34, 197, 94, 0.15)', text: '#22c55e', label: 'Завершён' },
    };
    const status = statusColors[project.status];

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
                <span style={{
                    fontSize: '16px',
                    color: project.impact === 'positive' ? '#22c55e' : '#94a3b8'
                }}>
                    {project.impact === 'positive' ? '↗️' : '➡️'}
                </span>
                <div>
                    <div style={{ color: '#e2e8f0', fontSize: '13px' }}>{project.name}</div>
                    <div style={{ color: '#64748b', fontSize: '11px' }}>{project.year}</div>
                </div>
            </div>
            <span style={{
                background: status.bg,
                color: status.text,
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '10px',
                fontWeight: 600
            }}>
                {status.label}
            </span>
        </div>
    );
}
