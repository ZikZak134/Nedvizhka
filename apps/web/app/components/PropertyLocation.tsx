'use client';
import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getMockLocation } from '../utils/mockLocations';

// Dynamic imports for Leaflet
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });

// Fix default icon
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

/**
 * PropertyLocation — Вкладка «Локация» в боковой панели объекта
 * Показывает транспортную доступность, время до ключевых точек и ближайшие достопримечательности
 * Адаптировано для светлой темы luxury-дизайна
 */

interface LocationPoint {
    name: string;
    icon: string;
    distance: string;
    time: string;
    type: 'transport' | 'attraction' | 'essential';
}

interface PropertyLocationProps {
    propertyId: string;
    address?: string;
}

// Mock-данные для различных объектов
const MOCK_LOCATIONS: Record<string, LocationPoint[]> = {
    default: [
        { name: 'Морской вокзал', icon: '🚢', distance: '2.1 км', time: '8 мин', type: 'transport' },
        { name: 'Аэропорт Адлер', icon: '✈️', distance: '28 км', time: '35 мин', type: 'transport' },
        { name: 'Жд вокзал Сочи', icon: '🚂', distance: '1.8 км', time: '6 мин', type: 'transport' },
        { name: 'Пляж «Ривьера»', icon: '🏖️', distance: '450 м', time: '5 мин', type: 'attraction' },
        { name: 'Дендрарий', icon: '🌲', distance: '1.2 км', time: '15 мин', type: 'attraction' },
        { name: 'Центр города', icon: '🏛️', distance: '800 м', time: '10 мин', type: 'essential' },
    ]
};

export function PropertyLocation({ propertyId, address }: PropertyLocationProps) {
    const locations = MOCK_LOCATIONS.default;

    // Resolve location (mock or prop)
    const location = useMemo(() => {
        const idNum = parseInt(propertyId.replace(/\D/g, '') || '0', 10);
        return getMockLocation(idNum);
    }, [propertyId]);

    const transportPoints = locations.filter(l => l.type === 'transport');
    const attractionPoints = locations.filter(l => l.type === 'attraction');
    const essentialPoints = locations.filter(l => l.type === 'essential');

    const [routeTime, setRouteTime] = useState<string | null>(null);
    const [activeRoute, setActiveRoute] = useState<string | null>(null);

    const calculateRoute = (type: string) => {
        setRouteTime('Считаем...');
        setActiveRoute(type);
        setTimeout(() => {
            const times: Record<string, string> = {
                'sea': '12 мин пешком',
                'airport': '35 мин на авто',
                'work': '20 мин на авто',
                'center': '15 мин на такси'
            };
            setRouteTime(times[type] || '10 мин');
        }, 800);
    };

    return (
        <div className="property-location fade-in">
            {/* Адрес */}
            <div style={{
                background: 'rgba(184, 134, 11, 0.08)',
                padding: '16px 20px',
                borderRadius: '8px',
                marginBottom: '24px',
                border: '1px solid rgba(184, 134, 11, 0.15)'
            }}>
                <div style={{ color: '#b8860b', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>
                    📍 Адрес
                </div>
                <div style={{ color: '#1a1a1a', fontSize: '15px', fontWeight: 500 }}>
                    {address || 'Сочи, Центральный район, ул. Приморская 24'}
                </div>
            </div>

            {/* Экспресс-маршруты */}
            <div style={{ marginBottom: '28px' }}>
                <h4 style={{ color: '#1a1a1a', fontSize: '13px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '16px' }}>
                    🚀 Экспресс-маршруты
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                    {[
                        { id: 'sea', label: 'До моря', icon: '🌊' },
                        { id: 'airport', label: 'Аэропорт', icon: '✈️' },
                        { id: 'center', label: 'Центр', icon: '🏛️' },
                        { id: 'work', label: 'Офис', icon: '💼' },
                    ].map(route => (
                        <button
                            key={route.id}
                            onClick={() => calculateRoute(route.id)}
                            style={{
                                background: activeRoute === route.id ? 'rgba(26, 26, 26, 0.08)' : '#ffffff',
                                border: activeRoute === route.id ? '1px solid #1a1a1a' : '1px solid rgba(0,0,0,0.1)',
                                padding: '12px',
                                borderRadius: '8px',
                                color: '#1a1a1a',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                transition: 'all 0.2s',
                                fontWeight: activeRoute === route.id ? 600 : 400
                            }}
                        >
                            <span style={{ fontSize: '18px' }}>{route.icon}</span>
                            <span style={{ fontSize: '13px' }}>{route.label}</span>
                        </button>
                    ))}
                </div>
                {activeRoute && (
                    <div className="fade-in" style={{
                        background: '#1a1a1a',
                        padding: '14px 18px',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}>Время в пути:</div>
                        <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: 600 }}>{routeTime}</div>
                    </div>
                )}
            </div>

            {/* Транспорт */}
            <div style={{ marginBottom: '28px' }}>
                <h4 style={{ color: '#1a1a1a', fontSize: '13px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '16px' }}>
                    🚗 Транспортная доступность
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {transportPoints.map((point, idx) => (
                        <LocationRow key={idx} point={point} />
                    ))}
                </div>
            </div>

            {/* Достопримечательности */}
            <div style={{ marginBottom: '24px' }}>
                <h4 style={{ color: '#1a1a1a', fontSize: '13px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '16px' }}>
                    ⭐ Рядом
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {attractionPoints.map((point, idx) => (
                        <LocationRow key={idx} point={point} />
                    ))}
                    {essentialPoints.map((point, idx) => (
                        <LocationRow key={idx} point={point} />
                    ))}
                </div>
            </div>

            {/* Мини-карта области */}
            <div style={{
                height: '180px',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid rgba(0,0,0,0.1)',
                position: 'relative'
            }}>
                <MapContainer
                    center={[location.lat, location.lng]}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                    attributionControl={false}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[location.lat, location.lng]} icon={DefaultIcon} />
                </MapContainer>

                {/* Overlay to prevent accidental scroll interaction if needed, or just style */}
                <div style={{
                    position: 'absolute', bottom: '10px', right: '10px',
                    background: 'rgba(255,255,255,0.9)', padding: '4px 8px',
                    borderRadius: '4px', fontSize: '10px', fontWeight: 600,
                    zIndex: 400
                }}>
                    📍 {location.district}
                </div>
            </div>
        </div>
    );
}

function LocationRow({ point }: { point: LocationPoint }) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            background: '#ffffff',
            borderRadius: '8px',
            border: '1px solid rgba(0,0,0,0.08)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '18px' }}>{point.icon}</span>
                <span style={{ color: '#1a1a1a', fontSize: '14px' }}>{point.name}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: '#666666', fontSize: '13px' }}>{point.distance}</span>
                <span style={{
                    background: 'rgba(22, 163, 74, 0.1)',
                    color: '#16a34a',
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600
                }}>
                    {point.time}
                </span>
            </div>
        </div>
    );
}
