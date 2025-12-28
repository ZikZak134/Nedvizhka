'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';
import { NAV_LINKS } from '../constants/routes';

export function HamburgerMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    // Close menu when route changes
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    // Lock body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            // Also prevent touch scrolling on iOS
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
        } else {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        };
    }, [isOpen]);

    return (
        <div className="md:hidden">
            {/* Hamburger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="btn btn-ghost"
                style={{ padding: '8px', zIndex: 100, position: 'relative' }}
                aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
                <div style={{
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: '6px'
                }}>
                    <span
                        style={{
                            width: '100%',
                            height: '2px',
                            background: 'currentColor',
                            transition: 'all 0.3s ease',
                            transform: isOpen ? 'rotate(45deg) translate(6px, 6px)' : 'none'
                        }}
                    />
                    <span
                        style={{
                            width: '100%',
                            height: '2px',
                            background: 'currentColor',
                            transition: 'all 0.3s ease',
                            opacity: isOpen ? 0 : 1
                        }}
                    />
                    <span
                        style={{
                            width: '100%',
                            height: '2px',
                            background: 'currentColor',
                            transition: 'all 0.3s ease',
                            transform: isOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none'
                        }}
                    />
                </div>
            </button>

            {/* Mobile Menu Overlay */}
            {isOpen && (
                <>
                    {/* Backdrop - полностью непрозрачный */}
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            width: '100vw',
                            height: '100vh',
                            zIndex: 9998,
                            backgroundColor: '#0a1128'
                        }}
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Menu Content */}
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            width: '100vw',
                            height: '100vh',
                            zIndex: 9999,
                            background: 'linear-gradient(180deg, #0a1128 0%, #1a2742 50%, #0a1128 100%)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '20px',
                            overflowY: 'auto'
                        }}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{
                                position: 'absolute',
                                top: '20px',
                                right: '20px',
                                width: '48px',
                                height: '48px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: '#ffffff'
                            }}
                            aria-label="Закрыть меню"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Logo */}
                        <div style={{ marginBottom: '48px', textAlign: 'center' }}>
                            <div style={{
                                fontSize: '32px',
                                fontFamily: 'var(--font-heading)',
                                fontWeight: 700,
                                color: '#d4af37',
                                letterSpacing: '0.05em'
                            }}>
                                EstateAnalytics
                            </div>
                            <div style={{
                                fontSize: '12px',
                                color: 'rgba(255, 255, 255, 0.5)',
                                marginTop: '8px',
                                letterSpacing: '0.2em',
                                textTransform: 'uppercase'
                            }}>
                                Элитная недвижимость
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <nav style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '12px',
                            width: '100%',
                            maxWidth: '280px'
                        }}>
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                        width: '100%',
                                        padding: '16px 24px',
                                        borderRadius: '16px',
                                        textDecoration: 'none',
                                        fontFamily: 'var(--font-heading)',
                                        fontSize: '18px',
                                        fontWeight: 600,
                                        color: pathname === link.href ? '#d4af37' : '#ffffff',
                                        background: pathname === link.href
                                            ? 'rgba(212, 175, 55, 0.15)'
                                            : 'rgba(255, 255, 255, 0.05)',
                                        border: pathname === link.href
                                            ? '1px solid rgba(212, 175, 55, 0.3)'
                                            : '1px solid rgba(255, 255, 255, 0.1)',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <span style={{ fontSize: '24px' }}>{link.icon}</span>
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        {/* Theme Toggle */}
                        <div style={{
                            marginTop: '48px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <span style={{
                                fontSize: '12px',
                                color: 'rgba(255, 255, 255, 0.5)',
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase'
                            }}>
                                Тема оформления
                            </span>
                            <ThemeToggle />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
