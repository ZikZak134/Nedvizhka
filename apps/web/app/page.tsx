'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Header } from './components/Header';
// Dynamic import for premium map
const PremiumMap = dynamic(
    () => import('./components/PremiumMap').then(mod => mod.PremiumMap),
    { ssr: false, loading: () => <MapLoading /> }
);

function MapLoading() {
    return (
        <div style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f172a, #1e293b)'
        }}>
            <div style={{ color: '#fff', textAlign: 'center' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>🗺️</div>
                <div style={{ fontSize: '18px', fontWeight: 600 }}>Загружаем карту инвестиций...</div>
            </div>
        </div>
    );
}

export default function HomePage() {
    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            background: '#0f172a'
        }}>
            <Header />

            {/* Full Screen Premium Map */}
            <main style={{ flex: 1, position: 'relative' }}>
                <PremiumMap height="100%" />
            </main>
        </div>
    );
}
