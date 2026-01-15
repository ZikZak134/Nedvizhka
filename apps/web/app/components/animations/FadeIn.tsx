'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface FadeInProps {
    children: React.ReactNode;
    delay?: number;
    direction?: 'up' | 'down' | 'left' | 'right' | 'none';
    duration?: number;
    className?: string;
    fullWidth?: boolean;
}

export const FadeIn = ({ 
    children, 
    delay = 0, 
    direction = 'up', 
    duration = 0.5,
    className = '',
    fullWidth = false 
}: FadeInProps) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-10% 0px" });

    const getVariants = () => {
        const distance = 40;
        const variants = {
            hidden: { opacity: 0, x: 0, y: 0 },
            visible: { opacity: 1, x: 0, y: 0 }
        };

        if (direction === 'up') variants.hidden.y = distance;
        if (direction === 'down') variants.hidden.y = -distance;
        if (direction === 'left') variants.hidden.x = distance;
        if (direction === 'right') variants.hidden.x = -distance;

        return variants;
    };

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={getVariants()}
            transition={{ duration, delay, ease: "easeOut" }}
            className={className}
            style={{ width: fullWidth ? '100%' : 'auto' }}
        >
            {children}
        </motion.div>
    );
};
