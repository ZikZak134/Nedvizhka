'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthGuard, useAuth } from './components/AuthGuard';
import styles from './admin.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { getUser, logout } = useAuth();
  const [user, setUser] = useState<{ display_name?: string; role?: string } | null>(null);

  // Страница логина не использует sidebar
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!isLoginPage) {
      setUser(getUser());
    }
  }, [isLoginPage]);

  const navItems = [
    { label: '📊 Дашборд', href: '/admin' },
    { label: '🏠 Объекты', href: '/admin/properties' },
    { label: '🏙️ Районы', href: '/admin/districts' },
    { label: '🏢 ЖК', href: '/admin/complexes' },
    { label: '📝 Контент', href: '/admin/content' },
    { label: '⚙️ Настройки', href: '/admin/settings' },
  ];

  // Для страницы логина — простой layout без sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <AuthGuard>
      <div className={styles.adminContainer}>
        {/* Sidebar */}
        <div className={styles.adminSidebar}>
          <div className={styles.adminLogo}>
            🛡️ Центр Управления
          </div>
          
          <nav className={styles.adminNavGroup}>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  className={`${styles.adminNavItem} ${isActive ? styles.adminNavItemActive : ''}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className={styles.adminUserSection}>
            <div className={styles.adminUserInfo}>
              <div className={styles.adminUserAvatar}>
                {(user?.display_name || 'A')[0].toUpperCase()}
              </div>
              <div>
                <div className={styles.adminUserName}>{user?.display_name || 'Администратор'}</div>
                <div className={styles.adminUserRole}>{user?.role || ''}</div>
              </div>
            </div>
            <button onClick={logout} className={styles.adminLogoutBtn}>
              🚪 Выйти
            </button>
            <Link href="/" className={styles.adminNavItem}>
              ← Вернуться на сайт
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className={styles.adminMainContent}>
          {children}
        </div>
      </div>
    </AuthGuard>
  );
}
