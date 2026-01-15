'use client';

import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface LocationPickerProps {
    initialLat: number;
    initialLon: number;
    onChange: (lat: number, lon: number) => void;
}

export default function LocationPicker({ initialLat, initialLon, onChange }: LocationPickerProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const marker = useRef<maplibregl.Marker | null>(null);
    const [status, setStatus] = useState('Нажмите на карту, чтобы выбрать точку');

    useEffect(() => {
        if (map.current) return;

        // Initialize Map
        map.current = new maplibregl.Map({
            container: mapContainer.current!,
            style: 'https://tiles.openfreemap.org/styles/liberty', // Free styling
            center: [initialLon, initialLat],
            zoom: 13
        });

        // Initialize Marker
        marker.current = new maplibregl.Marker({ color: '#d4af37', draggable: true })
            .setLngLat([initialLon, initialLat])
            .addTo(map.current);

        // Update on Drag
        marker.current.on('dragend', () => {
            const lngLat = marker.current!.getLngLat();
            onChange(lngLat.lat, lngLat.lng);
            setStatus(`Выбрано: ${lngLat.lat.toFixed(6)}, ${lngLat.lng.toFixed(6)}`);
        });

        // Update on Map Click
        map.current.on('click', (e) => {
            marker.current!.setLngLat(e.lngLat);
            onChange(e.lngLat.lat, e.lngLat.lng);
            setStatus(`Выбрано: ${e.lngLat.lat.toFixed(6)}, ${e.lngLat.lng.toFixed(6)}`);
        });

    }, [initialLat, initialLon, onChange]);

    return (
        <div style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ background: '#1e293b', padding: '12px', fontSize: '13px', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                📍 {status}
            </div>
            <div ref={mapContainer} style={{ height: '400px', width: '100%' }} />
        </div>
    );
}
