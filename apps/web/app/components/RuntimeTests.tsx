'use client';

import { useEffect } from 'react';

/**
 * RuntimeTests - компонент для диагностики фронтенда при запуске.
 * Выполняет проверки API и структуры данных, результаты пишет в консоль.
 */
export function RuntimeTests() {
    useEffect(() => {
        if (process.env.NODE_ENV !== 'development') return;

        console.group('🔍 [RuntimeTests] Starting checks...');
        
        const runChecks = async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            console.log('Environment:', {
                NODE_ENV: process.env.NODE_ENV,
                API_URL: apiUrl
            });

            // 1. Health Check
            try {
                console.time('Health Check');
                const healthRes = await fetch(`${apiUrl}/healthz`);
                const healthData = await healthRes.json();
                console.log('✅ Health Check:', healthRes.status, healthData);
                console.timeEnd('Health Check');
            } catch (err) {
                console.error('❌ Health Check Failed:', err);
            }

            // 2. Heatmap Structure Check
            try {
                console.time('Heatmap Check');
                const heatRes = await fetch(`${apiUrl}/api/v1/heatmap`);
                const heatData = await heatRes.json();
                
                if (heatData && typeof heatData === 'object' && Array.isArray(heatData.features)) {
                    console.log(`✅ Heatmap Data Valid: ${heatData.features.length} features`);
                } else if (Array.isArray(heatData)) {
                    console.log(`⚠️ Heatmap returned array directly (expected GeoJSON):`, heatData.length);
                } else {
                    console.error('❌ Heatmap Invalid Structure:', heatData);
                }
                console.timeEnd('Heatmap Check');
            } catch (err) {
                console.error('❌ Heatmap Check Failed:', err);
            }

            console.groupEnd();
        };

        runChecks();
    }, []);

    return null; // Renderless component
}
