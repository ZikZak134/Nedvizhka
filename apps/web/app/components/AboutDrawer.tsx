'use client';

import { useEffect, useState, useCallback } from 'react';

interface AboutDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Шторка «О компании» — выезжает сверху вниз.
 * Содержит анимированный текст, который появляется как будто его пишет призрачная рука.
 */
export function AboutDrawer({ isOpen, onClose }: AboutDrawerProps) {
    const [visibleSections, setVisibleSections] = useState<number>(0);
    const [typingIndex, setTypingIndex] = useState<number>(0);
    const [isTypingComplete, setIsTypingComplete] = useState(false);

    // Текст для анимации печатания (обращение к читателю)
    const introText = "Уважаемый гость, добро пожаловать в EstateAnalytics — ваш проводник в мир элитной недвижимости...";

    // Сброс анимации при закрытии
    useEffect(() => {
        if (!isOpen) {
            setVisibleSections(0);
            setTypingIndex(0);
            setIsTypingComplete(false);
        }
    }, [isOpen]);

    // Анимация печатания текста
    useEffect(() => {
        if (isOpen && typingIndex < introText.length) {
            const timer = setTimeout(() => {
                setTypingIndex(prev => prev + 1);
            }, 40); // Скорость печатания
            return () => clearTimeout(timer);
        } else if (typingIndex >= introText.length && isOpen) {
            setIsTypingComplete(true);
        }
    }, [isOpen, typingIndex, introText.length]);

    // Появление секций после завершения печатания
    useEffect(() => {
        if (isTypingComplete && visibleSections < 7) {
            const timer = setTimeout(() => {
                setVisibleSections(prev => prev + 1);
            }, 300); // Интервал появления секций
            return () => clearTimeout(timer);
        }
    }, [isTypingComplete, visibleSections]);

    // Блокировка скролла body при открытой шторке
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Закрытие по Escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    return (
        <>
            {/* Backdrop */}
            <div
                className={`about-drawer-backdrop ${isOpen ? 'open' : ''}`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Drawer */}
            <div
                className={`about-drawer ${isOpen ? 'open' : ''}`}
                role="dialog"
                aria-modal="true"
                aria-label="О компании EstateAnalytics"
            >
                {/* Кнопка закрытия */}
                <button
                    className="about-drawer-close"
                    onClick={onClose}
                    aria-label="Закрыть"
                >
                    ✕
                </button>

                {/* Контент */}
                <div className="about-drawer-content">
                    <header className="about-drawer-header">
                        <div className="about-drawer-icon">🏛️</div>
                        <h1>О КОМПАНИИ</h1>

                        {/* Анимированный текст — как будто пишет призрачная рука */}
                        <p className="about-drawer-typing">
                            <span className="typing-text">
                                {introText.slice(0, typingIndex)}
                            </span>
                            {typingIndex < introText.length && (
                                <span className="typing-cursor">|</span>
                            )}
                        </p>
                    </header>

                    <div className="about-drawer-poem">
                        {/* Блок 1 */}
                        <section className={`poem-section fade-in-section ${visibleSections >= 1 ? 'visible' : ''}`}>
                            <div className="poem-section-header">
                                <span className="poem-icon">🏗️</span>
                                <h2>ОТ ФУНДАМЕНТА ДО КРОВЛИ</h2>
                            </div>
                            <p>
                                От первого камня в основании —<br />
                                до последней черепицы под небом.<br />
                                Мы изучаем несущие стены и скрытые коммуникации,<br />
                                чтобы вы спали спокойно долгие годы.
                            </p>
                        </section>

                        {/* Блок 2 */}
                        <section className={`poem-section fade-in-section ${visibleSections >= 2 ? 'visible' : ''}`}>
                            <div className="poem-section-header">
                                <span className="poem-icon">🌳</span>
                                <h2>ОТ СОСЕДЕЙ ДО ЛАНДШАФТА</h2>
                            </div>
                            <p>
                                Кто живёт за стеной? Что шумит за окном?<br />
                                Мы знаем ответы на вопросы,<br />
                                которые вы ещё не успели задать.
                            </p>
                        </section>

                        {/* Блок 3 */}
                        <section className={`poem-section fade-in-section ${visibleSections >= 3 ? 'visible' : ''}`}>
                            <div className="poem-section-header">
                                <span className="poem-icon">📈</span>
                                <h2>ОТ ЦЕНЫ СЕГОДНЯ ДО СТОИМОСТИ ЗАВТРА</h2>
                            </div>
                            <p>
                                Сколько будет стоить ваш дом<br />
                                через три года? Через пять?<br />
                                Наши аналитики видят тренды,<br />
                                скрытые от обычного глаза.
                            </p>
                        </section>

                        {/* Разделитель */}
                        <div className={`poem-divider fade-in-section ${visibleSections >= 4 ? 'visible' : ''}`}>✦ ✦ ✦</div>

                        {/* Как пользоваться */}
                        <section className={`poem-section how-to-use fade-in-section ${visibleSections >= 4 ? 'visible' : ''}`}>
                            <h2 className="section-title-gold">КАК ПОЛЬЗОВАТЬСЯ</h2>

                            <div className="how-to-grid">
                                <div className="how-to-item">
                                    <span className="how-to-icon">🗺️</span>
                                    <strong>Карта инвестиций</strong>
                                    <p>Откройте карту — увидьте рост. Каждый маркер — история успеха.</p>
                                </div>
                                <div className="how-to-item">
                                    <span className="how-to-icon">🏢</span>
                                    <strong>Районы и ЖК</strong>
                                    <p>Выбирайте не квартиру — выбирайте образ жизни.</p>
                                </div>
                                <div className="how-to-item">
                                    <span className="how-to-icon">📊</span>
                                    <strong>Аналитика</strong>
                                    <p>Цифры не лгут. Графики рисуют будущее.</p>
                                </div>
                            </div>
                        </section>

                        {/* Разделитель */}
                        <div className={`poem-divider fade-in-section ${visibleSections >= 5 ? 'visible' : ''}`}>✦ ✦ ✦</div>

                        {/* Экспертиза */}
                        <section className={`poem-section experts fade-in-section ${visibleSections >= 5 ? 'visible' : ''}`}>
                            <h2 className="section-title-gold">МЫ — ЭКСПЕРТЫ</h2>

                            <div className="stats-row">
                                <div className="stat-item">
                                    <span className="stat-number">15+</span>
                                    <span className="stat-label">лет в строительстве</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-number">500+</span>
                                    <span className="stat-label">проверенных объектов</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-number">1000+</span>
                                    <span className="stat-label">счастливых клиентов</span>
                                </div>
                            </div>

                            <p className="poem-final">
                                Мы знаем, где течёт крыша,<br />
                                прежде чем она потечёт.<br />
                                Мы видим, где просядет цена,<br />
                                прежде чем рынок почувствует ветер.
                            </p>
                        </section>

                        {/* Финал */}
                        <footer className={`poem-footer fade-in-section ${visibleSections >= 6 ? 'visible' : ''}`}>
                            <p className="brand-line">
                                <strong>EstateAnalytics</strong> —<br />
                                видим дальше, копаем глубже,<br />
                                строим светлое будущее вместе с вами.
                            </p>
                            <button className="exit-badge" onClick={onClose}>
                                ✨ Добро пожаловать ✨
                            </button>
                        </footer>
                    </div>
                </div>
            </div>
        </>
    );
}
