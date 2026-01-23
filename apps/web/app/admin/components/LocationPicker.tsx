'use client';

import React, { useEffect, useRef, useState } from 'react';

interface LocationPickerProps {
    initialLat: number;
    initialLon: number;
    onChange: (lat: number, lon: number) => void;
}

export default function LocationPicker({ initialLat, initialLon, onChange }: LocationPickerProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);
    const markerInstance = useRef<any>(null);
    const [status, setStatus] = useState('Нажмите на карту, чтобы выбрать точку');
    const [isScriptsLoaded, setIsScriptsLoaded] = useState(false);

    // 1. Load 2GIS Script
    useEffect(() => {
        if (window.DG) {
            setIsScriptsLoaded(true);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://maps.api.2gis.ru/2.0/loader.js?pkg=full';
        script.async = true;
        script.onload = () => setIsScriptsLoaded(true);
        document.body.appendChild(script);

        return () => {
             // Cleanup if needed? Usually shared global script.
        };
    }, []);

    // 2. Initialize Map
    useEffect(() => {
        if (!isScriptsLoaded || !mapContainer.current) return;
        if (mapInstance.current) return;

        const DG = window.DG;

        mapInstance.current = DG.map(mapContainer.current, {
            center: [initialLat, initialLon],
            zoom: 16,
            fullscreenControl: false,
            zoomControl: true
        });

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

        // Cleanup
        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
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

    return (
        <div style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ background: '#1e293b', padding: '12px', fontSize: '13px', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                📍 {status}
            </div>
            <div ref={mapContainer} style={{ height: '400px', width: '100%' }} />
        </div>
    );
}
