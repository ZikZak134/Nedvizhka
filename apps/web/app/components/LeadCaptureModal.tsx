'use client';
import { useState, useEffect } from 'react';
import { reachGoal } from './YandexMetrika';

/**
 * LeadCaptureModal
 * Универсальное модальное окно для захвата лидов.
 * Поддерживает разные режимы:
 * - 'showing': Заказ показа
 * - 'report': Скачивание отчета
 * - 'question': Вопрос владельцу
 */

interface LeadCaptureModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'showing' | 'report' | 'question';
    propertyTitle?: string;
}

export function LeadCaptureModal({ isOpen, onClose, mode, propertyTitle }: LeadCaptureModalProps) {
    const [step, setStep] = useState<'form' | 'success'>('form');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    useEffect(() => {
        if (isOpen) {
            setStep('form');
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here we would send data to API
        console.log('Lead Captured:', { mode, name, phone, propertyTitle });
        
        // Track Yandex Metrika Goal
        if (mode === 'showing') reachGoal('lead_showing');
        else if (mode === 'report') reachGoal('lead_report');
        else if (mode === 'question') reachGoal('lead_question');

        setStep('success');
    };

    const getTitle = () => {
        switch (mode) {
            case 'showing': return 'Заказать закрытый показ';
            case 'report': return 'Получить инвест-отчет';
            case 'question': return 'Вопрос владельцу';
        }
    };

    const getDescription = () => {
        switch (mode) {
            case 'showing': return 'Оставьте контакты. Эксперт свяжется с вами в течение 15 минут для согласования времени.';
            case 'report': return 'Полный отчет с прогнозом доходности до 2028 года будет отправлен вам в WhatsApp.';
            case 'question': return 'Ваш вопрос будет передан представителю владельца. Мы пришлем ответ в мессенджер.';
        }
    };

    const getButtonText = () => {
        switch (mode) {
            case 'showing': return 'Записаться на показ';
            case 'report': return 'Скачать отчет';
            case 'question': return 'Отправить вопрос';
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px'
        }}>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(15, 23, 42, 0.8)',
                    backdropFilter: 'blur(8px)',
                    animation: 'fadeIn 0.3s ease'
                }}
            />

            {/* Modal Card */}
            <div style={{
                position: 'relative',
                background: '#1a1a1a',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                borderRadius: '24px',
                padding: '32px',
                width: '100%',
                maxWidth: '400px',
                color: 'white',
                animation: 'slideUp 0.3s ease'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '16px', right: '16px',
                        background: 'transparent', border: 'none', color: '#64748b',
                        fontSize: '24px', cursor: 'pointer'
                    }}
                >
                    ×
                </button>

                {step === 'form' ? (
                    <form onSubmit={handleSubmit}>
                        <div style={{
                            fontSize: '48px', marginBottom: '16px', textAlign: 'center'
                        }}>
                            {mode === 'showing' ? '🔑' : mode === 'report' ? '📈' : '💬'}
                        </div>

                        <h3 style={{
                            textAlign: 'center', fontSize: '20px', fontWeight: 700,
                            marginBottom: '8px', color: 'white'
                        }}>
                            {getTitle()}
                        </h3>

                        <p style={{
                            textAlign: 'center', fontSize: '14px', color: '#94a3b8',
                            marginBottom: '24px', lineHeight: 1.5
                        }}>
                            {getDescription()}
                        </p>

                        <div style={{ marginBottom: '16px' }}>
                            <input
                                type="text"
                                placeholder="Ваше имя"
                                required
                                value={name}
                                onChange={e => setName(e.target.value)}
                                style={{
                                    width: '100%', padding: '14px', borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                    color: 'white', fontSize: '16px', outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={e => e.target.style.borderColor = '#d4af37'}
                                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                            />
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <input
                                type="tel"
                                placeholder="+7 (999) 000-00-00"
                                required
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                style={{
                                    width: '100%', padding: '14px', borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                    color: 'white', fontSize: '16px', outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={e => e.target.style.borderColor = '#d4af37'}
                                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                            />
                        </div>

                        <button
                            type="submit"
                            style={{
                                width: '100%', padding: '16px', borderRadius: '12px',
                                background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
                                border: 'none', color: '#000', fontSize: '16px', fontWeight: 700,
                                cursor: 'pointer', boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)',
                                transition: 'transform 0.1s'
                            }}
                            className="active:scale-[0.98]"
                        >
                            {getButtonText()}
                        </button>

                        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '11px', color: '#64748b' }}>
                            Нажимая кнопку, вы соглашаетесь с условиями обработки персональных данных.
                        </p>
                    </form>
                ) : (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                        <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: 'white' }}>
                            Заявка принята!
                        </h3>
                        <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px' }}>
                            Мы свяжемся с вами в ближайшее время по номеру: <br />
                            <span style={{ color: '#d4af37', fontWeight: 600 }}>{phone}</span>
                        </p>
                        <button
                            onClick={onClose}
                            style={{
                                padding: '12px 32px', borderRadius: '12px',
                                background: 'rgba(255,255,255,0.1)',
                                border: 'none', color: 'white', fontSize: '14px', fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            Вернуться к просмотру
                        </button>
                    </div>
                )}
            </div>

            <style jsx global>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}
