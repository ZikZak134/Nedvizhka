import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export default function AboutPage() {
    return (
        <div className="page">
            <Header />

            <main className="page-main">
                <section className="section">
                    <div className="container container-narrow">
                        <span className="badge badge-accent mb-4">О проекте</span>
                        <h1 className="heading-2 mb-6">EstateAnalytics</h1>

                        <div className="prose">
                            <p className="body-large mb-8">
                                Аналитическая платформа для рынка элитной недвижимости Сочи.
                                Мы помогаем инвесторам и покупателям принимать обоснованные решения
                                на основе данных рынка.
                            </p>

                            <h2 className="heading-4 mb-4">Что мы делаем</h2>
                            <ul className="stack stack-sm mb-8">
                                <li className="body-base">📊 Агрегируем данные с ведущих площадок (ЦИАН, Авито)</li>
                                <li className="body-base">📈 Анализируем динамику цен в реальном времени</li>
                                <li className="body-base">🗺️ Предоставляем карту объектов с фильтрацией</li>
                                <li className="body-base">🤖 Используем AI для прогнозирования трендов</li>
                            </ul>

                            <h2 className="heading-4 mb-4">Технологии</h2>
                            <div className="grid md:grid-cols-2 gap-4 mb-8">
                                <div className="card" style={{ padding: 'var(--space-4)' }}>
                                    <h3 className="heading-6 mb-2">Backend</h3>
                                    <p className="body-small">Python, FastAPI, SQLAlchemy, PostgreSQL, TimescaleDB</p>
                                </div>
                                <div className="card" style={{ padding: 'var(--space-4)' }}>
                                    <h3 className="heading-6 mb-2">Frontend</h3>
                                    <p className="body-small">Next.js 15, TypeScript, CSS Design System</p>
                                </div>
                            </div>

                            <h2 className="heading-4 mb-4">Контакты</h2>
                            <div className="stack stack-sm">
                                <p className="body-base">📍 Сочи, Россия</p>
                                <p className="body-base">✉️ <a href="mailto:info@estate-analytics.ru" className="link">info@estate-analytics.ru</a></p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
