'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthGuard, useAuth } from './components/AuthGuard';
import { ToastProvider } from './components/ToastContainer';
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
    { label: 'Дашборд', icon: '📊', href: '/admin' },
    { label: 'Объекты', icon: '🏠', href: '/admin/properties' },
    { label: 'Районы', icon: '🏙️', href: '/admin/districts' },
    { label: 'ЖК', icon: '🏢', href: '/admin/complexes' },
    { label: 'Контент', icon: '📝', href: '/admin/content' },
    { label: 'Настройки', icon: '⚙️', href: '/admin/settings' },
  ];

  // Breadcrumbs generation
  const getBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'Админка', href: '/admin' }];
    
    if (segments.length > 1) {
      const current = navItems.find(item => item.href === pathname);
      if (current) {
        breadcrumbs.push({ label: current.label, href: pathname });
      } else {
        breadcrumbs.push({ label: segments[segments.length - 1], href: pathname });
      }
    }
    
    return breadcrumbs;
  };

  // Для страницы логина — простой layout без sidebar
  if (isLoginPage) {
    return <ToastProvider>{children}</ToastProvider>;
  }

  return (
    <AuthGuard>
      <ToastProvider>
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
                    <span className={styles.adminNavIcon}>{item.icon}</span>
                    <span>{item.label}</span>
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
              <Link href="/" className={`${styles.adminNavItem} ${styles.backToSiteLink}`}>
                <span className={styles.backToSiteIcon}>←</span>
                <span>Вернуться на сайт</span>
              </Link>
            </div>
          </div>

          {/* Main Content */}
          <div className={styles.adminMainContent}>
            {/* Breadcrumbs */}
            {!isLoginPage && pathname !== '/admin' && (
              <nav className={styles.breadcrumbsWrapper}>
                <ol className={styles.breadcrumbsList}>
                  {getBreadcrumbs().map((crumb, index, arr) => (
                    <li key={crumb.href} className={styles.breadcrumbItem}>
                      {index > 0 && <span className={styles.breadcrumbSeparator}>/</span>}
                      {index === arr.length - 1 ? (
                        <span className={styles.breadcrumbCurrent}>
                          {crumb.label}
                        </span>
                      ) : (
                        <Link href={crumb.href} className={styles.breadcrumbLink}>
                          {crumb.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
            )}
            {children}
          </div>
        </div>
      </ToastProvider>
    </AuthGuard>
  );
}
