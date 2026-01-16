'use client';

import styles from '../admin.module.css';

export default function ContentManagementPage() {
  return (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
          Контент
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px' }}>
          Управление контентом и настройками сайта
        </p>
      </div>

      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📝</span>
          <h2 className={styles.sectionTitle}>Управление контентом</h2>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
          Эта страница находится в разработке. Здесь будут настройки текстового контента, баннеров и других элементов сайта.
        </p>
      </div>
    </div>
  );
}
