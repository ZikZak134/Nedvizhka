'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface PageTransitionProps {
    children: ReactNode;
}

export const PageTransition = ({ children }: PageTransitionProps) => {
    const pathname = usePathname();

    const variants = {
        hidden: { opacity: 0, x: 0, y: 10 },
        enter: { opacity: 1, x: 0, y: 0 },
        exit: { opacity: 0, x: 0, y: -10 },
    };

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pathname}
                initial="hidden"
                animate="enter"
                exit="exit"
                variants={variants}
                transition={{ duration: 0.55, ease: "easeInOut" }} // Premium smooth transition
                className="w-full flex-grow flex flex-col"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
};
