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
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 w-screen h-screen z-[9998] bg-primary-900 mobile-menu-overlay"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Menu Content */}
                    <div className="fixed inset-0 w-screen h-screen z-[9999] bg-gradient-to-b from-primary-900 via-primary-800 to-primary-900 flex flex-col items-center justify-center p-5 overflow-y-auto mobile-menu-content">
                        {/* Close Button */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-5 right-5 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 border border-white/20 text-white active:scale-95 transition-transform"
                            aria-label="Закрыть меню"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Logo */}
                        <div className="mb-12 text-center mobile-nav-item" style={{ animationDelay: '0.05s' }}>
                            <div className="text-3xl font-display font-bold text-accent-500 tracking-wide">
                                EstateAnalytics
                            </div>
                            <div className="text-xs text-white/50 mt-2 tracking-[0.2em] uppercase">
                                Элитная недвижимость
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <nav className="flex flex-col items-center gap-3 w-full max-w-[280px]">
                            {NAV_LINKS.map((link, index) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`
                                        mobile-nav-item flex items-center gap-4 w-full p-4 rounded-xl no-underline 
                                        font-display text-lg font-semibold transition-all duration-200
                                        ${pathname === link.href 
                                            ? 'text-accent-500 bg-accent-500/15 border border-accent-500/30' 
                                            : 'text-white bg-white/5 border border-white/10 active:bg-white/10 active:scale-[0.98]'}

                                    `}
                                    style={{ animationDelay: `${0.1 + index * 0.05}s` }}
                                >
                                    <span className="text-2xl">{link.icon}</span>
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        {/* Theme Toggle */}
                        <div className="mt-12 flex flex-col items-center gap-3 mobile-nav-item" style={{ animationDelay: '0.4s' }}>
                            <span className="text-xs text-white/50 tracking-widest uppercase">
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
