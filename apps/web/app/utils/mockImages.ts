export const LUXURY_PROPERTY_IMAGES = [
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80', // Modern Manor
    'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80', // Modern Interior
    'https://images.unsplash.com/photo-1600596542815-60c37c65b567?w=800&q=80', // Modern Villa
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80', // Pool House
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80', // Living Room
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80', // Dark Kitchen
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', // Balcony
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80', // Resort
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80', // Palm Villa
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?w=800&q=80', // Facade
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80', // Luxury Home 1
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80', // House
];

/**
 * Returns a deterministic mock image URL based on the property ID.
 * The same ID will always return the same image.
 */
export function getMockImage(id: string | number): string {
    const strId = String(id);
    let hash = 0;
    for (let i = 0; i < strId.length; i++) {
        hash = strId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % LUXURY_PROPERTY_IMAGES.length;
    return LUXURY_PROPERTY_IMAGES[index];
}
