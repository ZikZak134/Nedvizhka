/**
 * useMagneticEffect Hook
 * 
 * Creates magnetic button effect where button follows cursor
 * User settings: size: 82, speed: 52, intensity: 38
 */

import { useRef, useCallback } from 'react';

interface MagneticEffectOptions {
    strength?: number; // 0-1, default from CSS var
    scale?: number; // scale factor, default from CSS var
}

export function useMagneticEffect<T extends HTMLElement>(options: MagneticEffectOptions = {}) {
    const elementRef = useRef<T>(null);

    const handleMouseMove = useCallback((e: React.MouseEvent<T>) => {
        const element = elementRef.current;
        if (!element) return;

        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Calculate distance from center
        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;

        // Get strength from options or CSS variable
        const strength = options.strength ?? 0.38; // User's intensity: 38

        // Apply transform
        const translateX = deltaX * strength;
        const translateY = deltaY * strength;

        element.style.transform = `translate(${translateX}px, ${translateY}px)`;
    }, [options.strength]);

    const handleMouseLeave = useCallback(() => {
        const element = elementRef.current;
        if (!element) return;

        element.style.transform = 'translate(0, 0)';
    }, []);

    return {
        ref: elementRef,
        onMouseMove: handleMouseMove,
        onMouseLeave: handleMouseLeave,
    };
}
