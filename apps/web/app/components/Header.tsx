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
            <header className="page-header elite-glass sticky top-0 z-[10000]" style={{
                /* Выше bottom-sheet (9990) чтобы мобильное меню перекрывало карточку */
            }}>
                <div className="container">
                    <div className="page-header-inner relative">
                        {/* Logo with Magnetic Effect */}
                        <Link
                            href="/"
                            className="flex items-center gap-2 elite-magnetic-btn group"
                            {...logoMagnetic}
                        >
                            <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 shadow-premium-gold text-primary-900 font-bold text-lg">
                                EA
                            </div>
                            <span className="heading-5 hidden md:block m-0 text-white tracking-wide transition-colors duration-300 group-hover:text-accent-400">
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


