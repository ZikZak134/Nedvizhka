'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '../../components/Header';
import { Breadcrumbs } from '../../components/Breadcrumbs';
import { Footer } from '../../components/Footer';
import { getMockImage } from '../../utils/mockImages';
import { getMockLocation } from '../../utils/mockLocations';

interface Property {
    id: string;
    title: string;
    description: string | null;
    price: number;
    currency: string;
    address: string;
    latitude: number | null;
    longitude: number | null;
    area_sqm: number;
    rooms: string | null;
    floor: number | null;
    total_floors: number | null;
    source: string;
    source_id: string | null;
    url: string | null;
    images: string[];
    features: Record<string, unknown>;
    created_at: string;
    updated_at: string;
    is_active: boolean;
}

declare global {
    interface Window {
        DG: any;
    }
}

export default function PropertyDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeImage, setActiveImage] = useState(0);
    const [dgReady, setDgReady] = useState(false);
    const mapRef = useState<HTMLDivElement | null>(null); // Actually better to use ref


    useEffect(() => {
        const fetchProperty = async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            try {
                const res = await fetch(`${apiUrl}/api/v1/properties/${params.id}`);
                if (!res.ok) {
                    throw new Error('Property not found');
                }
                const data = await res.json();
                setProperty(data);
                // Data is loaded from API
            } catch (err) {
                console.warn('API unavailable to fetch detail, falling back to MOCK', err);

                // Fallback Mock Data (Elite Style)
                const mockId = (Array.isArray(params.id) ? params.id[0] : params.id) || 'unknown';
                // Generate deterministic numeric from ID string
                const numericId = String(mockId).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

                const MOCK_DETAIL: Property = {
                    id: mockId,
                    title: `Elite Residence #${numericId % 20} with Panoramic View`,
                    description: "Experience luxury living in this stunning property located in the heart of Sochi. Featuring floor-to-ceiling windows, a private terrace with sea views, and premium Italian furnishings. The complex offers 24/7 concierge service, a heated pool, and underground parking. \n\nThis exclusive residence is perfect for those who value privacy, comfort, and status. Walking distance to the marina and the best restaurants in the city.",
                    price: 25000000 + ((numericId % 10) * 5000000),
                    currency: "RUB",
                    address: "Sochi, Central District, Ordzhonikidze St, 17",
                    latitude: 43.5855 + (Math.random() - 0.5) * 0.01,
                    longitude: 39.7231 + (Math.random() - 0.5) * 0.01,
                    area_sqm: 80 + (numericId % 100),
                    rooms: `${(numericId % 4) + 1}`,
                    floor: (numericId % 15) + 1,
                    total_floors: 24,
                    source: "mock",
                    source_id: "mock-source",
                    url: null,
                    images: [
                        getMockImage(numericId),
                        getMockImage(numericId + 1),
                        getMockImage(numericId + 2),
                        getMockImage(numericId + 3)
                    ],
                    features: {
                        "Бассейн": true,
                        "Паркинг": true,
                        "Охрана": "24/7",
                        "Вид": "На море",
                        "Отделка": "Дизайнерская",
                        "Мебель": "Италия"
                    },
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    is_active: true
                };

                setProperty(MOCK_DETAIL);
                setError(null);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchProperty();
        }
    }, [params.id]);

    // Load 2GIS
    useEffect(() => {
        if (typeof window !== 'undefined' && !window.DG) {
            const script = document.createElement('script');
            script.src = 'https://maps.api.2gis.ru/2.0/loader.js?pkg=full';
            script.async = true;
            script.onload = () => window.DG.then(() => setDgReady(true));
            document.head.appendChild(script);
        } else if (window.DG) {
            window.DG.then(() => setDgReady(true));
        }
    }, []);

    // Init Map
    useEffect(() => {
        if (!dgReady || !property || !property.latitude || !property.longitude) return;

        const container = document.getElementById('property-map');
        if (!container) return;

        // Cleanup
        container.innerHTML = '';

        window.DG.then(() => {
            const map = window.DG.map('property-map', {
                center: [property.latitude, property.longitude],
                zoom: 16,
                fullscreenControl: false,
                zoomControl: true,
                scrollWheelZoom: false,
            });

            window.DG.marker([property.latitude, property.longitude]).addTo(map)
                .bindPopup(property.title).openPopup();
        });
    }, [dgReady, property]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ru-RU').format(price);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const placeholderImage = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='500' viewBox='0 0 800 500'%3E%3Crect fill='%23e5e7eb' width='800' height='500'/%3E%3Ctext fill='%239ca3af' font-family='Arial' font-size='24' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EНет фото%3C/text%3E%3C/svg%3E`;

    if (loading) {
        return (
            <div className="page">
                <Header />
                <main className="page-main">
                    <div className="container">
                        <div className="skeleton" style={{ aspectRatio: '16/9', maxHeight: '500px', marginBottom: 'var(--space-6)' }} />
                        <div className="skeleton skeleton-title mb-4" />
                        <div className="skeleton skeleton-text mb-2" />
                        <div className="skeleton skeleton-text" style={{ width: '60%' }} />
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (error || !property) {
        return (
            <div className="page">
                <Header />
                <main className="page-main">
                    <div className="container text-center" style={{ padding: 'var(--space-16)' }}>
                        <div style={{ fontSize: '64px', marginBottom: 'var(--space-4)' }}>😢</div>
                        <h1 className="heading-3 mb-4">Объект не найден</h1>
                        <p className="body-base mb-6">{error || 'Запрашиваемый объект не существует или был удалён'}</p>
                        <button className="btn btn-primary" onClick={() => router.push('/properties')}>
                            Вернуться к списку
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const images = property.images.length > 0 ? property.images : [placeholderImage];

    return (
        <div className="min-h-screen bg-[#0f172a] animate-fadeIn">
            <Header />

            <main className="page-main">
                <div className="container">
                    <Breadcrumbs
                        items={[
                            { label: 'Недвижимость', href: '/properties' },
                            { label: property.title }
                        ]}
                    />

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="col-span-full lg:col-span-2">
                            {/* Image Gallery */}
                            <div className="mb-6">
                                <div style={{
                                    aspectRatio: '16/10',
                                    borderRadius: 'var(--radius-xl)',
                                    overflow: 'hidden',
                                    marginBottom: 'var(--space-3)'
                                }}>
                                    <img
                                        src={images[activeImage]}
                                        alt={property.title}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>
                                {images.length > 1 && (
                                    <div className="cluster cluster-sm">
                                        {images.map((img, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setActiveImage(i)}
                                                style={{
                                                    width: '80px',
                                                    height: '60px',
                                                    borderRadius: 'var(--radius-md)',
                                                    overflow: 'hidden',
                                                    border: activeImage === i ? '2px solid var(--color-primary-500)' : '2px solid transparent',
                                                    padding: 0,
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Title & Address */}
                            <h1 className="heading-3 mb-2">{property.title}</h1>
                            <p className="body-base mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                                📍 {property.address}
                            </p>

                            {/* Specs Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                <div className="card" style={{ padding: 'var(--space-6)', textAlign: 'center', background: 'var(--navy-light)' }}>
                                    <div className="stat-number" style={{ fontSize: 'var(--text-3xl)', color: 'var(--gold)', fontWeight: 700 }}>{property.area_sqm}</div>
                                    <div className="label" style={{ color: 'rgba(255, 255, 255, 0.75)', marginTop: '8px' }}>м²</div>
                                </div>
                                {property.rooms && (
                                    <div className="card" style={{ padding: 'var(--space-6)', textAlign: 'center', background: 'var(--navy-light)' }}>
                                        <div className="stat-number" style={{ fontSize: 'var(--text-3xl)', color: 'var(--gold)', fontWeight: 700 }}>{property.rooms}</div>
                                        <div className="label" style={{ color: 'rgba(255, 255, 255, 0.75)', marginTop: '8px' }}>Комнат</div>
                                    </div>
                                )}
                                {property.floor && (
                                    <div className="card" style={{ padding: 'var(--space-6)', textAlign: 'center', background: 'var(--navy-light)' }}>
                                        <div className="stat-number" style={{ fontSize: 'var(--text-3xl)', color: 'var(--gold)', fontWeight: 700 }}>{property.floor}/{property.total_floors}</div>
                                        <div className="label" style={{ color: 'rgba(255, 255, 255, 0.75)', marginTop: '8px' }}>Этаж</div>
                                    </div>
                                )}
                                <div className="card" style={{ padding: 'var(--space-6)', textAlign: 'center', background: 'var(--navy-light)' }}>
                                    <div className="stat-number" style={{ fontSize: 'var(--text-3xl)', color: 'var(--gold)', fontWeight: 700 }}>
                                        {Math.round(property.price / property.area_sqm / 1000)}K
                                    </div>
                                    <div className="label" style={{ color: 'rgba(255, 255, 255, 0.75)', marginTop: '8px' }}>₽/м²</div>
                                </div>
                            </div>

                            {/* Description */}
                            {property.description && (
                                <div className="mb-8">
                                    <h2 className="heading-5 mb-4">Описание</h2>
                                    <div className="prose">
                                        <p>{property.description}</p>
                                    </div>
                                </div>
                            )}

                            {/* Investment Analytics - Luxury Block */}
                            <div className="mb-8" style={{
                                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05), rgba(195, 162, 52, 0.08))',
                                border: '2px solid rgba(212, 175, 55, 0.2)',
                                borderRadius: '16px',
                                padding: '24px',
                                boxShadow: '0 8px 24px rgba(212, 175, 55, 0.1)',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        background: 'linear-gradient(135deg, #d4af37, #c3a234)',
                                        borderRadius: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '20px',
                                    }}>
                                        💰
                                    </div>
                                    <h2 className="heading-5" style={{ margin: 0, color: '#d4af37' }}>
                                        Инвестиционная справка
                                    </h2>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div style={{
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        padding: '16px',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(212, 175, 55, 0.15)',
                                    }}>
                                        <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '8px' }}>
                                            ROI (годовой)
                                        </div>
                                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#059669' }}>
                                            14%
                                        </div>
                                    </div>

                                    <div style={{
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        padding: '16px',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(212, 175, 55, 0.15)',
                                    }}>
                                        <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '8px' }}>
                                            Прирост/год
                                        </div>
                                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#059669' }}>
                                            +15%
                                        </div>
                                    </div>

                                    <div style={{
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        padding: '16px',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(212, 175, 55, 0.15)',
                                    }}>
                                        <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '8px' }}>
                                            Налог
                                        </div>
                                        <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                                            0.1%
                                        </div>
                                    </div>

                                    <div style={{
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        padding: '16px',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(212, 175, 55, 0.15)',
                                    }}>
                                        <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '8px' }}>
                                            Аренда/месяц
                                        </div>
                                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#d4af37' }}>
                                            120K ₽
                                        </div>
                                    </div>
                                </div>

                                <div style={{
                                    marginTop: '16px',
                                    padding: '12px 16px',
                                    background: 'rgba(212, 175, 55, 0.08)',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    color: 'var(--color-text-secondary)',
                                    borderLeft: '3px solid #d4af37',
                                }}>
                                    💡 <strong>Совет:</strong> Объект находится в зоне активного роста. Средний срок продажи — 22 дня.
                                </div>
                            </div>

                            {/* Features */}
                            {Object.keys(property.features).length > 0 && (
                                <div className="mb-8">
                                    <h2 className="heading-5 mb-4">Особенности</h2>
                                    <div className="cluster">
                                        {Object.entries(property.features).map(([key, value]) => (
                                            <span key={key} className="badge badge-primary">
                                                {key}: {String(value)}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Map */}
                            {(property.latitude && property.longitude) && (
                                <div className="mb-8">
                                    <h2 className="heading-5 mb-4">На карте (2GIS)</h2>
                                    <div
                                        id="property-map"
                                        style={{
                                            width: '100%',
                                            height: '400px',
                                            borderRadius: 'var(--radius-lg)',
                                            overflow: 'hidden',
                                            border: '1px solid var(--color-border)'
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <aside className="col-span-full lg:col-span-1">
                            <div className="card" style={{ position: 'sticky', top: 'calc(64px + var(--space-4))' }}>
                                <div className="card-body">
                                    <div className="price-display mb-4">
                                        {formatPrice(property.price)} <span className="currency">₽</span>
                                    </div>

                                    <div className="stack stack-sm mb-6">
                                        <button className="btn btn-primary btn-lg w-full">
                                            📞 Связаться
                                        </button>
                                        <button className="btn btn-secondary w-full">
                                            ❤️ В избранное
                                        </button>
                                    </div>

                                    <div className="stack stack-sm">
                                        <div className="flex justify-between body-small">
                                            <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Источник</span>
                                            <span className="badge badge-neutral">
                                                {property.source === 'cian' ? 'ЦИАН' :
                                                    property.source === 'avito' ? 'Авито' :
                                                        'Вручную'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between body-small">
                                            <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Добавлено</span>
                                            <span>{formatDate(property.created_at)}</span>
                                        </div>
                                        <div className="flex justify-between body-small">
                                            <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Обновлено</span>
                                            <span>{formatDate(property.updated_at)}</span>
                                        </div>
                                    </div>

                                    {property.url && (
                                        <>
                                            <hr className="divider" />
                                            <a
                                                href={property.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-ghost w-full"
                                            >
                                                Открыть оригинал ↗
                                            </a>
                                        </>
                                    )}
                                </div>
                            </div>
                        </aside>
                    </div>
                </div >
            </main >

            <Footer />
        </div >
    );
}
