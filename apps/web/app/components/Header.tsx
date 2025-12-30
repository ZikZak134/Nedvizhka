'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { HamburgerMenu } from './HamburgerMenu';
import { AboutDrawer } from './AboutDrawer';
import { useMagneticEffect } from '../hooks/useMagneticEffect';
import { useRippleEffect } from '../hooks/useRippleEffect';
import { NAV_LINKS } from '../constants/routes';

export function Header() {
    const [isAboutOpen, setIsAboutOpen] = useState(false);
    const logoMagnetic = useMagneticEffect<HTMLAnchorElement>({ strength: 0.38 });
    const { ripples, createRipple } = useRippleEffect();

    return (
        <>
            <header className="page-header elite-glass" style={{
                position: 'sticky',
                top: 0,
                zIndex: 10000, /* Выше bottom-sheet (9990) чтобы мобильное меню перекрывало карточку */
            }}>
                <div className="container">
                    <div className="page-header-inner" style={{ position: 'relative' }}>
                        {/* Logo with Magnetic Effect */}
                        <Link
                            href="/"
                            className="flex items-center gap-2 elite-magnetic-btn"
                            {...logoMagnetic}
                        >
                            <div style={{
                                width: '36px',
                                height: '36px',
                                background: 'linear-gradient(135deg, var(--elite-accent-gold), var(--elite-accent-gold-muted))',
                                borderRadius: 'var(--radius-lg)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--elite-bg-primary)',
                                fontWeight: 'bold',
                                fontSize: '18px',
                                boxShadow: 'var(--shadow-gold)',
                            }}>
                                EA
                            </div>
                            <span className="heading-5 hide-mobile" style={{
                                margin: 0,
                                color: 'var(--white)',
                                letterSpacing: '0.02em',
                                transition: 'color 0.3s ease'
                            }}
                                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--elite-accent-gold)'}
                                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--white)'}
                            >
                                EstateAnalytics
                            </span>
                        </Link>

                        {/* About Company Button - CENTER */}
                        <button
                            className="about-btn-vintage"
                            onClick={() => setIsAboutOpen(true)}
                            aria-label="О компании"
                        >
                            <span className="about-btn-text">О КОМПАНИИ</span>
                            <span className="about-btn-arrow">▼</span>
                        </button>

                        {/* Desktop Navigation with Ripple */}
                        <nav className="hidden md:flex items-center gap-6 elite-ripple" style={{ position: 'relative' }}>
                            {NAV_LINKS.map((link) => (
                                <Link key={link.href} href={link.href} className="link body-base" onClick={createRipple}>
                                    {link.label}
                                </Link>
                            ))}
                            <ThemeToggle />

                            {/* Ripple Waves */}
                            {ripples.map(ripple => (
                                <span
                                    key={ripple.id}
                                    className="elite-ripple-wave"
                                    style={{
                                        left: ripple.x,
                                        top: ripple.y,
                                        width: '10px',
                                        height: '10px',
                                    }}
                                />
                            ))}
                        </nav>

                        {/* Mobile Navigation */}
                        <div className="md:hidden">
                            <HamburgerMenu />
                        </div>
                    </div>
                </div>
            </header>

            {/* About Drawer */}
            <AboutDrawer isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
        </>
    );
}


