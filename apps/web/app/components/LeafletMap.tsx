'use client';

import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';

interface Property {
    id: string;
    title: string;
    price: number;
    price_per_sqm: number;
    area_sqm: number;
    rooms: string | null;
    address: string;
}

interface GeoJSONFeature {
    geometry: { coordinates: [number, number] };
    properties: Property;
}

interface GeoJSONData {
    features: GeoJSONFeature[];
    metadata: { total: number; avg_price: number; avg_price_per_sqm: number };
}

interface LeafletMapProps {
    height?: string;
    onPropertyClick?: (id: string) => void;
}

const getPriceColor = (price: number): string => {
    if (price >= 100_000_000) return '#ef4444';
    if (price >= 50_000_000) return '#f97316';
    if (price >= 30_000_000) return '#eab308';
    if (price >= 15_000_000) return '#22c55e';
    return '#3b82f6';
};

const formatPrice = (price: number): string => {
    if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(1)}M ₽`;
    return `${(price / 1_000).toFixed(0)}K ₽`;
};

export function LeafletMap({ height = '100%', onPropertyClick }: LeafletMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const tileLayerRef = useRef<any>(null);
    const [data, setData] = useState<GeoJSONData | null>(null);
    const [loading, setLoading] = useState(true);
    const [mapId] = useState(() => `leaflet-map-${Date.now()}`);
    const [mapStyle, setMapStyle] = useState<'scheme' | 'satellite'>('scheme');

    // Tile URLs
    const TILES = {
        scheme: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        satellite: 'https://server.arcgisonoline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    };

    // Fetch data
    useEffect(() => {
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
    }, []);

    // Init map
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const initMap = async () => {
            const L = (await import('leaflet')).default;

            // Ensure container exists and is not already initialized
            if (!mapRef.current) return;

            // Clean up any existing map on this container
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }

            // Create map
            const map = L.map(mapRef.current, {
                center: [43.585, 39.720],
                zoom: 12,
                zoomControl: true,
            });

            // Add tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            mapInstanceRef.current = map;

            // Add markers if data available
            if (data?.features) {
                data.features.forEach(feature => {
                    const [lng, lat] = feature.geometry.coordinates;
                    const props = feature.properties;
                    const color = getPriceColor(props.price);

                    const marker = L.circleMarker([lat, lng], {
                        radius: 10,
                        fillColor: color,
                        color: '#fff',
                        weight: 2,
                        opacity: 1,
                        fillOpacity: 0.8,
                    }).addTo(map);

                    marker.bindPopup(`
            <div style="min-width: 200px; font-family: system-ui;">
              <h4 style="margin: 0 0 8px; font-size: 14px; font-weight: 600;">
                ${props.title}
              </h4>
              <p style="margin: 0 0 8px; font-size: 12px; color: #666;">
                📍 ${props.address}
              </p>
              <div style="font-size: 18px; font-weight: 700; color: ${color}; margin-bottom: 8px;">
                ${formatPrice(props.price)}
              </div>
              <div style="display: flex; gap: 6px; margin-bottom: 10px;">
                <span style="background: #e5e7eb; padding: 2px 8px; border-radius: 4px; font-size: 11px;">
                  ${props.area_sqm} м²
                </span>
                ${props.rooms ? `
                  <span style="background: #e5e7eb; padding: 2px 8px; border-radius: 4px; font-size: 11px;">
                    ${props.rooms} комн.
                  </span>
                ` : ''}
              </div>
              <a href="/properties/${props.id}" style="
                display: block;
                padding: 8px 12px;
                background: #3b82f6;
                color: white;
                border-radius: 6px;
                text-align: center;
                font-size: 12px;
                text-decoration: none;
              ">
                Подробнее →
              </a>
            </div>
          `);
                });
            }
        };

        initMap();

        // Cleanup on unmount
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [data]);

    if (loading) {
        return (
            <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a2e' }}>
                <div style={{ color: '#fff', textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌍</div>
                    <span>Загрузка OSM карты...</span>
                </div>
            </div>
        );
    }

    return (
        <div style={{ height, position: 'relative' }} className="safe-area-bottom">
            <div
                ref={mapRef}
                id={mapId}
                style={{ height: '100%', width: '100%' }}
            />

            {/* Stats overlay - адаптивный для мобильных */}
            {data?.metadata && (
                <div
                    className="leaflet-stats-overlay"
                    style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        background: 'rgba(0,0,0,0.85)',
                        backdropFilter: 'blur(12px)',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px',
                        zIndex: 500,
                        maxWidth: 'calc(100% - 24px)',
                    }}>
                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>📊 {data.metadata.total} объектов</div>
                    <div style={{ opacity: 0.7, fontSize: '11px' }}>Ср. цена: {formatPrice(data.metadata.avg_price)}</div>
                </div>
            )}

            {/* Legend - скрываем на очень маленьких экранах */}
            <div
                className="leaflet-legend sm:block"
                style={{
                    position: 'absolute',
                    bottom: '70px',
                    right: '12px',
                    background: 'rgba(0,0,0,0.85)',
                    backdropFilter: 'blur(12px)',
                    padding: '10px 12px',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '10px',
                    zIndex: 500,
                }}>
                <div style={{ fontWeight: 600, marginBottom: '6px', fontSize: '11px' }}>Цена объекта</div>
                {[
                    { color: '#3b82f6', label: '< 15M' },
                    { color: '#22c55e', label: '15-30M' },
                    { color: '#eab308', label: '30-50M' },
                    { color: '#f97316', label: '50-100M' },
                    { color: '#ef4444', label: '100M+' },
                ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                        <span style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: item.color,
                            border: '2px solid rgba(255,255,255,0.3)',
                            flexShrink: 0,
                        }} />
                        <span>{item.label} ₽</span>
                    </div>
                ))}
            </div>

            {/* Branding - компактный для мобильных */}
            <div
                className="leaflet-branding"
                style={{
                    position: 'absolute',
                    bottom: '16px',
                    left: '12px',
                    background: 'rgba(0,0,0,0.85)',
                    backdropFilter: 'blur(12px)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '10px',
                    zIndex: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                }}>
                <span style={{ fontSize: '14px' }}>🏖️</span>
                <span style={{ fontWeight: 600 }}>EstateAnalytics</span>
                <span style={{ opacity: 0.6 }} className="sm:inline hidden">• OSM</span>
            </div>
        </div>
    );
}
