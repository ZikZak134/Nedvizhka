'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

interface ComplexStats {
    name: string;
    count: number;
    avg_price: number;
    min_price: number;
    max_price: number;
    avg_price_per_sqm: number;
    avg_area: number;
}

export default function ComplexesPage() {
    const [complexes, setComplexes] = useState<ComplexStats[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchComplexes = async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
            try {
                const res = await fetch(`${apiUrl}/complexes`);
                const data = await res.json();
                // Проверяем, что data — массив
                setComplexes(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Failed to fetch complexes:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchComplexes();
    }, []);

    const formatPrice = (price: number) => {
        if (price >= 1_000_000) {
            return `${(price / 1_000_000).toFixed(1)}M`;
        }
        return `${(price / 1_000).toFixed(0)}K`;
    };

    return (
        <div className="page">
            <Header />

            <main className="page-main">
                <section className="section-sm">
                    <div className="container">
                        {/* Page Header */}
                        <div className="mb-8">
                            <span className="badge badge-primary mb-4">Аналитика</span>
                            <h1 className="heading-2 mb-2">Жилые комплексы Сочи</h1>
                            <p className="body-base" style={{ color: 'var(--color-text-secondary)' }}>
                                Подробная аналитика по популярным ЖК элитного сегмента
                            </p>
                        </div>

                        {/* Complexes Grid */}
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="skeleton" style={{ height: '280px', borderRadius: 'var(--radius-lg)' }} />
                                ))}
                            </div>
                        ) : complexes.length === 0 ? (
                            <div className="card text-center" style={{ padding: 'var(--space-12)' }}>
                                <div style={{ fontSize: '64px', marginBottom: 'var(--space-4)' }}>🏢</div>
                                <h3 className="heading-4 mb-2">Нет данных по ЖК</h3>
                                <p className="body-base mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                                    Добавьте объекты с названиями ЖК в заголовке или адресе
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {complexes.map(complex => (
                                    <Link
                                        key={complex.name}
                                        href={`/complexes/${encodeURIComponent(complex.name)}`}
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <div className="card card-hover" style={{ height: '100%' }}>
                                            <div className="card-body">
                                                {/* Header */}
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <h3 className="heading-5 mb-1">{complex.name}</h3>
                                                        <span className="badge badge-neutral">{complex.count} объектов</span>
                                                    </div>
                                                    <div style={{
                                                        width: '48px',
                                                        height: '48px',
                                                        background: 'linear-gradient(135deg, var(--color-primary-100), var(--color-accent-100))',
                                                        borderRadius: 'var(--radius-lg)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '24px'
                                                    }}>
                                                        🏢
                                                    </div>
                                                </div>

                                                {/* Price Stats */}
                                                <div className="mb-4">
                                                    <div className="label mb-1">Средняя цена</div>
                                                    <div className="heading-4" style={{ color: 'var(--color-primary-500)' }}>
                                                        {formatPrice(complex.avg_price)} ₽
                                                    </div>
                                                </div>

                                                {/* Details */}
                                                <div className="stack stack-sm body-small">
                                                    <div className="flex justify-between">
                                                        <span style={{ color: 'var(--color-text-tertiary)' }}>Диапазон</span>
                                                        <span>{formatPrice(complex.min_price)} — {formatPrice(complex.max_price)} ₽</span>
                                                    </div>
                                                    {complex.avg_price_per_sqm > 0 && (
                                                        <div className="flex justify-between">
                                                            <span style={{ color: 'var(--color-text-tertiary)' }}>Цена/м²</span>
                                                            <span>{formatPrice(complex.avg_price_per_sqm)} ₽</span>
                                                        </div>
                                                    )}
                                                    {complex.avg_area > 0 && (
                                                        <div className="flex justify-between">
                                                            <span style={{ color: 'var(--color-text-tertiary)' }}>Ср. площадь</span>
                                                            <span>{complex.avg_area} м²</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* CTA */}
                                                <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--color-border-default)' }}>
                                                    <span className="link body-small">Подробная аналитика →</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Info Card */}
                        <div className="card mt-8">
                            <div className="card-body">
                                <h3 className="heading-5 mb-4">📊 Методология</h3>
                                <div className="grid md:grid-cols-2 gap-6 body-small">
                                    <div>
                                        <h4 className="heading-6 mb-2">Определение ЖК</h4>
                                        <p>
                                            Система автоматически распознаёт жилые комплексы по ключевым словам
                                            в заголовке и адресе объекта. Поддерживаются популярные ЖК:
                                            Mantera, Lighthouse, Corum, Elite Park и другие.
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="heading-6 mb-2">Расчёт статистики</h4>
                                        <p>
                                            Все показатели рассчитываются на основе актуальных объявлений.
                                            Медианная цена менее подвержена влиянию аномальных значений
                                            и даёт более точную картину рынка.
                                        </p>
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
