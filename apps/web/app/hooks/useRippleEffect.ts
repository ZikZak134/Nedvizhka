/**
 * useRippleEffect Hook
 * 
 * Creates slow, elegant ripple effect on click
 * User settings: size: 70, speed: 4 (very slow, elegant)
 */

import { useCallback, useState } from 'react';

interface Ripple {
    id: number;
    x: number;
    y: number;
}

export function useRippleEffect() {
    const [ripples, setRipples] = useState<Ripple[]>([]);

    const createRipple = useCallback((e: React.MouseEvent<HTMLElement>) => {
        const element = e.currentTarget;
        const rect = element.getBoundingClientRect();

        const ripple: Ripple = {
            id: Date.now(),
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };

        setRipples(prev => [...prev, ripple]);

        // Remove ripple after animation completes
        // Duration: 1000ms - (4 * 10) = 960ms (slow, elegant)
        const duration = 1000 - (4 * 10);
        setTimeout(() => {
            setRipples(prev => prev.filter(r => r.id !== ripple.id));
        }, duration);
    }, []);

    return {
        ripples,
        createRipple,
    };
}
