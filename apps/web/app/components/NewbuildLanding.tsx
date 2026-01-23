'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Header } from './Header';
import { Footer } from './Footer';
import { ApartmentGrid } from './ApartmentGrid';
import { LeadCaptureModal } from './LeadCaptureModal';
import { PropertyLocation } from './PropertyLocation';
import { FadeIn } from './animations/FadeIn';

import { Property } from '../types';

interface NewbuildLandingProps {
  property: Property;
}

export function NewbuildLanding({ property }: NewbuildLandingProps) {
  const router = useRouter();
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [leadMode, setLeadMode] = useState<'showing' | 'report' | 'question'>('showing');

  const openLeadModal = (mode: 'showing' | 'report' | 'question') => {
    setLeadMode(mode);
    setIsLeadModalOpen(true);
  };

  const images = property.images.length > 0 ? property.images : [];
  const minPrice = property.price; // Usually newbuild card shows "from X price"

  return (
    <div className="lux-page bg-[#0f172a] min-h-screen text-white font-sans">
      <LeadCaptureModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        mode={leadMode}
        propertyTitle={property.title}
      />
      
      <div className="absolute top-0 left-0 right-0 z-50">
        <Header />
      </div>

      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-end pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={images[0]} 
            alt={property.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/60 to-black/30" />
        </div>

        <div className="relative z-10 container mx-auto px-6">
          <div className="max-w-4xl">
            <div className="flex gap-2 mb-4">
              <span className="bg-[#d4af37] text-black text-sm font-bold px-3 py-1 rounded">
                Новостройка
              </span>
              {property.completion_date && (
                <span className="bg-white/10 backdrop-blur text-white text-sm font-medium px-3 py-1 rounded border border-white/20">
                  {property.completion_date}
                </span>
              )}
            </div>
            
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4 leading-tight">
              {property.title}
            </h1>
            
            <p className="text-xl text-[#cbd5e1] mb-8 flex items-center gap-2">
              <span className="text-[#d4af37]">📍</span>
              {property.address}
            </p>

            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => openLeadModal('showing')}
                className="bg-gradient-to-r from-[#d4af37] to-[#b8860b] text-[#0f172a] font-bold text-lg px-8 py-4 rounded-xl hover:translate-y-[-2px] transition-all shadow-lg shadow-[#d4af37]/20"
              >
                Скачать презентацию
              </button>
              <button 
                onClick={() => document.getElementById('apartments')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white/10 backdrop-blur border border-white/20 text-white font-semibold text-lg px-8 py-4 rounded-xl hover:bg-white/20 transition-all"
              >
                Выбрать квартиру
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Section */}
      <section className="py-20 bg-[#1e293b]/30 border-y border-white/5">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-[#d4af37] text-sm uppercase tracking-widest font-bold mb-2 block">О проекте</span>
            <h2 className="text-3xl font-serif font-bold mb-6">Концепция жизни</h2>
            <div className="prose prose-invert text-[#94a3b8] mb-8 whitespace-pre-line">
              {property.description}
            </div>
            
            {property.is_from_developer && property.developer_name && (
              <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="w-12 h-12 rounded-full bg-[#d4af37] flex items-center justify-center text-black font-bold text-xl">
                  {property.developer_name[0]}
                </div>
                <div>
                  <div className="text-xs text-[#64748b] uppercase">Застройщик</div>
                  <div className="text-white font-bold">{property.developer_name}</div>
                </div>
              </div>
            )}
            
            {property.developer_comment && (
               <div className="mt-6 pl-4 border-l-2 border-[#d4af37] italic text-[#cbd5e1]">
                 "{property.developer_comment}"
               </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {images.slice(1, 5).map((img, idx) => (
              <img 
                key={idx} 
                src={img} 
                alt="Gallery" 
                className={`rounded-xl object-cover w-full h-48 border border-white/10 ${idx === 0 ? 'col-span-2 h-64' : ''}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Apartments Grid */}
      <section id="apartments" className="py-20">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-[#d4af37] text-sm uppercase tracking-widest font-bold mb-2 block">Выбор планировки</span>
              <h2 className="text-3xl font-serif font-bold">Квартиры в продаже</h2>
            </div>
            {/* Filters could go here later */}
          </div>

          {property.complex_id ? (
            <ApartmentGrid complexId={property.complex_id} />
          ) : (
            <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
              <div className="text-2xl mb-2">🏗️</div>
              <h3 className="text-xl font-bold mb-2">Квартиры загружаются</h3>
              <p className="text-[#94a3b8]">Свяжитесь с менеджером для актуальной шахматки</p>
              <button 
                 onClick={() => openLeadModal('question')}
                 className="mt-4 px-6 py-2 bg-[#d4af37] text-black font-bold rounded-lg"
              >
                Получить шахматку
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Key Features */}
      {property.features && (
        <section className="py-20 bg-[#0f172a]">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-serif font-bold mb-12 text-center">Преимущества</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {Object.entries(property.features).slice(0, 8).map(([key, value]) => (
                <div key={key} className="text-center p-6 bg-white/5 rounded-xl border border-white/10 hover:border-[#d4af37]/50 transition-colors">
                  <div className="text-[#94a3b8] text-sm mb-2">{key}</div>
                  <div className="text-white font-bold text-lg">{String(value)}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Location */}
      <section className="py-20 bg-[#1e293b]/30">
        <div className="container mx-auto px-6">
           <h2 className="text-3xl font-serif font-bold mb-8">Расположение</h2>
           <div className="h-[400px] rounded-xl overflow-hidden border border-white/10">
             {property.latitude && property.longitude ? (
               <PropertyLocation 
                 propertyId={property.id} 
                 address={property.address} 
                 latitude={property.latitude} 
                 longitude={property.longitude} 
               />
             ) : (
               <div className="w-full h-full flex items-center justify-center bg-[#0f172a] text-[#94a3b8]">
                 Карта недоступна
               </div>
             )}
           </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
