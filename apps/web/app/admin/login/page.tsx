'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../admin.module.css';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
// Ensure no trailing slash
const API_URL = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;

export default function AdminLoginPage() {
    const router = useRouter();
    const [isSetup, setIsSetup] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState({ username: '', password: '' });

    // Проверяем есть ли уже авторизация
    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        if (token) {
            // Проверяем валидность токена
            fetch(`${API_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => {
                    if (res.ok) {
                        router.push('/admin');
                    } else {
                        localStorage.removeItem('admin_token');
                        setLoading(false);
                    }
                })
                .catch(() => {
                    localStorage.removeItem('admin_token');
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const endpoint = isSetup ? '/auth/setup' : '/auth/login';
            const res = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            const data = await res.json();

            if (res.ok) {
                if (isSetup) {
                    // После setup переключаемся на логин
                    setIsSetup(false);
                    setError(null);
                    alert('Администратор создан! Теперь войдите.');
                } else {
                    // Сохраняем токен и редиректим
                    localStorage.setItem('admin_token', data.access_token);
                    localStorage.setItem('admin_user', JSON.stringify(data.user));
                    router.push('/admin');
                }
            } else {
                if (res.status === 403 && data.detail?.includes('Первичная настройка уже выполнена')) {
                    setIsSetup(false);
                }
                setError(data.detail || 'Ошибка авторизации');
            }
        } catch {
            setError('Не удалось подключиться к серверу');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.loginContainer}>
                <div className={styles.loginCard}>
                    <div className={styles.authLoadingText}>Проверка авторизации...</div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.loginContainer}>
            <div className={styles.loginCard}>
                {/* Header */}
                <div className={styles.loginHeader}>
                    <div className={styles.loginLogo}>🛡️</div>
                    <h1 className={styles.loginTitle}>EstateAnalytics</h1>
                    <p className={styles.loginSubtitle}>
                        {isSetup ? 'Первичная настройка' : 'Панель администратора'}
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className={styles.loginError}>{error}</div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className={styles.loginForm}>
                    <div className={styles.loginInputGroup}>
                        <span className={styles.loginInputIcon}>👤</span>
                        <input
                            type="text"
                            value={form.username}
                            onChange={e => setForm({ ...form, username: e.target.value })}
                            className={styles.loginInput}
                            placeholder="admin"
                            required
                            autoFocus
                        />
                    </div>

                    <div className={styles.loginInputGroup}>
                        <span className={styles.loginInputIcon}>🔒</span>
                        <input
                            type="password"
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            className={styles.loginInput}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className={`${styles.loginButton} ${styles.loginButtonPrimary}`}
                    >
                        {submitting ? '⏳ Подождите...' : (isSetup ? '🔐 Создать администратора' : '🔑 Войти')}
                    </button>
                </form>

                {/* Switch mode */}
                <div className={styles.loginToggle}>
                    <span className={styles.loginToggleText}>
                        {isSetup ? 'Уже есть аккаунт?' : 'Первый вход?'}
                    </span>
                    <span 
                        className={styles.loginToggleLink}
                        onClick={() => setIsSetup(!isSetup)}
                    >
                        {isSetup ? 'Войти' : 'Создать администратора'}
                    </span>
                </div>
            </div>
        </div>
    );
}
