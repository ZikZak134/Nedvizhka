'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { toArray } from '../utils/safeArray';

// Types
import { Property } from '../types';

interface GeoJSONFeature {
    type: 'Feature';
    geometry: {
        type: 'Point';
        coordinates: [number, number];
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

interface TwoGisMapProps {
    height?: string;
    onPropertyClick?: (id: string) => void;
    showFilters?: boolean;
}

// Price color scale
const getPriceColor = (price: number): string => {
    if (price >= 100_000_000) return '#ef4444';
    if (price >= 50_000_000) return '#f97316';
    if (price >= 30_000_000) return '#eab308';
    if (price >= 15_000_000) return '#22c55e';
    return '#3b82f6';
};

const formatPrice = (price?: number | null): string => {
    if (price === null || price === undefined) return '— ₽';
    if (price >= 1_000_000) {
        return `${(price / 1_000_000).toFixed(1)}M ₽`;
    }
    return `${(price / 1_000).toFixed(0)}K ₽`;
};

declare global {
    interface Window {
        DG: any;
    }
}

export function TwoGisMap({ height = '100%', onPropertyClick, showFilters = true }: TwoGisMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);

    const [data, setData] = useState<GeoJSONData | null>(null);
    const [loading, setLoading] = useState(true);
    const [mapReady, setMapReady] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState<GeoJSONFeature | null>(null);
    const [priceFilter, setPriceFilter] = useState<'all' | 'low' | 'mid' | 'high' | 'premium'>('all');
    const [mapStyle, setMapStyle] = useState<'scheme' | 'satellite'>('scheme');

    const apiKey = process.env.NEXT_PUBLIC_2GIS_KEY || '';

    // Load 2GIS script
    useEffect(() => {
        if (typeof window !== 'undefined' && !window.DG) {
            const script = document.createElement('script');
            script.src = 'https://maps.api.2gis.ru/2.0/loader.js?pkg=full';
            script.async = true;
            script.onload = () => {
                window.DG.then(() => {
                    setMapReady(true);
                });
            };
            document.head.appendChild(script);
        } else if (window.DG) {
            window.DG.then(() => {
                setMapReady(true);
            });
        }
    }, []);

    // Initialize map
    useEffect(() => {
        if (!mapReady || !mapRef.current || mapInstanceRef.current) return;

        window.DG.then(() => {
            mapInstanceRef.current = window.DG.map(mapRef.current, {
                center: [43.5853, 39.7203],
                zoom: 14,
                fullscreenControl: true,
                zoomControl: true,
            });
            mapInstanceRef.current.setMaxBounds([[43.0, 36.0], [47.5, 42.0]]); // Krasnodar Krai bounds [[LatMin, LngMin], [LatMax, LngMax]]
        });

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [mapReady]);

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

    // Filter properties
    const filteredFeatures = useMemo(() => {
        // Используем toArray для гарантированного получения массива
        const features = toArray<GeoJSONFeature>(data?.features);
        if (features.length === 0) return [];

        return features.filter(f => {
            const price = f.properties.price;
            switch (priceFilter) {
                case 'low': return price < 15_000_000;
                case 'mid': return price >= 15_000_000 && price < 30_000_000;
                case 'high': return price >= 30_000_000 && price < 50_000_000;
                case 'premium': return price >= 50_000_000;
                default: return true;
            }
        });
    }, [data, priceFilter]);

    // Add markers
    useEffect(() => {
        if (!mapInstanceRef.current || !filteredFeatures.length) return;

        // Clear existing markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        window.DG.then(() => {
            filteredFeatures.forEach(feature => {
                const [lng, lat] = feature.geometry.coordinates;
                const props = feature.properties;
                const color = getPriceColor(props.price);

                // Custom marker icon
                const icon = window.DG.divIcon({
                    className: 'custom-marker',
                    html: `
            <div style="
              width: 32px;
              height: 32px;
              background: ${color};
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 8px rgba(0,0,0,0.4);
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              font-weight: bold;
              color: white;
            "></div>
          `,
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                });

                const marker = window.DG.marker([lat, lng], { icon })
                    .addTo(mapInstanceRef.current)
                    .bindPopup(`
            <div style="min-width: 220px; font-family: system-ui, sans-serif;">
              <h4 style="margin: 0 0 8px; font-size: 14px; font-weight: 600;">
                ${props.title}
              </h4>
              <p style="margin: 0 0 8px; font-size: 12px; color: #666;">
                📍 ${props.address}
              </p>
              <div style="display: flex; gap: 12px; margin-bottom: 8px;">
                <div>
                  <div style="font-size: 18px; font-weight: 700; color: ${color};">
                    ${formatPrice(props.price)}
                  </div>
                  <div style="font-size: 10px; color: #999;">Цена</div>
                </div>
                <div>
                  <div style="font-size: 14px; font-weight: 600;">
                    ${formatPrice(props.price_per_sqm)}/м²
                  </div>
                  <div style="font-size: 10px; color: #999;">За м²</div>
                </div>
              </div>
              <div style="display: flex; gap: 6px; margin-bottom: 10px; flex-wrap: wrap;">
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
                background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                color: white;
                border-radius: 6px;
                text-align: center;
                font-size: 12px;
                font-weight: 500;
                text-decoration: none;
              ">
                Подробнее →
              </a>
            </div>
          `);

                marker.on('click', () => {
                    setSelectedProperty(feature);
                });

                markersRef.current.push(marker);
            });
        });
    }, [filteredFeatures]);

    if (loading && !mapReady) {
        return (
            <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a2e' }}>
                <div style={{ color: '#fff', textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
                    <span>Загрузка карты 2GIS...</span>
                </div>
            </div>
        );
    }

    return (
        <div style={{ height, position: 'relative' }}>
            {/* Map container */}
            <div ref={mapRef} style={{ height: '100%', width: '100%' }} />

            {/* Price filter */}
            {showFilters && (
                <div style={{
                    position: 'absolute',
                    top: '16px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0,0,0,0.85)',
                    backdropFilter: 'blur(12px)',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    display: 'flex',
                    gap: '6px',
                    zIndex: 500,
                }}>
                    {[
                        { key: 'all', label: 'Все' },
                        { key: 'low', label: '< 15M', color: '#3b82f6' },
                        { key: 'mid', label: '15-30M', color: '#22c55e' },
                        { key: 'high', label: '30-50M', color: '#eab308' },
                        { key: 'premium', label: '50M+', color: '#ef4444' },
                    ].map(item => (
                        <button
                            key={item.key}
                            onClick={() => setPriceFilter(item.key as any)}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '8px',
                                border: 'none',
                                fontSize: '12px',
                                fontWeight: 500,
                                cursor: 'pointer',
                                background: priceFilter === item.key
                                    ? (item.color || 'linear-gradient(135deg, #3b82f6, #8b5cf6)')
                                    : 'rgba(255,255,255,0.1)',
                                color: '#fff',
                                transition: 'all 0.2s',
                            }}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Stats overlay */}
            {data?.metadata && (
                <div style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    background: 'rgba(0,0,0,0.85)',
                    backdropFilter: 'blur(12px)',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '13px',
                    zIndex: 500,
                }}>
                    <div style={{ fontWeight: 600, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '20px' }}>📊</span>
                        {filteredFeatures.length} объектов
                    </div>
                    <div style={{ opacity: 0.7, marginBottom: '2px' }}>
                        Ср. цена: {formatPrice(data.metadata.avg_price)}
                    </div>
                    <div style={{ opacity: 0.7 }}>
                        Ср. цена/м²: {formatPrice(data.metadata.avg_price_per_sqm)}
                    </div>
                </div>
            )}

            {/* Legend */}
            <div style={{
                position: 'absolute',
                bottom: '24px',
                right: '16px',
                background: 'rgba(0,0,0,0.85)',
                backdropFilter: 'blur(12px)',
                padding: '12px 14px',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '11px',
                zIndex: 500,
            }}>
                <div style={{ fontWeight: 600, marginBottom: '8px' }}>Цена объекта</div>
                {[
                    { color: '#3b82f6', label: '< 15M' },
                    { color: '#22c55e', label: '15-30M' },
                    { color: '#eab308', label: '30-50M' },
                    { color: '#f97316', label: '50-100M' },
                    { color: '#ef4444', label: '100M+' },
                ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: item.color,
                            border: '2px solid rgba(255,255,255,0.3)',
                        }} />
                        <span>{item.label} ₽</span>
                    </div>
                ))}
            </div>

            {/* Branding */}
            <div style={{
                position: 'absolute',
                bottom: '24px',
                left: '16px',
                background: 'rgba(0,0,0,0.85)',
                backdropFilter: 'blur(12px)',
                padding: '8px 14px',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '11px',
                zIndex: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
            }}>
                <span style={{ fontSize: '16px' }}>🏖️</span>
                <span style={{ fontWeight: 600 }}>EstateAnalytics</span>
                <span style={{ opacity: 0.6 }}>• Сочи</span>
            </div>
        </div>
    );
}
