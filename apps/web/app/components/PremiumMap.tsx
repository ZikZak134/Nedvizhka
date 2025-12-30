'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { useBreakpoint } from '../hooks/useBreakpoint';
import districtData from '../data/sochi_districts.json';

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
// MOCK DATA - Replace with API later
// ============================================
// ... (keep usage of DistrictDetails import)

// ============================================

// ============================================
// MOCK DATA - Replace with API later
// ============================================

const DISTRICTS_DATA = {
    "Красная Поляна": {
        avg_price_sqm: 520000,
        growth_5y: 110,
        growth_10y: 180,
        objects: 45,
        roi: 14,
        risk: 'low',
        center: [43.6831, 40.2048],
        // Горнолыжный курорт — полностью на суше
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
        // Центр Сочи — вдоль побережья, но на суше
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
        // Адлер — аэропорт и окрестности
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
        // Хоста — между центром и Адлером, на суше
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
        // Олимпийский парк — на суше
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
        // Лазаревское — северный район, на суше
        coordinates: [
            [43.92, 39.32], [43.91, 39.36], [43.89, 39.35], [43.88, 39.31], [43.90, 39.30]
        ]
    },
};


const JK_DATA = [
    {
        id: 'mantera',
        name: "Mantera Seaview Residence",
        growth: 185,
        price_sqm: 2800000,
        min_price: 150000000,
        center: [43.4055, 39.9431], // Sirius
        tags: ['Deluxe', 'Sea View', 'Pool'],
        image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'karat',
        name: "Karat Apartments (Hyatt)",
        growth: 130,
        price_sqm: 1900000,
        min_price: 120000000,
        center: [43.5786, 39.7267], // Central
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
        center: [43.5834, 39.7289], // Near warm sea
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

const LUXURY_PROPERTY_IMAGES = [
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80', // Modern Villa with Pool
    'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80', // White Minimalist House
    'https://images.unsplash.com/photo-1600596542815-60c37c65b567?auto=format&fit=crop&w=800&q=80', // Modern Glass Villa
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80', // Pool Deck
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=800&q=80', // Luxury Living Room
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80', // Black Kitchen
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80', // Balcony View
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80', // Tropical Resort
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=800&q=80', // Palm Tree Villa
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?auto=format&fit=crop&w=800&q=80', // Classic Facade
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80', // Modern Stone House
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80', // Cottage
    'https://images.unsplash.com/photo-1576941089067-2de3c901e126?auto=format&fit=crop&w=800&q=80', // Sunny Home
    'https://images.unsplash.com/photo-1598228723793-52759bba239c?auto=format&fit=crop&w=800&q=80', // Penthouse Interior
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80', // Cozy Apartment
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80', // Loft
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80', // Blue Room
    'https://images.unsplash.com/photo-1560184897-ae75f418493e?auto=format&fit=crop&w=800&q=80', // Golden Hour House
    'https://images.unsplash.com/photo-1484154218962-a1c002085d2f?auto=format&fit=crop&w=800&q=80', // Airbnb Style
    'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=800&q=80', // High Rise
    'https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=800&q=80', // White Interior
    'https://images.unsplash.com/photo-1502005229766-939760a58531?auto=format&fit=crop&w=800&q=80', // Grey Facade
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

const getMockImage = (id: string | number): string => {
    const strId = String(id);
    let hash = 0;
    for (let i = 0; i < strId.length; i++) {
        hash = ((hash << 5) - hash) + strId.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
    }
    const index = Math.abs(hash) % LUXURY_PROPERTY_IMAGES.length;
    return LUXURY_PROPERTY_IMAGES[index];
};

import { getMockLocation } from '../utils/mockLocations';

// ============================================
// Component
// ============================================

export function PremiumMap({ height = '100%' }: PremiumMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const tileLayerRef = useRef<any>(null);
    const districtLayersRef = useRef<any[]>([]);
    const markersRef = useRef<any[]>([]);

    const [data, setData] = useState<GeoJSONData | null>(null);
    const [loading, setLoading] = useState(true);
    const [mapProvider, setMapProvider] = useState<'osm' | '2gis' | 'satellite'>('osm'); // Default to OSM for reliability
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
    const [showSimilar, setShowSimilar] = useState(false);

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
            const newWidth = containerRect.right - e.clientX - 24; // 24px = right offset
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
            // Restore all
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

            // Filter out static types
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

        // Debounce
        const t = setTimeout(fetchInfra, 300);
        return () => clearTimeout(t);
    }, [activeInfraFilters]);

    // Load 2GIS script - ONLY if provider is 2GIS to avoid unnecessary network calls
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
                // Fallback to OSM if 2GIS fails
                setMapProvider('osm');
            };
            document.head.appendChild(script);
        } else if (window.DG) {
            window.DG.then(() => setDgReady(true));
        }
    }, [mapProvider]);

    // Safety Timeout to prevent infinite loading
    useEffect(() => {
        const timer = setTimeout(() => {
            if (loading) {
                console.warn('Force disabling loading state after timeout');
                setLoading(false);
            }
        }, 4000); // 4 seconds max load time (faster fallback)
        return () => clearTimeout(timer);
    }, [loading]);

    // Fetch data
    // Fetch data with Robust Fallback
    useEffect(() => {
        let isCancelled = false;

        const fetchData = async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            let features: GeoJSONFeature[] = [];

            try {
                // Timeout after 1.5 seconds to fall back to mock data quickly
                const res = await fetch(`${apiUrl}/api/v1/heatmap`, {
                    signal: AbortSignal.timeout(1500)
                });
                if (res.ok) {
                    const json = await res.json();
                    if (json.features) {
                        features = json.features;
                    }
                }
            } catch (error) {
                console.warn('API unavailable or timed out, using mock data for properties');
            }

            if (isCancelled) return;

            // Fallback / Augment with Mock Data if empty
            if (features.length < 5) {
                // Generate 20 mock properties (reduced for performance)
                for (let i = 0; i < 20; i++) {
                    const loc = getMockLocation(i);
                    // Фиксированные координаты из локаций — без джиттера для стабильности
                    const lat = loc.lat;
                    const lng = loc.lng;

                    features.push({
                        geometry: { coordinates: [lng, lat] },
                        properties: {
                            id: `mock-prop-${i}`,  // Исправлен ID для консистентности с роутами
                            title: loc.address || `Элитный объект #${i + 1}`,
                            price: 15000000 + Math.random() * 150000000,
                            price_per_sqm: 300000 + Math.random() * 1000000,
                            area_sqm: 40 + Math.floor(Math.random() * 200),
                            rooms: String(1 + Math.floor(Math.random() * 4)),
                            address: loc.address,
                            growth_10y: 50 + Math.floor(Math.random() * 150),
                            quality_score: 80,
                            image: getMockImage(i),
                            jk: i % 5 === 0 ? JK_DATA[i % JK_DATA.length].name : undefined
                        }
                    });
                }
            }

            // Enrich Data
            features = features.map((f, idx) => ({
                ...f,
                properties: {
                    ...f.properties,
                    // Ensure props exist
                    growth_10y: f.properties.growth_10y || (50 + Math.floor(Math.random() * 150)),
                    price: f.properties.price || (20000000),
                    image: f.properties.image || getMockImage(String(f.properties.id || idx)),
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

    // Filter properties
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
            mapInstanceRef.current.flyTo([lat, lng], 18, { duration: 1.2 });
        }
    }, [mapProvider]);

    // Zoom to Region
    const zoomToRegion = useCallback(() => {
        if (!mapInstanceRef.current) return;
        const target = [44.5, 39.5] as [number, number]; // Krasnodar Krai roughly
        const zoom = 8;
        if (mapProvider === '2gis') {
            mapInstanceRef.current.setView(target, zoom);
        } else {
            mapInstanceRef.current.flyTo(target, zoom, { duration: 1.5 });
        }
    }, [mapProvider]);

    // Zoom to City (Sochi)
    const zoomToCity = useCallback(() => {
        if (!mapInstanceRef.current) return;
        const target = [43.585, 39.720] as [number, number];
        const zoom = 13;
        if (mapProvider === '2gis') {
            mapInstanceRef.current.setView(target, zoom);
        } else {
            mapInstanceRef.current.flyTo(target, zoom, { duration: 1.5 });
        }
    }, [mapProvider]);

    // Navigate Properties
    const navigateProperty = useCallback((direction: 'next' | 'prev') => {
        if (!selectedPropertyId || filteredFeatures.length === 0) return;
        const currentIndex = filteredFeatures.findIndex(f => f.properties.id === selectedPropertyId);
        let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

        if (nextIndex >= filteredFeatures.length) nextIndex = 0;
        if (nextIndex < 0) nextIndex = filteredFeatures.length - 1;

        const nextFeature = filteredFeatures[nextIndex];
        flyToProperty(nextFeature);
    }, [selectedPropertyId, filteredFeatures, flyToProperty]);

    // Reset View
    const resetView = useCallback(() => {
        if (!mapInstanceRef.current) return;
        const target = [43.585, 39.720] as [number, number];
        const zoom = 14;

        if (mapProvider === '2gis') {
            mapInstanceRef.current.setView(target, zoom);
        } else {
            mapInstanceRef.current.flyTo(target, zoom, { duration: 1.5 });
        }
    }, [mapProvider]);

    // Race condition protection
    const isMounted = useRef(false);

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    // Init Leaflet map (OSM or Satellite)
    useEffect(() => {
        if (mapProvider === '2gis') return;
        if (typeof window === 'undefined' || !mapRef.current) return;

        let isCancelled = false;

        const initLeafletMap = async () => {
            const L = (await import('leaflet')).default;

            if (isCancelled || !isMounted.current) return;

            // CRITICAL FIX: Check for dirty DOM
            const container = mapRef.current as any;
            if (container && (container._leaflet_id || container.childElementCount > 0)) {
                console.warn('Map container dirty. Hard cleaning.');

                // Try proper removal first
                if (mapInstanceRef.current) {
                    try {
                        mapInstanceRef.current.remove();
                    } catch (e) { console.error('Map remove failed', e); }
                    mapInstanceRef.current = null;
                }

                // Nuclear Option (Force Clear)
                container._leaflet_id = null;
                container.innerHTML = '';
            }

            markersRef.current = [];
            districtLayersRef.current = [];

            try {
                const map = L.map(mapRef.current!, {
                    center: [43.585, 39.720],
                    zoom: 14,
                    zoomControl: false,
                    attributionControl: false // Elite look: hide default attribution (add custom minimal one if needed)
                });

                // Zoom Logic
                map.on('zoomend', () => {
                    if (!mapRef.current) return;
                    const z = map.getZoom();
                    if (z < 13) mapRef.current.classList.add('map-zoomed-out');
                    else mapRef.current.classList.remove('map-zoomed-out');
                });
                if (map.getZoom() < 13) mapRef.current!.classList.add('map-zoomed-out');

                L.control.zoom({ position: 'bottomright' }).addTo(map);

                const tileUrl = mapProvider === 'satellite'
                    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'; // Use a darker skin if possible? No, stick to Satellite for elite.

                L.tileLayer(tileUrl, { attribution: '' }).addTo(map);

                mapInstanceRef.current = map;

                // Add district polygons (Elite Style via GeoJSON)
                L.geoJSON(districtData as any, {
                    style: (feature) => {
                        const name = feature?.properties?.name;
                        const distData = DISTRICTS_DATA[name as keyof typeof DISTRICTS_DATA];
                        const growth = distData?.growth_10y || 0;
                        const isHeatmap = showHeatmap;

                        // Elite Color Palette
                        let color = '#94a3b8'; // Neutral Slate
                        if (growth > 150) color = '#10b981'; // Emerald
                        else if (growth > 100) color = '#d97706'; // Bronze/Amber
                        else if (growth > 50) color = '#f59e0b'; // Gold
                        else if (growth > 0) color = '#ef4444'; // Red

                        // Override color from JSON if present and valid
                        if (feature?.properties?.color) color = feature.properties.color;

                        return {
                            fillColor: color,
                            fillOpacity: isHeatmap ? 0.35 : 0.05, // Slightly more visible for satellite
                            color: color,
                            weight: isHeatmap ? 0 : 2,
                            className: isHeatmap ? 'heatmap-blob' : 'elite-district-border',
                            dashArray: isHeatmap ? '' : '4, 4'
                        };
                    },
                    onEachFeature: (feature, layer) => {
                        const name = feature.properties.name;
                        const distAnalytics = DISTRICTS_DATA[name as keyof typeof DISTRICTS_DATA];

                        layer.on('click', () => {
                            // Merge GeoJSON props with Analytics data
                            setSelectedDistrict({
                                name: name,
                                ...distAnalytics
                            });
                        });
                        districtLayersRef.current.push(layer);
                    }
                }).addTo(map);

                // Add Infrastructure (Elite Icons)
                if (showInfra) {
                    const visibleItems = [...realInfra, ...STATIC_DATA].filter(item => activeInfraFilters.includes(item.type));
                    visibleItems.forEach(item => {
                        const icon = L.divIcon({
                            className: 'infra-marker',
                            html: `<div style="
                                font-size: 20px; 
                                filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5)); 
                                background: rgba(255,255,255,0.1); 
                                backdrop-filter: blur(4px);
                                border-radius: 50%;
                                width: 32px;
                                height: 32px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                border: 1px solid rgba(255,255,255,0.2);
                            ">${item.type === 'school' ? '🎓' :
                                    item.type === 'kindergarten' ? '🧸' :
                                        item.type === 'hospital' ? '🏥' :
                                            item.type === 'shop' ? '🛍️' :
                                                item.type === 'promenade' ? '⛲' :
                                                    item.type === 'water' ? '🏊' :
                                                        item.type === 'food' ? '🍽️' :
                                                            item.type === 'dtp' ? '⚠️' :
                                                                item.type === 'meteo' ? '🌤️' : '🌳'
                                }</div>`,
                            iconSize: [32, 32],
                            iconAnchor: [16, 16],
                        });
                        const marker = L.marker([item.lat, item.lng], { icon }).addTo(map);
                        marker.bindPopup(`<div style="font-family: serif; font-weight: 700; padding: 4px; color: var(--navy-deep);">${item.name}</div>`);
                        markersRef.current.push(marker);
                    });
                }

                // Add markers (Jewel Style)
                filteredFeatures.forEach(feature => {
                    const [lng, lat] = feature.geometry.coordinates;
                    const props = feature.properties;
                    const priceColor = getPriceColor(props.price);

                    const icon = L.divIcon({
                        className: 'premium-marker',
                        html: createMarkerHtml(priceColor, '#fff', props.growth_10y || 0),
                        iconSize: [40, 40],
                        iconAnchor: [20, 20],
                    });

                    const marker = L.marker([lat, lng], { icon }).addTo(map);

                    // Показываем только короткий tooltip при наведении (не popup)
                    marker.bindTooltip(`<strong>${props.title}</strong><br/>${formatPrice(props.price)}`, {
                        direction: 'top',
                        offset: [0, -20],
                        className: 'elite-tooltip'
                    });

                    // При клике на маркер — зум до объекта + открыть боковую панель (без popup)
                    marker.on('click', () => {
                        setSelectedPropertyId(props.id);
                        map.flyTo([lat, lng], 18, { duration: 0.8 });
                    });

                    markersRef.current.push(marker);
                });

            } catch (err) {
                console.error("Leaflet Init Error:", err);
            }
        };

        initLeafletMap();

        return () => {
            isCancelled = true;
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [mapProvider, filteredFeatures, showHeatmap, showInfra, activeInfraFilters]);

    // (Ensure space between effects)
    useEffect(() => {
        if (mapProvider !== '2gis' || !dgReady || !mapRef.current) return;

        let isCancelled = false;

        // Cleanup previous
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }
        markersRef.current = [];

        window.DG.then(() => {
            if (isCancelled || !isMounted.current) return;

            const map = window.DG.map(mapRef.current, {
                center: [43.585, 39.720],
                zoom: 14,
                fullscreenControl: false,
                zoomControl: true,
            });

            mapInstanceRef.current = map;

            // Add district polygons
            Object.entries(DISTRICTS_DATA).forEach(([name, district]) => {
                // Dynamic Color
                const growth = district.growth_10y;
                let color = '#ef4444';
                if (growth > 150) color = '#22c55e';
                else if (growth > 100) color = '#84cc16';
                else if (growth > 50) color = '#eab308';
                else color = '#f97316';

                let layer;
                if (district.coordinates) {
                    layer = window.DG.polygon(district.coordinates, {
                        color: color,
                        fillColor: color,
                        fillOpacity: 0.15,
                        weight: 2,
                        interactive: true // Ensure interactive
                    });
                } else {
                    layer = window.DG.circle(district.center, {
                        radius: 5000,
                        color: color,
                        fillColor: color,
                        fillOpacity: 0.15,
                        weight: 2,
                        interactive: true
                    });
                }

                layer.addTo(map);
                // layer.bindPopup(createDistrictPopup(name, district));
                layer.on('click', () => {
                    setSelectedDistrict({ name, ...district });
                });

            });

            // Add Infrastructure
            if (showInfra) {
                // Filter items
                const visibleItems = [...realInfra, ...STATIC_DATA].filter(item => activeInfraFilters.includes(item.type));

                visibleItems.forEach(item => {
                    const icon = window.DG.divIcon({
                        className: 'infra-marker',
                        html: `<div style="font-size: 24px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); cursor: pointer;" title="${item.name}">${item.type === 'school' ? '🎓' :
                            item.type === 'kindergarten' ? '🧸' :
                                item.type === 'hospital' ? '🏥' :
                                    item.type === 'shop' ? '🛍️' :
                                        item.type === 'promenade' ? '⛲' :
                                            item.type === 'water' ? '🏊' :
                                                item.type === 'food' ? '🍽️' :
                                                    item.type === 'dtp' ? '⚠️' :
                                                        item.type === 'meteo' ? '🌤️' : '🌳'
                            }</div>`,
                        iconSize: [30, 30],
                        iconAnchor: [15, 15],
                    });
                    const marker = window.DG.marker([item.lat, item.lng], { icon }).addTo(map);
                    marker.bindPopup(`<div style="font-family: system-ui; font-weight: 700; padding: 4px; color: var(--navy-deep);">${item.name}</div>`);
                    markersRef.current.push(marker);
                });
            }

            // Add markers
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

                // Показываем tooltip вместо popup
                marker.bindLabel(`<strong>${props.title}</strong><br/>${formatPrice(props.price)}`, {
                    static: false
                });

                // При клике на маркер — зум до объекта + открыть боковую панель
                marker.on('click', () => {
                    setSelectedPropertyId(props.id);
                    map.setView([lat, lng], 18, { animate: true });
                });

                markersRef.current.push(marker);
            });
        });

        return () => {
            if (mapInstanceRef.current && mapProvider === '2gis') {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [mapProvider, dgReady, filteredFeatures, showInfra]);

    // Helper functions for popups
    // Helper functions for popups
    function createMarkerHtml(priceColor: string, growthColor: string, growth: number) {
        return `
      <div class="marker-content" style="
        --marker-color: ${priceColor};
        --growth-color: ${growthColor};
      ">
        <span class="marker-badge">+${growth}%</span>
      </div>
    `;
    }

    function createDistrictPopup(name: string, district: any) {
        return `
      <div style="min-width: 220px; font-family: system-ui; padding: 4px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h3 style="margin: 0; font-size: 16px; font-weight: 700;">${name}</h3>
          <span style="background: ${district.color}; color: white; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;">+${district.growth_10y}%</span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
          <div style="background: #f1f5f9; padding: 8px; border-radius: 6px;">
            <div style="font-size: 16px; font-weight: 700;">${formatPrice(district.avg_price_sqm)}</div>
            <div style="font-size: 10px; color: #64748b;">за м²</div>
          </div>
          <div style="background: #f1f5f9; padding: 8px; border-radius: 6px;">
            <div style="font-size: 16px; font-weight: 700; color: #22c55e;">+${district.growth_5y}%</div>
            <div style="font-size: 10px; color: #64748b;">5 лет</div>
          </div>
        </div>
      </div>
    `;
    }

    function createPropertyPopup(props: Property, priceColor: string) {
        return `
            <div style="padding: 12px; background: #0f172a; color: white; border-radius: 12px; min-width: 220px;">
                <div style="margin-bottom: 12px; position: relative; height: 120px; border-radius: 8px; overflow: hidden;">
                     <img src="${props.image || ''}" style="width: 100%; height: 100%; object-fit: cover;" />
                     <div style="position: absolute; top: 6px; right: 6px; background: ${priceColor}; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700;">
                        ${props.growth_10y ? '+' + props.growth_10y + '%' : ''}
                     </div>
                </div>
                <h3 style="margin: 0 0 4px; font-size: 14px;">${props.title}</h3>
                <p style="margin: 0 0 8px; font-size: 11px; color: #94a3b8;">${props.address}</p>
                <div style="margin-top: 8px; color: #d4af37; font-weight: 700; font-size: 16px;">${formatPrice(props.price)}</div>
                <a href="/properties/${props.id}" style="display: block; margin-top: 10px; padding: 8px; background: rgba(255,255,255,0.1); color: white; text-align: center; border-radius: 8px; text-decoration: none; font-size: 12px;">
                    Подробнее →
                </a>
            </div>
        `;
    }



    // Debug log to ensure we are inside the function
    // console.log('PremiumMap render, loading:', loading);

    if (loading) {
        return (
            <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}>
                <div style={{ color: '#fff', textAlign: 'center' }}>
                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>🗺️</div>
                    <div style={{ fontSize: '18px', fontWeight: 600 }}>Загружаем карту инвестиций...</div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ height, position: 'relative', background: '#0f172a' }}>
            {/* Map Container - key forces clean remount on provider change */}
            <div key={mapProvider} ref={mapRef} style={{ height: '100%', width: '100%' }} />

            {/* Top Controls Container */}
            <div style={{
                position: 'absolute',
                top: '16px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                zIndex: 300,
                width: 'auto',
                maxWidth: '90%',
            }}>
                {/* Map Provider Toggle */}
                <div style={{
                    background: 'rgba(15, 23, 42, 0.95)',
                    backdropFilter: 'blur(16px)',
                    padding: '4px',
                    borderRadius: '12px',
                    display: 'flex',
                    gap: '4px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                }}>
                    {[
                        { key: 'osm', label: '🗺️ Схема', color: '#3b82f6' },
                        { key: '2gis', label: '🟢 2GIS', color: '#22c55e' },
                        { key: 'satellite', label: '🛰️ Спутник', color: '#8b5cf6' },
                    ].map(item => (
                        <button
                            key={item.key}
                            onClick={() => setMapProvider(item.key as any)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: 'none',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                background: mapProvider === item.key ? item.color : 'transparent',
                                color: '#fff',
                                transition: 'all 0.2s',
                            }}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Filters Bar - Mobile Horizontal Scroll */}
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    overflowX: 'auto',
                    maxWidth: '100vw',
                    padding: '0 16px',
                    scrollbarWidth: 'none',
                    justifyContent: isMobile ? 'flex-start' : 'center',
                    pointerEvents: 'auto'
                }}>
                    {/* Map Layers */}
                    <div style={{ display: 'flex', gap: '8px', background: 'rgba(15,23,42,0.8)', padding: '4px', borderRadius: '12px', backdropFilter: 'blur(12px)' }}>
                        <button
                            onClick={() => setShowHeatmap(!showHeatmap)}
                            style={{
                                padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                background: showHeatmap ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                                color: showHeatmap ? '#f87171' : '#94a3b8',
                                fontSize: '12px', fontWeight: 600, display: 'flex', gap: '6px', alignItems: 'center'
                            }}
                        >
                            🔥 <span>Спрос</span>
                        </button>
                        <button
                            onClick={() => setShowInfra(!showInfra)}
                            style={{
                                padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                background: showInfra ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                                color: showInfra ? '#60a5fa' : '#94a3b8',
                                fontSize: '12px', fontWeight: 600, display: 'flex', gap: '6px', alignItems: 'center'
                            }}
                        >
                            🏗️ <span>Инфра</span>
                        </button>
                    </div>

                    {/* Price Filter */}
                    <div style={{ display: 'flex', gap: '4px', background: 'rgba(15,23,42,0.8)', padding: '4px', borderRadius: '12px', backdropFilter: 'blur(12px)' }}>
                        {['all', 'low', 'mid', 'high', 'premium', 'luxury'].map(f => (
                            <button
                                key={f}
                                onClick={() => setPriceFilter(f as any)}
                                style={{
                                    padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                    background: priceFilter === f ? '#d4af37' : 'transparent',
                                    color: priceFilter === f ? '#000' : '#94a3b8',
                                    fontSize: '12px', fontWeight: 600
                                }}
                            >
                                {f === 'all' ? 'Все' : f === 'luxury' ? 'Luxury' : f === 'high' ? 'High' : f}
                            </button>
                        ))}
                    </div>

                    {/* Scenario Filter - Restored */}
                    <div style={{ display: 'flex', gap: '4px', background: 'rgba(15,23,42,0.8)', padding: '4px', borderRadius: '12px', backdropFilter: 'blur(12px)' }}>
                        {[
                            { key: 'all', label: 'Все', icon: '' },
                            { key: 'investor', label: 'Инвест', icon: '💼' },
                            { key: 'family', label: 'Семья', icon: '🧸' },
                            { key: 'single', label: 'Для себя', icon: '👤' }
                        ].map(s => (
                            <button
                                key={s.key}
                                onClick={() => setScenario(s.key as any)}
                                style={{
                                    padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                    background: scenario === s.key ? '#8b5cf6' : 'transparent',
                                    color: scenario === s.key ? '#fff' : '#94a3b8',
                                    fontSize: '12px', fontWeight: 600, display: 'flex', gap: '6px', alignItems: 'center'
                                }}
                            >
                                {s.icon && <span>{s.icon}</span>}
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mobile Widgets Container */}
            <div className="widgets-container">
                {isMobile ? (
                    <MobileNewsCarousel />
                ) : (
                    <>
                        <div style={{ flex: 1, minWidth: '300px' }}><NewsFeed /></div>
                        <div style={{ flex: 1, minWidth: '300px' }}><SocialFeed /></div>
                        {/* Only show SMIFeed if plenty of space or relevant */}
                        <div style={{ flex: 1, minWidth: '300px' }}><SMIFeed /></div>
                    </>
                )}
            </div>

            {/* Mobile Top Overlay (Insights) */}
            {isMobile && !showInsights && (
                <button
                    onClick={() => setShowInsights(true)}
                    style={{
                        position: 'absolute', top: '16px', right: '16px', zIndex: 400,
                        background: 'var(--elite-accent-gold)', border: 'none', borderRadius: '50%',
                        width: '40px', height: '40px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px'
                    }}
                >✨</button>
            )}

            {/* Mobile Insights Overlay */}
            {isMobile && showInsights && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'var(--elite-bg-primary)',
                    zIndex: 5000,
                    padding: '24px',
                    overflowY: 'auto'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h2 style={{ color: 'var(--elite-accent-gold)', margin: 0 }}>✨ Инсайты рынка</h2>
                        <button
                            onClick={() => setShowInsights(false)}
                            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', color: '#fff', width: '32px', height: '32px' }}
                        >✕</button>
                    </div>
                    <div style={{ pointerEvents: 'auto' }}><NewsFeed /></div>
                    <div style={{ pointerEvents: 'auto', marginTop: '24px' }}><SocialFeed /></div>
                </div>
            )}

            {/* Desktop Side Panel */}
            {!isMobile && (selectedPropertyId || selectedDistrict) && (
                <div className="property-side-panel slide-right" style={{ display: 'flex', flexDirection: 'column', width: `${panelWidth}px` }}>
                    {/* Resize Handle */}
                    <div
                        ref={resizeRef}
                        onMouseDown={() => setIsResizing(true)}
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: '8px',
                            cursor: 'ew-resize',
                            background: isResizing ? 'rgba(212, 175, 55, 0.3)' : 'transparent',
                            transition: 'background 0.2s',
                            zIndex: 10,
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(212, 175, 55, 0.2)'}
                        onMouseLeave={(e) => !isResizing && (e.currentTarget.style.background = 'transparent')}
                    />
                    <div className="side-panel-content" style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
                        {(() => {
                            // Find property
                            const p = data?.features.find(f => f.properties.id === selectedPropertyId)?.properties;
                            // Find district
                            const d = selectedDistrict;
                            if (!p && !d) return null;

                            const title = p ? p.title : d.name;
                            const subtitle = p ? p.address : 'Район Сочи';
                            const price = p ? p.price : d.avg_price_sqm;

                            return (
                                <div style={{ color: '#fff' }}>
                                    {/* Header (Breadcrumbs) - Restored! */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '11px', color: '#94a3b8' }}>
                                        <span onClick={() => { setSelectedPropertyId(null); setSelectedDistrict(null); }} style={{ cursor: 'pointer', borderBottom: '1px dashed #64748b' }}>Карта</span>
                                        <span>/</span>
                                        <span style={{ color: '#d4af37' }}>{selectedDistrict ? selectedDistrict.name : 'Район'}</span>
                                        {p && <>
                                            <span>/</span>
                                            <span style={{ color: '#fff' }}>{p.title}</span>
                                        </>}
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
                                        <div>
                                            <h2 style={{ margin: '0 0 8px', fontSize: '24px', fontFamily: '"Playfair Display", serif', color: '#fff' }}>
                                                {title}
                                            </h2>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '13px' }}>
                                                <span>📍</span> {subtitle}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => { setSelectedPropertyId(null); setSelectedDistrict(null); }}
                                            className="close-btn"
                                        >✕</button>
                                    </div>

                                    {/* Tabs - горизонтальный скролл */}
                                    <div className="tabs-container" style={{
                                        display: 'flex',
                                        gap: '6px',
                                        marginBottom: '24px',
                                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                                        paddingBottom: '12px',
                                        overflowX: 'auto',
                                        overflowY: 'hidden',
                                        scrollbarWidth: 'none',
                                        msOverflowStyle: 'none',
                                        WebkitOverflowScrolling: 'touch',
                                    }}>
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
                                                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                                            >
                                                <span>{tab.icon}</span>
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Content Area */}
                                    <div className="tab-scroll-area">
                                        {activeTab === 'details' && p && (
                                            <div className="fade-in">
                                                <img
                                                    src={p.image}
                                                    style={{ width: '100%', height: '240px', objectFit: 'cover', borderRadius: '16px', marginBottom: '24px' }}
                                                />
                                                {/* Price Block */}
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '16px' }}>
                                                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>Стоимость</div>
                                                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#d4af37' }}>{formatPrice(p.price)}</div>
                                                    </div>
                                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '16px' }}>
                                                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>Цена за м²</div>
                                                        <div style={{ fontSize: '20px', fontWeight: 600 }}>{formatPrice(p.price_per_sqm)}</div>
                                                    </div>
                                                </div>

                                                <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>О проекте</h3>
                                                <p style={{ lineHeight: 1.6, color: '#cbd5e1', marginBottom: '24px' }}>
                                                    Эксклюзивный проект в сердце {selectedDistrict ? selectedDistrict.name : 'Сочи'}.
                                                    Идеально подходит для инвестиций и жизни. Премиальная отделка,
                                                    закрытая территория и консьерж-сервис 24/7.
                                                </p>

                                                <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Характеристики</h3>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                                                        <span style={{ color: '#94a3b8' }}>Площадь</span>
                                                        <span style={{ fontWeight: 600 }}>{p.area_sqm} м²</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                                                        <span style={{ color: '#94a3b8' }}>Комнат</span>
                                                        <span style={{ fontWeight: 600 }}>{p.rooms}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                                                        <span style={{ color: '#94a3b8' }}>Рост (10 лет)</span>
                                                        <span style={{ fontWeight: 600, color: '#22c55e' }}>+{p.growth_10y}%</span>
                                                    </div>
                                                </div>

                                                <button className="book-btn">
                                                    Записаться на просмотр
                                                </button>
                                            </div>
                                        )}
                                        {activeTab === 'details' && !p && d && (
                                            <div>
                                                <DistrictDetails district={d} onClose={() => setSelectedDistrict(null)} embedded={true} />
                                            </div>
                                        )}

                                        {activeTab === 'location' && p && <PropertyLocation propertyId={p.id} address={p.address} />}
                                        {activeTab === 'potential' && p && <PropertyPotential propertyId={p.id} currentGrowth={p.growth_10y} />}
                                        {activeTab === 'surroundings' && p && <PropertySurroundings propertyId={p.id} />}
                                        {activeTab === 'news' && <NewsFeed />}
                                        {activeTab === 'social' && <SocialFeed />}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                    {/* Fixed Footer Navigation (Restored) */}
                    <div style={{
                        background: 'rgba(15, 23, 42, 0.98)',
                        borderTop: '1px solid rgba(255,255,255,0.1)',
                        padding: '16px 20px',
                        display: 'grid',
                        gridTemplateColumns: '48px 1fr 48px',
                        gap: '12px',
                        backdropFilter: 'blur(10px)',
                        zIndex: 30,
                        boxShadow: '0 -4px 20px rgba(0,0,0,0.3)'
                    }}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                navigateProperty('prev');
                            }}
                            className="nav-btn"
                        >←</button>

                        {(() => {
                            const p = data?.features.find(f => f.properties.id === selectedPropertyId)?.properties;
                            if (!p) return <div></div>;
                            return (
                                <a
                                    href={`/properties/${p.id}`}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: 'var(--elite-accent-gold)',
                                        color: '#000',
                                        fontWeight: 700,
                                        borderRadius: '12px',
                                        textDecoration: 'none',
                                        fontSize: '14px'
                                    }}
                                >
                                    Подробнее об объекте
                                </a>
                            );
                        })()}

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                navigateProperty('next');
                            }}
                            className="nav-btn"
                        >→</button>
                    </div>
                </div>
            )}

            {/* District Details Panel (Mobile Only - Overlay/Sheet style) */}
            {
                widgetsReady && isMobile && selectedDistrict && !selectedPropertyId && (
                    <DistrictDetails
                        district={selectedDistrict}
                        onClose={() => setSelectedDistrict(null)}
                    />
                )
            }

            {/* Mobile Property Sheet */}
            {widgetsReady && isMobile && selectedPropertyId && (
                <div className="map-bottom-sheet" style={{
                    padding: '20px',
                    background: '#0a1128',
                    borderRadius: '24px 24px 0 0',
                    zIndex: 9990, /* Ниже мобильного меню (9999) */
                    boxShadow: '0 -4px 20px rgba(0,0,0,0.6)',
                    borderTop: '1px solid rgba(212, 175, 55, 0.3)'
                }}>
                    <div className="sheet-handle" onClick={() => setSelectedPropertyId(null)}></div>
                    <div className="sheet-content">
                        {(() => {
                            const prop = filteredFeatures.find(f => f.properties.id === selectedPropertyId)?.properties;
                            if (!prop) return null;
                            return (
                                <div>
                                    {/* Mobile Image */}
                                    <div style={{
                                        position: 'relative',
                                        height: '200px',
                                        borderRadius: '16px',
                                        overflow: 'hidden',
                                        marginBottom: '16px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                                    }}>
                                        <img
                                            src={prop.image || getMockImage(prop.id)}
                                            alt={prop.title}
                                            onError={(e) => { e.currentTarget.src = getMockImage(prop.id); }}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                        <div style={{
                                            position: 'absolute',
                                            top: '12px',
                                            right: '12px',
                                            background: 'rgba(0,0,0,0.6)',
                                            backdropFilter: 'blur(4px)',
                                            padding: '4px 8px',
                                            borderRadius: '8px',
                                            color: '#fff',
                                            fontSize: '10px',
                                            fontWeight: 700
                                        }}>
                                            {prop.jk || 'Elite'}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'start' }}>
                                        <h3 style={{ margin: 0, color: 'white', fontSize: '20px', maxWidth: '85%', lineHeight: 1.2 }}>{prop.title}</h3>
                                        <button onClick={() => setSelectedPropertyId(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '24px', padding: '0 8px' }}>✕</button>
                                    </div>
                                    <div style={{ fontSize: '26px', fontWeight: 700, color: '#d4af37', marginBottom: '8px' }}>
                                        {formatPrice(prop.price)}
                                    </div>
                                    <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 20px' }}>📍 {prop.address}</p>

                                    {/* Tabs for Mobile */}
                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
                                        {[
                                            { id: 'details', label: 'Инфо' },
                                            { id: 'potential', label: 'Потенциал' },
                                            { id: 'surroundings', label: 'Окружение' },
                                            { id: 'location', label: 'Локация' }, // Added location tab
                                        ].map(tab => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id as any)}
                                                style={{
                                                    padding: '10px 18px',
                                                    borderRadius: '20px',
                                                    border: '1px solid',
                                                    borderColor: activeTab === tab.id ? '#d4af37' : 'rgba(255,255,255,0.1)',
                                                    background: activeTab === tab.id ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255,255,255,0.05)',
                                                    color: activeTab === tab.id ? '#d4af37' : '#94a3b8',
                                                    fontSize: '14px',
                                                    fontWeight: 600,
                                                    whiteSpace: 'nowrap',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Content based on Tab */}
                                    {activeTab === 'details' && (
                                        <div className="fade-in">
                                            {/* Key Stats Grid */}
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '24px' }}>
                                                {[
                                                    { label: 'Площадь', value: `${prop.area_sqm} м²` },
                                                    { label: 'Комнаты', value: prop.rooms || 'Студия' },
                                                    { label: 'Рост', value: `+${prop.growth_10y}%`, color: '#22c55e' }
                                                ].map((stat, i) => (
                                                    <div key={i} style={{
                                                        background: 'rgba(255,255,255,0.05)',
                                                        borderRadius: '12px',
                                                        padding: '10px',
                                                        textAlign: 'center',
                                                        border: '1px solid rgba(255,255,255,0.1)'
                                                    }}>
                                                        <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px' }}>{stat.label}</div>
                                                        <div style={{ fontSize: '14px', fontWeight: 600, color: stat.color || '#fff' }}>{stat.value}</div>
                                                    </div>
                                                ))}
                                            </div>

                                            <button style={{
                                                width: '100%',
                                                padding: '16px',
                                                background: 'linear-gradient(135deg, #d4af37 0%, #fcd34d 100%)',
                                                border: 'none',
                                                borderRadius: '16px',
                                                color: '#000',
                                                fontSize: '16px',
                                                fontWeight: 700,
                                                marginBottom: '32px',
                                                cursor: 'pointer',
                                                boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
                                            }}>
                                                📞 Связаться с брокером
                                            </button>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                                                <button onClick={() => navigateProperty('prev')} style={{ padding: '14px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', color: 'white', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontWeight: 600 }}>← Назад</button>
                                                <button onClick={() => navigateProperty('next')} style={{ padding: '14px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', color: 'white', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontWeight: 600 }}>Вперед →</button>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'location' && (
                                        <PropertyLocation propertyId={prop.id} address={prop.address} />
                                    )}

                                    {activeTab === 'potential' && (
                                        <PropertyPotential propertyId={prop.id} currentGrowth={prop.growth_10y} />
                                    )}

                                    {activeTab === 'surroundings' && (
                                        <PropertySurroundings propertyId={prop.id} />
                                    )}

                                    <a href={`/properties/${prop.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '18px', background: 'linear-gradient(135deg, #d4af37, #b8860b)', color: '#0a1128', borderRadius: '16px', textDecoration: 'none', fontWeight: 800, fontSize: '16px', boxShadow: '0 8px 20px rgba(212, 175, 55, 0.4)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Подробнее об объекте
                                    </a>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}

            <style jsx global>{`
                .leaflet-pane { z-index: 1 !important; }
                
                /* --- ELITE DESIGN SYSTEM --- */
                
                /* Elite District Border */
                .elite-district-border {
                    filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.4)); /* Gold Glow */
                    animation: dash 4s linear infinite;
                }
                
                /* Heatmap Blob */
                .heatmap-blob {
                    filter: blur(50px);
                    opacity: 0.5;
                    mix-blend-mode: soft-light;
                    animation: pulse 6s infinite ease-in-out;
                }
                
                @keyframes pulse {
                    0% { opacity: 0.4; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(1.05); }
                    100% { opacity: 0.4; transform: scale(1); }
                }

                /* Zoom Logic: Markers (Elite Upgrade) */
                .marker-content {
                    position: relative;
                    width: 40px;
                    height: 40px;
                    background: var(--marker-color);
                    border: 1.5px solid rgba(255, 255, 255, 0.9);
                    border-radius: 50%;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.3); /* Glassy depth */
                    cursor: pointer;
                    transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1); /* Elegant easing */
                    z-index: 10;
                }

                .marker-badge {
                    position: absolute;
                    top: -6px;
                    right: -6px;
                    background: var(--growth-color); /* Fallback */
                    background: linear-gradient(135deg, var(--growth-color), #0f172a);
                    color: white;
                    font-size: 8px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-weight: 800;
                    padding: 3px 6px;
                    border-radius: 6px;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                    border: 1px solid rgba(255,255,255,0.2);
                    transition: all 0.3s;
                }

                /* When Zoomed Out (< 13): Star/Gem Effect */
                .map-zoomed-out .marker-content {
                    transform: scale(0.5); 
                    box-shadow: 0 0 15px var(--marker-color), 0 0 30px var(--marker-color); /* Strong glow */
                    opacity: 0.9;
                    border-width: 0;
                    border-radius: 50%; /* Ensure round */
                }
                .map-zoomed-out .marker-badge {
                    opacity: 0; 
                }
                
                /* Hover: Scale Up */
                .marker-content:hover {
                    transform: scale(1.15) !important;
                    box-shadow: 0 12px 30px rgba(0,0,0,0.6), 0 0 0 2px rgba(255,255,255,0.5) !important;
                    z-index: 999;
                }
                .marker-content:hover .marker-badge {
                    opacity: 1 !important;
                    transform: translateY(-2px);
                }
                
                /* Popup Styles Overrides (Optional) */
                .leaflet-popup {
                    z-index: 1001 !important;
                }
                .leaflet-popup-content-wrapper {
                    background: rgba(15, 23, 42, 0.95) !important;
                    backdrop-filter: blur(16px) saturate(180%);
                    color: white !important;
                    border-radius: 12px !important;
                    border: 1px solid rgba(255,255,255,0.1);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.6);
                }
                .leaflet-popup-tip {
                    background: rgba(15, 23, 42, 0.95) !important;
                }
                .leaflet-popup-close-button {
                    color: rgba(255,255,255,0.6) !important;
                }

                /* --- RESPONSIVE MOBILE LAYOUT --- */
                .widgets-container {
                    position: absolute;
                    top: 80px;
                    left: 16px;
                    z-index: 9999;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    max-height: calc(100% - 200px);
                    overflow-y: auto;
                    scrollbar-width: none;
                }

                @media (max-width: 768px) {
                    .widgets-container {
                        top: auto;
                        bottom: 0;
                        left: 0;
                        width: 100%;
                        flex-direction: row;
                        overflow-x: auto;
                        overflow-y: hidden;
                        padding: 16px;
                        gap: 16px;
                        /* Glass Tray Background for visibility */
                        background: linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0) 100%);
                        /* Snap scrolling */
                        scroll-snap-type: x mandatory;
                        max-height: auto;
                        display: ${selectedPropertyId || selectedDistrict ? 'none' : 'flex'};
                    }
                    
                    /* Ensure children take full width or partial width in row */
                    .widgets-container > div {
                        min-width: 85vw; /* Almost full screen width cards */
                        scroll-snap-align: center;
                    }

                    /* Adjust Leaflet Controls */
                    .leaflet-bottom.leaflet-right {
                        bottom: ${selectedPropertyId || selectedDistrict ? '40vh' : '180px'} !important;
                        transition: bottom 0.3s ease;
                    }

                    .map-bottom-sheet {
                        position: fixed;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        background: #0a1128;
                        border-top: 1px solid rgba(212, 175, 55, 0.3);
                        border-radius: 20px 20px 0 0;
                        z-index: 9990; /* Ниже мобильного меню (9999) */
                        max-height: 80vh;
                        box-shadow: 0 -10px 40px rgba(0,0,0,0.8);
                    }

                    .sheet-handle {
                        width: 40px;
                        height: 4px;
                        background: rgba(255,255,255,0.2);
                        border-radius: 2px;
                        margin: 12px auto;
                        cursor: pointer;
                    }

                    .sheet-content {
                        padding: 0 20px 32px;
                        overflow-y: auto;
                    }

                    .slide-up {
                        animation: slideUp 0.3s ease-out forwards;
                    }

                    @keyframes slideUp {
                        from { transform: translateY(100%); }
                        to { transform: translateY(0); }
                    }
                }

                /* --- DESKTOP SIDE PANEL --- */
                .property-side-panel {
                    position: absolute;
                    top: 100px;
                    right: 24px;
                    min-width: 360px;
                    max-width: 600px;
                    height: calc(100% - 132px);
                    background: rgba(15, 23, 42, 0.9);
                    backdrop-filter: blur(24px) saturate(160%);
                    border-radius: 20px;
                    border: 1px solid rgba(212, 175, 55, 0.3);
                    z-index: 2000;
                    box-shadow: -20px 0 60px rgba(0,0,0,0.6);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    transition: box-shadow 0.2s;
                }
                .property-side-panel:has(.resize-active) {
                    box-shadow: -20px 0 60px rgba(212, 175, 55, 0.3);
                }
                
                /* Hide scrollbar for tabs */
                .tabs-container::-webkit-scrollbar {
                    display: none;
                }

                .side-panel-content {
                    padding: 24px;
                    height: 100%;
                    overflow-y: auto;
                    scrollbar-width: thin;
                    scrollbar-color: rgba(212, 175, 55, 0.3) transparent;
                }

                .close-btn {
                    background: rgba(255,255,255,0.05);
                    border: none;
                    color: #fff;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .close-btn:hover { background: rgba(255, 215, 0, 0.2); color: var(--elite-accent-gold); }

                .nav-btn {
                    background: rgba(255,255,255,0.05);
                    border: none;
                    color: #fff;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                    font-size: 18px;
                }
                .nav-btn:hover { background: rgba(212, 175, 55, 0.2); transform: scale(1.1); }

                .tab-btn {
                    flex: 0 0 auto;
                    padding: 8px 12px;
                    border-radius: 10px;
                    background: transparent;
                    color: #94a3b8;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                    font-size: 11px;
                    font-weight: 600;
                    transition: all 0.3s;
                    white-space: nowrap;
                    min-width: 56px;
                }
                .tab-btn.active {
                    background: rgba(212, 175, 55, 0.15);
                    color: var(--elite-accent-gold);
                }
                .tab-btn span { font-size: 18px; }

                .action-btn {
                   flex: 1;
                   padding: 12px;
                   border-radius: 12px;
                   background: rgba(255,255,255,0.05);
                   color: #fff;
                   border: 1px solid rgba(255,255,255,0.1);
                   font-size: 13px;
                   font-weight: 600;
                   cursor: pointer;
                   display: flex;
                   align-items: center;
                   justify-content: center;
                   gap: 8px;
                   transition: all 0.2s;
                }
                .action-btn:hover { background: rgba(255,255,255,0.1); border-color: var(--elite-accent-gold); }

                .book-btn {
                    width: 100%;
                    padding: 18px;
                    border-radius: 16px;
                    background: linear-gradient(135deg, #d4af37, #b8860b);
                    color: #0a1128;
                    font-weight: 800;
                    border: none;
                    cursor: pointer;
                    box-shadow: 0 10px 30px rgba(212, 175, 55, 0.3);
                    transition: all 0.3s;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .book-btn:hover { transform: translateY(-4px); boxShadow: 0 15px 40px rgba(212, 175, 55, 0.5); }

                .slide-right {
                    animation: slideRight 0.4s cubic-bezier(0.19, 1, 0.22, 1) forwards;
                }
                @keyframes slideRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }

                .fade-in {
                    animation: fadeIn 0.4s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @media (max-width: 1200px) {
                    .property-side-panel { width: 360px; }
                }
             `}</style>
        </div >
    );
}
