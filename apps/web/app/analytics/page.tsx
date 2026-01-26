'use client';

import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { StatsCard } from '../components/StatsCard';
import { PriceChart } from '../components/PriceChart';
import { useBreakpoint } from '../hooks/useBreakpoint';

interface Stats {
    properties: {
        total_properties: number;
        avg_price: number;
        min_price: number;
        max_price: number;
        avg_area_sqm: number;
    };
}

export default function AnalyticsPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const { isMobile, isTablet, breakpoint } = useBreakpoint();

    useEffect(() => {
        const fetchStats = async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
            try {
                const res = await fetch(`${apiUrl}/stats`);
                const data = await res.json();
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const formatPrice = (price: number) => {
        if (price >= 1000000) {
            return `${(price / 1000000).toFixed(1)} млн`;
        }
        return new Intl.NumberFormat('ru-RU').format(price);
    };

    return (
        <div className="page">
            <Header />

            <main className="page-main">
                <section className="section-sm">
                    <div className="container">
                        {/* Page Header */}
                        <div className="mb-12">
                            <span className="badge badge-primary mb-4">Аналитика</span>
                            <h1 className="heading-1 mb-4">Обзор рынка</h1>
                            <p className="body-base" style={{ color: 'var(--elite-text-secondary)', maxWidth: '600px', lineHeight: '1.6' }}>
                                Статистика и аналитика по рынку элитной недвижимости Сочи. Данные обновляются в реальном времени.
                            </p>
                        </div>

                        {/* Key Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
                            <StatsCard
                                title="Всего объектов"
                                value={loading ? '—' : String(stats?.properties?.total_properties || 0)}
                                icon="🏠"
                                trend={+12}
                            />
                            <StatsCard
                                title="Средняя цена"
                                value={loading ? '—' : formatPrice(stats?.properties?.avg_price || 0) + ' ₽'}
                                icon="💰"
                                trend={+5.2}
                            />
                            <StatsCard
                                title="Мин. цена"
                                value={loading ? '—' : formatPrice(stats?.properties?.min_price || 0) + ' ₽'}
                                icon="📉"
                            />
                            <StatsCard
                                title="Макс. цена"
                                value={loading ? '—' : formatPrice(stats?.properties?.max_price || 0) + ' ₽'}
                                icon="📈"
                            />
                        </div>

                        {/* Charts Section */}
                        <div className="grid lg:grid-cols-2 gap-8 mb-12">
                            {/* Price Distribution */}
                            <div className="card">
                                <div className="card-body">
                                    <h3 className="heading-5 mb-4">Распределение цен</h3>
                                    <PriceChart type="distribution" />
                                </div>
                            </div>

                            {/* Price Trend */}
                            <div className="card">
                                <div className="card-body">
                                    <h3 className="heading-5 mb-4">Динамика цен</h3>
                                    <PriceChart type="trend" />
                                </div>
                            </div>
                        </div>

                        {/* Market Insights */}
                        <div className="grid md:grid-cols-3 gap-6 mb-12">
                            <div className="card">
                                <div className="card-body">
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        background: 'rgba(5, 150, 105, 0.1)',
                                        borderRadius: 'var(--radius-lg)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: 'var(--space-md)',
                                        border: '1px solid rgba(5, 150, 105, 0.2)'
                                    }}>
                                        📊
                                    </div>
                                    <h4 className="heading-6 mb-2">Рынок растёт</h4>
                                    <p className="body-small">
                                        Средняя цена за м² выросла на 8% за последние 3 месяца
                                    </p>
                                </div>
                            </div>

                            <div className="card">
                                <div className="card-body">
                                    <div style={{
                                        width: '56px',
                                        height: '56px',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        borderRadius: 'var(--radius-lg)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: 'var(--space-md)',
                                        fontSize: '24px',
                                        border: '1px solid rgba(255, 255, 255, 0.1)'
                                    }}>
                                        🏖️
                                    </div>
                                    <h4 className="heading-6 mb-2">Популярные районы</h4>
                                    <p className="body-small">
                                        Центральный район и Хоста показывают наибольший спрос
                                    </p>
                                </div>
                            </div>

                            <div className="card">
                                <div className="card-body">
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        background: 'rgba(212, 175, 55, 0.1)',
                                        borderRadius: 'var(--radius-lg)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: 'var(--space-md)',
                                        border: '1px solid rgba(212, 175, 55, 0.2)'
                                    }}>
                                        🌊
                                    </div>
                                    <h4 className="heading-6 mb-2">Премиум сегмент</h4>
                                    <p className="body-small">
                                        Объекты с видом на море дороже на 35% в среднем
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Additional Stats */}
                        <div className="card">
                            <div className="card-body">
                                <h3 className="heading-5 mb-6">Общая статистика</h3>
                                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div>
                                        <div className="label mb-2">Средняя площадь</div>
                                        <div className="heading-4">
                                            {loading ? '—' : `${Math.round(stats?.properties?.avg_area_sqm || 0)} м²`}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="label mb-2">Цена за м²</div>
                                        <div className="heading-4">
                                            {loading || !stats?.properties?.avg_price || !stats?.properties?.avg_area_sqm
                                                ? '—'
                                                : formatPrice(Math.round(stats.properties.avg_price / stats.properties.avg_area_sqm)) + ' ₽'
                                            }
                                        </div>
                                    </div>
                                    <div>
                                        <div className="label mb-2">Новых за неделю</div>
                                        <div className="heading-4">+12</div>
                                    </div>
                                    <div>
                                        <div className="label mb-2">Источников</div>
                                        <div className="heading-4">3</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
