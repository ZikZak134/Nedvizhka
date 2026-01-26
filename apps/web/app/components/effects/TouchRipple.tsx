'use client';

import React, { useState, useLayoutEffect } from 'react';

// Simple CSS-based ripple implementation for reliability and performance
// Requires parent to have `position: relative` and `overflow: hidden`

export const TouchRipple = ({ color = 'rgba(255, 255, 255, 0.3)' }: { color?: string }) => {
    const [ripples, setRipples] = useState<{ x: number; y: number; size: number; id: number }[]>([]);

    useLayoutEffect(() => {
        let bounce: NodeJS.Timeout | null = null;
        if (ripples.length > 0) {
            bounce = setTimeout(() => {
                setRipples([]);
            }, 600); // Clear ripples after animation matches duration
        }
        return () => {
            if (bounce) clearTimeout(bounce);
        };
    }, [ripples]);

    const createRipple = (event: React.MouseEvent<HTMLDivElement>) => {
        const container = event.currentTarget.getBoundingClientRect();
        const size = container.width > container.height ? container.width : container.height;
        const x = event.clientX - container.left - size / 2;
        const y = event.clientY - container.top - size / 2;
        const newRipple = { x, y, size, id: Date.now() };

        setRipples((prev) => [...prev, newRipple]);
    };

    return (
        <div 
            className="absolute inset-0 cursor-pointer" 
            onMouseDown={createRipple}
            style={{ zIndex: 0 }} // Behind content if content has higher z-index, or use as overlay
        >
            {ripples.map((ripple) => (
                <span
                    key={ripple.id}
                    style={{
                        position: 'absolute',
                        left: ripple.x,
                        top: ripple.y,
                        width: ripple.size,
                        height: ripple.size,
                        borderRadius: '50%',
                        backgroundColor: color,
                        transform: 'scale(0)',
                        animation: 'ripple 600ms linear',
                        pointerEvents: 'none',
                    }}
                />
            ))}
            <style jsx>{`
                @keyframes ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `}</style>
        </div>
    );
};
