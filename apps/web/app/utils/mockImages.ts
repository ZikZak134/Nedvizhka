export const LUXURY_PROPERTY_IMAGES = [
    'https://images.unsplash.com/photo-1600596542815-60c37c65b567?auto=format&fit=crop&w=800&q=80', // Modern White Villa with Pool
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80', // Balcony with View
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80', // Modern Pool Deck
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80', // Luxury Living Room
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=800&q=80', // Dining Area
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80', // Modern Dark Kitchen
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80', // Tropical White House
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=800&q=80', // Palm Tree Mansion
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80', // Stone Facade
    'https://images.unsplash.com/photo-1576941089067-2de3c901e126?auto=format&fit=crop&w=800&q=80', // Sunny Cottage
    'https://images.unsplash.com/photo-1598228723793-52759bba239c?auto=format&fit=crop&w=800&q=80', // Penthouse Interior
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80', // Cozy Apartment
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
