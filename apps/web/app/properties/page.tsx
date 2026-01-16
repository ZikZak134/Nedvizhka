'use client';

import { useEffect, useState } from 'react';
import { getMockImage } from '../utils/mockImages';
import { getMockLocation } from '../utils/mockLocations';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { PropertyCard } from '../components/PropertyCard';
import { PropertyFilters } from '../components/PropertyFilters';
import styles from '../styles/public.module.css';

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
    images: string[];
    features: Record<string, unknown>;
    created_at: string;
    is_active: boolean;
}

interface Filters {
    min_price?: number;
    max_price?: number;
    min_area?: number;
    max_area?: number;
    rooms?: string;
}

export default function PropertiesPage() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<Filters>({});
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchProperties = async () => {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('size', '12');

        if (filters.min_price) params.append('min_price', filters.min_price.toString());
        if (filters.max_price) params.append('max_price', filters.max_price.toString());
        if (filters.min_area) params.append('min_area', filters.min_area.toString());
        if (filters.max_area) params.append('max_area', filters.max_area.toString());
        if (filters.rooms) params.append('rooms', filters.rooms);

        try {
            const res = await fetch(`${apiUrl}/api/v1/properties?${params.toString()}`);
            if (!res.ok) throw new Error('Network response was not ok');
            const data = await res.json();

            // Enrich with mock images if missing
            const enrichedItems = (data.items || []).map((p: any) => ({
                ...p,
                images: (!p.images || p.images.length === 0) ? [getMockImage(p.id)] : p.images
            }));

            setProperties(enrichedItems);
            setTotalPages(data.pages || 1);
            setTotal(data.total || 0);
        } catch (error) {
            console.error('Failed to fetch properties (using fallback):', error);

            setProperties([]);
            setTotalPages(1);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProperties();
    }, [page, filters]);

    const handleFilterChange = (newFilters: Filters) => {
        setFilters(newFilters);
        setPage(1);
    };

    // Dynamic Map Import
    const PropertyMap = useState(() => import('../components/PropertyMap').then(mod => mod.PropertyMap))[0];
    const [PropertyMapComp, setPropertyMapComp] = useState<any>(null);

    useEffect(() => {
        PropertyMap.then(comp => setPropertyMapComp(() => comp));
    }, [PropertyMap]);

    const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

    return (
        <div className="page">
            <Header />

            <main className="page-main">
                <section className="section-sm">
                    <div className="container">
                        {/* Page Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="heading-3 mb-2">Объекты недвижимости</h1>
                                <p className="body-small">
                                    {loading ? 'Загрузка...' : `Найдено ${total} объектов`}
                                </p>
                            </div>
                            <div className="cluster">
                                <button
                                    className={`btn btn-sm ${viewMode === 'grid' ? 'btn-secondary' : 'btn-ghost'}`}
                                    onClick={() => setViewMode('grid')}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="3" width="7" height="7" />
                                        <rect x="14" y="3" width="7" height="7" />
                                        <rect x="14" y="14" width="7" height="7" />
                                        <rect x="3" y="14" width="7" height="7" />
                                    </svg>
                                    Сетка
                                </button>
                                <button
                                    className={`btn btn-sm ${viewMode === 'map' ? 'btn-secondary' : 'btn-ghost'}`}
                                    onClick={() => setViewMode('map')}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                        <circle cx="12" cy="10" r="3" />
                                    </svg>
                                    Карта
                                </button>
                            </div>
                        </div>

                        {/* Layout with Sidebar */}
                        <div className="sidebar-layout">
                            {/* Filters Sidebar */}
                            <aside className="sidebar">
                                <PropertyFilters
                                    filters={filters}
                                    onFilterChange={handleFilterChange}
                                />
                            </aside>

                            {/* Properties Grid or Map */}
                            <div className={styles.propertiesContainer}>
                                {loading && viewMode === 'grid' ? (
                                    <div className="grid grid-auto-fill-md">
                                        {[...Array(6)].map((_, i) => (
                                            <div key={i} className="card">
                                                <div className="skeleton skeleton-image" />
                                                <div className="card-body">
                                                    <div className="skeleton skeleton-title mb-2" />
                                                    <div className="skeleton skeleton-text mb-4" />
                                                    <div className={`skeleton skeleton-text ${styles.skeletonWidth40}`} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : properties.length === 0 ? (
                                    <div className={`text-center ${styles.emptyStateContainer}`}>
                                        <div className={styles.emptyStateIcon}>🏠</div>
                                        <h3 className="heading-5 mb-2">Объекты не найдены</h3>
                                        <p className="body-small">
                                            Попробуйте изменить параметры фильтрации или добавьте новые объекты через API
                                        </p>
                                    </div>
                                ) : viewMode === 'map' ? (
                                    <div className={styles.mapContainer}>
                                        {PropertyMapComp ? (
                                            <PropertyMapComp
                                                height="100%"
                                                properties={properties}
                                                onPropertyClick={(id: string) => window.location.href = `/properties/${id}`}
                                            />
                                        ) : (
                                            <div className="skeleton w-full h-full" />
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-auto-fill-md">
                                            {properties.map((property) => (
                                                <PropertyCard key={property.id} property={property} />
                                            ))}
                                        </div>

                                        {/* Pagination */}
                                        {totalPages > 1 && (
                                            <div className="flex items-center justify-center gap-4 mt-8">
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    disabled={page === 1}
                                                    onClick={() => setPage(p => p - 1)}
                                                >
                                                    ← Назад
                                                </button>
                                                <span className="body-base">
                                                    Страница {page} из {totalPages}
                                                </span>
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    disabled={page === totalPages}
                                                    onClick={() => setPage(p => p + 1)}
                                                >
                                                    Вперёд →
                                                </button>
                                            </div>
                                        )}
                                    </>
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

