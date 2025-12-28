'use client';

import { useState, useEffect } from 'react';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

const getBreakpoint = (width: number): Breakpoint => {
    if (width < 480) return 'xs';
    if (width < 768) return 'sm';
    if (width < 960) return 'md';
    if (width < 1200) return 'lg';
    if (width < 1600) return 'xl';
    if (width < 2000) return '2xl';
    return '3xl';
};

export function useBreakpoint() {
    const [breakpoint, setBreakpoint] = useState<Breakpoint>('lg'); // Default to lg for SSR safely or just init

    useEffect(() => {
        // Init on mount
        const handleResize = () => {
            setBreakpoint(getBreakpoint(window.innerWidth));
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return {
        breakpoint,
        isXs: breakpoint === 'xs',
        isSm: breakpoint === 'sm',
        isMd: breakpoint === 'md',
        isLg: breakpoint === 'lg',
        isXl: breakpoint === 'xl',
        is2xl: breakpoint === '2xl',
        is3xl: breakpoint === '3xl',
        isMobile: breakpoint === 'xs' || breakpoint === 'sm',
        isTablet: breakpoint === 'md' || breakpoint === 'lg',
        isDesktop: breakpoint === 'xl' || breakpoint === '2xl' || breakpoint === '3xl',
    };
}
