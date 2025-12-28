'use client';

/**
 * GlowTrailOverlay Component
 * 
 * Renders golden glow particles following cursor
 * Automatically disabled on mobile and for reduced motion
 */

import { useGlowTrail } from '../../hooks/useGlowTrail';

export function GlowTrailOverlay() {
    const particles = useGlowTrail(true);

    if (particles.length === 0) return null;

    return (
        <>
            {particles.map(particle => (
                <div
                    key={particle.id}
                    className="elite-glow-trail-particle"
                    style={{
                        left: particle.x,
                        top: particle.y,
                    }}
                />
            ))}
        </>
    );
}
