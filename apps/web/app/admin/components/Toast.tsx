'use client';

import { useEffect } from 'react';
import styles from '../admin.module.css';

export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, type, duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  return (
    <div 
      className={`${styles.toast} ${styles[`toast${type.charAt(0).toUpperCase() + type.slice(1)}`]}`}
      onClick={onClose}
    >
      <span className={styles.toastIcon}>{icons[type]}</span>
      <span className={styles.toastMessage}>{message}</span>
      <button 
        className={styles.toastClose}
        onClick={onClose}
        aria-label="Закрыть"
      >
        ×
      </button>
    </div>
  );
}
