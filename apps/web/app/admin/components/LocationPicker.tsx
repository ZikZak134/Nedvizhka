'use client';

import React, { useEffect, useRef, useState } from 'react';

declare global {
    interface Window {
        DG: any;
    }
}

interface LocationPickerProps {
    initialLat: number;
    initialLon: number;
    addressName?: string;
    onChange: (lat: number, lon: number) => void;
}

export default function LocationPicker({ initialLat, initialLon, addressName, onChange }: LocationPickerProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);
    const markerInstance = useRef<any>(null);
    const [status, setStatus] = useState('Нажмите на карту, чтобы выбрать точку');
    const [isScriptsLoaded, setIsScriptsLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 1. Load 2GIS Script
    useEffect(() => {
        if (window.DG) {
            setIsScriptsLoaded(true);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://maps.api.2gis.ru/2.0/loader.js?pkg=full';
        script.async = true;
        
        script.onload = () => {
            console.log('✅ 2GIS Script loaded successfully');
            setIsScriptsLoaded(true);
        };
        
        script.onerror = (e) => {
            console.error('❌ Failed to load 2GIS script:', e);
            setError('Не удалось загрузить скрипт карты (2GIS). Проверьте интернет-соединение или блокировщик рекламы.');
        };

        document.body.appendChild(script);

        return () => {
             // Cleanup if needed
        };
    }, []);

    // 2. Initialize Map
    useEffect(() => {
        if (!isScriptsLoaded || !mapContainer.current) return;
        if (mapInstance.current) return;

        try {
            const DG = window.DG;
            if (!DG) {
                throw new Error('DG object is missing despite script load');
            }

            // Fallback to Sochi center if coordinates are invalid
            const lat = (initialLat && !isNaN(initialLat)) ? initialLat : 43.5855;
            const lng = (initialLon && !isNaN(initialLon)) ? initialLon : 39.7231;

            console.log(`🗺️ Initializing 2GIS Map at [${lat}, ${lng}]...`);
            
            mapInstance.current = DG.map(mapContainer.current, {
                center: [lat, lng],
                zoom: 16,
                fullscreenControl: false,
                zoomControl: true,
                geoclicker: true
            });

            // Fix for map not rendering correctly in hidden containers/modals
            setTimeout(() => {
                if (mapInstance.current) {
                    mapInstance.current.invalidateSize();
                }
            }, 500);

            console.log('✅ Map initialized. Creating marker...');

            markerInstance.current = DG.marker([initialLat, initialLon], {
                draggable: true
            }).addTo(mapInstance.current);

            // Events
            markerInstance.current.on('dragend', (e: any) => {
                const lat = e.target.getLatLng().lat;
                const lng = e.target.getLatLng().lng;
                onChange(lat, lng);
                setStatus(`Выбрано: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
            });

            mapInstance.current.on('click', (e: any) => {
                markerInstance.current.setLatLng(e.latlng);
                onChange(e.latlng.lat, e.latlng.lng);
                setStatus(`Выбрано: ${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`);
            });

        } catch (err: any) {
            console.error('❌ Map Initialization Error:', err);
            setError(`Ошибка инициализации карты: ${err.message}`);
        }

        // Cleanup
        return () => {
            if (mapInstance.current) {
                try {
                    mapInstance.current.remove();
                } catch (e) {
                    console.warn('Error removing map:', e);
                }
                mapInstance.current = null;
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isScriptsLoaded]); // init only once when script loads

    // 3. React to Prop Changes (Manual Typing)
    useEffect(() => {
        if (!mapInstance.current || !markerInstance.current) return;
        
        const currentPos = markerInstance.current.getLatLng();
        // Only update if significantly different (avoid loops)
        if (Math.abs(currentPos.lat - initialLat) > 0.0001 || Math.abs(currentPos.lng - initialLon) > 0.0001) {
            const newLatLng = [initialLat, initialLon];
            markerInstance.current.setLatLng(newLatLng);
            mapInstance.current.panTo(newLatLng);
            setStatus(`Обновлено: ${initialLat.toFixed(6)}, ${initialLon.toFixed(6)}`);
        }
    }, [initialLat, initialLon]);

    if (error) {
        return (
            <div style={{ 
                border: '1px solid #ef4444', 
                borderRadius: '12px', 
                padding: '24px', 
                background: '#450a0a', 
                color: '#fca5a5',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🗺️⚠️</div>
                <strong>Ошибка карты</strong>
                <p style={{ marginTop: '8px', fontSize: '14px' }}>{error}</p>
            </div>
        );
    }

    return (
        <div style={{ 
            border: '1px solid rgba(255,255,255,0.1)', 
            borderRadius: '12px', 
            overflow: 'hidden',
            position: 'relative', // Context for absolute children
            zIndex: 1 // Ensure it sits above background but below modals
        }}>
            <div style={{ background: '#1e293b', padding: '12px', fontSize: '13px', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                📍 {status}
            </div>
            <div 
                ref={mapContainer} 
                style={{ height: '400px', width: '100%', display: 'block' }} // Added display block
            />
        </div>
    );
}
