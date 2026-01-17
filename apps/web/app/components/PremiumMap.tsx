/* eslint-disable react/no-inline-styles */
/**
 * PremiumMap — интерактивная карта недвижимости.
 * Использует inline стили для динамических элементов карты (маркеры, панели, фильтры).
 * Это стандартный паттерн для компонентов карт с высокой динамикой UI.
 */
'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import styles from './premium-map.module.css';
import { useBreakpoint } from '../hooks/useBreakpoint';
import districtData from '../data/sochi_districts.json';
import { getMockImage } from '../utils/mockImages';
import { getMockLocation } from '../utils/mockLocations';

// Lazy load heavy sidebar components
const NewsFeed = dynamic(() => import('./NewsFeed').then(m => m.NewsFeed), { ssr: false });
const SocialFeed = dynamic(() => import('./SocialFeed').then(m => m.SocialFeed), { ssr: false });
const DistrictDetails = dynamic(() => import('./DistrictDetails').then(m => m.DistrictDetails), { ssr: false });
const MobileNewsCarousel = dynamic(() => import('./MobileNewsCarousel').then(m => m.MobileNewsCarousel), { ssr: false });
const SMIFeed = dynamic(() => import('./SMIFeed').then(m => m.SMIFeed), { ssr: false });
const PropertyLocation = dynamic(() => import('./PropertyLocation').then(m => m.PropertyLocation), { ssr: false });
const PropertyPotential = dynamic(() => import('./PropertyPotential').then(m => m.PropertyPotential), { ssr: false });
const PropertySurroundings = dynamic(() => import('./PropertySurroundings').then(m => m.PropertySurroundings), { ssr: false });

// ============================================
// TYPES — для районов и ЖК из API
// ============================================

interface DistrictData {
    name: string;
    avg_price_sqm: number;
    growth_5y: number;
    growth_10y: number;
    objects_count: number;
    roi: number;
    risk_level: string;
    center_lat: number;
    center_lng: number;
    coordinates?: number[][];
}

interface ComplexData {
    id: string | number;
    name: string;
    growth: number;
    price_sqm: number;
    min_price: number;
    center_lat: number;
    center_lng: number;
    tags: string[];
    image: string;
}

// ============================================
// FALLBACK DATA (загружается из API, если доступен)
// ============================================

const FALLBACK_DISTRICTS: Record<string, {
    avg_price_sqm: number;
    growth_5y: number;
    growth_10y: number;
    objects: number;
    roi: number;
    risk: string;
    center: [number, number];
    coordinates?: number[][];
}> = {
    "Красная Поляна": {
        avg_price_sqm: 520000,
        growth_5y: 110,
        growth_10y: 180,
        objects: 45,
        roi: 14,
        risk: 'low',
        center: [43.6831, 40.2048],
        coordinates: [
            [43.70, 40.19], [43.71, 40.24], [43.68, 40.27], [43.66, 40.22], [43.68, 40.17]
        ]
    },
    "Центральный": {
        avg_price_sqm: 450000,
        growth_5y: 87,
        growth_10y: 145,
        objects: 120,
        roi: 11,
        risk: 'low',
        center: [43.5855, 39.7231],
        coordinates: [
            [43.60, 39.71], [43.59, 39.74], [43.58, 39.74], [43.57, 39.73], [43.58, 39.70], [43.59, 39.70]
        ]
    },
    "Адлер": {
        avg_price_sqm: 380000,
        growth_5y: 65,
        growth_10y: 120,
        objects: 95,
        roi: 9,
        risk: 'medium',
        center: [43.4281, 39.9226],
        coordinates: [
            [43.46, 39.91], [43.45, 39.95], [43.42, 39.96], [43.41, 39.92], [43.43, 39.90]
        ]
    },
    "Хоста": {
        avg_price_sqm: 320000,
        growth_5y: 45,
        growth_10y: 95,
        objects: 35,
        roi: 7,
        risk: 'medium',
        center: [43.5147, 39.8631],
        coordinates: [
            [43.53, 39.84], [43.52, 39.88], [43.50, 39.89], [43.49, 39.86], [43.51, 39.83]
        ]
    },
    "Сириус": {
        avg_price_sqm: 650000,
        growth_5y: 150,
        growth_10y: 200,
        objects: 25,
        roi: 12,
        risk: 'low',
        center: [43.40, 39.97],
        coordinates: [
            [43.41, 39.95], [43.41, 39.99], [43.39, 40.00], [43.38, 39.97], [43.39, 39.94]
        ]
    },
    "Лазаревское": {
        avg_price_sqm: 180000,
        growth_5y: 25,
        growth_10y: 55,
        objects: 60,
        roi: 5,
        risk: 'high',
        center: [43.9042, 39.3280],
        coordinates: [
            [43.92, 39.32], [43.91, 39.36], [43.89, 39.35], [43.88, 39.31], [43.90, 39.30]
        ]
    },
};

const FALLBACK_JK: {
    id: string;
    name: string;
    growth: number;
    price_sqm: number;
    min_price: number;
    center: [number, number];
    tags: string[];
    image: string;
}[] = [
    {
        id: 'mantera',
        name: "Mantera Seaview Residence",
        growth: 185,
        price_sqm: 2800000,
        min_price: 150000000,
        center: [43.4055, 39.9431],
        tags: ['Deluxe', 'Sea View', 'Pool'],
        image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'karat',
        name: "Karat Apartments (Hyatt)",
        growth: 130,
        price_sqm: 1900000,
        min_price: 120000000,
        center: [43.5786, 39.7267],
        tags: ['Hotel Service', 'Center', 'Elite'],
        image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'grand_royal',
        name: "Grand Royal Residence",
        growth: 95,
        price_sqm: 1200000,
        min_price: 45000000,
        center: [43.5905, 39.7156],
        tags: ['Park', 'History', 'Private Beach'],
        image: 'https://images.unsplash.com/photo-1600596542815-60c37c65b567?auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'reef',
        name: "Reef Residence",
        growth: 150,
        price_sqm: 2100000,
        min_price: 110000000,
        center: [43.5834, 39.7289],
        tags: ['Club House', 'First Line'],
        image: 'https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'sancity',
        name: "San City",
        growth: 75,
        price_sqm: 650000,
        min_price: 28000000,
        center: [43.565, 39.750],
        tags: ['Business', 'Spa'],
        image: 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'alean',
        name: "Alean Family Resort",
        growth: 110,
        price_sqm: 950000,
        min_price: 35000000,
        center: [43.550, 39.780],
        tags: ['Invest', 'Family', 'All Inclusive'],
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'
    },
];

const STATIC_DATA = [
    // Accidents (DTP) - Mock / Live Events
    { id: 'dtp1', type: 'dtp', name: 'ДТП: Столкновение', lat: 43.592, lng: 39.722, description: 'Средняя тяжесть. Ожидается патруль.' },
    { id: 'dtp2', type: 'dtp', name: 'ДТП: Затор', lat: 43.585, lng: 39.920, description: 'Пробка 2км. Ремонт дорог.' },

    // Weather / Meteo - Mock / Real integration later
    { id: 'm1', type: 'meteo', name: 'Метео: +22°C', lat: 43.570, lng: 39.720, description: 'Солнечно, штиль. Температура воды +20°C.' },
    { id: 'm2', type: 'meteo', name: 'Метео: +18°C', lat: 43.680, lng: 40.210, description: 'Облачно, возможен дождь.' },
];



// ============================================
// Types
// ============================================

interface Property {
    id: string;
    title: string;
    price: number;
    price_per_sqm: number;
    area_sqm: number;
    rooms: string | null;
    address: string;
    growth_5y?: number;
    growth_10y?: number;
    quality_score?: number;
    jk?: string;
    image?: string;
}

interface GeoJSONFeature {
    geometry: { coordinates: [number, number] };
    properties: Property;
}

interface GeoJSONData {
    features: GeoJSONFeature[];
    metadata: { total: number; avg_price: number; avg_price_per_sqm: number };
}

interface PremiumMapProps {
    height?: string;
}

declare global {
    interface Window {
        DG: any;
    }
}

// ============================================
// Helpers
// ============================================

const getPriceColor = (price: number): string => {
    if (price >= 100_000_000) return '#ef4444';
    if (price >= 50_000_000) return '#f97316';
    if (price >= 30_000_000) return '#eab308';
    if (price >= 15_000_000) return '#22c55e';
    return '#3b82f6';
};

const getGrowthColor = (growth: number): string => {
    if (growth >= 100) return '#22c55e';
    if (growth >= 60) return '#84cc16';
    if (growth >= 30) return '#eab308';
    if (growth >= 0) return '#f97316';
    return '#ef4444';
};

const formatPrice = (price: number): string => {
    if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(1)}M ₽`;
    if (price >= 1_000) return `${(price / 1_000).toFixed(0)}K ₽`;
    return `${price} ₽`;
};

// HTML Maker for Markers
const createMarkerHtml = (priceColor: string, growthColor: string, growth: number) => {
    return `
      <div class="marker-content" style="
        --marker-color: ${priceColor};
        --growth-color: ${growthColor};
        width: 36px;
        height: 36px;
        background: rgba(15, 23, 42, 0.9);
        border: 2px solid var(--marker-color);
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        transition: transform 0.2s;
      ">
        <div style="transform: rotate(45deg); font-weight: 700; font-size: 10px; color: #fff;">
         <span class="marker-badge" style="color: ${growthColor};">+${growth}%</span>
        </div>
      </div>
    `;
};

// ============================================
// Component
// ============================================

export function PremiumMap({ height = '100%' }: PremiumMapProps) {
    const router = useRouter();
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    
    // 2GIS dedicated refs
    const twoGisMapRef = useRef<any>(null);
    const twoGisContainerRef = useRef<HTMLDivElement>(null);

    const [data, setData] = useState<GeoJSONData | null>(null);
    const [loading, setLoading] = useState(true);
    const [mapProvider, setMapProvider] = useState<'osm' | '2gis' | 'satellite'>('osm');
    const [priceFilter, setPriceFilter] = useState<'all' | 'low' | 'mid' | 'high' | 'premium' | 'ultra' | 'luxury'>('all');
    const [scenario, setScenario] = useState<'all' | 'investor' | 'family' | 'single'>('all');
    const [showHeatmap, setShowHeatmap] = useState(true);
    const [showInfra, setShowInfra] = useState(false);
    const [showLuxuryGrid, setShowLuxuryGrid] = useState(false);
    const [showNavPanel, setShowNavPanel] = useState(true);
    const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<any | null>(null);
    const { isMobile, breakpoint } = useBreakpoint();
    const [showInsights, setShowInsights] = useState(false);
    const [activeTab, setActiveTab] = useState<'details' | 'location' | 'potential' | 'surroundings' | 'news' | 'social'>('details');
    
    // Resizable Side Panel
    const [panelWidth, setPanelWidth] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('sidePanelWidth');
            return saved ? parseInt(saved, 10) : 420;
        }
        return 420;
    });
    const [isResizing, setIsResizing] = useState(false);
    const resizeRef = useRef<HTMLDivElement>(null);

    // Drag-to-resize handler
    useEffect(() => {
        if (!isResizing) return;

        const handleMouseMove = (e: MouseEvent) => {
            const containerRect = mapRef.current?.getBoundingClientRect();
            if (!containerRect) return;
            const newWidth = containerRect.right - e.clientX - 24;
            const clampedWidth = Math.max(360, Math.min(600, newWidth));
            setPanelWidth(clampedWidth);
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            localStorage.setItem('sidePanelWidth', String(panelWidth));
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, panelWidth]);

    // Sync showNavPanel with mobile state
    useEffect(() => {
        if (isMobile) {
            setShowNavPanel(false);
        } else {
            setShowNavPanel(true);
        }
    }, [isMobile]);

    const [dgReady, setDgReady] = useState(false);
    
    // ============================================
    // DYNAMIC DATA FROM API (с fallback на константы)
    // ============================================
    const [districtsData, setDistrictsData] = useState<Record<string, typeof FALLBACK_DISTRICTS[keyof typeof FALLBACK_DISTRICTS]>>(FALLBACK_DISTRICTS);
    const [jkData, setJkData] = useState<typeof FALLBACK_JK>(FALLBACK_JK);
    
    // Загрузка районов и ЖК из API
    useEffect(() => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        
        // Загрузка районов
        fetch(`${apiUrl}/api/v1/districts`, { signal: AbortSignal.timeout(2000) })
            .then(res => res.ok ? res.json() : Promise.reject())
            .then((data: DistrictData[]) => {
                if (data && data.length > 0) {
                    const mapped: Record<string, typeof FALLBACK_DISTRICTS[keyof typeof FALLBACK_DISTRICTS]> = {};
                    data.forEach(d => {
                        mapped[d.name] = {
                            avg_price_sqm: d.avg_price_sqm,
                            growth_5y: d.growth_5y,
                            growth_10y: d.growth_10y,
                            objects: d.objects_count,
                            roi: d.roi,
                            risk: d.risk_level,
                            center: [d.center_lat, d.center_lng],
                            coordinates: d.coordinates,
                        };
                    });
                    setDistrictsData(mapped);
                    console.log(`[PremiumMap] Загружено ${data.length} районов из API`);
                }
            })
            .catch(() => console.log('[PremiumMap] Используем fallback для районов'));
        
        // Загрузка ЖК
        fetch(`${apiUrl}/api/v1/complexes-admin`, { signal: AbortSignal.timeout(2000) })
            .then(res => res.ok ? res.json() : Promise.reject())
            .then((data: ComplexData[]) => {
                if (data && data.length > 0) {
                    const mapped = data.map(c => ({
                        id: String(c.id),
                        name: c.name,
                        growth: c.growth,
                        price_sqm: c.price_sqm,
                        min_price: c.min_price,
                        center: [c.center_lat, c.center_lng] as [number, number],
                        tags: c.tags || [],
                        image: c.image || FALLBACK_JK[0].image,
                    }));
                    setJkData(mapped);
                    console.log(`[PremiumMap] Загружено ${data.length} ЖК из API`);
                }
            })
            .catch(() => console.log('[PremiumMap] Используем fallback для ЖК'));
    }, []);
    
    // Safe Hydration State
    const [widgetsReady, setWidgetsReady] = useState(false);
    useEffect(() => {
        setWidgetsReady(true);
        document.body.classList.remove('antigravity-scroll-lock');
        document.body.style.overflow = '';
        document.body.style.pointerEvents = '';
    }, []);

    // Infra Filters
    const [activeInfraFilters, setActiveInfraFilters] = useState<string[]>(['school', 'shop', 'food', 'water', 'park', 'hospital', 'promenade', 'dtp', 'meteo']);

    const toggleInfraFilter = (type: string) => {
        setActiveInfraFilters(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    // Link Scenario to Layers
    useEffect(() => {
        if (scenario === 'family') {
            setShowInfra(true);
            setActiveInfraFilters(['school', 'kindergarten', 'park', 'hospital']);
            setShowHeatmap(false);
            if (activeTab === 'details') setActiveTab('surroundings');
        } else if (scenario === 'investor') {
            setShowHeatmap(true);
            setShowInfra(false);
            if (activeTab === 'details') setActiveTab('potential');
        } else if (scenario === 'single') {
            setShowInfra(true);
            setActiveInfraFilters(['food', 'shop', 'promenade', 'water']);
            setShowHeatmap(false);
            if (activeTab === 'details') setActiveTab('social');
        } else {
            setActiveInfraFilters(['school', 'kindergarten', 'park', 'hospital', 'food', 'shop', 'promenade', 'water', 'dtp', 'meteo']);
            if (activeTab !== 'details') setActiveTab('details');
        }
    }, [scenario]);

    // Fetch Real Infrastructure from 2GIS
    const [realInfra, setRealInfra] = useState<any[]>([]);

    useEffect(() => {
        const fetchInfra = async () => {
            if (activeInfraFilters.length === 0) {
                setRealInfra([]);
                return;
            }
            const remoteTypes = activeInfraFilters.filter(t => !['dtp', 'meteo'].includes(t));
            if (remoteTypes.length === 0) return;

            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const centerLat = 43.5855;
                const centerLon = 39.7231;
                const typeStr = remoteTypes.join(',');

                const res = await fetch(`${apiUrl}/api/v1/infrastructure?lat=${centerLat}&lon=${centerLon}&radius=5000&types=${typeStr}`);
                if (res.ok) {
                    const data = await res.json();
                    const mapped = data.map((i: any) => ({
                        id: i.id,
                        type: i.type,
                        name: i.name,
                        lat: i.lat,
                        lng: i.lon,
                        description: i.address
                    }));
                    setRealInfra(mapped);
                }
            } catch (err) {
                console.error("Failed to fetch infra", err);
            }
        };

        const t = setTimeout(fetchInfra, 300);
        return () => clearTimeout(t);
    }, [activeInfraFilters]);

    // Load 2GIS script
    useEffect(() => {
        if (mapProvider !== '2gis') return;
        if (typeof window !== 'undefined' && !window.DG) {
            const script = document.createElement('script');
            script.src = 'https://maps.api.2gis.ru/2.0/loader.js?pkg=full';
            script.async = true;
            script.onload = () => {
                window.DG.then(() => setDgReady(true));
            };
            script.onerror = () => {
                console.error('Failed to load 2GIS script');
                setMapProvider('osm');
            };
            document.head.appendChild(script);
        } else if (window.DG) {
            window.DG.then(() => setDgReady(true));
        }
    }, [mapProvider]);

    // Fetch Data
    useEffect(() => {
        let isCancelled = false;
        const fetchData = async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            let features: GeoJSONFeature[] = [];

            try {
                const res = await fetch(`${apiUrl}/api/v1/heatmap`, { signal: AbortSignal.timeout(1500) });
                if (res.ok) {
                    const json = await res.json();
                    if (json.features) features = json.features;
                }
            } catch (error) {
                console.warn('API недоступен или время ожидания истекло');
            }

            if (isCancelled) return;

            // Моковые данные УБРАНЫ — карта отображает только реальные объекты из БД
            // Если нужна демонстрация — добавьте объекты через админку /admin/properties

            // Mock data removed. Only API data is used.
            features = features.map((f, idx) => ({
                ...f,
                properties: {
                    ...f.properties,
                    // Preserve existing properties, only default if absolutely missing crucial UI fields
                    growth_10y: f.properties.growth_10y || 0,
                }
            }));

            if (!isCancelled) {
                setData({ features, metadata: { total: features.length, avg_price: 0, avg_price_per_sqm: 0 } });
                setLoading(false);
            }
        };
        fetchData();
        return () => { isCancelled = true; };
    }, []);

    const filteredFeatures = useMemo(() => {
        if (!data?.features) return [];
        return data.features.filter(f => {
            const price = f.properties.price;
            const growth = f.properties.growth_10y || 0;

            let passPrice = true;
            switch (priceFilter) {
                case 'low': passPrice = price < 15_000_000; break;
                case 'mid': passPrice = price >= 15_000_000 && price < 30_000_000; break;
                case 'high': passPrice = price >= 30_000_000 && price < 50_000_000; break;
                case 'premium': passPrice = price >= 50_000_000 && price < 100_000_000; break;
                case 'ultra': passPrice = price >= 100_000_000 && price < 150_000_000; break;
                case 'luxury': passPrice = price >= 150_000_000; break;
            }

            let passScenario = true;
            switch (scenario) {
                case 'investor': passScenario = growth >= 80; break;
                case 'family': passScenario = price < 40_000_000; break;
                case 'single': passScenario = price < 25_000_000; break;
            }

            return passPrice && passScenario;
        });
    }, [data, priceFilter, scenario]);

    // Fly to property
    const flyToProperty = useCallback((feature: GeoJSONFeature) => {
        if (!mapInstanceRef.current) return;
        const [lng, lat] = feature.geometry.coordinates;
        setSelectedPropertyId(feature.properties.id);

        if (mapProvider === '2gis') {
            mapInstanceRef.current.setView([lat, lng], 18, { animate: true });
        } else {
            mapInstanceRef.current.flyTo({ center: [lng, lat], zoom: 18, pitch: 60 });
        }
    }, [mapProvider]);

    const navigateProperty = useCallback((direction: 'next' | 'prev') => {
        if (!selectedPropertyId || filteredFeatures.length === 0) return;
        const currentIndex = filteredFeatures.findIndex(f => f.properties.id === selectedPropertyId);
        let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

        if (nextIndex >= filteredFeatures.length) nextIndex = 0;
        if (nextIndex < 0) nextIndex = filteredFeatures.length - 1;

        const nextFeature = filteredFeatures[nextIndex];
        flyToProperty(nextFeature);
    }, [selectedPropertyId, filteredFeatures, flyToProperty]);

     // Race condition protection
    const isMounted = useRef(false);
    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    // Init MapLibre Map (OSM / Satellite)
    useEffect(() => {
        if (mapProvider === '2gis') return;
        if (typeof window === 'undefined' || !mapRef.current) return;

        let isCancelled = false;

        const initMapLibre = () => {
             // Cleanup
            if (mapInstanceRef.current) {
                if (mapInstanceRef.current.remove) mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
            if (mapRef.current) mapRef.current.innerHTML = '';

            const style = {
                version: 8,
                sources: {
                    'raster-tiles': {
                        type: 'raster',
                        tiles: mapProvider === 'satellite'
                            ? ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}']
                            : ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                        tileSize: 256,
                        attribution: ''
                    }
                },
                layers: [{
                    id: 'simple-tiles',
                    type: 'raster',
                    source: 'raster-tiles',
                    minzoom: 0,
                    maxzoom: 22
                }]
            };

            const map = new maplibregl.Map({
                container: mapRef.current!,
                style: style as any,
                center: [39.720, 43.585],
                zoom: 13,
                pitch: 0, 
                bearing: 0
            });

            // Add navigation controls
            map.addControl(new maplibregl.NavigationControl({ visualizePitch: false }), 'bottom-right');

            map.on('load', () => {
                if (isCancelled) return;
                
                // --- Add Districts (Flat) ---
                if (districtData) {
                    const enrichedFeatures = (districtData as any).features.map((f: any) => {
                         const name = f?.properties?.name;
                         const distData = districtsData[name as keyof typeof districtsData];
                         const growth = distData?.growth_10y || 0;
                         
                         let color = '#94a3b8';
                         if (growth > 150) color = '#10b981'; 
                         else if (growth > 100) color = '#d97706'; 
                         else if (growth > 50) color = '#f59e0b';
                         else if (growth > 0) color = '#ef4444';

                         return {
                             ...f,
                             properties: {
                                 ...f.properties,
                                 color: color
                             }
                         };
                    });

                    map.addSource('districts', {
                        type: 'geojson',
                        data: { type: 'FeatureCollection', features: enrichedFeatures }
                    });

                    map.addLayer({
                        id: 'districts-fill',
                        type: 'fill',
                        source: 'districts',
                        paint: {
                            'fill-color': ['get', 'color'],
                            'fill-opacity': showHeatmap ? 0.4 : 0.05,
                            'fill-outline-color': '#ffffff'
                        }
                    });
                    
                    // Click on district
                    map.on('click', 'districts-fill', (e) => {
                        if (e.features && e.features[0]) {
                            const props = e.features[0].properties;
                             const name = props.name;
                             const distAnalytics = districtsData[name as keyof typeof districtsData];
                             setSelectedDistrict({ name, ...distAnalytics });
                        }
                    });
                }

                // --- Add Property Markers (Custom HTML) ---
                filteredFeatures.forEach(feature => {
                     const [lng, lat] = feature.geometry.coordinates;
                     const props = feature.properties;
                     const priceColor = getPriceColor(props.price);
                     const growthColor = getGrowthColor(props.growth_10y || 0);

                     const el = document.createElement('div');
                     el.innerHTML = createMarkerHtml(priceColor, growthColor, props.growth_10y || 0);
                     
                     const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
                        .setLngLat([lng, lat])
                        .addTo(map);

                     // Interaction
                     el.addEventListener('click', (e) => {
                         e.stopPropagation();
                         setSelectedPropertyId(props.id);
                         map.flyTo({ center: [lng, lat], zoom: 18, pitch: 60 });
                     });
                     
                     markersRef.current.push(marker);
                });

                // --- Add Infrastructure (Simple Markers) ---
                if (showInfra) {
                    const visibleItems = [...realInfra, ...STATIC_DATA].filter(item => activeInfraFilters.includes(item.type));
                    
                    visibleItems.forEach(item => {
                        const el = document.createElement('div');
                        el.innerHTML = `<div style="
                                font-size: 24px; 
                                filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5)); 
                                cursor: pointer;
                            ">${item.type === 'school' ? '🎓' :
                                    item.type === 'kindergarten' ? '🧸' :
                                        item.type === 'hospital' ? '🏥' :
                                            item.type === 'shop' ? '🛍️' :
                                                item.type === 'promenade' ? '⛲' :
                                                    item.type === 'water' ? '🏊' :
                                                        item.type === 'food' ? '🍽️' :
                                                            item.type === 'dtp' ? '⚠️' :
                                                                item.type === 'meteo' ? '🌤️' : '🌳'
                                }</div>`;
                        
                        new maplibregl.Marker({ element: el })
                            .setLngLat([item.lng, item.lat])
                            .addTo(map);
                    });
                }
            });

            mapInstanceRef.current = map;
        };

        initMapLibre();

        return () => {
            isCancelled = true;
            if (mapInstanceRef.current && mapInstanceRef.current.remove) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
            markersRef.current = [];
        };
    }, [mapProvider, filteredFeatures, showHeatmap, showInfra, activeInfraFilters]);


    // 2GIS Implementation
    useEffect(() => {
        if (mapProvider !== '2gis') return;
        
        // Wait for container ref to be ready
        if (!twoGisContainerRef.current) return;
        
        // If map already exists, just ensure it's resized? 
        // 2GIS might need invalidatesize if it was hidden.
        if (twoGisMapRef.current) {
             twoGisMapRef.current.invalidateSize();
             return;
        }

        if (!dgReady) return; // Wait for script

        window.DG.then(() => {
            if (!twoGisContainerRef.current) return;
            
            // Initialize map
            const map = window.DG.map(twoGisContainerRef.current, {
                center: [43.585, 39.720],
                zoom: 13,
                fullscreenControl: false,
                zoomControl: true,
            });
            twoGisMapRef.current = map;

            // ... 2GIS Layers ...
             Object.entries(districtsData).forEach(([name, district]) => {
                const growth = district.growth_10y;
                let color = '#ef4444';
                if (growth > 150) color = '#22c55e';
                else if (growth > 100) color = '#84cc16';
                else if (growth > 50) color = '#eab308';
                else color = '#f97316';

                let layer;
                if (district.coordinates) {
                    layer = window.DG.polygon(district.coordinates, {
                            color: color, fillColor: color, fillOpacity: 0.15, weight: 2
                    });
                } else {
                     layer = window.DG.circle(district.center, {
                        radius: 5000, color: color, fillColor: color, fillOpacity: 0.15, weight: 2
                    });
                }
                layer.addTo(map);
                layer.on('click', () => { setSelectedDistrict({ name, ...district }); });
            });
            
            // Markers for 2GIS
             filteredFeatures.forEach(feature => {
                const [lng, lat] = feature.geometry.coordinates;
                const props = feature.properties;
                const priceColor = getPriceColor(props.price);
                const growthColor = getGrowthColor(props.growth_10y || 0);

                const icon = window.DG.divIcon({
                    className: 'custom-marker',
                    html: createMarkerHtml(priceColor, growthColor, props.growth_10y || 0),
                    iconSize: [36, 36],
                    iconAnchor: [18, 36],
                });

                const marker = window.DG.marker([lat, lng], { icon }).addTo(map);
                marker.on('click', () => {
                    setSelectedPropertyId(props.id);
                    map.setView([lat, lng], 18, { animate: true });
                });
            });
        });

        // No cleanup - keep instance alive
    }, [mapProvider, dgReady, filteredFeatures]);




    /* eslint-disable react/forbid-dom-props */
    const loadingStyles = { '--map-height': height } as React.CSSProperties;

    if (loading) {
        return (
            <div className={styles.loadingContainer} style={loadingStyles}>
                <div className={styles.loadingContent}>
                    <div className={styles.loadingIcon}>🗺️</div>
                    <div className={styles.loadingText}>Загружаем карту инвестиций...</div>
                </div>
            </div>
        );
    }

    const containerStyles = { '--map-height': height } as React.CSSProperties;

    return (
        <div className={styles.mainContainer} style={containerStyles}>
            {/* MapLibre Container (OSM/Satellite) */}
            <div 
                ref={mapRef} 
                className={`${styles.mapLayer} ${mapProvider === '2gis' ? styles.mapLayerHidden : styles.mapLayerVisible}`}
            />
            
            {/* 2GIS Container */}
            <div 
                ref={twoGisContainerRef}
                className={`${styles.mapLayer} ${styles.twoGisPlaceholder} ${mapProvider === '2gis' ? styles.mapLayerVisible : styles.mapLayerHidden}`}
            />
            
            {/* Top Controls Container */}
            <div className={styles.topControlsContainer}>
                {/* Map Provider Toggle */}
                <div className={styles.providerToggle}>
                    {[
                        { key: 'osm', label: '🗺️ Схема', color: '#3b82f6' },
                        { key: '2gis', label: '🟢 2GIS', color: '#22c55e' },
                        { key: 'satellite', label: '🛰️ Спутник', color: '#8b5cf6' },
                    ].map(item => {
                        const btnStyles = { '--btn-bg': mapProvider === item.key ? item.color : 'transparent' } as React.CSSProperties;
                        return (
                            <button
                                key={item.key}
                                onClick={() => setMapProvider(item.key as any)}
                                className={`${styles.providerBtn} ${mapProvider === item.key ? `text-white bg-[${item.color}]` : 'text-slate-400 bg-transparent'}`}
                                style={btnStyles}
                            >
                                {item.label}
                            </button>
                        );
                    })}

                    <button
                        onClick={() => router.push('/properties')}
                        className={styles.listBtn}
                    >
                        📋 <span>Список</span>
                    </button>
                </div>


                 {/* Filters Bar */}
                 {/* <VIBE: FILTERS_STRIP> - DO NOT REMOVE ELEMENTS WITHOUT CONFIRMATION */}
                 <div className={`${styles.filtersStrip} ${isMobile ? styles.filtersStripMobile : ''}`}>
                    
                    {/* Object Counter */}
                    <div className={styles.objectCounter}>
                        <span className={styles.counterIcon}>📊</span>
                        <span className={styles.counterValue}>{filteredFeatures.length}</span>
                    </div>

                    {/* Main Toggles */}
                    <div className={styles.filterGroup}>
                         <button 
                            onClick={() => router.push('/details')} // Placeholder for details
                            className={`${styles.filterBtn} bg-white/5 text-slate-400`}
                        >
                            🌍 <span>Обзор</span>
                        </button>
                        <button 
                            onClick={() => setShowHeatmap(!showHeatmap)} 
                            className={`${styles.filterBtn} ${showHeatmap ? 'bg-orange-500 text-white' : 'bg-transparent text-slate-400'}`}
                        >
                            🔥 <span>Heatmap</span>
                        </button>
                        <button 
                            onClick={() => setShowInfra(!showInfra)} 
                            className={`${styles.filterBtn} ${showInfra ? 'bg-pink-600 text-white' : 'bg-transparent text-slate-400'}`}
                        >
                            🏗️ <span>Инфра</span>
                        </button>
                        <button 
                            onClick={() => {}} 
                            className={`${styles.filterBtn} bg-transparent text-slate-400`}
                        >
                            💎 <span>ЖК</span>
                        </button>
                    </div>

                    {/* Scenarios (Lifestyle) */}
                     <div className={styles.separator} />

                     <div className={styles.filterGroup}>
                        <button 
                            onClick={() => setScenario('all')} 
                            className={`${styles.filterBtn} ${scenario === 'all' ? 'bg-violet-500 text-white' : 'bg-transparent text-slate-400'}`}
                        >
                            🎯 Все
                        </button>
                        <button 
                            onClick={() => setScenario('investor')} 
                            className={`${styles.filterBtn} ${scenario === 'investor' ? 'bg-white/10 text-white' : 'bg-transparent text-slate-400'}`}
                        >
                            💼 Инвестор
                        </button>
                        <button 
                            onClick={() => setScenario('family')} 
                            className={`${styles.filterBtn} ${scenario === 'family' ? 'bg-white/10 text-white' : 'bg-transparent text-slate-400'}`}
                        >
                            🧸 Семья
                        </button>
                         <button 
                            onClick={() => setScenario('single')} 
                            className={`${styles.filterBtn} ${scenario === 'single' ? 'bg-white/10 text-white' : 'bg-transparent text-slate-400'}`}
                        >
                            🔥 Одиночка
                        </button>
                    </div>

                     <div className={styles.separator} />

                     {/* Price Filters */}
                     <div className={styles.filterGroup}>
                        {['all', 'low', 'mid', 'high', 'premium', 'luxury'].map(f => {
                             const labels: Record<string, string> = { 'all': 'Все цены', 'low': '<15M', 'mid': '15-30M', 'high': '30-50M', 'premium': '50M+', 'luxury': 'Элит' };
                            return (
                                <button 
                                    key={f} 
                                    onClick={() => setPriceFilter(f as any)} 
                                    className={`${styles.filterBtn} ${priceFilter === f ? 'bg-blue-500 text-white' : 'bg-transparent text-slate-400'}`}
                                >
                                    {labels[f] || f}
                                </button>
                            );
                        })}
                    </div>
                 </div>
                 {/* </VIBE> */}
            </div>

            {/* Mobile Widgets */}
            <div className="widgets-container">
                {isMobile ? (<MobileNewsCarousel />) : (
                    <>
                        <div className="flex-1 min-w-[300px]"><NewsFeed /></div>
                        <div className="flex-1 min-w-[300px]"><SocialFeed /></div>
                        <div className="flex-1 min-w-[300px]"><SMIFeed /></div>
                    </>
                )}
            </div>

            {/* Side Panel logic */}
            {!isMobile && (selectedPropertyId || selectedDistrict) && (
                (() => {
                    const sidePanelStyles = { '--panel-width': `${panelWidth}px` } as React.CSSProperties;
                    const p = data?.features.find(f => f.properties.id === selectedPropertyId)?.properties;
                    const d = selectedDistrict;
                    if (!p && !d) return null;
                    const title = p ? p.title : d.name;
                    const subtitle = p ? p.address : 'Район Сочи';

                    return (
                        <div className={`${styles.propertySidePanel} ${styles.slideRight} lux-dark-theme`} style={sidePanelStyles}>
                            <div ref={resizeRef} onMouseDown={() => setIsResizing(true)} className={`absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize z-10 ${isResizing ? 'bg-[#d4af37]/30' : 'bg-transparent'}`} />
                            <div className={styles.sidePanelContent}>
                                <div className={styles.panelHeader}>
                                    <div className={styles.breadcrumbs}>
                                        <span onClick={() => { setSelectedPropertyId(null); setSelectedDistrict(null); }} className={styles.breadcrumbsLink}>Карта</span>
                                        <span>/</span>
                                        <span className={styles.breadcrumbsHighlight}>{selectedDistrict ? selectedDistrict.name : 'Район'}</span>
                                        {p && <><span>/</span><span className={styles.breadcrumbsWhite}>{p.title}</span></>}
                                    </div>
                                    <div className={styles.propertyHeader}>
                                        <div>
                                            <h2 className={styles.propertyTitle}>{title}</h2>
                                            <div className={styles.propertySubtitle}><span>📍</span> {subtitle}</div>
                                        </div>
                                        <button onClick={() => { setSelectedPropertyId(null); setSelectedDistrict(null); }} className={styles.closeBtn}>✕</button>
                                    </div>
                                    <div className={styles.panelTabs}>
                                        {[
                                            { id: 'details', icon: '📝', label: 'Инфо' },
                                            { id: 'location', icon: '📍', label: 'Локация' },
                                            { id: 'potential', icon: '📈', label: 'Потенциал' },
                                            { id: 'surroundings', icon: '🌳', label: 'Окружение' },
                                            { id: 'news', icon: '📰', label: 'СМИ' },
                                            { id: 'social', icon: '💬', label: 'Отзывы' }
                                        ].map(tab => (
                                            <button 
                                                key={tab.id} 
                                                onClick={() => setActiveTab(tab.id as any)} 
                                                className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabBtnActive : ''}`}
                                            >
                                                <span>{tab.icon}</span>{tab.label}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="tab-scroll-area">
                                        {activeTab === 'details' && p && (
                                            <div className={styles.fadeIn}>
                                                <img src={p.image || getMockImage(p.id)} alt={p.title || 'Фото объекта недвижимости'} className={styles.propertyImage} />
                                                <div className={styles.priceGrid}>
                                                    <div className={styles.priceCard}>
                                                        <div className={styles.priceLabel}>Стоимость</div>
                                                        <div className={styles.priceValueMain}>{formatPrice(p.price)}</div>
                                                    </div>
                                                    <div className={styles.priceCard}>
                                                        <div className={styles.priceLabel}>Цена за м²</div>
                                                        <div className={styles.priceValueSec}>{formatPrice(p.price_per_sqm)}</div>
                                                    </div>
                                                </div>
                                                <h3 className={styles.descTitle}>О проекте</h3>
                                                <p className={styles.descText}>Эксклюзивный проект. Премиальная отделка, закрытая территория.</p>
                                                <button className={styles.bookBtn}>Записаться на просмотр</button>
                                            </div>
                                        )}
                                        {activeTab === 'details' && !p && d && (<DistrictDetails district={d} onClose={() => setSelectedDistrict(null)} embedded={true} />)}
                                        {activeTab === 'location' && p && <PropertyLocation propertyId={p.id} address={p.address} />}
                                        {activeTab === 'potential' && p && <PropertyPotential propertyId={p.id} currentGrowth={p.growth_10y} />}
                                        {activeTab === 'surroundings' && p && <PropertySurroundings propertyId={p.id} />}
                                        {activeTab === 'news' && <NewsFeed />}
                                        {activeTab === 'social' && <SocialFeed />}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })()
            )}
        </div>
    );
}
