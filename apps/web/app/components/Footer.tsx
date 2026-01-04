'use client';

import { NAV_LINKS, UTILITY_LINKS } from '../constants/routes';

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer style={{
            background: '#0a0a0a',
            color: '#fff',
            paddingTop: '80px',
            borderTop: '1px solid rgba(212, 175, 55, 0.2)',
            fontFamily: 'var(--font-sans)',
        }}>
            <div className="lux-container">
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '40px',
                    marginBottom: '60px'
                }}>
                    {/* Brand */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <div style={{
                                width: '40px', height: '40px',
                                background: 'linear-gradient(135deg, #d4af37, #b8860b)',
                                borderRadius: '8px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#000', fontWeight: 'bold', fontSize: '18px',
                                fontFamily: 'var(--font-serif)'
                            }}>EA</div>
                            <span style={{ fontSize: '24px', fontWeight: 600, letterSpacing: '-0.02em', fontFamily: 'var(--font-serif)' }}>EstateAnalytics</span>
                        </div>
                        <p style={{ color: '#9ca3af', lineHeight: 1.6, fontSize: '14px', maxWidth: '300px' }}>
                            Интеллектуальная платформа для поиска и анализа премиальной недвижимости в Сочи.
                            Инсайты рынка, точные прогнозы и эксклюзивные предложения.
                        </p>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h4 style={{ color: '#d4af37', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px' }}>
                            Навигация
                        </h4>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {['Карта объектов', 'Аналитика', 'Районы', 'Блог'].map(item => (
                                <li key={item}>
                                    <a href="#" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s' }}
                                        onMouseOver={(e) => e.currentTarget.style.color = '#d4af37'}
                                        onMouseOut={(e) => e.currentTarget.style.color = '#d1d5db'}>
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contacts */}
                    <div>
                        <h4 style={{ color: '#d4af37', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px' }}>
                            Контакты
                        </h4>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ color: '#d4af37' }}>📍</span>
                                <span style={{ color: '#e5e7eb', fontSize: '14px' }}>Сочи, Курортный проспект, 59</span>
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ color: '#d4af37' }}>📞</span>
                                <a href="tel:+79990000000" style={{ color: '#e5e7eb', fontSize: '14px', textDecoration: 'none' }}>+7 (999) 000-00-00</a>
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ color: '#d4af37' }}>✉️</span>
                                <a href="mailto:vip@estate-analytics.ru" style={{ color: '#e5e7eb', fontSize: '14px', textDecoration: 'none' }}>vip@estate-analytics.ru</a>
                            </li>
                        </ul>
                    </div>

                    {/* Subscribe */}
                    <div>
                        <h4 style={{ color: '#d4af37', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px' }}>
                            Дайджест
                        </h4>
                        <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '16px' }}>
                            Получайте закрытые отчеты о росте цен раз в месяц.
                        </p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                type="email"
                                placeholder="Ваш Email"
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    padding: '10px 14px',
                                    fontSize: '13px',
                                    color: 'white',
                                    flex: 1,
                                    outline: 'none'
                                }}
                            />
                            <button style={{
                                background: '#d4af37',
                                color: '#000',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '0 16px',
                                cursor: 'pointer',
                                fontWeight: 700
                            }}>→</button>
                        </div>
                    </div>
                </div>

                <div style={{
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    padding: '32px 0 40px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '20px',
                    fontSize: '12px',
                    color: '#6b7280'
                }}>
                    <div>
                        © {currentYear} EstateAnalytics. Premium Real Estate Intelligence.
                    </div>
                    <div style={{ display: 'flex', gap: '24px' }}>
                        <a href="#" style={{ color: '#6b7280', textDecoration: 'none' }}>Конфиденциальность</a>
                        <a href="#" style={{ color: '#6b7280', textDecoration: 'none' }}>Условия использования</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
