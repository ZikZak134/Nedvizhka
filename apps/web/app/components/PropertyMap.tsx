'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

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
    if (price >= 100_000_000) return 8; // Smaller for MapLibre circle-radius (pixels)
    if (price >= 50_000_000) return 7;
    if (price >= 30_000_000) return 6;
    return 5;
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

    // Initialize MapLibre map
    useEffect(() => {
        if (!mounted || loading || !mapRef.current) return;

        const initMap = async () => {
            // Clean up any existing map
            if (mapInstanceRef.current) {
                if(mapInstanceRef.current.remove) mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
             if (mapRef.current) mapRef.current.innerHTML = '';

            const map = new maplibregl.Map({
                container: mapRef.current,
                style: {
                    version: 8,
                    sources: {
                        'osm': {
                            type: 'raster',
                            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                            tileSize: 256,
                            attribution: '&copy; OpenStreetMap Contributors'
                        }
                    },
                    layers: [{
                        id: 'simple-tiles',
                        type: 'raster',
                        source: 'osm',
                        minzoom: 0,
                        maxzoom: 22
                    }]
                },
                center: [39.720, 43.585],
                zoom: 13,
                attributionControl: true
            });
            mapInstanceRef.current = map;

            map.on('load', () => {
                if (data?.features) {
                     // Add source
                    map.addSource('properties', {
                        type: 'geojson',
                        data: data as any
                    });

                    // Add circle layer
                    map.addLayer({
                        id: 'property-circles',
                        type: 'circle',
                        source: 'properties',
                        paint: {
                            'circle-radius': [
                                'interpolate', ['linear'], ['get', 'price'],
                                15000000, 5,
                                100000000, 10
                            ],
                            'circle-color': [
                                'step', ['get', 'price'],
                                '#3b82f6', 15000000,
                                '#22c55e', 30000000,
                                '#eab308', 50000000,
                                '#f97316', 100000000,
                                '#ef4444'
                            ],
                            'circle-stroke-width': 1,
                            'circle-stroke-color': '#fff',
                            'circle-opacity': 0.8
                        }
                    });

                    // Popups
                    map.on('click', 'property-circles', (e) => {
                        const coordinates = (e.features![0].geometry as any).coordinates.slice();
                        const props = e.features![0].properties;

                        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                        }

                        new maplibregl.Popup()
                            .setLngLat(coordinates)
                            .setHTML(`
                                <div style="min-width: 200px; color: #000;">
                                    <h4 style="margin: 0 0 8px; font-size: 14px; font-weight: 700; color: #0f172a;">${props.title}</h4>
                                    <p style="margin: 0 0 4px; font-size: 12px; color: #64748b;">📍 ${props.address}</p>
                                    <div style="font-weight: 700; margin-top: 4px;">${formatPrice(props.price)} ₽</div>
                                    <a href="/properties/${props.id}" style="display: block; margin-top: 8px; padding: 6px; background: #3b82f6; color: #fff; border-radius: 4px; text-decoration: none; text-align: center; font-size: 12px;">Подробнее</a>
                                </div>
                            `)
                            .addTo(map);
                        
                        if (onPropertyClick) {
                            onPropertyClick(props.id);
                        }
                    });
                     // Change cursor on hover
                    map.on('mouseenter', 'property-circles', () => {
                        map.getCanvas().style.cursor = 'pointer';
                    });
                    map.on('mouseleave', 'property-circles', () => {
                        map.getCanvas().style.cursor = '';
                    });
                }
            });
        };

        initMap();

        return () => {
            if (mapInstanceRef.current) {
                if(mapInstanceRef.current.remove) mapInstanceRef.current.remove();
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
                background: 'rgba(255, 255, 255, 0.9)',
                padding: '12px',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                zIndex: 10,
                fontSize: '12px',
                color: '#333'
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
                        }} />
                        <span>{item.label} ₽</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
