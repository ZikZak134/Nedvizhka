'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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
      <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Панель управления</h1>
      <p style={{ color: '#94a3b8', marginBottom: '32px' }}>Добро пожаловать в командный центр.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        {/* Stat Card 1 */}
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '8px' }}>Всего объектов</div>
          <div style={{ fontSize: '36px', fontWeight: 700, color: '#fff' }}>
            {loading ? '...' : stats.totalProperties}
          </div>
          <div style={{ color: '#10b981', fontSize: '13px', marginTop: '4px' }}>Активных на сайте</div>
        </div>

        {/* Stat Card 2 */}
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '8px' }}>Активные заявки</div>
          <div style={{ fontSize: '36px', fontWeight: 700, color: '#fff' }}>
            {loading ? '...' : stats.activeLeads}
          </div>
          <div style={{ color: '#f59e0b', fontSize: '13px', marginTop: '4px' }}>Ожидают обработки</div>
        </div>

        {/* Stat Card 3 */}
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '8px' }}>Общая стоимость</div>
          <div style={{ fontSize: '36px', fontWeight: 700, color: '#fff' }}>
            {loading ? '...' : formatValue(stats.totalValue)}
          </div>
          <div style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>Сумма всех объектов</div>
        </div>
      </div>

      <div style={{ marginTop: '48px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Быстрые действия</h2>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Link href="/admin/properties" style={{ padding: '12px 24px', background: '#d4af37', color: '#000', borderRadius: '12px', border: 'none', fontWeight: 700, cursor: 'pointer', textDecoration: 'none' }}>
            + Добавить объект
          </Link>
          <Link href="/admin/settings" style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '12px', border: 'none', fontWeight: 600, cursor: 'pointer', textDecoration: 'none' }}>
            ⚙️ Настройки сайта
          </Link>
        </div>
      </div>
    </div>
  );
}
