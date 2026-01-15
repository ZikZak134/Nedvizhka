'use client';

import { useState, useEffect } from 'react';

interface SiteSettings {
    id?: number;
    default_images: string[];
    default_locations: { lat: number; lng: number; address: string; district?: string }[];
    footer_phone: string | null;
    footer_address: string | null;
    footer_email: string | null;
    social_links: { [key: string]: string };
    footer_description: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Дефолтные значения
const DEFAULT_SETTINGS: SiteSettings = {
    default_images: [
        'https://images.unsplash.com/photo-1600596542815-60c37c65b567?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
    ],
    default_locations: [],
    footer_phone: '+7 (800) 555-35-35',
    footer_address: '354000, г. Сочи, ул. Навагинская, 9Д',
    footer_email: 'info@estateanalytics.ru',
    social_links: { telegram: 'https://t.me/estateanalytics', vk: '', instagram: '', youtube: '' },
    footer_description: 'Премиальная недвижимость Сочи'
};

export default function SettingsAdminPage() {
    const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [imagesInput, setImagesInput] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch(`${API_URL}/api/v1/settings`);
            if (res.ok) {
                const data = await res.json();
                setSettings(data);
                setImagesInput(data.default_images?.join('\n') || '');
            }
        } catch {
            // Используем дефолтные
            setImagesInput(DEFAULT_SETTINGS.default_images.join('\n'));
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            const payload = {
                ...settings,
                default_images: imagesInput.split('\n').map(s => s.trim()).filter(Boolean),
            };

            const res = await fetch(`${API_URL}/api/v1/settings`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Настройки сохранены!' });
                setSettings(await res.json());
            } else {
                setMessage({ type: 'error', text: 'Ошибка сохранения' });
            }
        } catch {
            setMessage({ type: 'error', text: 'Не удалось подключиться к серверу' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ color: '#fff', padding: '40px' }}>Загрузка...</div>;

    return (
        <div style={{ maxWidth: '800px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#d4af37', marginBottom: '32px' }}>⚙️ Настройки сайта</h1>

            {message && (
                <div style={{ padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', background: message.type === 'success' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)', color: message.type === 'success' ? '#22c55e' : '#ef4444' }}>
                    {message.text}
                </div>
            )}

            {/* Контактная информация */}
            <section style={sectionStyle}>
                <h2 style={sectionTitle}>📞 Контакты</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                        <label style={label}>Телефон</label>
                        <input style={input} value={settings.footer_phone || ''} onChange={e => setSettings({ ...settings, footer_phone: e.target.value })} placeholder="+7 (800) 555-35-35" />
                    </div>
                    <div>
                        <label style={label}>Email</label>
                        <input style={input} value={settings.footer_email || ''} onChange={e => setSettings({ ...settings, footer_email: e.target.value })} placeholder="info@example.ru" />
                    </div>
                </div>
                <div style={{ marginTop: '16px' }}>
                    <label style={label}>Адрес</label>
                    <input style={input} value={settings.footer_address || ''} onChange={e => setSettings({ ...settings, footer_address: e.target.value })} placeholder="г. Сочи, ул. ..." />
                </div>
                <div style={{ marginTop: '16px' }}>
                    <label style={label}>Описание компании</label>
                    <textarea style={{ ...input, minHeight: '80px' }} value={settings.footer_description || ''} onChange={e => setSettings({ ...settings, footer_description: e.target.value })} placeholder="Краткое описание для footer" />
                </div>
            </section>

            {/* Социальные сети */}
            <section style={sectionStyle}>
                <h2 style={sectionTitle}>🌐 Социальные сети</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                        <label style={label}>Telegram</label>
                        <input style={input} value={settings.social_links?.telegram || ''} onChange={e => setSettings({ ...settings, social_links: { ...settings.social_links, telegram: e.target.value } })} placeholder="https://t.me/..." />
                    </div>
                    <div>
                        <label style={label}>VK</label>
                        <input style={input} value={settings.social_links?.vk || ''} onChange={e => setSettings({ ...settings, social_links: { ...settings.social_links, vk: e.target.value } })} placeholder="https://vk.com/..." />
                    </div>
                    <div>
                        <label style={label}>Instagram</label>
                        <input style={input} value={settings.social_links?.instagram || ''} onChange={e => setSettings({ ...settings, social_links: { ...settings.social_links, instagram: e.target.value } })} placeholder="https://instagram.com/..." />
                    </div>
                    <div>
                        <label style={label}>YouTube</label>
                        <input style={input} value={settings.social_links?.youtube || ''} onChange={e => setSettings({ ...settings, social_links: { ...settings.social_links, youtube: e.target.value } })} placeholder="https://youtube.com/..." />
                    </div>
                    <div>
                        <label style={label}>WhatsApp</label>
                        <input style={input} value={settings.social_links?.whatsapp || ''} onChange={e => setSettings({ ...settings, social_links: { ...settings.social_links, whatsapp: e.target.value } })} placeholder="https://wa.me/..." />
                    </div>
                </div>
            </section>

            {/* Дефолтные изображения */}
            <section style={sectionStyle}>
                <h2 style={sectionTitle}>🖼️ Дефолтные изображения</h2>
                <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '12px' }}>URL изображений (по одному на строку). Используются для объектов без фото.</p>
                <textarea 
                    style={{ ...input, minHeight: '120px', fontFamily: 'monospace', fontSize: '12px' }} 
                    value={imagesInput} 
                    onChange={e => setImagesInput(e.target.value)} 
                    placeholder="https://images.unsplash.com/..." 
                />
                {imagesInput && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                        {imagesInput.split('\n').filter(Boolean).slice(0, 5).map((url, i) => (
                            <img key={i} src={url.trim()} alt={`Preview ${i + 1}`} style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        ))}
                    </div>
                )}
            </section>

            {/* Кнопка сохранения */}
            <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={saveSettings} disabled={saving} style={{ padding: '14px 32px', borderRadius: '8px', border: 'none', background: '#d4af37', color: '#000', fontWeight: 700, fontSize: '16px', cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                    {saving ? '⏳ Сохранение...' : '💾 Сохранить настройки'}
                </button>
            </div>
        </div>
    );
}

// Стили
const sectionStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.1)' };
const sectionTitle: React.CSSProperties = { fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '16px' };
const label: React.CSSProperties = { display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' };
const input: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '14px' };
