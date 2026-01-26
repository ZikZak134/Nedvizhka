'use client';

import { motion, Variants } from 'framer-motion';
import { ReactNode } from 'react';

interface StaggerContainerProps {
    children: ReactNode;
    className?: string;
    delayChildren?: number;
    staggerChildren?: number;
    tag?: keyof JSX.IntrinsicElements; // Allow changing the wrapper tag (e.g., 'ul', 'div')
}

export const StaggerContainer = ({
    children,
    className = '',
    delayChildren = 0.1,
    staggerChildren = 0.1,
    tag = 'div' // Default to div
}: StaggerContainerProps) => {
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                delayChildren,
                staggerChildren
            }
        }
    };

    const Component = motion[tag as keyof typeof motion] as any; // Cast for flexibility

    return (
        <Component
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className={className}
        >
            {children}
        </Component>
    );
};

interface StaggerItemProps {
    children: ReactNode;
    className?: string;
    variants?: Variants; // Allow overriding default item variants
    tag?: keyof JSX.IntrinsicElements;
}

export const StaggerItem = ({
    children,
    className = '',
    variants,
    tag = 'div'
}: StaggerItemProps) => {
    const defaultItemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50, damping: 15 } } // Springy upscale feel
    };

    const Component = motion[tag as keyof typeof motion] as any;

    return (
        <Component
            variants={variants || defaultItemVariants}
            className={className}
        >
            {children}
        </Component>
    );
};
