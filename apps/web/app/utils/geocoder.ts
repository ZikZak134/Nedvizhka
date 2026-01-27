
interface GeocodeResult {
    lat: number;
    lng: number;
    address?: string;
}

export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
    try {
        // Nominatim OpenStreetMap
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
            { headers: { 'Accept-Language': 'ru' } }
        );

        if (!response.ok) return null;

        const data = await response.json();
        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon),
                address: data[0].display_name
            };
        }
    } catch (error) {
        console.error('Failed to geocode address:', error);
    }
    
    return null;
}

export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
    try {
        // Nominatim Reverse
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
             { headers: { 'Accept-Language': 'ru' } }
        );

        if (!response.ok) return null;

        const data = await response.json();
        return data.display_name || null;
    } catch (error) {
        console.error('Failed to reverse geocode:', error);
    }
    
    return null;
}
