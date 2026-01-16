'use client';

import { useState, useEffect } from 'react';
import LocationPicker from '../components/LocationPicker';

interface District {
    id?: number;
    name: string;
    center_lat: number;
    center_lng: number;
    avg_price_sqm: number | null;
    growth_5y: number | null;
    growth_10y: number | null;
    objects_count: number;
    roi: number | null;
    risk_level: string;
    description: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Дефолтные данные (из PremiumMap.tsx)
const DEFAULT_DISTRICTS: District[] = [
    { name: "Красная Поляна", center_lat: 43.6831, center_lng: 40.2048, avg_price_sqm: 520000, growth_5y: 110, growth_10y: 180, objects_count: 45, roi: 14, risk_level: 'low', description: null },
    { name: "Центральный", center_lat: 43.5855, center_lng: 39.7231, avg_price_sqm: 450000, growth_5y: 87, growth_10y: 145, objects_count: 120, roi: 11, risk_level: 'low', description: null },
    { name: "Адлер", center_lat: 43.4281, center_lng: 39.9226, avg_price_sqm: 380000, growth_5y: 65, growth_10y: 120, objects_count: 95, roi: 9, risk_level: 'medium', description: null },
    { name: "Хоста", center_lat: 43.5147, center_lng: 39.8631, avg_price_sqm: 320000, growth_5y: 45, growth_10y: 95, objects_count: 35, roi: 7, risk_level: 'medium', description: null },
    { name: "Сириус", center_lat: 43.40, center_lng: 39.97, avg_price_sqm: 650000, growth_5y: 150, growth_10y: 200, objects_count: 25, roi: 12, risk_level: 'low', description: null },
    { name: "Лазаревское", center_lat: 43.9042, center_lng: 39.3280, avg_price_sqm: 180000, growth_5y: 25, growth_10y: 55, objects_count: 60, roi: 5, risk_level: 'high', description: null },
];

export default function DistrictsAdminPage() {
    const [districts, setDistricts] = useState<District[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<District | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Загрузка районов
    useEffect(() => {
        fetchDistricts();
    }, []);

    const fetchDistricts = async () => {
        try {
            const res = await fetch(`${API_URL}/api/v1/districts`);
            if (res.ok) {
                const data = await res.json();
                setDistricts(data);
            } else {
                // Если API не отвечает — используем дефолтные
                setDistricts(DEFAULT_DISTRICTS);
            }
        } catch {
            setDistricts(DEFAULT_DISTRICTS);
        } finally {
            setLoading(false);
        }
    };

    const saveDistrict = async (district: District) => {
        try {
            const method = district.id ? 'PUT' : 'POST';
            const url = district.id ? `${API_URL}/api/v1/districts/${district.id}` : `${API_URL}/api/v1/districts`;
            
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(district),
            });
            
            if (res.ok) {
                setMessage({ type: 'success', text: district.id ? 'Район обновлён!' : 'Район создан!' });
                fetchDistricts();
                setEditing(null);
            } else {
                const err = await res.json();
                setMessage({ type: 'error', text: err.detail || 'Ошибка сохранения' });
            }
        } catch {
            setMessage({ type: 'error', text: 'Не удалось подключиться к серверу' });
        }
    };

    const deleteDistrict = async (id: number) => {
        if (!confirm('Удалить район?')) return;
        try {
            await fetch(`${API_URL}/api/v1/districts/${id}`, { method: 'DELETE' });
            setMessage({ type: 'success', text: 'Район удалён' });
            fetchDistricts();
        } catch {
            setMessage({ type: 'error', text: 'Ошибка удаления' });
        }
    };

    const seedDefaults = async () => {
        if (!confirm('Это добавит 6 стандартных районов Сочи. Продолжить?')) return;
        for (const d of DEFAULT_DISTRICTS) {
            await fetch(`${API_URL}/api/v1/districts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(d),
            });
        }
        fetchDistricts();
        setMessage({ type: 'success', text: 'Стандартные районы добавлены!' });
    };

    if (loading) return <div style={{ color: '#fff', padding: '40px' }}>Загрузка...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#d4af37' }}>🏙️ Управление районами</h1>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={seedDefaults} style={btnSecondary}>📋 Заполнить стандартными</button>
                    <button onClick={() => setEditing({ name: '', center_lat: 43.58, center_lng: 39.72, avg_price_sqm: null, growth_5y: null, growth_10y: null, objects_count: 0, roi: null, risk_level: 'medium', description: null })} style={btnPrimary}>+ Добавить район</button>
                </div>
            </div>

            {message && (
                <div style={{ padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', background: message.type === 'success' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)', color: message.type === 'success' ? '#22c55e' : '#ef4444' }}>
                    {message.text}
                </div>
            )}

            {/* Таблица районов */}
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.1)' }}>
                            <th style={th}>Название</th>
                            <th style={th}>Цена/м²</th>
                            <th style={th}>Рост 5л</th>
                            <th style={th}>Рост 10л</th>
                            <th style={th}>ROI</th>
                            <th style={th}>Риск</th>
                            <th style={th}>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {districts.map((d, i) => (
                            <tr key={d.id || i} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <td style={td}>{d.name}</td>
                                <td style={td}>{d.avg_price_sqm ? `${(d.avg_price_sqm / 1000).toFixed(0)}K` : '—'}</td>
                                <td style={td}>{d.growth_5y ? `+${d.growth_5y}%` : '—'}</td>
                                <td style={td}>{d.growth_10y ? `+${d.growth_10y}%` : '—'}</td>
                                <td style={td}>{d.roi ? `${d.roi}%` : '—'}</td>
                                <td style={td}>
                                    <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', background: d.risk_level === 'low' ? 'rgba(34,197,94,0.2)' : d.risk_level === 'medium' ? 'rgba(234,179,8,0.2)' : 'rgba(239,68,68,0.2)', color: d.risk_level === 'low' ? '#22c55e' : d.risk_level === 'medium' ? '#eab308' : '#ef4444' }}>
                                        {d.risk_level === 'low' ? 'Низкий' : d.risk_level === 'medium' ? 'Средний' : 'Высокий'}
                                    </span>
                                </td>
                                <td style={td}>
                                    <button onClick={() => setEditing(d)} style={{ ...btnSmall, marginRight: '8px' }}>✏️</button>
                                    {d.id && <button onClick={() => deleteDistrict(d.id!)} style={{ ...btnSmall, background: 'rgba(239,68,68,0.2)' }}>🗑️</button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Модальное окно редактирования */}
            {editing && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#1e293b', borderRadius: '16px', padding: '32px', width: '600px', maxHeight: '90vh', overflow: 'auto' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px', color: '#fff' }}>
                            {editing.id ? 'Редактирование района' : 'Новый район'}
                        </h2>
                        <form onSubmit={(e) => { e.preventDefault(); saveDistrict(editing); }}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={label}>Название *</label>
                                <input style={input} value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} required placeholder="Например: Центральный" />
                            </div>
                            
                            {/* Карта для выбора центра района */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={label}>📍 Центр района на карте</label>
                                <LocationPicker
                                    initialLat={editing.center_lat}
                                    initialLon={editing.center_lng}
                                    onChange={(lat, lng) => setEditing({ ...editing, center_lat: lat, center_lng: lng })}
                                />
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div>
                                    <label style={label}>Широта</label>
                                    <input style={input} type="number" step="0.0001" value={editing.center_lat} onChange={e => setEditing({ ...editing, center_lat: parseFloat(e.target.value) })} />
                                </div>
                                <div>
                                    <label style={label}>Долгота</label>
                                    <input style={input} type="number" step="0.0001" value={editing.center_lng} onChange={e => setEditing({ ...editing, center_lng: parseFloat(e.target.value) })} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div>
                                    <label style={label}>Цена за м² (₽)</label>
                                    <input style={input} type="number" value={editing.avg_price_sqm || ''} onChange={e => setEditing({ ...editing, avg_price_sqm: e.target.value ? parseInt(e.target.value) : null })} />
                                </div>
                                <div>
                                    <label style={label}>ROI (%)</label>
                                    <input style={input} type="number" step="0.1" value={editing.roi || ''} onChange={e => setEditing({ ...editing, roi: e.target.value ? parseFloat(e.target.value) : null })} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div>
                                    <label style={label}>Рост 5 лет (%)</label>
                                    <input style={input} type="number" value={editing.growth_5y || ''} onChange={e => setEditing({ ...editing, growth_5y: e.target.value ? parseFloat(e.target.value) : null })} />
                                </div>
                                <div>
                                    <label style={label}>Рост 10 лет (%)</label>
                                    <input style={input} type="number" value={editing.growth_10y || ''} onChange={e => setEditing({ ...editing, growth_10y: e.target.value ? parseFloat(e.target.value) : null })} />
                                </div>
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={label}>Уровень риска</label>
                                <select style={input} value={editing.risk_level} onChange={e => setEditing({ ...editing, risk_level: e.target.value })}>
                                    <option value="low">Низкий</option>
                                    <option value="medium">Средний</option>
                                    <option value="high">Высокий</option>
                                </select>
                            </div>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={label}>Описание</label>
                                <textarea style={{ ...input, minHeight: '80px' }} value={editing.description || ''} onChange={e => setEditing({ ...editing, description: e.target.value })} />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setEditing(null)} style={btnSecondary}>Отмена</button>
                                <button type="submit" style={btnPrimary}>💾 Сохранить</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// Стили
const btnPrimary: React.CSSProperties = { padding: '12px 20px', borderRadius: '8px', border: 'none', background: '#d4af37', color: '#000', fontWeight: 600, cursor: 'pointer' };
const btnSecondary: React.CSSProperties = { padding: '12px 20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', cursor: 'pointer' };
const btnSmall: React.CSSProperties = { padding: '6px 10px', borderRadius: '4px', border: 'none', background: 'rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer' };
const th: React.CSSProperties = { padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#94a3b8' };
const td: React.CSSProperties = { padding: '12px 16px', fontSize: '14px', color: '#fff' };
const label: React.CSSProperties = { display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' };
const input: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '14px' };
