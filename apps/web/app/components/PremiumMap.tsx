'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
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
                console.warn('API unavailable or timed out, using mock data');
            }

            if (isCancelled) return;

            if (features.length < 5) {
                for (let i = 0; i < 20; i++) {
                    const loc = getMockLocation(i);
                    features.push({
                        geometry: { coordinates: [loc.lng, loc.lat] },
                        properties: {
                            id: `mock-prop-${i}`,
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

            features = features.map((f, idx) => ({
                ...f,
                properties: {
                    ...f.properties,
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
                container: mapRef.current,
                style: style as any,
                center: [39.720, 43.585],
                zoom: 13,
                pitch: 60, // Angled view
                bearing: -17.6,
                antialias: true
            });

            // Add navigation controls
            map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-right');

            map.on('load', () => {
                if (isCancelled) return;
                
                // --- Add Districts (3D Extrusion) ---
                if (districtData) {
                    const enrichedFeatures = (districtData as any).features.map((f: any) => {
                         const name = f?.properties?.name;
                         const distData = DISTRICTS_DATA[name as keyof typeof DISTRICTS_DATA];
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
                                 color: color,
                                 height: growth * 10 // Mock height based on growth
                             }
                         };
                    });

                    map.addSource('districts', {
                        type: 'geojson',
                        data: { type: 'FeatureCollection', features: enrichedFeatures }
                    });

                    map.addLayer({
                        id: 'districts-fill',
                        type: 'fill-extrusion',
                        source: 'districts',
                        paint: {
                            'fill-extrusion-color': ['get', 'color'],
                            'fill-extrusion-height': showHeatmap ? ['get', 'height'] : 20,
                            'fill-extrusion-base': 0,
                            'fill-extrusion-opacity': showHeatmap ? 0.6 : 0.1
                        }
                    });
                    
                    // Click on district
                    map.on('click', 'districts-fill', (e) => {
                        if (e.features && e.features[0]) {
                            const props = e.features[0].properties;
                             const name = props.name;
                             const distAnalytics = DISTRICTS_DATA[name as keyof typeof DISTRICTS_DATA];
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


    // 2GIS Implementation (Kept separate)
    useEffect(() => {
        if (mapProvider !== '2gis' || !dgReady || !mapRef.current) return;
        let isCancelled = false;

        // Cleanup previous
         if (mapInstanceRef.current) {
             // If it was MapLibre
            if (mapInstanceRef.current.remove) mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }
        if (mapRef.current) mapRef.current.innerHTML = '';
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

            // ... 2GIS Layers ...
             Object.entries(DISTRICTS_DATA).forEach(([name, district]) => {
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
                markersRef.current.push(marker);
            });
        });

        return () => {
            if (mapInstanceRef.current && mapProvider === '2gis') {
                 mapInstanceRef.current.remove();
                 mapInstanceRef.current = null;
            }
        };
    }, [mapProvider, dgReady, filteredFeatures]);


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
            <div key={mapProvider} ref={mapRef} style={{ height: '100%', width: '100%' }} />
            
            {/* ... Rest of UI (Controls, Side Panel, etc) ... */}
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

                    <button
                        onClick={() => router.push('/properties')}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            background: 'rgba(255,255,255,0.1)',
                            color: '#fff',
                            transition: 'all 0.2s',
                            marginLeft: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    >
                        📋 <span>Список</span>
                    </button>
                </div>

                {/* Filters Bar */}
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
                    <div style={{ display: 'flex', gap: '8px', background: 'rgba(15,23,42,0.8)', padding: '4px', borderRadius: '12px', backdropFilter: 'blur(12px)' }}>
                        <button onClick={() => setShowHeatmap(!showHeatmap)} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: showHeatmap ? 'rgba(239, 68, 68, 0.2)' : 'transparent', color: showHeatmap ? '#f87171' : '#94a3b8', fontSize: '12px', fontWeight: 600, display: 'flex', gap: '6px', alignItems: 'center' }}>🔥 <span>Спрос</span></button>
                        <button onClick={() => setShowInfra(!showInfra)} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: showInfra ? 'rgba(59, 130, 246, 0.2)' : 'transparent', color: showInfra ? '#60a5fa' : '#94a3b8', fontSize: '12px', fontWeight: 600, display: 'flex', gap: '6px', alignItems: 'center' }}>🏗️ <span>Инфра</span></button>
                    </div>
                     <div style={{ display: 'flex', gap: '4px', background: 'rgba(15,23,42,0.8)', padding: '4px', borderRadius: '12px', backdropFilter: 'blur(12px)' }}>
                        {['all', 'low', 'mid', 'high', 'premium', 'luxury'].map(f => {
                             const labels: Record<string, string> = { 'all': 'Все', 'low': 'Эконом', 'mid': 'Комфорт', 'high': 'Бизнес', 'premium': 'Премиум', 'luxury': 'Элит' };
                            return (
                                <button key={f} onClick={() => setPriceFilter(f as any)} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: priceFilter === f ? '#d4af37' : 'transparent', color: priceFilter === f ? '#000' : '#94a3b8', fontSize: '12px', fontWeight: 600, flexShrink: 0 }}>
                                    {labels[f] || f}
                                </button>
                            );
                        })}
                    </div>
                 </div>
            </div>

            {/* Mobile Widgets */}
            <div className="widgets-container">
                {isMobile ? (<MobileNewsCarousel />) : (
                    <>
                        <div style={{ flex: 1, minWidth: '300px' }}><NewsFeed /></div>
                        <div style={{ flex: 1, minWidth: '300px' }}><SocialFeed /></div>
                        <div style={{ flex: 1, minWidth: '300px' }}><SMIFeed /></div>
                    </>
                )}
            </div>

            {/* Side Panel logic (Copied from original) */}
            {!isMobile && (selectedPropertyId || selectedDistrict) && (
                <div className="property-side-panel slide-right lux-dark-theme" style={{ display: 'flex', flexDirection: 'column', width: `${panelWidth}px` }}>
                    <div ref={resizeRef} onMouseDown={() => setIsResizing(true)} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '8px', cursor: 'ew-resize', background: isResizing ? 'rgba(212, 175, 55, 0.3)' : 'transparent', zIndex: 10 }} />
                    <div className="side-panel-content" style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
                         {(() => {
                            const p = data?.features.find(f => f.properties.id === selectedPropertyId)?.properties;
                            const d = selectedDistrict;
                            if (!p && !d) return null;
                            const title = p ? p.title : d.name;
                            const subtitle = p ? p.address : 'Район Сочи';
                            return (
                                <div style={{ color: '#fff' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '11px', color: '#94a3b8' }}>
                                        <span onClick={() => { setSelectedPropertyId(null); setSelectedDistrict(null); }} style={{ cursor: 'pointer', borderBottom: '1px dashed #64748b' }}>Карта</span>
                                        <span>/</span>
                                        <span style={{ color: '#d4af37' }}>{selectedDistrict ? selectedDistrict.name : 'Район'}</span>
                                        {p && <><span>/</span><span style={{ color: '#fff' }}>{p.title}</span></>}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
                                        <div>
                                            <h2 style={{ margin: '0 0 8px', fontSize: '24px', fontFamily: '"Playfair Display", serif', color: '#fff' }}>{title}</h2>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '13px' }}><span>📍</span> {subtitle}</div>
                                        </div>
                                        <button onClick={() => { setSelectedPropertyId(null); setSelectedDistrict(null); }} className="close-btn">✕</button>
                                    </div>
                                    <div className="tabs-container" style={{ display: 'flex', gap: '6px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '12px', scrollbarWidth: 'none' }}>
                                        {[
                                            { id: 'details', icon: '📝', label: 'Инфо' },
                                            { id: 'location', icon: '📍', label: 'Локация' },
                                            { id: 'potential', icon: '📈', label: 'Потенциал' },
                                            { id: 'surroundings', icon: '🌳', label: 'Окружение' },
                                            { id: 'news', icon: '📰', label: 'СМИ' },
                                            { id: 'social', icon: '💬', label: 'Отзывы' }
                                        ].map(tab => (
                                            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}><span>{tab.icon}</span>{tab.label}</button>
                                        ))}
                                    </div>
                                    <div className="tab-scroll-area">
                                        {activeTab === 'details' && p && (
                                            <div className="fade-in">
                                                <img src={p.image || getMockImage(p.id)} style={{ width: '100%', height: '240px', objectFit: 'cover', borderRadius: '16px', marginBottom: '24px' }} />
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '16px' }}><div style={{ fontSize: '12px', color: '#94a3b8' }}>Стоимость</div><div style={{ fontSize: '24px', fontWeight: 700, color: '#d4af37' }}>{formatPrice(p.price)}</div></div>
                                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '16px' }}><div style={{ fontSize: '12px', color: '#94a3b8' }}>Цена за м²</div><div style={{ fontSize: '20px', fontWeight: 600 }}>{formatPrice(p.price_per_sqm)}</div></div>
                                                </div>
                                                <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>О проекте</h3>
                                                <p style={{ lineHeight: 1.6, color: '#cbd5e1', marginBottom: '24px' }}>Эксклюзивный проект. Премиальная отделка, закрытая территория.</p>
                                                <button className="book-btn">Записаться на просмотр</button>
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
                            );
                        })()}
                    </div>
                </div>
            )}

             <style jsx>{`
                .property-side-panel {
                    position: absolute;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(15, 23, 42, 0.95);
                    backdrop-filter: blur(20px);
                    border-left: 1px solid rgba(255, 255, 255, 0.1);
                    z-index: 1000;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    transition: box-shadow 0.2s;
                }
                .tabs-container::-webkit-scrollbar { display: none; }
                .side-panel-content { padding: 24px; height: 100%; overflow-y: auto; scrollbar-width: thin; scrollbar-color: rgba(212, 175, 55, 0.3) transparent; }
                .close-btn { background: rgba(255,255,255,0.05); border: none; color: #fff; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; transition: all 0.2s; }
                .close-btn:hover { background: rgba(255, 215, 0, 0.2); color: var(--elite-accent-gold); }
                .tab-btn { flex: 0 0 auto; padding: 8px 12px; border-radius: 10px; background: transparent; color: #94a3b8; border: none; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: 11px; font-weight: 600; transition: all 0.3s; white-space: nowrap; min-width: 56px; }
                .tab-btn.active { background: rgba(212, 175, 55, 0.15); color: var(--elite-accent-gold); }
                .tab-btn span { font-size: 18px; }
                .book-btn { width: 100%; padding: 18px; border-radius: 16px; background: linear-gradient(135deg, #d4af37, #b8860b); color: #0a1128; font-weight: 800; border: none; cursor: pointer; box-shadow: 0 10px 30px rgba(212, 175, 55, 0.3); transition: all 0.3s; text-transform: uppercase; letter-spacing: 1px; }
                .book-btn:hover { transform: translateY(-4px); boxShadow: 0 15px 40px rgba(212, 175, 55, 0.5); }
                .slide-right { animation: slideRight 0.4s cubic-bezier(0.19, 1, 0.22, 1) forwards; }
                @keyframes slideRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                .fade-in { animation: fadeIn 0.4s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @media (max-width: 1200px) { .property-side-panel { width: 360px; } }
             `}</style>
        </div>
    );
}
