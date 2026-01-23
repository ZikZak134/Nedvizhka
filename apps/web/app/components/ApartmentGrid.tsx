'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Apartment {
  id: string;
  title: string;
  price: number;
  area_sqm: number;
  rooms: string | null;
  floor: number | null;
  layout_type: string | null;
  finishing_type: string | null;
  images: string[];
}

interface ApartmentGridProps {
  complexId: number;
}

export function ApartmentGrid({ complexId }: ApartmentGridProps) {
  const router = useRouter();
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApartments = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiUrl}/api/v1/complexes/${complexId}/apartments`);
        if (!res.ok) throw new Error('Failed to fetch apartments');
        const data = await res.json();
        setApartments(data);
      } catch (err) {
        console.error(err);
        // Silent error or show toast? Silent is better for a section.
      } finally {
        setLoading(false);
      }
    };

    if (complexId) fetchApartments();
  }, [complexId]);

  if (loading) {
    return <div className="py-8 text-center text-[#94a3b8]">Загрузка квартир...</div>;
  }

  if (apartments.length === 0) {
    return <div className="py-8 text-center text-[#94a3b8]">Квартиры в продаже пока отсутствуют</div>;
  }

  // Group by rooms? Or just list?
  // Let's just list provided design is "Grid".

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {apartments.map((apt) => (
        <div 
          key={apt.id} 
          className="bg-[#1e293b]/50 border border-white/10 rounded-xl overflow-hidden cursor-pointer hover:border-[#d4af37]/50 transition-all hover:-translate-y-1 group"
          onClick={() => router.push(`/properties/${apt.id}`)}
        >
          {/* Image */}
          <div className="h-48 relative overflow-hidden bg-[#0f172a]">
            {apt.images?.[0] ? (
              <img 
                src={apt.images[0]} 
                alt={apt.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-[#64748b]">Нет фото</div>
            )}
            <div className="absolute top-2 left-2 bg-[#d4af37] text-black text-xs font-bold px-2 py-1 rounded">
              {apt.layout_type || 'Квартира'}
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="text-white font-semibold text-lg mb-1 truncate">{apt.title}</h3>
            <div className="flex items-center gap-2 text-[#94a3b8] text-sm mb-3">
              <span>{apt.area_sqm} м²</span>
              <span>•</span>
              <span>{apt.floor} этаж</span>
              <span>•</span>
              <span>{apt.finishing_type || 'Без отделки'}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-[#d4af37] font-bold text-lg">
                {formatPrice(apt.price)}
              </div>
              <button className="text-sm text-white/50 hover:text-white transition-colors">
                Подробнее →
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
