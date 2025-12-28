'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

// Leaflet map (основной вариант)
const PropertyMap = dynamic(
    () => import('../components/PropertyMap').then(mod => mod.PropertyMap),
    { ssr: false }
);

interface DistrictStats {
    district: string;
    count: number;
    avg_price: number;
    min_price: number;
    max_price: number;
    median_price: number;
    avg_price_per_sqm: number;
    avg_area: number;
    center: { lat: number; lng: number };
}

export default function MapPage() {
    const router = useRouter();
    const [districts, setDistricts] = useState<DistrictStats[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDistricts = async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            try {
                const res = await fetch(`${apiUrl}/api/v1/heatmap/districts`, {
                    signal: AbortSignal.timeout(3000) // Таймаут 3 секунды
                });
                if (res.ok) {
                    const data = await res.json();
                    setDistricts(data);
                }
            } catch (error) {
                console.warn('API districts недоступен, показываем пустой список:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDistricts();
    }, []);

    const formatPrice = (price: number) => {
        if (price >= 1_000_000) {
            return `${(price / 1_000_000).toFixed(1)}M`;
        }
        return `${(price / 1_000).toFixed(0)}K`;
    };

    const handlePropertyClick = (id: string) => {
        router.push(`/properties/${id}`);
    };

    return (
        <div className="page">
            <Header />

            <main className="page-main">
                <section className="section-sm">
                    <div className="container">
                        {/* Page Header */}
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <span className="badge badge-primary mb-4">Карта</span>
                                <h1 className="heading-2 mb-2">Карта объектов</h1>
                                <p className="body-base" style={{ color: 'var(--color-text-secondary)' }}>
                                    Интерактивная карта недвижимости Сочи с тепловой картой цен
                                </p>
                            </div>
                        </div>

                        {/* Map - Leaflet Only */}
                        <div className="mb-8">
                            <PropertyMap key="leaflet-map" height="600px" onPropertyClick={handlePropertyClick} />
                        </div>

                        {/* District Analytics */}
                        <div className="mb-8">
                            <h2 className="heading-4 mb-6">📊 Аналитика по районам</h2>

                            {loading ? (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="skeleton" style={{ height: '180px', borderRadius: 'var(--radius-lg)' }} />
                                    ))}
                                </div>
                            ) : districts.length === 0 ? (
                                <div className="card text-center" style={{ padding: 'var(--space-8)' }}>
                                    <p className="body-base">Нет данных по районам. Добавьте объекты через API.</p>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {districts.map(district => (
                                        <div key={district.district} className="card">
                                            <div className="card-body">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <h3 className="heading-6">{district.district}</h3>
                                                        <span className="badge badge-neutral mt-1">{district.count} объектов</span>
                                                    </div>
                                                    <div style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        background: 'var(--color-primary-100)',
                                                        borderRadius: 'var(--radius-md)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '20px'
                                                    }}>
                                                        🏘️
                                                    </div>
                                                </div>

                                                <div className="stack stack-sm">
                                                    <div className="flex justify-between body-small">
                                                        <span style={{ color: 'var(--color-text-tertiary)' }}>Средняя цена</span>
                                                        <span className="font-medium">{formatPrice(district.avg_price)} ₽</span>
                                                    </div>
                                                    <div className="flex justify-between body-small">
                                                        <span style={{ color: 'var(--color-text-tertiary)' }}>Мин — Макс</span>
                                                        <span>{formatPrice(district.min_price)} — {formatPrice(district.max_price)} ₽</span>
                                                    </div>
                                                    <div className="flex justify-between body-small">
                                                        <span style={{ color: 'var(--color-text-tertiary)' }}>Цена/м²</span>
                                                        <span className="font-medium">{formatPrice(district.avg_price_per_sqm)} ₽</span>
                                                    </div>
                                                    <div className="flex justify-between body-small">
                                                        <span style={{ color: 'var(--color-text-tertiary)' }}>Ср. площадь</span>
                                                        <span>{district.avg_area} м²</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Legend & Info */}
                        <div className="card">
                            <div className="card-body">
                                <h3 className="heading-5 mb-4">Как читать карту</h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="heading-6 mb-3">Цветовая шкала</h4>
                                        <div className="stack stack-sm body-small">
                                            <div className="flex items-center gap-2">
                                                <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#3b82f6' }} />
                                                <span>До 15M ₽ — доступный сегмент</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#22c55e' }} />
                                                <span>15-30M ₽ — средний сегмент</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#eab308' }} />
                                                <span>30-50M ₽ — бизнес-класс</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#f97316' }} />
                                                <span>50-100M ₽ — премиум</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#ef4444' }} />
                                                <span>100M+ ₽ — люкс</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="heading-6 mb-3">Размер маркера</h4>
                                        <p className="body-small mb-4">
                                            Чем дороже объект, тем больше его маркер на карте.
                                            Это позволяет визуально выделить премиальные объекты.
                                        </p>
                                        <h4 className="heading-6 mb-3">Взаимодействие</h4>
                                        <p className="body-small">
                                            Нажмите на маркер, чтобы увидеть детали объекта.
                                            Используйте колёсико мыши для масштабирования.
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
