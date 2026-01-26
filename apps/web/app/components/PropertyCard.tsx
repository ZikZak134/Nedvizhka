'use client';

import { motion } from 'framer-motion';

import Link from 'next/link';
import { getMockImage } from '../utils/mockImages';
import { formatNumber, formatCurrency } from '../utils/formatters';
import { TouchRipple } from './effects/TouchRipple';

import { Property } from '../types';

interface PropertyCardProps {
    property: Property;
}

const MotionLink = motion.create(Link);

export function PropertyCard({ property }: PropertyCardProps) {
    const formatPrice = (price?: number | null) => formatCurrency(price);

    const placeholderImage = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='250' viewBox='0 0 400 250'%3E%3Crect fill='%23e5e7eb' width='400' height='250'/%3E%3Ctext fill='%239ca3af' font-family='Arial' font-size='14' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EНет фото%3C/text%3E%3C/svg%3E`;

    return (
        <MotionLink 
            href={`/properties/${property.id}`} 
            className="card property-card mobile-card-animated touch-ripple group hover:shadow-premium-xl border border-transparent hover:border-accent-500/30 relative overflow-hidden block" 
            style={{ textDecoration: 'none' }}
            whileHover={{ y: -8, transition: { type: "spring", stiffness: 300 } }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            <TouchRipple />
            
            {/* Image */}
            <div className="relative overflow-hidden aspect-[4/3] group-hover:glimmer">
                <img
                    src={property.images?.[0] || getMockImage(property.id)}
                    alt={property.title}
                    className="card-image w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                        e.currentTarget.src = getMockImage(property.id + '-fallback');
                    }}
                />
                <span className="badge backdrop-blur-md bg-neutral-900/60 text-white border border-white/10" style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 1 }}>
                    {property.source === 'cian' ? 'ЦИАН' :
                        property.source === 'avito' ? 'Авито' :
                            'Вручную'}
                </span>
                {property.is_from_developer && (
                    <span className="badge shadow-premium-sm" style={{ 
                        position: 'absolute', 
                        top: '12px', 
                        right: '12px',
                        background: 'linear-gradient(135deg, var(--color-accent-400) 0%, var(--color-accent-300) 100%)',
                        color: 'var(--color-primary-900)',
                        fontWeight: 600,
                        zIndex: 1
                    }}>
                        🏗️ Застройщик
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="card-body">
                <div className="property-price mb-2">
                    {property.price_per_sqm ? (
                        <>
                            {formatPrice(property.price_per_sqm)} <span style={{ fontSize: '14px', fontWeight: 'normal' }}>₽/м²</span>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 'normal' }}>
                                от {formatPrice(property.price)} ₽
                            </div>
                        </>
                    ) : (
                        <>
                            {formatPrice(property.price)} <span style={{ fontSize: '14px', fontWeight: 'normal' }}>₽</span>
                        </>
                    )}
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

                {/* Developer Info */}
                {(property.layout_type || property.finishing_type || property.completion_date) && (
                    <div className="flex flex-wrap gap-1 mt-2">
                        {property.layout_type && (
                            <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                                {property.layout_type}
                            </span>
                        )}
                        {property.finishing_type && (
                            <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                                {property.finishing_type}
                            </span>
                        )}
                        {property.completion_date && property.completion_date !== 'Сдан' && (
                            <span className="text-xs px-2 py-0.5 rounded bg-orange-500/20 text-orange-300">
                                📅 {property.completion_date}
                            </span>
                        )}
                    </div>
                )}

                {/* Specs */}
                <div className="property-specs">
                    <span className="property-spec">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                        </svg>
                        {property.area_min && property.area_max ? (
                            <>{property.area_min}–{property.area_max} м²</>
                        ) : (
                            <>{property.area_sqm} м²</>
                        )}
                    </span>
                    {(property.rooms || (property.rooms_min && property.rooms_max)) && (
                        <span className="property-spec">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                <polyline points="9,22 9,12 15,12 15,22" />
                            </svg>
                            {property.rooms_min && property.rooms_max ? (
                                <>{property.rooms_min}–{property.rooms_max} комн.</>
                            ) : (
                                <>{property.rooms} комн.</>
                            )}
                        </span>
                    )}
                    {(property.floor && property.total_floors) || (property.floor_min && property.floor_max) ? (
                        <span className="property-spec">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="4" y="2" width="16" height="20" rx="2" />
                                <line x1="8" y1="6" x2="16" y2="6" />
                                <line x1="8" y1="10" x2="16" y2="10" />
                                <line x1="8" y1="14" x2="16" y2="14" />
                                <line x1="8" y1="18" x2="16" y2="18" />
                            </svg>
                            {property.floor_min && property.floor_max ? (
                                <>{property.floor_min}–{property.floor_max}/{property.total_floors} эт.</>
                            ) : (
                                <>{property.floor}/{property.total_floors} эт.</>
                            )}
                        </span>
                    ) : null}
                </div>
            </div>
        </MotionLink>
    );
}
