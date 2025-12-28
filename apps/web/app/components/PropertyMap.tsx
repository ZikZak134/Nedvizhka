'use client';

import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';

// Types
interface Property {
    id: string;
    title: string;
    price: number;
    price_per_sqm: number;
    area_sqm: number;
    rooms: string | null;
    address: string;
    source: string;
    description?: string | null;
    currency?: string;
    latitude?: number | null;
    longitude?: number | null;
    floor?: number | null;
    total_floors?: number | null;
    images?: string[];
    features?: Record<string, unknown>;
    created_at?: string;
    is_active?: boolean;
}

interface GeoJSONFeature {
    type: 'Feature';
    geometry: {
        type: 'Point';
        coordinates: [number, number]; // [lng, lat]
    };
    properties: Property;
}

interface GeoJSONData {
    type: 'FeatureCollection';
    features: GeoJSONFeature[];
    metadata: {
        total: number;
        avg_price: number;
        avg_price_per_sqm: number;
    };
}

interface PropertyMapProps {
    height?: string;
    showHeatmap?: boolean;
    onPropertyClick?: (id: string) => void;
    properties?: Property[]; // Optional: pass properties directly
}

// Price color scale
const getPriceColor = (price: number): string => {
    if (price >= 100_000_000) return '#ef4444';
    if (price >= 50_000_000) return '#f97316';
    if (price >= 30_000_000) return '#eab308';
    if (price >= 15_000_000) return '#22c55e';
    return '#3b82f6';
};

const getMarkerRadius = (price: number): number => {
    if (price >= 100_000_000) return 15;
    if (price >= 50_000_000) return 12;
    if (price >= 30_000_000) return 10;
    return 8;
};

const formatPrice = (price: number): string => {
    if (price >= 1_000_000) {
        return `${(price / 1_000_000).toFixed(1)}M`;
    }
    return `${(price / 1_000).toFixed(0)}K`;
};

export function PropertyMap({ height = '500px', showHeatmap = true, onPropertyClick, properties }: PropertyMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const [data, setData] = useState<GeoJSONData | null>(null);
    const [loading, setLoading] = useState(!properties);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Process properties prop or fetch data
    useEffect(() => {
        if (properties) {
            // Convert passed properties to GeoJSON
            const features: GeoJSONFeature[] = properties
                .filter(p => p.latitude && p.longitude)
                .map(p => ({
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [p.longitude!, p.latitude!]
                    },
                    properties: p
                }));

            setData({
                type: 'FeatureCollection',
                features,
                metadata: {
                    total: properties.length,
                    avg_price: properties.reduce((acc, p) => acc + p.price, 0) / (properties.length || 1),
                    avg_price_per_sqm: 0 // not critical for this view
                }
            });
            setLoading(false);
        } else {
            const fetchData = async () => {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                try {
                    const res = await fetch(`${apiUrl}/api/v1/heatmap`);
                    const json = await res.json();
                    setData(json);
                } catch (error) {
                    console.error('Failed to fetch heatmap data:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [properties]);

    // Initialize Leaflet map (manual approach - avoids react-leaflet issues)
    useEffect(() => {
        if (!mounted || loading || !mapRef.current) return;

        const initMap = async () => {
            const L = (await import('leaflet')).default;

            // Clean up any existing map
            const container = mapRef.current as any;
            if (container && (container._leaflet_id || container.childElementCount > 0)) {
                if (mapInstanceRef.current) {
                    try { mapInstanceRef.current.remove(); } catch (e) { }
                    mapInstanceRef.current = null;
                }
                container._leaflet_id = null;
                container.innerHTML = '';
            }

            // Create map
            const map = L.map(mapRef.current!, {
                center: [43.585, 39.720],
                zoom: 14,
                zoomControl: true,
            });
            mapInstanceRef.current = map;

            // Add tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            // Add markers
            if (data?.features) {
                data.features.forEach((feature, idx) => {
                    const [lng, lat] = feature.geometry.coordinates;
                    const props = feature.properties;

                    const marker = L.circleMarker([lat, lng], {
                        radius: getMarkerRadius(props.price),
                        fillColor: getPriceColor(props.price),
                        color: '#fff',
                        weight: 2,
                        opacity: 1,
                        fillOpacity: 0.8,
                    }).addTo(map);

                    // Popup
                    marker.bindPopup(`
                        <div style="min-width: 200px;">
                            <h4 style="margin: 0 0 8px; font-size: 14px; font-weight: 700; color: var(--navy-deep);">${props.title}</h4>
                            <p style="margin: 0 0 4px; font-size: 12px; color: var(--gray-700);">📍 ${props.address}</p>
                            <div style="display: flex; gap: 12px; margin: 8px 0;">
                                <div>
                                    <div style="font-size: 18px; font-weight: 700; color: ${getPriceColor(props.price)};">${formatPrice(props.price)} ₽</div>
                                    <div style="font-size: 11px; color: var(--gray-600); font-weight: 500;">Цена</div>
                                </div>
                                <div>
                                    <div style="font-size: 14px; font-weight: 600; color: var(--navy-deep);">${formatPrice(props.price_per_sqm)} ₽/м²</div>
                                    <div style="font-size: 11px; color: var(--gray-600); font-weight: 500;">За м²</div>
                                </div>
                            </div>
                            <a href="/properties/${props.id}" style="display: block; margin-top: 8px; padding: 6px 12px; background: #3b82f6; color: #fff; border-radius: 6px; text-align: center; font-size: 12px; text-decoration: none;">Подробнее →</a>
                        </div>
                    `);

                    // Click handler
                    if (onPropertyClick) {
                        marker.on('click', () => onPropertyClick(props.id));
                    }
                });
            }
        };

        initMap();

        return () => {
            if (mapInstanceRef.current) {
                try { mapInstanceRef.current.remove(); } catch (e) { }
                mapInstanceRef.current = null;
            }
        };
    }, [mounted, loading, data, onPropertyClick]);

    if (!mounted) {
        return (
            <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
                <div className="skeleton" style={{ width: '100%', height: '100%' }} />
            </div>
        );
    }

    if (loading) {
        return (
            <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
                <span className="body-base">🗺️ Загрузка карты...</span>
            </div>
        );
    }

    return (
        <div style={{ height, borderRadius: 'var(--radius-lg)', overflow: 'hidden', position: 'relative' }}>
            {/* Map Container */}
            <div ref={mapRef} style={{ height: '100%', width: '100%' }} />

            {/* Legend */}
            <div style={{
                position: 'absolute',
                bottom: '20px',
                right: '20px',
                background: 'rgba(15, 23, 42, 0.9)',
                backdropFilter: 'blur(8px)',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: 'var(--shadow-xl)',
                color: 'var(--white)',
                zIndex: 500,
                fontSize: '12px',
            }}>
                <div style={{ fontWeight: 600, marginBottom: '8px' }}>Цена объекта</div>
                {[
                    { color: '#3b82f6', label: '< 15M' },
                    { color: '#22c55e', label: '15-30M' },
                    { color: '#eab308', label: '30-50M' },
                    { color: '#f97316', label: '50-100M' },
                    { color: '#ef4444', label: '> 100M' },
                ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <span style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: item.color,
                            border: '1px solid #fff',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                        }} />
                        <span>{item.label} ₽</span>
                    </div>
                ))}
            </div>

            {/* Stats overlay */}
            {data?.metadata && (
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    background: 'rgba(15, 23, 42, 0.9)',
                    backdropFilter: 'blur(8px)',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: 'var(--shadow-xl)',
                    color: 'var(--white)',
                    zIndex: 500,
                    fontSize: '12px',
                }}>
                    <div style={{ fontWeight: 600 }}>📊 {data.metadata.total} объектов</div>
                    <div style={{ color: 'var(--gray-300)' }}>Ср. цена: {formatPrice(data.metadata.avg_price)} ₽</div>
                    <div style={{ color: 'var(--gray-300)' }}>Ср. цена/м²: {formatPrice(data.metadata.avg_price_per_sqm)} ₽</div>
                </div>
            )}
        </div>
    );
}
