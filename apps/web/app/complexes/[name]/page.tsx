'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';

interface ComplexDetail {
    name: string;
    statistics: {
        total_count: number;
        avg_price: number;
        min_price: number;
        max_price: number;
        median_price: number;
        avg_price_per_sqm: number;
        min_price_per_sqm: number;
        max_price_per_sqm: number;
        avg_area: number;
    };
    room_distribution: Record<string, number>;
    price_distribution: Array<{ range: string; count: number; percentage: number }>;
    source_distribution: Record<string, number>;
    properties: Array<{
        id: string;
        title: string;
        price: number;
        area_sqm: number;
        rooms: string | null;
        price_per_sqm: number;
        source: string;
    }>;
    investment_metrics: {
        est_rental_yield: number;
        price_trend_30d: number;
        days_on_market_avg: number;
    };
}

export default function ComplexDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [data, setData] = useState<ComplexDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const complexName = decodeURIComponent(params.name as string);

    useEffect(() => {
        const fetchComplex = async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
            try {
                const res = await fetch(`${apiUrl}/complexes/${encodeURIComponent(complexName)}`);
                if (!res.ok) throw new Error('Complex not found');
                const json = await res.json();
                setData(json);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load');
            } finally {
                setLoading(false);
            }
        };

        fetchComplex();
    }, [complexName]);

    const formatPrice = (price: number) => {
        if (price >= 1_000_000) {
            return `${(price / 1_000_000).toFixed(1)}M`;
        }
        return `${(price / 1_000).toFixed(0)}K`;
    };

    if (loading) {
        return (
            <div className="page">
                <Header />
                <main className="page-main">
                    <div className="container">
                        <div className="skeleton skeleton-title mb-4" />
                        <div className="grid md:grid-cols-4 gap-4 mb-8">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="skeleton" style={{ height: '100px' }} />
                            ))}
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="page">
                <Header />
                <main className="page-main">
                    <div className="container text-center" style={{ padding: 'var(--space-16)' }}>
                        <div style={{ fontSize: '64px', marginBottom: 'var(--space-4)' }}>🏢</div>
                        <h1 className="heading-3 mb-4">ЖК не найден</h1>
                        <p className="body-base mb-6">{error}</p>
                        <button className="btn btn-primary" onClick={() => router.push('/complexes')}>
                            К списку ЖК
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // Безопасный доступ к данным с fallback на пустые структуры
    const priceDistribution = data.price_distribution || [];
    const roomDistribution = data.room_distribution || {};
    const sourceDistribution = data.source_distribution || {};
    const properties = data.properties || [];
    const maxDistributionCount = priceDistribution.length > 0 ? Math.max(...priceDistribution.map(d => d.count)) : 0;

    return (
        <div className="page">
            <Header />

            <main className="page-main">
                <section className="section-sm">
                    <div className="container">
                        {/* Breadcrumb */}
                        <nav className="mb-6">
                            <ol className="cluster cluster-sm body-small">
                                <li><a href="/" className="link">Главная</a></li>
                                <li style={{ color: 'var(--color-text-tertiary)' }}>/</li>
                                <li><a href="/complexes" className="link">ЖК</a></li>
                                <li style={{ color: 'var(--color-text-tertiary)' }}>/</li>
                                <li style={{ color: 'var(--color-text-tertiary)' }}>{data.name}</li>
                            </ol>
                        </nav>

                        {/* Header */}
                        <div className="mb-8">
                            <span className="badge badge-primary mb-4">Аналитика ЖК</span>
                            <h1 className="heading-2 mb-2">{data.name}</h1>
                            <p className="body-base" style={{ color: 'var(--color-text-secondary)' }}>
                                {data.statistics.total_count} активных объявлений
                            </p>
                        </div>

                        {/* Key Stats */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <div className="card" style={{ padding: 'var(--space-5)' }}>
                                <div className="label mb-1">Средняя цена</div>
                                <div className="heading-3" style={{ color: 'var(--color-primary-500)' }}>
                                    {formatPrice(data.statistics.avg_price)} ₽
                                </div>
                            </div>
                            <div className="card" style={{ padding: 'var(--space-5)' }}>
                                <div className="label mb-1">Медианная цена</div>
                                <div className="heading-3">{formatPrice(data.statistics.median_price)} ₽</div>
                            </div>
                            <div className="card" style={{ padding: 'var(--space-5)' }}>
                                <div className="label mb-1">Цена за м²</div>
                                <div className="heading-3">{formatPrice(data.statistics.avg_price_per_sqm)} ₽</div>
                            </div>
                            <div className="card" style={{ padding: 'var(--space-5)' }}>
                                <div className="label mb-1">Ср. площадь</div>
                                <div className="heading-3">{data.statistics.avg_area} м²</div>
                            </div>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-8 mb-8">
                            {/* Price Distribution */}
                            <div className="card">
                                <div className="card-body">
                                    <h3 className="heading-5 mb-4">📊 Распределение цен</h3>
                                    <div className="stack stack-sm">
                                        {priceDistribution.map(item => (
                                            <div key={item.range}>
                                                <div className="flex justify-between body-small mb-1">
                                                    <span>{item.range} ₽</span>
                                                    <span>{item.count} ({item.percentage}%)</span>
                                                </div>
                                                <div style={{
                                                    height: '24px',
                                                    background: 'var(--color-bg-tertiary)',
                                                    borderRadius: 'var(--radius-sm)',
                                                    overflow: 'hidden'
                                                }}>
                                                    <div style={{
                                                        width: `${maxDistributionCount > 0 ? (item.count / maxDistributionCount) * 100 : 0}%`,
                                                        height: '100%',
                                                        background: 'linear-gradient(90deg, var(--color-primary-400), var(--color-primary-600))',
                                                        transition: 'width 0.3s ease'
                                                    }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Room Distribution */}
                            <div className="card">
                                <div className="card-body">
                                    <h3 className="heading-5 mb-4">🛏️ По количеству комнат</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {Object.entries(roomDistribution).map(([room, count]) => (
                                            <div key={room} className="flex items-center justify-between" style={{
                                                padding: 'var(--space-3)',
                                                background: 'var(--color-bg-secondary)',
                                                borderRadius: 'var(--radius-md)'
                                            }}>
                                                <span className="body-base">{room} комн.</span>
                                                <span className="badge badge-primary">{count}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <h3 className="heading-5 mb-4 mt-6">📡 По источнику</h3>
                                    <div className="cluster">
                                        {Object.entries(sourceDistribution).map(([source, count]) => (
                                            <span key={source} className="badge badge-neutral">
                                                {source === 'cian' ? 'ЦИАН' : source === 'avito' ? 'Авито' : source} ({count})
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Investment Metrics */}
                        <div className="card mb-8">
                            <div className="card-body">
                                <h3 className="heading-5 mb-4">💰 Инвестиционные показатели</h3>
                                <div className="grid md:grid-cols-3 gap-6">
                                    <div>
                                        <div className="label mb-1">Доходность аренды (оценка)</div>
                                        <div className="heading-4" style={{ color: 'var(--color-success-600)' }}>
                                            {data.investment_metrics.est_rental_yield}% годовых
                                        </div>
                                    </div>
                                    <div>
                                        <div className="label mb-1">Динамика 30 дн.</div>
                                        <div className="heading-4">
                                            {data.investment_metrics.price_trend_30d > 0 ? '+' : ''}
                                            {data.investment_metrics.price_trend_30d}%
                                        </div>
                                    </div>
                                    <div>
                                        <div className="label mb-1">Ср. срок продажи</div>
                                        <div className="heading-4">{data.investment_metrics.days_on_market_avg} дней</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Properties List */}
                        <div className="card">
                            <div className="card-body">
                                <h3 className="heading-5 mb-4">🏠 Объекты в этом ЖК</h3>
                                <div className="stack stack-sm">
                                    {properties.slice(0, 10).map(prop => (
                                        <Link
                                            key={prop.id}
                                            href={`/properties/${prop.id}`}
                                            className="flex items-center justify-between"
                                            style={{
                                                padding: 'var(--space-3)',
                                                background: 'var(--color-bg-secondary)',
                                                borderRadius: 'var(--radius-md)',
                                                textDecoration: 'none',
                                                color: 'inherit'
                                            }}
                                        >
                                            <div>
                                                <div className="body-base font-medium">{prop.title}</div>
                                                <div className="caption" style={{ color: 'var(--color-text-tertiary)' }}>
                                                    {prop.area_sqm} м² • {prop.rooms || '—'} комн.
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="body-base font-medium" style={{ color: 'var(--color-primary-500)' }}>
                                                    {formatPrice(prop.price)} ₽
                                                </div>
                                                <div className="caption">{formatPrice(prop.price_per_sqm)} ₽/м²</div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>

                                {properties.length > 10 && (
                                    <div className="mt-4 text-center">
                                        <span className="body-small" style={{ color: 'var(--color-text-tertiary)' }}>
                                            Показаны первые 10 из {properties.length} объектов
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
