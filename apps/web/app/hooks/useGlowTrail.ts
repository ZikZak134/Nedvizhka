/**
 * useGlowTrail Hook
 * 
 * Creates golden glow trail effect following cursor
 * User settings: size: 25, speed: 98, intensity: 8, color: #c3a234
 */

import { useEffect, useState } from 'react';

interface GlowParticle {
    id: number;
    x: number;
    y: number;
}

export function useGlowTrail(enabled: boolean = true) {
    const [particles, setParticles] = useState<GlowParticle[]>([]);

    useEffect(() => {
        if (!enabled) return;

        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        // Check if mobile (disable on mobile for performance)
        const isMobile = window.innerWidth <= 768;
        if (isMobile) return;

        const handleMouseMove = (e: MouseEvent) => {
            const particle: GlowParticle = {
                id: Date.now() + Math.random(),
                x: e.clientX,
                y: e.clientY,
            };

            setParticles(prev => {
                // Limit to last 10 particles for performance
                const updated = [...prev, particle].slice(-10);
                return updated;
            });

            // Remove particle after fade duration (very fast: speed 98)
            // Fade duration: 800ms - (98 * 8) = 16ms (very fast fade)
            const fadeDuration = 800 - (98 * 8);
            setTimeout(() => {
                setParticles(prev => prev.filter(p => p.id !== particle.id));
            }, Math.max(fadeDuration, 100)); // Min 100ms for visibility
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [enabled]);

    return particles;
}
