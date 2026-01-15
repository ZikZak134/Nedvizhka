'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface RevealProps {
    children: string;
    delay?: number;
    className?: string;
}

export const Reveal = ({ children, delay = 0, className = '' }: RevealProps) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    return (
        <span className={className} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom' }}>
            <motion.span
                ref={ref}
                initial={{ y: "100%" }}
                animate={isInView ? { y: 0 } : { y: "100%" }}
                transition={{ duration: 0.5, delay, ease: [0.33, 1, 0.68, 1] }}
                style={{ display: 'inline-block' }}
            >
                {children}
            </motion.span>
        </span>
    );
};
