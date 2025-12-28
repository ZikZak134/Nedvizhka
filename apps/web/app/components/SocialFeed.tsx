'use client';
import { useState } from 'react';

export function SocialFeed() {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div style={{
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(16px)',
            borderRadius: 'var(--radius-xl)',
            width: '100%',
            maxWidth: '340px',
            color: 'white',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        }}>
            {/* Header */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    background: 'rgba(255,255,255,0.03)',
                    borderBottom: isOpen ? '1px solid rgba(255,255,255,0.1)' : 'none'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px' }}>💬</span>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>Живые отзывы</span>
                </div>
                <button style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                    {isOpen ? '▲' : '▼'}
                </button>
            </div>

            {/* Content */}
            {isOpen && (
                <div style={{ padding: '16px', maxHeight: '400px', overflowY: 'auto' }}>

                    {/* Comment 1 */}
                    <div style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>A</div>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#e2e8f0' }}>Alextlt</span>
                            <span style={{ fontSize: '9px', color: '#64748b' }}>Янв 2018</span>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '0 12px 12px 12px', fontSize: '11px', lineHeight: 1.4, color: '#cbd5e1' }}>
                            Город Сочи реально классный, лучшего не видел. Если денег хватает — не раздумывайте. За три года город сильно изменился в лучшую сторону.
                        </div>
                    </div>

                    {/* Comment 2 */}
                    <div style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>J</div>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#e2e8f0' }}>Julia</span>
                            <span style={{ fontSize: '9px', color: '#64748b' }}>Местная</span>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '0 12px 12px 12px', fontSize: '11px', lineHeight: 1.4, color: '#cbd5e1' }}>
                            С постройкой дублера решена проблема пробок — у нас их нет! У нас чистый город и удивительная культура вождения.
                        </div>
                    </div>

                    {/* Warning Block */}
                    <div style={{ marginBottom: '12px', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '10px', background: 'rgba(239, 68, 68, 0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: '#ef4444', fontSize: '11px', fontWeight: 700 }}>
                            ⚠️ Осторожно: Фейки!
                        </div>
                        <div style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: 1.4 }}>
                            "90% объявлений на досках — это "риэлторские фонари". Реальные цены в 2-3 раза выше заявленных. Не верьте сказкам про дешевое жилье!"
                            <div style={{ marginTop: '4px', color: '#94a3b8', fontSize: '10px' }}>— Кассава Пандора</div>
                        </div>
                    </div>

                    {/* Comment 3 */}
                    <div style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>E</div>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#e2e8f0' }}>Евгения</span>
                            <span style={{ fontSize: '9px', color: '#64748b' }}>Инвестор</span>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '0 12px 12px 12px', fontSize: '11px', lineHeight: 1.4, color: '#cbd5e1' }}>
                            С 2015 года квартира выросла на 30%. Сдаю гораздо выгоднее, чем если бы держала деньги на депозите.
                        </div>
                    </div>

                    {/* Advice */}
                    <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '10px', borderRadius: '12px', fontSize: '11px', lineHeight: 1.4, color: '#e2e8f0', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                        <strong style={{ color: '#4ade80' }}>Совет от Oleg:</strong> Приезжайте с деньгами, снимайте жильё, осмотритесь сначала, а потом уже покупайте.
                    </div>

                </div>
            )}
        </div>
    );
}
