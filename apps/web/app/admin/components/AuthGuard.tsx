'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import styles from '../admin.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface User {
    id: string;
    username: string;
    display_name: string;
    role: string;
}

interface AuthGuardProps {
    children: React.ReactNode;
}

/**
 * AuthGuard — компонент защиты админ-маршрутов.
 * Проверяет наличие и валидность JWT токена.
 * Если токен отсутствует или невалиден — редирект на /admin/login.
 */
export function AuthGuard({ children }: AuthGuardProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // Страница логина не требует авторизации
        if (pathname === '/admin/login') {
            setIsLoading(false);
            setIsAuthenticated(true);
            return;
        }

        const checkAuth = async () => {
            const token = localStorage.getItem('admin_token');
            
            if (!token) {
                router.push('/admin/login');
                return;
            }

            try {
                const res = await fetch(`${API_URL}/api/v1/auth/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const userData = await res.json();
                    setUser(userData);
                    setIsAuthenticated(true);
                } else {
                    // Токен невалиден — удаляем и редиректим
                    localStorage.removeItem('admin_token');
                    localStorage.removeItem('admin_user');
                    router.push('/admin/login');
                }
            } catch {
                // Ошибка сети — пробуем использовать кешированного пользователя
                const cachedUser = localStorage.getItem('admin_user');
                if (cachedUser) {
                    setUser(JSON.parse(cachedUser));
                    setIsAuthenticated(true);
                } else {
                    router.push('/admin/login');
                }
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [pathname, router]);

    if (isLoading) {
        return (
            <div className={styles.authLoading}>
                <div className={styles.authLoadingContent}>
                    <div className={styles.authSpinner} />
                    <div className={styles.authLoadingText}>Проверка авторизации...</div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated && pathname !== '/admin/login') {
        return null;
    }

    return <>{children}</>;
}

/**
 * Хук для получения текущего пользователя и функции logout.
 */
export function useAuth() {
    const router = useRouter();

    const getUser = (): User | null => {
        if (typeof window === 'undefined') return null;
        const cached = localStorage.getItem('admin_user');
        return cached ? JSON.parse(cached) : null;
    };

    const getToken = (): string | null => {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('admin_token');
    };

    const logout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        router.push('/admin/login');
    };

    const authFetch = async (url: string, options: RequestInit = {}) => {
        const token = getToken();
        const headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        return fetch(url, { ...options, headers });
    };

    return { getUser, getToken, logout, authFetch };
}
