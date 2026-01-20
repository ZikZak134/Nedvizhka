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
            position: 'fixed', inset: 0, zIndex: 'var(--z-modal)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 'var(--space-4)'
        }}>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(10, 17, 40, 0.85)',
                    backdropFilter: 'blur(12px)',
                    animation: 'fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
            />

            {/* Modal Card */}
            <div style={{
                position: 'relative',
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-accent-600)',
                boxShadow: 'var(--shadow-2xl), 0 0 40px rgba(212, 175, 55, 0.15)',
                borderRadius: 'var(--radius-2xl)',
                padding: 'var(--space-8)',
                width: '100%',
                maxWidth: '420px',
                color: 'var(--color-text-primary)',
                animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                fontFamily: 'var(--font-sans)'
            }}>
                <button
                    onClick={onClose}
                    aria-label="Закрыть"
                    style={{
                        position: 'absolute', top: 'var(--space-4)', right: 'var(--space-4)',
                        background: 'transparent', border: 'none', color: 'var(--color-text-tertiary)',
                        fontSize: '28px', cursor: 'pointer', width: '32px', height: '32px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: 'var(--radius-md)',
                        transition: 'all var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                        e.currentTarget.style.color = 'var(--color-text-primary)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--color-text-tertiary)';
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
                            textAlign: 'center', fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)',
                            marginBottom: 'var(--space-2)', color: 'var(--color-text-primary)',
                            fontFamily: 'var(--font-display)', letterSpacing: '-0.02em'
                        }}>
                            {getTitle()}
                        </h3>

                        <p style={{
                            textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)',
                            marginBottom: 'var(--space-6)', lineHeight: 'var(--leading-relaxed)'
                        }}>
                            {getDescription()}
                        </p>

                        <div style={{ marginBottom: 'var(--space-4)' }}>
                            <input
                                type="text"
                                placeholder="Ваше имя"
                                required
                                value={name}
                                onChange={e => setName(e.target.value)}
                                style={{
                                    width: '100%', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-lg)',
                                    background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)',
                                    color: 'var(--color-text-primary)', fontSize: 'var(--text-base)', outline: 'none',
                                    transition: 'all var(--transition-fast)', fontFamily: 'var(--font-sans)'
                                }}
                                onFocus={e => {
                                    e.target.style.borderColor = 'var(--color-accent-500)';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(212, 175, 55, 0.1)';
                                }}
                                onBlur={e => {
                                    e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: 'var(--space-6)' }}>
                            <input
                                type="tel"
                                placeholder="+7 (999) 000-00-00"
                                required
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                style={{
                                    width: '100%', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-lg)',
                                    background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)',
                                    color: 'var(--color-text-primary)', fontSize: 'var(--text-base)', outline: 'none',
                                    transition: 'all var(--transition-fast)', fontFamily: 'var(--font-sans)'
                                }}
                                onFocus={e => {
                                    e.target.style.borderColor = 'var(--color-accent-500)';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(212, 175, 55, 0.1)';
                                }}
                                onBlur={e => {
                                    e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            style={{
                                width: '100%', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)',
                                background: 'linear-gradient(135deg, var(--color-accent-500) 0%, var(--color-accent-700) 100%)',
                                border: 'none', color: 'var(--color-text-inverse)', fontSize: 'var(--text-base)', 
                                fontWeight: 'var(--font-bold)', cursor: 'pointer', 
                                boxShadow: '0 4px 16px rgba(212, 175, 55, 0.4), 0 0 0 0 rgba(212, 175, 55, 0)',
                                transition: 'all var(--transition-fast)', fontFamily: 'var(--font-sans)',
                                letterSpacing: '0.02em'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(212, 175, 55, 0.5), 0 0 0 0 rgba(212, 175, 55, 0)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 16px rgba(212, 175, 55, 0.4), 0 0 0 0 rgba(212, 175, 55, 0)';
                            }}
                            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                            onMouseUp={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        >
                            {getButtonText()}
                        </button>

                        <p style={{ textAlign: 'center', marginTop: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', lineHeight: 'var(--leading-relaxed)' }}>
                            Нажимая кнопку, вы соглашаетесь с условиями обработки персональных данных.
                        </p>
                    </form>
                ) : (
                    <div style={{ textAlign: 'center', padding: 'var(--space-5) 0' }}>
                        <div style={{ fontSize: '56px', marginBottom: 'var(--space-4)', animation: 'pulse 2s ease-in-out infinite' }}>✅</div>
                        <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-2)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
                            Заявка принята!
                        </h3>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)', lineHeight: 'var(--leading-relaxed)' }}>
                            Мы свяжемся с вами в ближайшее время по номеру: <br />
                            <span style={{ color: 'var(--color-accent-500)', fontWeight: 'var(--font-semibold)' }}>{phone}</span>
                        </p>
                        <button
                            onClick={onClose}
                            style={{
                                padding: 'var(--space-3) var(--space-8)', borderRadius: 'var(--radius-lg)',
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)', color: 'var(--color-text-primary)', 
                                fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)',
                                cursor: 'pointer', transition: 'all var(--transition-fast)', fontFamily: 'var(--font-sans)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                                e.currentTarget.style.borderColor = 'var(--color-accent-500)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                            }}
                        >
                            Вернуться к просмотру
                        </button>
                    </div>
                )}
            </div>

            <style jsx global>{`
                @keyframes fadeIn { 
                    from { opacity: 0; } 
                    to { opacity: 1; } 
                }
                @keyframes slideUp { 
                    from { opacity: 0; transform: translateY(30px) scale(0.95); } 
                    to { opacity: 1; transform: translateY(0) scale(1); } 
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                
                /* Mobile responsiveness */
                @media (max-width: 480px) {
                    [style*="maxWidth: '420px'"] {
                        max-width: 100% !important;
                        padding: var(--space-6) !important;
                    }
                }
            `}</style>
        </div>
    );
}
