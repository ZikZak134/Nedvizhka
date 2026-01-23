'use client';

import { PremiumMap } from './components/PremiumMap';

export default function HomePage() {
    return (
        <main style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
            <PremiumMap height="100%" />
        </main>
    );
}
