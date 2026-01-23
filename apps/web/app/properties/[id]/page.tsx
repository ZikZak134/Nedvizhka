'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { LeadCaptureModal } from '../../components/LeadCaptureModal';
import '../../styles/luxury-property.css';

// Lazy load components
const PropertyLocation = dynamic(() => import('../../components/PropertyLocation').then(m => m.PropertyLocation), { ssr: false });
const PropertyPotential = dynamic(() => import('../../components/PropertyPotential').then(m => m.PropertyPotential), { ssr: false });
const PropertySurroundings = dynamic(() => import('../../components/PropertySurroundings').then(m => m.PropertySurroundings), { ssr: false });
const SMIFeed = dynamic(() => import('../../components/SMIFeed').then(m => m.SMIFeed), { ssr: false });
import { FadeIn } from '../../components/animations/FadeIn';
import { Reveal } from '../../components/animations/Reveal';
import { motion } from 'framer-motion';

interface Property {
    is_from_developer: boolean;
    property_type: string;
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
    features: Record<string, any>;
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
    // Поля из API для динамических данных
    badges?: string[];
    owner_quote?: string;
    owner_name?: string;
    investment_metrics?: {
        roi?: number;
        growth_10y?: number;
        sale_time?: number;
    };
    agent_profile?: {
        name?: string;
        role?: string;
        photo?: string;
        phone?: string;
    };
    eco_score?: Record<string, number>;
    green_zones?: any[];
    growth_forecasts?: any[];
    development_projects?: any[];
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

const NewbuildLanding = dynamic(() => import('../../components/NewbuildLanding').then(m => m.NewbuildLanding), { ssr: false });

export default function PropertyDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [property, setProperty] = useState<Property | null>(null);
    const [nearbyProperties, setNearbyProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeImage, setActiveImage] = useState(0);
    const [activeTab, setActiveTab] = useState<TabType>('info');
    const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
    const [leadMode, setLeadMode] = useState<'showing' | 'report' | 'question'>('showing');

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
                setError('Объект не найден или был удалён');
                setProperty(null);
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
                <main className="flex items-center justify-center min-h-[calc(100vh-200px)] py-[60px] px-6">
                    <div className="text-center max-w-[400px]">
                        <h1 className="font-serif text-[32px] mb-4">Объект не найден</h1>
                        <p className="text-[var(--lux-text-secondary)] mb-8">{error || 'Запрашиваемый объект не существует или был удалён'}</p>
                        <button onClick={() => router.push('/properties')} className="lux-btn lux-btn--primary">Вернуться к каталогу</button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const images = property.images.length > 0 ? property.images : [];
    const currentIndex = getCurrentIndex();

    // Conditional Render for Developer Properties
    if (property.is_from_developer && property.property_type === 'newbuild') {
        return <NewbuildLanding property={property} />;
    }

    const openLeadModal = (mode: 'showing' | 'report' | 'question') => {
        setLeadMode(mode);
        setIsLeadModalOpen(true);
    };

    return (
        <div className="lux-page">
            <LeadCaptureModal
                isOpen={isLeadModalOpen}
                onClose={() => setIsLeadModalOpen(false)}
                mode={leadMode}
                propertyTitle={property.title}
            />

            {/* Header */}
            <div className="lux-header-wrapper">
                <Header />
            </div>

            {/* ... Existing Hero ... */}
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
                    {/* Динамические badges из API */}
                    {property.badges && property.badges.length > 0 ? (
                        <div className="flex gap-2 mb-2">
                            {property.badges.map((badge, idx) => (
                                <div key={idx} className="lux-hero-badge">{badge}</div>
                            ))}
                        </div>
                    ) : (
                        <div className="lux-hero-badge">Премиум</div>
                    )}
                    {property.complex && (
                        <div className="lux-hero-complex">{property.complex}</div>
                    )}

                    <h1 className="lux-hero-title">
                        <Reveal>{property.title}</Reveal>
                    </h1>
                    <FadeIn delay={0.2}>
                        <p className="lux-hero-location">
                            {property.district || 'Сочи'}, Россия
                        </p>
                    </FadeIn>
                    <FadeIn delay={0.4}>
                        <div className="lux-hero-price">{formatPrice(property.price)}</div>
                    </FadeIn>
                    <div className="lux-hero-price-label">Стоимость объекта</div>
                    {/* Ask Owner Link */}
                    {/* Ask Owner Link */}
                    <button
                        onClick={() => openLeadModal('question')}
                        className="bg-transparent border-none text-[#d4af37] underline mt-3 text-[13px] cursor-pointer font-sans"
                    >
                        💬 Задать вопрос представителю владельца
                    </button>
                </div>

                <div className="lux-scroll-hint">
                    <span>Листайте</span>
                    <div className="lux-scroll-arrow" />
                </div>
            </section>

            {/* ... Existing Nav & Facts ... */}
            <nav className="lux-nav-bar">
                <div className="lux-container">
                    <div className="lux-nav-bar-inner">
                        <div className="lux-breadcrumbs">
                            <a href="/" className="lux-breadcrumb-back">
                                ← На главную
                            </a>
                            <span className="lux-breadcrumb-sep">/</span>
                            <a href={`/?district=${property.district}`} className="lux-breadcrumb-link">
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

            <FadeIn>
                <section className="lux-facts">
                    <div className="lux-container">
                        <div className="lux-facts-grid">
                            <div className="lux-fact">
                                <div className="lux-fact-value">{property.area_sqm}</div>
                                <div className="lux-fact-unit">м²</div>
                                <div className="lux-fact-label">Площадь</div>
                            </div>
                            <div className="lux-fact">
                                <div className="lux-fact-value">{property.rooms || '—'}</div>
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
                                <div className="lux-fact-value">{property.quality_score || '—'}</div>
                                <div className="lux-fact-unit">/ 100</div>
                                <div className="lux-fact-label">Рейтинг</div>
                            </div>
                        </div>
                    </div>
                </section>
            </FadeIn>

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

            <section className="lux-features">
                <div className="lux-container">
                    <div className="lux-section-header">
                        <FadeIn direction="left">
                            <span className="lux-section-tag">Особенности</span>
                        </FadeIn>
                        <FadeIn direction="right">
                            <h2 className="lux-section-title">Что делает её уникальной</h2>
                        </FadeIn>
                    </div>
                    <FadeIn delay={0.2}>
                        <div className="lux-features-grid">
                        <div className="lux-feature-item">
                            <div className="lux-feature-icon">{FeatureIcons.view}</div>
                            <div className="lux-feature-content">
                                <div className="lux-feature-title">Панорамный вид</div>
                                <div className="lux-feature-value">{String(property.features?.["Вид"] || "—")}</div>
                            </div>
                        </div>
                        <div className="lux-feature-item">
                            <div className="lux-feature-icon">{FeatureIcons.terrace}</div>
                            <div className="lux-feature-content">
                                <div className="lux-feature-title">Терраса</div>
                                <div className="lux-feature-value">{String(property.features?.["Терраса"] || "—")}</div>
                            </div>
                        </div>
                        <div className="lux-feature-item">
                            <div className="lux-feature-icon">{FeatureIcons.parking}</div>
                            <div className="lux-feature-content">
                                <div className="lux-feature-title">Паркинг</div>
                                <div className="lux-feature-value">{String(property.features?.["Паркинг"] || "—")}</div>
                            </div>
                        </div>
                        <div className="lux-feature-item">
                            <div className="lux-feature-icon">{FeatureIcons.finish}</div>
                            <div className="lux-feature-content">
                                <div className="lux-feature-title">Отделка</div>
                                <div className="lux-feature-value">{String(property.features?.["Отделка"] || "—")}</div>
                            </div>
                        </div>
                        <div className="lux-feature-item">
                            <div className="lux-feature-icon">{FeatureIcons.ceiling}</div>
                            <div className="lux-feature-content">
                                <div className="lux-feature-title">Высота потолков</div>
                                <div className="lux-feature-value">{String(property.features?.["Потолки"] || "—")}</div>
                            </div>
                        </div>
                        <div className="lux-feature-item">
                            <div className="lux-feature-icon">{FeatureIcons.pool}</div>
                            <div className="lux-feature-content">
                                <div className="lux-feature-title">Бассейн</div>
                                <div className="lux-feature-value">{String(property.features?.["Бассейн"] || "—")}</div>
                            </div>
                        </div>
                    </div>
                    </FadeIn>
                </div>
            </section>

            <section className="lux-owner">
                <div className="lux-container">
                    <div className="lux-owner-card">
                        <div className="lux-owner-quote-icon">"</div>
                        <blockquote className="lux-owner-quote">
                            {property.owner_quote || property.ownerComment || 'Отзыв владельца ещё не добавлен'}
                        </blockquote>
                        <div className="lux-owner-info">
                            <div className="lux-owner-avatar">
                                {(property.owner_name || property.ownerName || 'В')[0]}
                            </div>
                            <div className="lux-owner-details">
                                <div className="lux-owner-name">{property.owner_name || property.ownerName || 'Владелец'}</div>
                                <div className="lux-owner-role">Собственник резиденции</div>
                            </div>
                            <div className="lux-owner-verified">✓ Верифицирован</div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="lux-investment">
                <div className="lux-container">
                    <div className="lux-section-header">
                        <span className="lux-section-tag">Инвестиции</span>
                        <h2 className="lux-section-title">Не просто дом — актив</h2>
                    </div>
                <div className="lux-investment-grid">
                    {/* eslint-disable react/forbid-dom-props */}
                    {(() => {
                        const growthStyle = { '--progress-width': `${Math.min(property.growth_10y || 0, 100)}%` } as React.CSSProperties;
                        const roiStyle = { '--progress-width': `${Math.min((property.investment_metrics?.roi || 0) * 5, 100)}%` } as React.CSSProperties;
                        const saleStyle = { '--progress-width': `${Math.min((property.investment_metrics?.sale_time || 0), 100)}%` } as React.CSSProperties;

                        return (
                            <>
                                <div className="lux-investment-item">
                                    <div className="lux-investment-value positive">+{property.growth_10y}%</div>
                                    <div className="lux-investment-label">Рост стоимости за 10 лет</div>
                                    <div className="lux-investment-bar">
                                        <div className="lux-investment-bar-fill bg-[#16a34a]" style={growthStyle} />
                                    </div>
                                </div>
                                <div className="lux-investment-item">
                                    <div className="lux-investment-value gold">{property.investment_metrics?.roi || 0}%</div>
                                    <div className="lux-investment-label">Годовая доходность (ROI)</div>
                                    <div className="lux-investment-bar">
                                        <div className="lux-investment-bar-fill bg-[#b8860b]" style={roiStyle} />
                                    </div>
                                </div>
                                <div className="lux-investment-item">
                                    <div className="lux-investment-value blue">{property.investment_metrics?.sale_time || 0} дней</div>
                                    <div className="lux-investment-label">Средний срок продажи</div>
                                    <div className="lux-investment-bar">
                                        <div className="lux-investment-bar-fill bg-[#2563eb]" style={saleStyle} />
                                    </div>
                                </div>
                            </>
                        );
                    })()}
                </div>
                </div>
            </section>

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
                        {activeTab === 'location' && <PropertyLocation propertyId={property.id} address={property.address} latitude={property.latitude} longitude={property.longitude} />}
                        {activeTab === 'potential' && (
                            <PropertyPotential 
                                propertyId={property.id} 
                                currentGrowth={property.investment_metrics?.growth_10y}
                                forecasts={property.growth_forecasts}
                                projects={property.development_projects}
                            />
                        )}
                        {activeTab === 'surroundings' && (
                            <PropertySurroundings 
                                propertyId={property.id} 
                                environment={property.eco_score ? Object.entries(property.eco_score).map(([key, val]) => ({
                                    name: key, icon: '📍', score: Number(val), description: 'Оценка из админки'
                                })) : undefined}
                                greenZones={property.green_zones}
                            />
                        )}
                        {activeTab === 'smi' && <SMIFeed />}
                    </div>
                </div>
            </section>

            <section className="lux-agent">
                <div className="lux-container">
                    <div className="lux-agent-card">
                        <div className="lux-agent-photo">
                            {property.agent_profile?.photo ? (
                                <img src={property.agent_profile.photo} alt={property.agent_profile.name} className="w-full h-full rounded-full" />
                            ) : (
                                <span className="lux-agent-photo-placeholder">{(property.agent_profile?.name || 'А')[0]}</span>
                            )}
                        </div>
                        <div className="lux-agent-info">
                            <div className="lux-agent-title">Ваш эксперт</div>
                            <div className="lux-agent-name">{property.agent_profile?.name || 'Эксперт'}</div>
                            <div className="lux-agent-role">{property.agent_profile?.role || 'Консультант'}</div>
                            <div className="lux-agent-actions">

                                <motion.button 
                                    className="lux-btn lux-btn--primary" 
                                    onClick={() => openLeadModal('showing')}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    🔑 Заказать показ
                                </motion.button>
                                <motion.button 
                                    className="lux-btn lux-btn--secondary" 
                                    onClick={() => openLeadModal('question')}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Задать вопрос
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="lux-cta">
                <div className="lux-container">
                    <h2 className="lux-cta-title">Готовы увидеть вживую?</h2>
                    <p className="lux-cta-text">Запишитесь на приватный просмотр и почувствуйте атмосферу лично</p>
                    <div className="lux-cta-actions">
                        <motion.button 
                            className="lux-btn lux-btn--primary" 
                            onClick={() => openLeadModal('showing')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            🔑 Назначить показ
                        </motion.button>
                        <motion.button 
                            className="lux-btn lux-btn--secondary" 
                            onClick={() => openLeadModal('question')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Связаться с экспертом
                        </motion.button>
                    </div>
                </div>
            </section>

            {/* ... Existing Nearby ... */}
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

            {/* STICKY FOOTER (Mobile) */}
            <div className="fixed bottom-0 left-0 right-0 bg-[#0f172a] border-t border-white/10 p-3 z-[100] md:hidden block">
                <div className="flex gap-3">
                    <motion.button
                        onClick={() => openLeadModal('showing')}
                        className="flex-[2] p-3.5 rounded-xl bg-[#d4af37] border-none text-black font-bold text-base"
                        whileTap={{ scale: 0.95 }}
                    >
                        🔑 Заказать показ
                    </motion.button>
                    <motion.button
                        onClick={() => openLeadModal('question')}
                        className="flex-1 p-3.5 rounded-xl bg-white/10 border-none text-white font-semibold text-[13px]"
                        whileTap={{ scale: 0.95 }}
                    >
                        💬 Вопрос
                    </motion.button>
                </div>
            </div>

            <style jsx>{`
                @media (max-width: 768px) {
                    .lux-agent, .lux-cta { padding-bottom: 80px; } /* Add padding for footer */
                }
            `}</style>

            <Footer />
        </div>
    );
}
