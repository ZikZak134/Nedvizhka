
interface GeocodeResult {
    lat: number;
    lng: number;
    address?: string;
}

export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
    const apiKey = process.env.NEXT_PUBLIC_2GIS_KEY;
    if (!apiKey) {
        console.warn('Geocoding skipped: NEXT_PUBLIC_2GIS_KEY is missing');
        return null;
    }

    try {
        // Using 2GIS Catalog API for geocoding
        // Doc: https://docs.2gis.com/en/api/search/places/reference/3.0/items
        const cleanAddress = address.replace(/^Сочи,\s*/i, '').trim(); 
        const cityContext = 'Сочи'; // Bias towards Sochi
        
        const url = `https://catalog.api.2gis.com/3.0/items?q=${encodeURIComponent(`${cityContext}, ${cleanAddress}`)}&fields=items.point&key=${apiKey}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Geocoding API error: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.result && data.result.items && data.result.items.length > 0) {
            const item = data.result.items[0];
            if (item.point) {
                return {
                    lat: item.point.lat,
                    lng: item.point.lon,
                    address: item.full_name || item.name
                };
            }
        }
    } catch (error) {
        console.error('Failed to geocode address:', error);
    }
    
    return null;
}

export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
    const apiKey = process.env.NEXT_PUBLIC_2GIS_KEY;
    if (!apiKey) {
        console.warn('Reverse geocoding skipped: NEXT_PUBLIC_2GIS_KEY is missing');
        return null;
    }

    try {
        // Using 2GIS Catalog API for reverse geocoding
        // Doc: https://docs.2gis.com/en/api/search/places/reference/3.0/items
        const url = `https://catalog.api.2gis.com/3.0/items/geocode?lon=${lng}&lat=${lat}&fields=items.point&key=${apiKey}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Reverse Geocoding API error: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.result && data.result.items && data.result.items.length > 0) {
            const item = data.result.items[0];
            return item.full_name || item.name || null;
        }
    } catch (error) {
        console.error('Failed to reverse geocode:', error);
    }
    
    return null;
}
