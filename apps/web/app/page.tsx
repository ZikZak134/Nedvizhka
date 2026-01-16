'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Header } from './components/Header';
import styles from './styles/public.module.css';

// Dynamic import for premium map
const PremiumMap = dynamic(
    () => import('./components/PremiumMap').then(mod => mod.PremiumMap),
    { ssr: false, loading: () => <MapLoading /> }
);

function MapLoading() {
    return (
        <div className={styles.mapLoadingContainer}>
            <motion.div 
                animate={{ opacity: [0.6, 1, 0.6], scale: [0.98, 1, 0.98] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className={styles.mapLoadingContent}
            >
                <div className={styles.mapLoadingIcon}>🗺️</div>
                <div className={styles.mapLoadingText}>Загружаем карту инвестиций...</div>
            </motion.div>
        </div>
    );
}

export default function HomePage() {
    return (
        <div className={styles.fullPageContainer}>
            <Header />

            {/* Full Screen Premium Map */}
            <main className={styles.mainContent}>
                <PremiumMap height="100%" />
            </main>
        </div>
    );
}
