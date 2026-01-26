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
        const res = await fetch('/api/v1/properties');
        if (res.ok) {
          const data = await res.json();
          // API возвращает {items: [...], total, pages}, а не просто массив
          const properties = Array.isArray(data) ? data : (Array.isArray(data.items) ? data.items : []);
          const total = properties.length;
          const totalValue = properties.reduce((sum: number, p: { price?: number }) => sum + (p.price || 0), 0);
          setStats({
            totalProperties: total,
            activeLeads: 0,
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
      <header className={styles.dashboardHeader}>
        <h1 className={styles.dashboardTitle}>Панель управления</h1>
        <p className={styles.dashboardSubtitle}>
          Добро пожаловать в командный центр EstateAnalytics
        </p>
      </header>

      {/* Stat Cards Grid */}
      <div className={styles.statsGrid}>
        
        {/* Stat Card 1 */}
        <div className={styles.statCard}>
          <div className={styles.statCardInner}>
            <div className={styles.statCardHeader}>
              <div className={styles.statLabel}>Всего объектов</div>
              <div className={styles.statCardIcon}>🏠</div>
            </div>
            <div className={styles.statValue}>
              {loading ? (
                <div className={`${styles.skeleton} ${styles.skeletonLarge}`} />
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
          <div className={styles.statCardInner}>
            <div className={styles.statCardHeader}>
              <div className={styles.statLabel}>Активные заявки</div>
              <div className={styles.statCardIcon}>📋</div>
            </div>
            <div className={styles.statValue}>
              {loading ? (
                <div className={`${styles.skeleton} ${styles.skeletonMedium}`} />
              ) : (
                stats.activeLeads
              )}
            </div>
            <div className={`${styles.statChange} ${styles.statChangeWarning}`}>
              ⏳ Ожидают обработки
            </div>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className={styles.statCard}>
          <div className={styles.statCardInner}>
            <div className={styles.statCardHeader}>
              <div className={styles.statLabel}>Общая стоимость</div>
              <div className={styles.statCardIcon}>💰</div>
            </div>
            <div className={`${styles.statValue} ${styles.statValueSmall}`}>
              {loading ? (
                <div className={`${styles.skeleton} ${styles.skeletonWide}`} />
              ) : (
                formatValue(stats.totalValue)
              )}
            </div>
            <div className={`${styles.statChange} ${styles.statChangeNeutral}`}>
              📊 Сумма всех объектов
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className={styles.quickActionsTitle}>Быстрые действия</h2>
        <div className={styles.quickActionsGrid}>
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

      {/* Recent Activity */}
      <div className={styles.recentSection}>
        <h3 className={styles.recentTitle}>Последние обновления</h3>
        <div className={styles.sectionCard}>
          <p className={styles.recentEmpty}>
            История действий появится здесь
          </p>
        </div>
      </div>
    </div>
  );
}
