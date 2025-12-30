export const LUXURY_PROPERTY_IMAGES = [
    'https://images.unsplash.com/photo-1600596542815-60c37c65b567?w=1600&q=80', // Modern Villa with Pool
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&q=80', // Modern Manor
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=80', // Pool House Twilight
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80', // Modern Balcony
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1600&q=80', // Spacious Living Room
    'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=1600&q=80', // Luxury Bedroom
    'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=1600&q=80', // Marble Bathroom
    'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=1600&q=80', // Modern Kitchen
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1600&q=80', // Tropical Villa
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=80', // White House Resort
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1600&q=80', // Classic Mansion
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1600&q=80', // Country House
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
