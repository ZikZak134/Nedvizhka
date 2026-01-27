'use client';

import React, { useEffect, useRef, useState } from 'react';

declare global {
    interface Window {
        ymaps: any;
    }
}

interface LocationPickerProps {
    initialLat: number;
    initialLon: number;
    addressName?: string;
    onChange: (lat: number, lon: number, address?: string) => void;
}

export default function LocationPicker({ initialLat, initialLon, addressName, onChange }: LocationPickerProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);
    const placemarkRef = useRef<any>(null);
    
    const [status, setStatus] = useState('Загрузка карты (Yandex)...');
    const [isScriptsLoaded, setIsScriptsLoaded] = useState(false);
    const [loadingAddress, setLoadingAddress] = useState(false);

    // 1. Load Yandex Script
    useEffect(() => {
        if (window.ymaps) {
            window.ymaps.ready(() => setIsScriptsLoaded(true));
            return;
        }

        const script = document.createElement('script');
        // Dev mode without key works, but for prod use env
        const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_KEY || '';
        script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`;
        script.async = true;
        
        script.onload = () => {
             window.ymaps.ready(() => setIsScriptsLoaded(true));
        };
        
        script.onerror = () => {
            setStatus('Ошибка загрузки Яндекс Карт');
        };

        document.body.appendChild(script);
    }, []);

    // 2. Initialize Map
    useEffect(() => {
        if (!isScriptsLoaded || !mapContainer.current || mapInstance.current) return;

        const startLat = (initialLat && !isNaN(initialLat) && initialLat !== 0) ? initialLat : 43.5855;
        const startLng = (initialLon && !isNaN(initialLon) && initialLon !== 0) ? initialLon : 39.7231;

        console.log(`🗺️ Yandex Map Init at [${startLat}, ${startLng}]`);

        const map = new window.ymaps.Map(mapContainer.current, {
            center: [startLat, startLng],
            zoom: 16,
            controls: [], // Clean map without extra controls
            suppressMapOpenBlock: true // Remove 'Open in Yandex Maps', Taxi, Routes links
        });

        // Draggable Placemark
        const placemark = new window.ymaps.Placemark([startLat, startLng], {
            hintContent: 'Перетащите метку',
            balloonContent: addressName || 'Выбранная точка'
        }, {
            draggable: true,
            preset: 'islands#blueDotIcon'
        });

        placeMarkEvents(placemark);

        map.geoObjects.add(placemark);
        mapInstance.current = map;
        placemarkRef.current = placemark;

        setStatus(addressName ? `📍 ${addressName}` : 'Перетащите метку для выбора адреса');

        // Click on map to move marker
        map.events.add('click', (e: any) => {
            const coords = e.get('coords');
            placemark.geometry.setCoordinates(coords);
            handleDragEnd(coords);
        });

    }, [isScriptsLoaded]);

    const placeMarkEvents = (placemark: any) => {
        placemark.events.add('dragend', () => {
            const coords = placemark.geometry.getCoordinates();
            handleDragEnd(coords);
        });
    };

    const handleDragEnd = (coords: number[]) => {
        const [lat, lon] = coords;
        setStatus(`Координаты: ${lat.toFixed(6)}, ${lon.toFixed(6)}`);
        
        // Reverse Geocoding
        setLoadingAddress(true);
        window.ymaps.geocode(coords).then((res: any) => {
            const firstGeoObject = res.geoObjects.get(0);
            const address = firstGeoObject ? firstGeoObject.getAddressLine() : 'Адрес не найден';
            
            setStatus(`📍 ${address}`);
            onChange(lat, lon, address); // Pass address back to form!
            
            if (firstGeoObject && placemarkRef.current) {
                placemarkRef.current.properties.set({
                    balloonContent: address
                });
            }
        }).catch((err: any) => {
            console.error('Geo error', err);
            onChange(lat, lon); // Pass at least coords
            setStatus(`Координаты: ${lat.toFixed(6)}, ${lon.toFixed(6)} (Ошибка адреса)`);
        }).finally(() => {
            setLoadingAddress(false);
        });
    };

    // Sync external props (if changed manually)
    useEffect(() => {
        if (mapInstance.current && placemarkRef.current) {
            const current = placemarkRef.current.geometry.getCoordinates();
            if (Math.abs(current[0] - initialLat) > 0.0001 || Math.abs(current[1] - initialLon) > 0.0001) {
                // Only act if valid
                 if (initialLat && initialLon) {
                    const newCoords = [initialLat, initialLon];
                    placemarkRef.current.geometry.setCoordinates(newCoords);
                    mapInstance.current.setCenter(newCoords);
                 }
            }
        }
    }, [initialLat, initialLon]);

    return (
         <div style={{ 
            border: '1px solid rgba(255,255,255,0.1)', 
            borderRadius: '12px', 
            overflow: 'hidden',
            position: 'relative', 
            zIndex: 1 
        }}>
            <div style={{ background: '#1e293b', padding: '12px', fontSize: '13px', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between' }}>
                <span className="truncate pr-4">{status}</span>
                {loadingAddress && <span className="animate-pulse text-yellow-500">Поиск...</span>}
            </div>
            <div 
                ref={mapContainer} 
                style={{ height: '400px', width: '100%', display: 'block' }} 
            />
        </div>
    );
}
