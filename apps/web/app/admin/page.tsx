'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './admin.module.css';

interface Stats {
  totalProperties: number;
  activeLeads: number;
  totalValue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ totalProperties: 0, activeLeads: 0, totalValue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        // Загружаем объекты для подсчёта статистики
        const res = await fetch(`${apiUrl}/api/v1/properties`);
        if (res.ok) {
          const properties = await res.json();
          const total = properties.length;
          const totalValue = properties.reduce((sum: number, p: { price?: number }) => sum + (p.price || 0), 0);
          setStats({
            totalProperties: total,
            activeLeads: 0, // TODO: Добавить API для лидов
            totalValue
          });
        }
      } catch {
        // Используем нули при ошибке
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Форматирование цены
  const formatValue = (value: number) => {
    if (value >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toFixed(1)} млрд ₽`;
    }
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(0)} млн ₽`;
    }
    return new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
  };

  return (
    <div>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px', color: '#fff' }}>
          Панель управления
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '15px' }}>
          Добро пожаловать в командный центр EstateAnalytics
        </p>
      </header>

      {/* Stat Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '48px' }}>
        
        {/* Stat Card 1 */}
        <div className={styles.statCard}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div className={styles.statLabel}>Всего объектов</div>
              <div style={{ fontSize: '32px' }}>🏠</div>
            </div>
            <div className={styles.statValue}>
              {loading ? (
                <div className={styles.skeleton} style={{ width: '80px', height: '42px' }} />
              ) : (
                stats.totalProperties
              )}
            </div>
            <div className={`${styles.statChange} ${styles.statChangePositive}`}>
             ↗ Активных на сайте
            </div>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className={styles.statCard}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div className={styles.statLabel}>Активные заявки</div>
              <div style={{ fontSize: '32px' }}>📋</div>
            </div>
            <div className={styles.statValue}>
              {loading ? (
                <div className={styles.skeleton} style={{ width: '60px', height: '42px' }} />
              ) : (
                stats.activeLeads
              )}
            </div>
            <div className={styles.statChange} style={{ color: '#f59e0b' }}>
              ⏳ Ожидают обработки
            </div>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className={styles.statCard}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div className={styles.statLabel}>Общая стоимость</div>
              <div style={{ fontSize: '32px' }}>💰</div>
            </div>
            <div className={styles.statValue} style={{ fontSize: '28px' }}>
              {loading ? (
                <div className={styles.skeleton} style={{ width: '140px', height: '38px' }} />
              ) : (
                formatValue(stats.totalValue)
              )}
            </div>
            <div className={styles.statChange} style={{ color: '#94a3b8' }}>
              📊 Сумма всех объектов
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px', color: '#fff' }}>
          Быстрые действия
        </h2>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Link href="/admin/properties" className={styles.btnPrimary}>
            ➕ Добавить объект
          </Link>
          <Link href="/admin/settings" className={styles.btnSecondary}>
            ⚙️ Настройки сайта
          </Link>
          <Link href="/admin/complexes" className={styles.btnSecondary}>
            🏢 Управление ЖК
          </Link>
        </div>
      </div>

      {/* Recent Activity (Optional) */}
      <div style={{ marginTop: '48px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px', color: '#fff' }}>
          Последние обновления
        </h3>
        <div className={styles.sectionCard}>
          <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>
            История действий появится здесь
          </p>
        </div>
      </div>
    </div>
  );
}

