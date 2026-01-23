/**
 * Property type definition for use across the application.
 * Centralized to avoid Vercel build errors caused by type inconsistencies.
 */
export interface Property {
    id: string;
    title: string;
    description: string | null;
    price: number;
    price_per_sqm?: number | null;
    currency?: string;
    address: string;
    latitude: number | null;
    longitude: number | null;
    area_sqm: number;
    area_min?: number | null;
    area_max?: number | null;
    rooms?: string | number | null;
    rooms_min?: number | null;
    rooms_max?: number | null;
    floor?: number | null;
    floor_min?: number | null;
    floor_max?: number | null;
    total_floors?: number | null;
    images: string[];
    videos?: string[];
    source: string;
    source_id?: string | null;
    url?: string | null;
    is_active: boolean;
    is_from_developer?: boolean;
    property_type?: string | null;
    layout_type?: string | null;
    finishing_type?: string | null;
    completion_date?: string | null;
    developer_name?: string | null;
    developer_comment?: string | null;
    district?: string | null;
    complex_name?: string | null;
    complex_id?: number | null;
    quality_score?: number | null;
    features?: Record<string, any>;
    badges?: string[];
    owner_quote?: string | null;
    owner_name?: string | null;
    ownerComment?: string | null; // Compatibility with legacy field
    ownerName?: string | null;    // Compatibility with legacy field
    pricePerSqm?: number | null;  // Compatibility with legacy field
    investment_metrics?: {
        roi?: number;
        growth_10y?: number;
        sale_time?: number;
    };
    agent_profile?: {
        name?: string;
        role?: string;
        photo?: string;
        phone?: string;
    };
    eco_score?: Record<string, number>;
    green_zones?: any[];
    growth_forecasts?: any[];
    development_projects?: any[];
    created_at?: string;
    updated_at?: string;
    marker_icon?: string | null;
    
    // Flattened / Legacy fields for compatibility
    growth_10y?: number;
    growth_5y?: number;
    jk?: string | null;
    complex?: string | null;
    image?: string | null;
}
