'use client';

import styles from '../admin.module.css';

export default function ContentManagementPage() {
  return (
    <div className={styles.adminContent}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Контент</h1>
        <p className={styles.pageSubtitle}>
          Управление контентом и настройками сайта
        </p>
      </div>

      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📝</span>
          <h2 className={styles.sectionTitle}>Управление контентом</h2>
        </div>
        <p className={styles.sectionDescription}>
          Эта страница находится в разработке. Здесь будут настройки текстового контента, баннеров и других элементов сайта.
        </p>
      </div>
    </div>
  );
}
