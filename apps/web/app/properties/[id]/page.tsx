'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { getMockImage } from '../../utils/mockImages';
import { getMockLocation } from '../../utils/mockLocations';
import '../../styles/luxury-property.css';

// Lazy load components
const PropertyLocation = dynamic(() => import('../../components/PropertyLocation').then(m => m.PropertyLocation), { ssr: false });
const PropertyPotential = dynamic(() => import('../../components/PropertyPotential').then(m => m.PropertyPotential), { ssr: false });
const PropertySurroundings = dynamic(() => import('../../components/PropertySurroundings').then(m => m.PropertySurroundings), { ssr: false });
const SMIFeed = dynamic(() => import('../../components/SMIFeed').then(m => m.SMIFeed), { ssr: false });

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
    district?: string;
    complex?: string;
    growth_10y?: number;
    quality_score?: number;
    ownerComment?: string;
    ownerName?: string;
    pricePerSqm?: number;
}

type TabType = 'info' | 'location' | 'potential' | 'surroundings' | 'smi';

// SVG иконки для features (тонкие, минималистичные)
const FeatureIcons = {
    view: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    ),
    terrace: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 21h18M3 7v14M21 7v14M6 7h12M6 3l6 4 6-4" />
        </svg>
    ),
    parking: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 17V7h4a3 3 0 010 6H9" />
        </svg>
    ),
    finish: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
    ),
    ceiling: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 21V8l9-5 9 5v13" />
            <path d="M9 12h6M9 16h6" />
        </svg>
    ),
    pool: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 12h20M2 16h20M2 20h20" />
            <circle cx="6" cy="8" r="2" />
            <circle cx="18" cy="8" r="2" />
        </svg>
    ),
    smartHome: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <path d="M9 22V12h6v10" />
        </svg>
    ),
};

export default function PropertyDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [property, setProperty] = useState<Property | null>(null);
    const [nearbyProperties, setNearbyProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeImage, setActiveImage] = useState(0);
    const [activeTab, setActiveTab] = useState<TabType>('info');

    // Fetch property data
    useEffect(() => {
        const fetchProperty = async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            try {
                const res = await fetch(`${apiUrl}/api/v1/properties/${params.id}`);
                if (!res.ok) throw new Error('Property not found');
                const data = await res.json();
                setProperty(data);
            } catch {
                // Mock data fallback
                const mockId = (Array.isArray(params.id) ? params.id[0] : params.id) || 'unknown';
                const match = String(mockId).match(/mock-prop-(\d+)/);
                const locationIndex = match ? parseInt(match[1], 10) : 0;
                const location = getMockLocation(locationIndex);
                const seed = locationIndex;
                const basePrice = 25000000 + (seed * 3500000) % 100000000;
                const areaSqm = 120 + (seed * 20) % 180;

                const complexNames = [
                    'ЖК «Красная Площадь»',
                    'ЖК «Актёр Гэлакси»',
                    'ЖК «Александрийский Маяк»',
                    'ЖК «Горки Город»',
                    'ЖК «Премьер»',
                    'ЖК «Олимпийский»',
                ];

                setProperty({
                    id: mockId,
                    title: location.address || `Резиденция ${locationIndex + 1}`,
                    description: `Эта исключительная резиденция расположена в самом сердце ${location.district || 'Сочи'}. Архитектурный шедевр, где каждая деталь продумана для комфортной жизни на высшем уровне.\n\nПанорамные окна от пола до потолка открывают захватывающие виды на море и горы. Изысканные интерьеры выполнены итальянскими мастерами с использованием мрамора Calacatta, дуба и натуральной кожи.\n\nКомплекс предлагает: приватный пляж, консьерж-сервис 24/7, подземный паркинг, SPA-зону и rooftop-бассейн с подогревом.`,
                    price: basePrice,
                    currency: "RUB",
                    address: location.address,
                    latitude: location.lat,
                    longitude: location.lng,
                    area_sqm: areaSqm,
                    rooms: `${(seed % 4) + 2}`,
                    floor: (seed % 15) + 8,
                    total_floors: 25,
                    source: "mock",
                    source_id: `mock-source-${locationIndex}`,
                    url: null,
                    images: [
                        getMockImage(locationIndex),
                        getMockImage(locationIndex + 1),
                        getMockImage(locationIndex + 2),
                        getMockImage(locationIndex + 3),
                        getMockImage(locationIndex + 4)
                    ],
                    features: {
                        "Вид": seed % 3 === 0 ? "Море" : seed % 3 === 1 ? "Горы" : "Панорама",
                        "Терраса": "45 м²",
                        "Паркинг": "2 места",
                        "Отделка": "Премиум",
                        "Потолки": "3.2 м",
                        "Бассейн": "Rooftop"
                    },
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    is_active: true,
                    district: location.district,
                    complex: complexNames[seed % complexNames.length],
                    growth_10y: 85 + (seed * 5) % 60,
                    quality_score: 90 + (seed * 2) % 10,
                    pricePerSqm: Math.round(basePrice / areaSqm),
                    ownerComment: `Эту квартиру я приобрёл три года назад как инвестицию и летнюю резиденцию. За это время стоимость выросла на 40%. Здесь потрясающие закаты — каждый вечер как картина. Продаю из-за переезда в Европу, но если бы не обстоятельства — оставил бы себе навсегда.`,
                    ownerName: seed % 2 === 0 ? "Александр К." : "Михаил В.",
                });
                setError(null);

                // Generate nearby properties
                const nearby: Property[] = [];
                for (let i = 0; i < 4; i++) {
                    const nearbyIndex = (locationIndex + i + 1) % 10;
                    const nearbyLocation = getMockLocation(nearbyIndex);
                    const nearbyPrice = 20000000 + (nearbyIndex * 4500000) % 80000000;
                    const nearbyArea = 80 + (nearbyIndex * 25) % 150;
                    nearby.push({
                        id: `mock-prop-${nearbyIndex}`,
                        title: nearbyLocation.address || `Резиденция ${nearbyIndex + 1}`,
                        description: null,
                        price: nearbyPrice,
                        currency: "RUB",
                        address: nearbyLocation.address,
                        latitude: nearbyLocation.lat,
                        longitude: nearbyLocation.lng,
                        area_sqm: nearbyArea,
                        rooms: `${(nearbyIndex % 4) + 2}`,
                        floor: (nearbyIndex % 12) + 5,
                        total_floors: 20,
                        source: "mock",
                        source_id: null,
                        url: null,
                        images: [getMockImage(nearbyIndex)],
                        features: {},
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        is_active: true,
                        district: nearbyLocation.district,
                    });
                }
                setNearbyProperties(nearby);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) fetchProperty();
    }, [params.id]);

    const formatPrice = (price: number) => {
        if (price >= 1_000_000) {
            return `${(price / 1_000_000).toFixed(1)} млн ₽`;
        }
        return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
    };

    const formatPriceShort = (price: number) => {
        if (price >= 1_000_000) {
            return `${(price / 1_000_000).toFixed(1)} млн`;
        }
        return new Intl.NumberFormat('ru-RU').format(price);
    };

    // Get current property index for navigation
    const getCurrentIndex = () => {
        const mockId = (Array.isArray(params.id) ? params.id[0] : params.id) || 'unknown';
        const match = String(mockId).match(/mock-prop-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
    };

    const navigateToProperty = (direction: 'prev' | 'next') => {
        const currentIndex = getCurrentIndex();
        const newIndex = direction === 'prev'
            ? Math.max(0, currentIndex - 1)
            : Math.min(9, currentIndex + 1);
        router.push(`/properties/mock-prop-${newIndex}`);
    };

    // Loading state
    if (loading) {
        return (
            <div className="lux-loading">
                <div className="lux-loading-spinner" />
                <div className="lux-loading-text">Загружаем…</div>
            </div>
        );
    }

    // Error state
    if (error || !property) {
        return (
            <div className="lux-page">
                <Header />
                <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 200px)', padding: '60px 24px' }}>
                    <div style={{ textAlign: 'center', maxWidth: '400px' }}>
                        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', marginBottom: '16px' }}>Объект не найден</h1>
                        <p style={{ color: 'var(--lux-text-secondary)', marginBottom: '32px' }}>{error || 'Запрашиваемый объект не существует или был удалён'}</p>
                        <button onClick={() => router.push('/properties')} className="lux-btn lux-btn--primary">Вернуться к каталогу</button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const images = property.images.length > 0 ? property.images : [getMockImage(0)];
    const currentIndex = getCurrentIndex();

    return (
        <div className="lux-page">
            {/* Header */}
            <div className="lux-header-wrapper">
                <Header />
            </div>

            {/* ═══════════════════════════════════════════════════════════════════
                HERO SECTION — Full-Screen Cinematic
            ═══════════════════════════════════════════════════════════════════ */}
            <section className="lux-hero">
                <div className="lux-hero-media">
                    <img
                        src={images[activeImage]}
                        alt={property.title}
                        className="lux-hero-image"
                    />
                    <div className="lux-hero-overlay" />
                </div>

                <div className="lux-hero-content">
                    <div className="lux-hero-badge">Эксклюзив</div>
                    {property.complex && (
                        <div className="lux-hero-complex">{property.complex}</div>
                    )}
                    <h1 className="lux-hero-title">{property.title}</h1>
                    <p className="lux-hero-location">
                        {property.district || 'Сочи'}, Россия
                    </p>
                    <div className="lux-hero-price">{formatPrice(property.price)}</div>
                    <div className="lux-hero-price-label">Стоимость объекта</div>
                </div>

                <div className="lux-scroll-hint">
                    <span>Листайте</span>
                    <div className="lux-scroll-arrow" />
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════════
                NAVIGATION BAR — Breadcrumbs + Property Navigation
            ═══════════════════════════════════════════════════════════════════ */}
            <nav className="lux-nav-bar">
                <div className="lux-container">
                    <div className="lux-nav-bar-inner">
                        <div className="lux-breadcrumbs">
                            <a href="/map" className="lux-breadcrumb-back">
                                ← Карта
                            </a>
                            <span className="lux-breadcrumb-sep">/</span>
                            <a href={`/map?district=${property.district}`} className="lux-breadcrumb-link">
                                {property.district || 'Район'}
                            </a>
                            <span className="lux-breadcrumb-sep">/</span>
                            <a href="#" className="lux-breadcrumb-link">
                                {property.complex || 'ЖК'}
                            </a>
                            <span className="lux-breadcrumb-sep">/</span>
                            <span className="lux-breadcrumb-current">{property.address}</span>
                        </div>

                        <div className="lux-property-nav">
                            <button
                                className="lux-property-nav-btn"
                                onClick={() => navigateToProperty('prev')}
                                disabled={currentIndex === 0}
                            >
                                ← Пред.
                            </button>
                            <button
                                className="lux-property-nav-btn"
                                onClick={() => navigateToProperty('next')}
                                disabled={currentIndex >= 9}
                            >
                                След. →
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* ═══════════════════════════════════════════════════════════════════
                KEY FACTS — Minimal Data Display
            ═══════════════════════════════════════════════════════════════════ */}
            <section className="lux-facts">
                <div className="lux-container">
                    <div className="lux-facts-grid">
                        <div className="lux-fact">
                            <div className="lux-fact-value">{property.area_sqm}</div>
                            <div className="lux-fact-unit">м²</div>
                            <div className="lux-fact-label">Площадь</div>
                        </div>
                        <div className="lux-fact">
                            <div className="lux-fact-value">{property.rooms || '2'}</div>
                            <div className="lux-fact-unit">комн.</div>
                            <div className="lux-fact-label">Комнаты</div>
                        </div>
                        <div className="lux-fact">
                            <div className="lux-fact-value">{property.floor}</div>
                            <div className="lux-fact-unit">из {property.total_floors}</div>
                            <div className="lux-fact-label">Этаж</div>
                        </div>
                        <div className="lux-fact">
                            <div className="lux-fact-value">{formatPriceShort(property.pricePerSqm || Math.round(property.price / property.area_sqm))}</div>
                            <div className="lux-fact-unit">₽/м²</div>
                            <div className="lux-fact-label">Цена за метр</div>
                        </div>
                        <div className="lux-fact">
                            <div className="lux-fact-value">{property.quality_score || 94}</div>
                            <div className="lux-fact-unit">/ 100</div>
                            <div className="lux-fact-label">Рейтинг</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════════
                GALLERY — Editorial Layout
            ═══════════════════════════════════════════════════════════════════ */}
            <section className="lux-gallery">
                <div className="lux-container">
                    <div className="lux-gallery-main">
                        <img src={images[activeImage]} alt={property.title} />
                        <div className="lux-gallery-counter">{activeImage + 1} / {images.length}</div>
                    </div>
                    <div className="lux-gallery-thumbs">
                        {images.map((img, i) => (
                            <div
                                key={i}
                                className={`lux-gallery-thumb ${i === activeImage ? 'active' : ''}`}
                                onClick={() => setActiveImage(i)}
                            >
                                <img src={img} alt={`Фото ${i + 1}`} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════════
                ABOUT — Editorial Description
            ═══════════════════════════════════════════════════════════════════ */}
            <section className="lux-about">
                <div className="lux-container lux-container--narrow">
                    <div className="lux-section-header">
                        <span className="lux-section-tag">О резиденции</span>
                        <h2 className="lux-section-title">Исключительная недвижимость</h2>
                    </div>
                    <div className="lux-about-content">
                        <div className="lux-about-text">
                            {property.description?.split('\n\n').map((paragraph, i) => (
                                <p key={i}>{paragraph}</p>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════════
                FEATURES — Clean Two-Column List
            ═══════════════════════════════════════════════════════════════════ */}
            <section className="lux-features">
                <div className="lux-container">
                    <div className="lux-section-header">
                        <span className="lux-section-tag">Особенности</span>
                        <h2 className="lux-section-title">Что делает её уникальной</h2>
                    </div>
                    <div className="lux-features-grid">
                        <div className="lux-feature-item">
                            <div className="lux-feature-icon">{FeatureIcons.view}</div>
                            <div className="lux-feature-content">
                                <div className="lux-feature-title">Панорамный вид</div>
                                <div className="lux-feature-value">{String(property.features?.["Вид"] || "Море и горы")}</div>
                            </div>
                        </div>
                        <div className="lux-feature-item">
                            <div className="lux-feature-icon">{FeatureIcons.terrace}</div>
                            <div className="lux-feature-content">
                                <div className="lux-feature-title">Терраса</div>
                                <div className="lux-feature-value">{String(property.features?.["Терраса"] || "45 м²")}</div>
                            </div>
                        </div>
                        <div className="lux-feature-item">
                            <div className="lux-feature-icon">{FeatureIcons.parking}</div>
                            <div className="lux-feature-content">
                                <div className="lux-feature-title">Паркинг</div>
                                <div className="lux-feature-value">{String(property.features?.["Паркинг"] || "2 места")}</div>
                            </div>
                        </div>
                        <div className="lux-feature-item">
                            <div className="lux-feature-icon">{FeatureIcons.finish}</div>
                            <div className="lux-feature-content">
                                <div className="lux-feature-title">Отделка</div>
                                <div className="lux-feature-value">{String(property.features?.["Отделка"] || "Премиум")}</div>
                            </div>
                        </div>
                        <div className="lux-feature-item">
                            <div className="lux-feature-icon">{FeatureIcons.ceiling}</div>
                            <div className="lux-feature-content">
                                <div className="lux-feature-title">Высота потолков</div>
                                <div className="lux-feature-value">{String(property.features?.["Потолки"] || "3.2 м")}</div>
                            </div>
                        </div>
                        <div className="lux-feature-item">
                            <div className="lux-feature-icon">{FeatureIcons.pool}</div>
                            <div className="lux-feature-content">
                                <div className="lux-feature-title">Бассейн</div>
                                <div className="lux-feature-value">{String(property.features?.["Бассейн"] || "Rooftop")}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════════
                OWNER'S INSIGHT — Quote Section
            ═══════════════════════════════════════════════════════════════════ */}
            <section className="lux-owner">
                <div className="lux-container">
                    <div className="lux-owner-card">
                        <div className="lux-owner-quote-icon">"</div>
                        <blockquote className="lux-owner-quote">
                            {property.ownerComment || 'Эту квартиру я приобрёл три года назад как инвестицию и летнюю резиденцию. За это время стоимость выросла на 40%. Здесь потрясающие закаты — каждый вечер как картина.'}
                        </blockquote>
                        <div className="lux-owner-info">
                            <div className="lux-owner-avatar">
                                {(property.ownerName || 'А')[0]}
                            </div>
                            <div className="lux-owner-details">
                                <div className="lux-owner-name">{property.ownerName || 'Владелец'}</div>
                                <div className="lux-owner-role">Собственник резиденции</div>
                            </div>
                            <div className="lux-owner-verified">✓ Верифицирован</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════════
                INVESTMENT — Clean Data Visualization
            ═══════════════════════════════════════════════════════════════════ */}
            <section className="lux-investment">
                <div className="lux-container">
                    <div className="lux-section-header">
                        <span className="lux-section-tag">Инвестиции</span>
                        <h2 className="lux-section-title">Не просто дом — актив</h2>
                    </div>
                    <div className="lux-investment-grid">
                        <div className="lux-investment-item">
                            <div className="lux-investment-value positive">+{property.growth_10y}%</div>
                            <div className="lux-investment-label">Рост стоимости за 10 лет</div>
                            <div className="lux-investment-bar">
                                <div
                                    className="lux-investment-bar-fill"
                                    style={{ width: `${Math.min(property.growth_10y || 0, 100)}%`, background: '#16a34a' }}
                                />
                            </div>
                        </div>
                        <div className="lux-investment-item">
                            <div className="lux-investment-value gold">14%</div>
                            <div className="lux-investment-label">Годовая доходность (ROI)</div>
                            <div className="lux-investment-bar">
                                <div
                                    className="lux-investment-bar-fill"
                                    style={{ width: '70%', background: '#b8860b' }}
                                />
                            </div>
                        </div>
                        <div className="lux-investment-item">
                            <div className="lux-investment-value blue">22 дня</div>
                            <div className="lux-investment-label">Средний срок продажи</div>
                            <div className="lux-investment-bar">
                                <div
                                    className="lux-investment-bar-fill"
                                    style={{ width: '30%', background: '#2563eb' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════════
                TABS — Additional Information
            ═══════════════════════════════════════════════════════════════════ */}
            <section className="lux-tabs">
                <div className="lux-container">
                    <nav className="lux-tabs-nav">
                        {[
                            { id: 'info' as TabType, label: 'Подробнее' },
                            { id: 'location' as TabType, label: 'Локация' },
                            { id: 'potential' as TabType, label: 'Аналитика' },
                            { id: 'surroundings' as TabType, label: 'Инфраструктура' },
                            { id: 'smi' as TabType, label: 'В СМИ' },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`lux-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>

                    <div className="lux-tabs-content">
                        {activeTab === 'info' && (
                            <div className="lux-tabs-features">
                                {Object.entries(property.features).map(([key, value]) => (
                                    <span key={key} className="lux-tabs-feature-tag">
                                        {key}: {String(value)}
                                    </span>
                                ))}
                            </div>
                        )}
                        {activeTab === 'location' && <PropertyLocation propertyId={property.id} address={property.address} />}
                        {activeTab === 'potential' && <PropertyPotential propertyId={property.id} currentGrowth={property.growth_10y} />}
                        {activeTab === 'surroundings' && <PropertySurroundings propertyId={property.id} />}
                        {activeTab === 'smi' && <SMIFeed />}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════════
                AGENT SECTION — Contact Card
            ═══════════════════════════════════════════════════════════════════ */}
            <section className="lux-agent">
                <div className="lux-container">
                    <div className="lux-agent-card">
                        <div className="lux-agent-photo">
                            <span className="lux-agent-photo-placeholder">А</span>
                        </div>
                        <div className="lux-agent-info">
                            <div className="lux-agent-title">Ваш эксперт</div>
                            <div className="lux-agent-name">Анна Петрова</div>
                            <div className="lux-agent-role">Эксперт по премиальной недвижимости • 12 лет опыта</div>
                            <div className="lux-agent-actions">
                                <button className="lux-btn lux-btn--primary">
                                    Записаться на просмотр
                                </button>
                                <button className="lux-btn lux-btn--secondary">
                                    Задать вопрос
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════════
                CTA — Prominent Call to Action
            ═══════════════════════════════════════════════════════════════════ */}
            <section className="lux-cta">
                <div className="lux-container">
                    <h2 className="lux-cta-title">Готовы увидеть вживую?</h2>
                    <p className="lux-cta-text">Запишитесь на приватный просмотр и почувствуйте атмосферу лично</p>
                    <div className="lux-cta-actions">
                        <button className="lux-btn lux-btn--primary">
                            Назначить показ
                        </button>
                        <button className="lux-btn lux-btn--secondary">
                            Связаться с экспертом
                        </button>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════════
                NEARBY PROPERTIES — Horizontal Scroll
            ═══════════════════════════════════════════════════════════════════ */}
            <section className="lux-nearby">
                <div className="lux-container">
                    <div className="lux-section-header">
                        <span className="lux-section-tag">Рядом</span>
                        <h2 className="lux-section-title">Другие объекты в этом районе</h2>
                    </div>
                    <div className="lux-nearby-scroll">
                        {nearbyProperties.map((prop) => (
                            <div
                                key={prop.id}
                                className="lux-nearby-card"
                                onClick={() => router.push(`/properties/${prop.id}`)}
                            >
                                <div className="lux-nearby-card-image">
                                    <img src={prop.images[0]} alt={prop.title} />
                                </div>
                                <div className="lux-nearby-card-content">
                                    <div className="lux-nearby-card-title">{prop.title}</div>
                                    <div className="lux-nearby-card-address">{prop.district}</div>
                                    <div className="lux-nearby-card-price">{formatPrice(prop.price)}</div>
                                    <div className="lux-nearby-card-stats">
                                        <span>{prop.area_sqm} м²</span>
                                        <span>{prop.rooms} комн.</span>
                                        <span>{prop.floor} этаж</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
