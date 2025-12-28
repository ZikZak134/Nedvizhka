'use client';
import { useState } from 'react';

/**
 * PropertyLocation — Вкладка «Локация» в боковой панели объекта
 * Показывает транспортную доступность, время до ключевых точек и ближайшие достопримечательности
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
            {/* ... Existing Address ... */}
            <div style={{
                background: 'rgba(212, 175, 55, 0.1)',
                padding: '14px',
                borderRadius: '12px',
                marginBottom: '16px',
                border: '1px solid rgba(212, 175, 55, 0.2)'
            }}>
                <div style={{ color: '#d4af37', fontSize: '13px', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    📍 Адрес
                </div>
                <div style={{ color: '#e2e8f0', fontSize: '14px' }}>
                    {address || 'Сочи, Центральный район, ул. Приморская 24'}
                </div>
            </div>

            {/* Экспресс-маршруты */}
            <div style={{ marginBottom: '20px' }}>
                <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>
                    🚀 Экспресс-маршруты
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
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
                                background: activeRoute === route.id ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.05)',
                                border: activeRoute === route.id ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.05)',
                                padding: '10px',
                                borderRadius: '10px',
                                color: '#fff',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.2s'
                            }}
                        >
                            <span style={{ fontSize: '18px' }}>{route.icon}</span>
                            <span style={{ fontSize: '13px' }}>{route.label}</span>
                        </button>
                    ))}
                </div>
                {activeRoute && (
                    <div className="fade-in" style={{
                        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                        padding: '12px',
                        borderRadius: '10px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                    }}>
                        <div style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>Время в пути:</div>
                        <div style={{ color: '#fff', fontSize: '16px', fontWeight: 800 }}>{routeTime}</div>
                    </div>
                )}
            </div>

            {/* Транспорт */}
            <div style={{ marginBottom: '20px' }}>
                <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px' }}>🚗</span> Транспортная доступность
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {transportPoints.map((point, idx) => (
                        <LocationRow key={idx} point={point} />
                    ))}
                </div>
            </div>

            {/* Достопримечательности */}
            <div style={{ marginBottom: '20px' }}>
                <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px' }}>⭐</span> Рядом
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

            {/* Мини-карта области (placeholder) */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
                borderRadius: '12px',
                height: '120px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                color: '#94a3b8',
                fontSize: '13px',
                gap: '8px'
            }}>
                <span style={{ fontSize: '24px' }}>🗺️</span>
                Мини-карта окрестностей
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
            padding: '10px 12px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.05)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '18px' }}>{point.icon}</span>
                <span style={{ color: '#e2e8f0', fontSize: '13px' }}>{point.name}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: '#94a3b8', fontSize: '12px' }}>{point.distance}</span>
                <span style={{
                    background: 'rgba(34, 197, 94, 0.15)',
                    color: '#22c55e',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600
                }}>
                    {point.time}
                </span>
            </div>
        </div>
    );
}
