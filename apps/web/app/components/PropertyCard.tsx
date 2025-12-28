import Link from 'next/link';

interface Property {
    id: string;
    title: string;
    description: string | null;
    price: number;
    currency: string;
    address: string;
    area_sqm: number;
    rooms: string | null;
    floor: number | null;
    total_floors: number | null;
    images: string[];
    source: string;
}

interface PropertyCardProps {
    property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
    const formatPrice = (price: number) => {
        if (price >= 1000000) {
            return `${(price / 1000000).toFixed(1)} млн`;
        }
        return price.toLocaleString('ru-RU');
    };

    const placeholderImage = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='250' viewBox='0 0 400 250'%3E%3Crect fill='%23e5e7eb' width='400' height='250'/%3E%3Ctext fill='%239ca3af' font-family='Arial' font-size='14' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EНет фото%3C/text%3E%3C/svg%3E`;

    return (
        <Link href={`/properties/${property.id}`} className="card property-card touch-ripple" style={{ textDecoration: 'none' }}>
            {/* Image */}
            <div className="relative">
                <img
                    src={property.images?.[0] || placeholderImage}
                    alt={property.title}
                    className="card-image"
                    style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                    loading="lazy"
                />
                <span className="badge badge-neutral" style={{ position: 'absolute', top: '12px', left: '12px' }}>
                    {property.source === 'cian' ? 'ЦИАН' :
                        property.source === 'avito' ? 'Авито' :
                            'Вручную'}
                </span>
            </div>

            {/* Content */}
            <div className="card-body">
                <div className="property-price mb-2">
                    {formatPrice(property.price)} <span style={{ fontSize: '14px', fontWeight: 'normal' }}>₽</span>
                </div>

                <h3 className="card-title" style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                }}>
                    {property.title}
                </h3>

                <p className="card-subtitle" style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                }}>
                    📍 {property.address}
                </p>

                {/* Specs */}
                <div className="property-specs">
                    <span className="property-spec">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                        </svg>
                        {property.area_sqm} м²
                    </span>
                    {property.rooms && (
                        <span className="property-spec">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                <polyline points="9,22 9,12 15,12 15,22" />
                            </svg>
                            {property.rooms} комн.
                        </span>
                    )}
                    {property.floor && property.total_floors && (
                        <span className="property-spec">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="4" y="2" width="16" height="20" rx="2" />
                                <line x1="8" y1="6" x2="16" y2="6" />
                                <line x1="8" y1="10" x2="16" y2="10" />
                                <line x1="8" y1="14" x2="16" y2="14" />
                                <line x1="8" y1="18" x2="16" y2="18" />
                            </svg>
                            {property.floor}/{property.total_floors} эт.
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}
