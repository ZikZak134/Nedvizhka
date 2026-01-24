'use client';

import { useState, useEffect } from 'react';

interface Complex {
    id?: number;
    name: string;
    center_lat: number;
    center_lng: number;
    growth: number | null;
    price_sqm: number | null;
    min_price: number | null;
    tags: string[];
    image: string | null;
    description: string | null;
    district: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Дефолтные данные из PremiumMap.tsx
const DEFAULT_COMPLEXES: Complex[] = [
    { name: "Mantera Seaview Residence", center_lat: 43.4055, center_lng: 39.9431, growth: 185, price_sqm: 2800000, min_price: 150000000, tags: ['Deluxe', 'Sea View', 'Pool'], image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80', description: null, district: 'Сириус' },
    { name: "Karat Apartments (Hyatt)", center_lat: 43.5786, center_lng: 39.7267, growth: 130, price_sqm: 1900000, min_price: 120000000, tags: ['Hotel Service', 'Center', 'Elite'], image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80', description: null, district: 'Центральный' },
    { name: "Grand Royal Residence", center_lat: 43.5905, center_lng: 39.7156, growth: 95, price_sqm: 1200000, min_price: 45000000, tags: ['Park', 'History', 'Private Beach'], image: 'https://images.unsplash.com/photo-1600596542815-60c37c65b567?auto=format&fit=crop&w=800&q=80', description: null, district: 'Центральный' },
    { name: "Reef Residence", center_lat: 43.5834, center_lng: 39.7289, growth: 150, price_sqm: 2100000, min_price: 110000000, tags: ['Club House', 'First Line'], image: 'https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=800&q=80', description: null, district: 'Центральный' },
    { name: "San City", center_lat: 43.565, center_lng: 39.750, growth: 75, price_sqm: 650000, min_price: 28000000, tags: ['Business', 'Spa'], image: 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=800&q=80', description: null, district: 'Центральный' },
    { name: "Alean Family Resort", center_lat: 43.550, center_lng: 39.780, growth: 110, price_sqm: 950000, min_price: 35000000, tags: ['Invest', 'Family', 'All Inclusive'], image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80', description: null, district: 'Хоста' },
];

export default function ComplexesAdminPage() {
    const [complexes, setComplexes] = useState<Complex[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Complex | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [tagsInput, setTagsInput] = useState('');

    useEffect(() => {
        fetchComplexes();
    }, []);

    const fetchComplexes = async () => {
        try {
            const res = await fetch(`${API_URL}/api/v1/complexes-admin`);
            if (res.ok) {
                const data = await res.json();
                // Проверяем, что data — массив
                setComplexes(Array.isArray(data) ? data : DEFAULT_COMPLEXES);
            } else {
                setComplexes(DEFAULT_COMPLEXES);
            }
        } catch {
            setComplexes(DEFAULT_COMPLEXES);
        } finally {
            setLoading(false);
        }
    };

    const saveComplex = async (complex: Complex) => {
        try {
            const method = complex.id ? 'PUT' : 'POST';
            const url = complex.id ? `${API_URL}/api/v1/complexes-admin/${complex.id}` : `${API_URL}/api/v1/complexes-admin`;
            
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...complex, tags: tagsInput ? tagsInput.split(',').map(t => t.trim()) : complex.tags }),
            });
            
            if (res.ok) {
                setMessage({ type: 'success', text: complex.id ? 'ЖК обновлён!' : 'ЖК создан!' });
                fetchComplexes();
                setEditing(null);
            } else {
                const err = await res.json();
                setMessage({ type: 'error', text: err.detail || 'Ошибка сохранения' });
            }
        } catch {
            setMessage({ type: 'error', text: 'Не удалось подключиться к серверу' });
        }
    };

    const deleteComplex = async (id: number) => {
        if (!confirm('Удалить ЖК?')) return;
        try {
            await fetch(`${API_URL}/api/v1/complexes-admin/${id}`, { method: 'DELETE' });
            setMessage({ type: 'success', text: 'ЖК удалён' });
            fetchComplexes();
        } catch {
            setMessage({ type: 'error', text: 'Ошибка удаления' });
        }
    };

    const seedDefaults = async () => {
        if (!confirm('Добавить 6 стандартных ЖК?')) return;
        for (const c of DEFAULT_COMPLEXES) {
            await fetch(`${API_URL}/api/v1/complexes-admin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(c),
            });
        }
        fetchComplexes();
        setMessage({ type: 'success', text: 'Стандартные ЖК добавлены!' });
    };

    const openEdit = (c: Complex) => {
        setEditing(c);
        setTagsInput(c.tags?.join(', ') || '');
    };

    if (loading) return <div style={{ color: '#fff', padding: '40px' }}>Загрузка...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#d4af37' }}>🏢 Управление ЖК</h1>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={seedDefaults} style={btnSecondary}>📋 Заполнить стандартными</button>
                    <button onClick={() => openEdit({ name: '', center_lat: 43.58, center_lng: 39.72, growth: null, price_sqm: null, min_price: null, tags: [], image: null, description: null, district: null })} style={btnPrimary}>+ Добавить ЖК</button>
                </div>
            </div>

            {message && (
                <div style={{ padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', background: message.type === 'success' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)', color: message.type === 'success' ? '#22c55e' : '#ef4444' }}>
                    {message.text}
                </div>
            )}

            {/* Карточки ЖК */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {complexes.map((c, i) => (
                    <div key={c.id || i} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                        {c.image && <img src={c.image} alt={c.name} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />}
                        <div style={{ padding: '16px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: '#fff' }}>{c.name}</h3>
                            <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>{c.district || 'Район не указан'}</div>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                                {c.tags?.map((tag, ti) => (
                                    <span key={ti} style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', background: 'rgba(212,175,55,0.2)', color: '#d4af37' }}>{tag}</span>
                                ))}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>
                                <div>Рост: <strong style={{ color: '#22c55e' }}>+{c.growth}%</strong></div>
                                <div>Цена/м²: <strong style={{ color: '#fff' }}>{c.price_sqm ? `${(c.price_sqm / 1000).toFixed(0)}K` : '—'}</strong></div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => openEdit(c)} style={{ ...btnSmall, flex: 1 }}>✏️ Редактировать</button>
                                {c.id && <button onClick={() => deleteComplex(c.id!)} style={{ ...btnSmall, background: 'rgba(239,68,68,0.2)' }}>🗑️</button>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Модальное окно редактирования */}
            {editing && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#1e293b', borderRadius: '16px', padding: '32px', width: '500px', maxHeight: '90vh', overflow: 'auto' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px', color: '#fff' }}>
                            {editing.id ? 'Редактирование ЖК' : 'Новый ЖК'}
                        </h2>
                        <form onSubmit={(e) => { e.preventDefault(); saveComplex(editing); }}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={label}>Название *</label>
                                <input style={input} value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} required />
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={label}>URL изображения</label>
                                <input style={input} value={editing.image || ''} onChange={e => setEditing({ ...editing, image: e.target.value })} placeholder="https://..." />
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
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div>
                                    <label style={label}>Рост (%)</label>
                                    <input style={input} type="number" value={editing.growth || ''} onChange={e => setEditing({ ...editing, growth: e.target.value ? parseFloat(e.target.value) : null })} />
                                </div>
                                <div>
                                    <label style={label}>Цена/м² (₽)</label>
                                    <input style={input} type="number" value={editing.price_sqm || ''} onChange={e => setEditing({ ...editing, price_sqm: e.target.value ? parseInt(e.target.value) : null })} />
                                </div>
                                <div>
                                    <label style={label}>Мин. цена (₽)</label>
                                    <input style={input} type="number" value={editing.min_price || ''} onChange={e => setEditing({ ...editing, min_price: e.target.value ? parseInt(e.target.value) : null })} />
                                </div>
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={label}>Район</label>
                                <input style={input} value={editing.district || ''} onChange={e => setEditing({ ...editing, district: e.target.value })} placeholder="Центральный" />
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={label}>Теги (через запятую)</label>
                                <input style={input} value={tagsInput} onChange={e => setTagsInput(e.target.value)} placeholder="Deluxe, Sea View, Pool" />
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
const btnSmall: React.CSSProperties = { padding: '8px 12px', borderRadius: '6px', border: 'none', background: 'rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', fontSize: '13px' };
const label: React.CSSProperties = { display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' };
const input: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '14px' };
