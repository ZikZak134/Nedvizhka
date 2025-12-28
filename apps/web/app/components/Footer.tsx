import { NAV_LINKS, UTILITY_LINKS } from '../constants/routes';

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="page-footer" style={{
            background: 'linear-gradient(to bottom, transparent, var(--navy-deep))',
            paddingTop: 'var(--space-2xl)',
            borderTop: '1px solid rgba(212, 175, 55, 0.1)'
        }}>
            <div className="container">
                <div className="grid md:grid-cols-4 gap-12 mb-16">
                    {/* Brand Section */}
                    <div className="col-span-full md:col-span-1">
                        <div className="flex items-center gap-3 mb-6">
                            <div style={{
                                width: '32px',
                                height: '32px',
                                background: 'var(--gold)',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--navy-deep)',
                                fontWeight: 'bold'
                            }}>EA</div>
                            <span className="heading-5" style={{ margin: 0, letterSpacing: '0.05em' }}>EstateAnalytics</span>
                        </div>
                        <p className="body-small" style={{ opacity: 0.8, lineHeight: 1.6 }}>
                            Интеллектуальный анализ и поиск элитной недвижимости в Сочи. Экспертный подход к вашим инвестициям.
                        </p>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h4 className="label mb-6" style={{ color: 'var(--gold)' }}>Навигация</h4>
                        <ul className="stack stack-sm">
                            {NAV_LINKS.map(link => (
                                <li key={link.href}>
                                    <a href={link.href} className="link body-small hover:text-gold transition-colors">
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Important pages */}
                    <div>
                        <h4 className="label mb-6" style={{ color: 'var(--gold)' }}>Компания</h4>
                        <ul className="stack stack-sm">
                            {UTILITY_LINKS.map(link => (
                                <li key={link.href}>
                                    <a href={link.href} className="link body-small hover:text-gold transition-colors">
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                            <li><a href="mailto:info@estate-analytics.ru" className="link body-small hover:text-gold transition-colors">Связаться</a></li>
                        </ul>
                    </div>

                    {/* Newsletter/Trust */}
                    <div>
                        <h4 className="label mb-6" style={{ color: 'var(--gold)' }}>Подписка</h4>
                        <p className="body-xs mb-4" style={{ color: 'var(--gray-400)' }}>Получайте закрытые отчеты о рынке недвижимости раз в месяц.</p>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Email"
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    padding: '8px 12px',
                                    fontSize: '12px',
                                    color: 'white',
                                    width: '100%'
                                }}
                            />
                            <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '12px' }}>→</button>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                    <p className="caption" style={{ color: 'var(--gray-500)' }}>
                        © {currentYear} EstateAnalytics. Проект группы компаний Elite.
                    </p>
                    <div className="flex gap-6">
                        <a href="/privacy" className="link caption hover:text-gold">Конфиденциальность</a>
                        <a href="/terms" className="link caption hover:text-gold">Условия</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
