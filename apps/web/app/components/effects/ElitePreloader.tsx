'use client';

/**
 * ElitePreloader Component
 * 
 * Luxury gradient wave preloader
 * User settings: speed: 40
 */

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export function ElitePreloader() {
    const [isLoading, setIsLoading] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        // Only show if it's a client-side route change
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);

        return () => {
            clearTimeout(timer);
            setIsLoading(false);
        };
    }, [pathname]);

    if (!isLoading) return null;

    return (
        <div className="elite-preloader">
            <div className="elite-preloader-wave" />
            <div className="elite-preloader-text">Loading...</div>
        </div>
    );
}
