import React from 'react';
import styles from '../admin.module.css';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export const Section: React.FC<SectionProps> = ({ title, children, actions }) => {
  return (
    <section className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        {actions && <div>{actions}</div>}
      </div>
      <div>
        {children}
      </div>
    </section>
  );
};
