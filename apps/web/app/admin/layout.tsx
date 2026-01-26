'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthGuard, useAuth } from './components/AuthGuard';
import { ToastProvider } from './components/ToastContainer';
import { 
  IconDashboard, IconHome, IconCity, IconBuilding, 
  IconFolder, IconFileText, IconSettings, IconShield, IconLogOut 
} from './components/AdminIcons';
import styles from './admin.module.css';

// Hamburger Icon (inline SVG)
const IconMenu = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const IconClose = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { getUser, logout } = useAuth();
  const [user, setUser] = useState<{ display_name?: string; role?: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Страница логина не использует sidebar
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!isLoginPage) {
      setUser(getUser());
    }
  }, [isLoginPage]);

  // Закрывать sidebar при смене страницы
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Закрывать sidebar при resize на desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    { label: 'Дашборд', icon: <IconDashboard />, href: '/admin' },
    { label: 'Объекты', icon: <IconHome />, href: '/admin/properties' },
    { label: 'Районы', icon: <IconCity />, href: '/admin/districts' },
    { label: 'ЖК', icon: <IconBuilding />, href: '/admin/complexes' },
    { label: 'Файлы', icon: <IconFolder />, href: '/admin/files' },
    { label: 'Контент', icon: <IconFileText />, href: '/admin/content' },
    { label: 'Настройки', icon: <IconSettings />, href: '/admin/settings' },
  ];

  // Bottom nav items (только 4 главных)
  const bottomNavItems = [
    { label: 'Главная', icon: <IconDashboard size={20} />, href: '/admin' },
    { label: 'Объекты', icon: <IconHome size={20} />, href: '/admin/properties' },
    { label: 'Настройки', icon: <IconSettings size={20} />, href: '/admin/settings' },
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
          {/* Mobile Header */}
          <header className={styles.mobileHeader}>
            <button 
              className={styles.hamburgerBtn}
              onClick={() => setSidebarOpen(true)}
              aria-label="Открыть меню"
            >
              <IconMenu />
            </button>
            <div className={styles.mobileHeaderTitle}>
              <IconShield size={20} />
              <span>Админка</span>
            </div>
            <div className={styles.mobileHeaderAvatar}>
              {(user?.display_name || 'A')[0].toUpperCase()}
            </div>
          </header>

          {/* Backdrop */}
          {sidebarOpen && (
            <div 
              className={styles.sidebarBackdrop}
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <div className={`${styles.adminSidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
            <div className={styles.sidebarHeader}>
              <div className={styles.adminLogo}>
                <IconShield size={24} /> <span>Центр Управления</span>
              </div>
              <button 
                className={styles.sidebarCloseBtn}
                onClick={() => setSidebarOpen(false)}
                aria-label="Закрыть меню"
              >
                <IconClose />
              </button>
            </div>
          
            <nav className={styles.adminNavGroup}>
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link 
                    key={item.href} 
                    href={item.href} 
                    className={`${styles.adminNavItem} ${isActive ? styles.adminNavItemActive : ''}`}
                    onClick={() => setSidebarOpen(false)}
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
                <IconLogOut size={16} /> Выйти
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

          {/* Bottom Navigation (Mobile) */}
          <nav className={styles.bottomNav}>
            {bottomNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.bottomNavItem} ${isActive ? styles.bottomNavItemActive : ''}`}
                >
                  <span className={styles.bottomNavIcon}>{item.icon}</span>
                  <span className={styles.bottomNavLabel}>{item.label}</span>
                </Link>
              );
            })}
            <button
              className={styles.bottomNavItem}
              onClick={() => setSidebarOpen(true)}
            >
              <span className={styles.bottomNavIcon}><IconMenu size={20} /></span>
              <span className={styles.bottomNavLabel}>Меню</span>
            </button>
          </nav>
        </div>
      </ToastProvider>
    </AuthGuard>
  );
}
