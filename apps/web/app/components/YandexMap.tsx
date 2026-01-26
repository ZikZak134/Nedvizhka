'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { toArray } from '../utils/safeArray';
import { Property } from '../types';

interface YandexMapProps {
    properties: Property[];
    selectedPropertyId?: string | null;
    onPropertySelect?: (id: string) => void;
    className?: string;
    center?: [number, number];   // [lat, lng]
    zoom?: number;
}

declare global {
    interface Window {
        ymaps: any;
    }
}

const PRICE_COLOR_SCALE = [
    { threshold: 100_000_000, color: '#ef4444' }, // Red
    { threshold: 50_000_000, color: '#f97316' },  // Orange
    { threshold: 30_000_000, color: '#eab308' },  // Yellow
    { threshold: 15_000_000, color: '#22c55e' },  // Green
    { threshold: 0, color: '#3b82f6' }            // Blue
];

const getPriceColor = (price: number) => {
    return PRICE_COLOR_SCALE.find(s => price >= s.threshold)?.color || '#3b82f6';
};

const formatPriceShort = (price: number) => {
    if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(1)}M`;
    return `${(price / 1_000).toFixed(0)}K`;
};

export function YandexMap({
    properties,
    selectedPropertyId,
    onPropertySelect,
    className,
    center = [43.5855, 39.7231], // Sochi Center
    zoom = 13
}: YandexMapProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const objectManagerRef = useRef<any>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // 1. Load Yandex Script
    useEffect(() => {
        if (window.ymaps) {
            window.ymaps.ready(() => setIsLoaded(true));
            return;
        }

        const script = document.createElement('script');
        // Dev key or empty for non-comercial/testing
        const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_KEY || ''; 
        script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`;
        script.async = true;
        script.onload = () => {
             window.ymaps.ready(() => setIsLoaded(true));
        };
        document.body.appendChild(script);

        return () => {
            // Cleanup not strictly necessary for script but good habit
        };
    }, []);

    // 2. Initialize Map
    useEffect(() => {
        if (!isLoaded || !mapContainerRef.current || mapInstanceRef.current) return;

        const init = () => {
            const map = new window.ymaps.Map(mapContainerRef.current, {
                center: center,
                zoom: zoom,
                controls: ['zoomControl', 'fullscreenControl', 'typeSelector', 'geolocationControl', 'rulerControl']
            }, {
                // Блокируем карточки чужих организаций (музеи, такси и т.д.)
                suppressMapOpenBlock: true,
                // Отключаем интерактивность POI (точки интереса Яндекса)
                yandexMapDisablePoiInteractivity: true,
                // Не показывать устаревшее уведомление браузера
                suppressObsoleteBrowserNotifier: true
            });

            // Create ObjectManager
            const objectManager = new window.ymaps.ObjectManager({
                clusterize: true,
                gridSize: 64,
                clusterDisableClickZoom: false
            });

            // Customize Clusters
            objectManager.clusters.options.set('preset', 'islands#invertedNightClusterIcons');
            
            map.geoObjects.add(objectManager);

            // Handle Clicks
            objectManager.objects.events.add('click', (e: any) => {
                const objectId = e.get('objectId');
                // The objectId in OM is usually passed from our data features id
                if (onPropertySelect) {
                    onPropertySelect(String(objectId));
                }
            });

            mapInstanceRef.current = map;
            objectManagerRef.current = objectManager;
        };

        // Ensure container has height
        init();

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.destroy();
                mapInstanceRef.current = null;
            }
        };
    }, [isLoaded]);

    // 3. Sync Data
    useEffect(() => {
        if (!objectManagerRef.current || !properties) return;

        const collection = {
            type: 'FeatureCollection',
            features: properties.map(p => {
                const color = getPriceColor(p.price);
                const priceLabel = formatPriceShort(p.price);
                
                return {
                    type: 'Feature',
                    id: p.id,
                    geometry: {
                        type: 'Point',
                        coordinates: [p.latitude, p.longitude] // Yandex uses [lat, lng]
                    },
                    properties: {
                        balloonContentHeader: `<div style="font-weight:bold;">${p.title}</div>`,
                        balloonContentBody: `
                            <div>
                                <img src="${p.images?.[0] || ''}" style="width:100%; height:120px; object-fit:cover; border-radius:8px; margin-bottom:8px;">
                                <div>Price: <b>${p.price.toLocaleString('ru-RU')} ₽</b></div>
                                <div>Address: ${p.address}</div>
                            </div>
                        `,
                        clusterCaption: p.title,
                        hintContent: `${p.title} | ${priceLabel}`
                    },
                    options: {
                        preset: 'islands#circleIcon',
                        iconColor: color
                    }
                };
            })
        };

        objectManagerRef.current.removeAll();
        objectManagerRef.current.add(collection);

    }, [properties, isLoaded]);

    // 4. Handle Selection (FlyTo)
    useEffect(() => {
        if (!objectManagerRef.current || !mapInstanceRef.current || !selectedPropertyId) return;

        // Find object coordinates
        // For ObjectManager, we can't easily 'get' single object geometry if mapped by custom ID unless we indexed it, 
        // but OM uses the 'id' field we passed.
        
        // Wait for OM to populate? It syncs fast. 
        // Let's assume passed properties contain the selected one
        const selected = properties.find(p => p.id === selectedPropertyId);
        if (selected && selected.latitude && selected.longitude) {
            mapInstanceRef.current.setCenter([selected.latitude, selected.longitude], 16, {
                duration: 500,
                timingFunction: 'ease-out'
            }).then(() => {
                // Open balloon
                 objectManagerRef.current.objects.balloon.open(selectedPropertyId);
            });
        }
    }, [selectedPropertyId, properties]);

    return (
        <div 
            ref={mapContainerRef} 
            className={className} 
            style={{ width: '100%', height: '100%', minHeight: '400px', background: '#f1f5f9' }} 
        />
    );
}
