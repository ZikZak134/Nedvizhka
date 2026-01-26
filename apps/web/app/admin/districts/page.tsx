'use client';

import { useState, useEffect } from 'react';
import LocationPicker from '../components/LocationPicker';
import styles from '../admin.module.css';

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
            const res = await fetch(`/api/v1/districts`);
            if (res.ok) {
                const data = await res.json();
                // Проверяем, что data — массив
                setDistricts(Array.isArray(data) ? data : DEFAULT_DISTRICTS);
            } else {
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
            const url = district.id ? `/api/v1/districts/${district.id}` : `/api/v1/districts`;
            
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
            await fetch(`/api/v1/districts/${id}`, { method: 'DELETE' });
            setMessage({ type: 'success', text: 'Район удалён' });
            fetchDistricts();
        } catch {
            setMessage({ type: 'error', text: 'Ошибка удаления' });
        }
    };

    const seedDefaults = async () => {
        if (!confirm('Это добавит 6 стандартных районов Сочи. Продолжить?')) return;
        for (const d of DEFAULT_DISTRICTS) {
            await fetch(`/api/v1/districts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(d),
            });
        }
        fetchDistricts();
        setMessage({ type: 'success', text: 'Стандартные районы добавлены!' });
    };

    const getRiskBadgeClass = (level: string) => {
        if (level === 'low') return `${styles.districtBadge} ${styles.districtBadgeLow}`;
        if (level === 'medium') return `${styles.districtBadge} ${styles.districtBadgeMedium}`;
        return `${styles.districtBadge} ${styles.districtBadgeHigh}`;
    };

    if (loading) return <div className={styles.loadingText}>Загрузка...</div>;

    return (
        <div>
            <div className={styles.districtsHeader}>
                <h1 className={styles.districtsTitle}>🏙️ Управление районами</h1>
                <div className={styles.districtsActions}>
                    <button onClick={seedDefaults} className={styles.btnSecondary}>📋 Заполнить стандартными</button>
                    <button onClick={() => setEditing({ name: '', center_lat: 43.58, center_lng: 39.72, avg_price_sqm: null, growth_5y: null, growth_10y: null, objects_count: 0, roi: null, risk_level: 'medium', description: null })} className={styles.btnPrimary}>+ Добавить район</button>
                </div>
            </div>

            {message && (
                <div className={`${styles.districtsMessage} ${message.type === 'success' ? styles.districtsMessageSuccess : styles.districtsMessageError}`}>
                    {message.text}
                </div>
            )}

            {/* Таблица районов */}
            <div className={styles.districtsTableWrapper}>
                <table className={styles.districtsTable}>
                    <thead>
                        <tr className={styles.districtsTableHeader}>
                            <th className={styles.districtsTableTh}>Название</th>
                            <th className={styles.districtsTableTh}>Цена/м²</th>
                            <th className={styles.districtsTableTh}>Рост 5л</th>
                            <th className={styles.districtsTableTh}>Рост 10л</th>
                            <th className={styles.districtsTableTh}>ROI</th>
                            <th className={styles.districtsTableTh}>Риск</th>
                            <th className={styles.districtsTableTh}>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {districts.map((d, i) => (
                            <tr key={d.id || i} className={styles.districtsTableRow}>
                                <td className={styles.districtsTableTd}>{d.name}</td>
                                <td className={styles.districtsTableTd}>{d.avg_price_sqm ? `${(d.avg_price_sqm / 1000).toFixed(0)}K` : '—'}</td>
                                <td className={styles.districtsTableTd}>{d.growth_5y ? `+${d.growth_5y}%` : '—'}</td>
                                <td className={styles.districtsTableTd}>{d.growth_10y ? `+${d.growth_10y}%` : '—'}</td>
                                <td className={styles.districtsTableTd}>{d.roi ? `${d.roi}%` : '—'}</td>
                                <td className={styles.districtsTableTd}>
                                    <span className={getRiskBadgeClass(d.risk_level)}>
                                        {d.risk_level === 'low' ? 'Низкий' : d.risk_level === 'medium' ? 'Средний' : 'Высокий'}
                                    </span>
                                </td>
                                <td className={styles.districtsTableTd}>
                                    <button onClick={() => setEditing(d)} className={styles.btnSmall}>✏️</button>
                                    {d.id && <button onClick={() => deleteDistrict(d.id!)} className={`${styles.btnSmall} ${styles.btnSmallDanger}`}>🗑️</button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Модальное окно редактирования */}
            {editing && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h2 className={styles.modalTitle}>
                            {editing.id ? 'Редактирование района' : 'Новый район'}
                        </h2>
                        <form onSubmit={(e) => { e.preventDefault(); saveDistrict(editing); }}>
                            <div className={styles.modalFormGroup}>
                                <label className={styles.modalFormLabel}>Название *</label>
                                <input className={styles.modalFormInput} value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} required placeholder="Например: Центральный" aria-label="Название" />
                            </div>
                            
                            {/* Карта для выбора центра района */}
                            <div className={styles.modalFormGroup}>
                                <label className={styles.modalFormLabel}>📍 Центр района на карте</label>
                                <LocationPicker
                                    initialLat={editing.center_lat}
                                    initialLon={editing.center_lng}
                                    onChange={(lat, lng) => setEditing({ ...editing, center_lat: lat, center_lng: lng })}
                                />
                            </div>
                            
                            <div className={styles.modalFormRow}>
                                <div>
                                    <label className={styles.modalFormLabel}>Широта</label>
                                    <input className={styles.modalFormInput} type="number" step="0.0001" value={editing.center_lat} onChange={e => setEditing({ ...editing, center_lat: parseFloat(e.target.value) })} placeholder="43.58" aria-label="Широта" />
                                </div>
                                <div>
                                    <label className={styles.modalFormLabel}>Долгота</label>
                                    <input className={styles.modalFormInput} type="number" step="0.0001" value={editing.center_lng} onChange={e => setEditing({ ...editing, center_lng: parseFloat(e.target.value) })} placeholder="39.72" aria-label="Долгота" />
                                </div>
                            </div>
                            <div className={styles.modalFormRow}>
                                <div>
                                    <label className={styles.modalFormLabel}>Цена за м² (₽)</label>
                                    <input className={styles.modalFormInput} type="number" value={editing.avg_price_sqm || ''} onChange={e => setEditing({ ...editing, avg_price_sqm: e.target.value ? parseInt(e.target.value) : null })} placeholder="500000" aria-label="Цена за м²" />
                                </div>
                                <div>
                                    <label className={styles.modalFormLabel}>ROI (%)</label>
                                    <input className={styles.modalFormInput} type="number" step="0.1" value={editing.roi || ''} onChange={e => setEditing({ ...editing, roi: e.target.value ? parseFloat(e.target.value) : null })} placeholder="12" aria-label="ROI" />
                                </div>
                            </div>
                            <div className={styles.modalFormRow}>
                                <div>
                                    <label className={styles.modalFormLabel}>Рост 5 лет (%)</label>
                                    <input className={styles.modalFormInput} type="number" value={editing.growth_5y || ''} onChange={e => setEditing({ ...editing, growth_5y: e.target.value ? parseFloat(e.target.value) : null })} placeholder="50" aria-label="Рост 5 лет" />
                                </div>
                                <div>
                                    <label className={styles.modalFormLabel}>Рост 10 лет (%)</label>
                                    <input className={styles.modalFormInput} type="number" value={editing.growth_10y || ''} onChange={e => setEditing({ ...editing, growth_10y: e.target.value ? parseFloat(e.target.value) : null })} placeholder="100" aria-label="Рост 10 лет" />
                                </div>
                            </div>
                            <div className={styles.modalFormGroup}>
                                <label className={styles.modalFormLabel}>Уровень риска</label>
                                <select className={styles.modalFormInput} value={editing.risk_level} onChange={e => setEditing({ ...editing, risk_level: e.target.value })} aria-label="Уровень риска">
                                    <option value="low">Низкий</option>
                                    <option value="medium">Средний</option>
                                    <option value="high">Высокий</option>
                                </select>
                            </div>
                            <div className={styles.modalFormGroupLarge}>
                                <label className={styles.modalFormLabel}>Описание</label>
                                <textarea className={styles.modalFormTextarea} value={editing.description || ''} onChange={e => setEditing({ ...editing, description: e.target.value })} placeholder="Описание района..." aria-label="Описание" />
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" onClick={() => setEditing(null)} className={styles.btnSecondary}>Отмена</button>
                                <button type="submit" className={styles.btnPrimary}>💾 Сохранить</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
