import { toArray } from '../utils/safeArray';

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
    forecasts?: GrowthForecast[];
    projects?: DevelopmentProject[];
}

const DEFAULT_FORECASTS: GrowthForecast[] = [
    { period: '1 год', growth: 12, confidence: 'high' },
    { period: '5 лет', growth: 65, confidence: 'medium' },
    { period: '10 лет', growth: 127, confidence: 'medium' },
];

const DEFAULT_PROJECTS: DevelopmentProject[] = [
    { name: 'Новая набережная', status: 'in_progress', year: '2025', impact: 'positive' },
    { name: 'Метробус до центра', status: 'planned', year: '2026', impact: 'positive' },
];

export function PropertyPotential({ 
    propertyId, 
    currentGrowth = 127, 
    forecasts = DEFAULT_FORECASTS, 
    projects = DEFAULT_PROJECTS 
}: PropertyPotentialProps) {
    return (
        <div className="property-potential fade-in lux-potential-container">
            {/* Текущий рейтинг */}
            <div className="lux-potential-card lux-potential-card--primary">
                <div className="lux-potential-label">Инвестиционный потенциал</div>
                <div className="lux-potential-score">
                    <span className="lux-potential-score-icon">📈</span>
                    +{currentGrowth}%
                </div>
                <div className="lux-potential-subtext">Прогноз роста на 10 лет</div>
            </div>

            {/* Прогноз по периодам */}
            <div className="lux-potential-section">
                <h4 className="lux-potential-title">🎯 Прогноз роста стоимости</h4>
                <div className="lux-potential-grid">
                    {toArray<GrowthForecast>(forecasts).map((forecast, idx) => (
                        <div key={idx} className="lux-potential-item">
                            <div className="lux-potential-item-period">{forecast.period}</div>
                            <div className={`lux-potential-item-growth ${forecast.growth >= 50 ? 'growth-high' : forecast.growth >= 20 ? 'growth-med' : 'growth-low'}`}>
                                +{forecast.growth}%
                            </div>
                            <ConfidenceBadge level={forecast.confidence} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Проекты развития */}
            <div className="lux-potential-section">
                <h4 className="lux-potential-title">🏗️ Развитие района</h4>
                <div className="lux-potential-list">
                    {toArray<DevelopmentProject>(projects).map((project, idx) => (
                        <ProjectRow key={idx} project={project} />
                    ))}
                </div>
            </div>

            {/* Факторы роста */}
            <div className="lux-potential-card lux-potential-card--factors">
                <div className="lux-potential-factors-title">💡 Ключевые факторы роста</div>
                <ul className="lux-potential-factors-list">
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
        high: { label: '●●●', className: 'confidence-high' },
        medium: { label: '●●○', className: 'confidence-medium' },
        low: { label: '●○○', className: 'confidence-low' },
    };
    const style = colors[level];
    return <span className={`lux-confidence-badge ${style.className}`}>{style.label}</span>;
}

function ProjectRow({ project }: { project: DevelopmentProject }) {
    const statusMap = {
        planned: { label: 'Планируется', className: 'status-planned' },
        in_progress: { label: 'В процессе', className: 'status-progress' },
        completed: { label: 'Завершён', className: 'status-completed' },
    };
    const status = statusMap[project.status];
    return (
        <div className="lux-project-row">
            <div className="lux-project-info">
                <span className={`lux-project-icon ${project.impact}`}>
                    {project.impact === 'positive' ? '↗️' : '➡️'}
                </span>
                <div>
                    <div className="lux-project-name">{project.name}</div>
                    <div className="lux-project-year">{project.year}</div>
                </div>
            </div>
            <span className={`lux-project-status ${status.className}`}>{status.label}</span>
        </div>
    );
}
