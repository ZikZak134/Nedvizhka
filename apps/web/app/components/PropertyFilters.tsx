'use client';

import { useState } from 'react';

interface Filters {
    min_price?: number;
    max_price?: number;
    min_area?: number;
    max_area?: number;
    rooms?: string;
}

interface PropertyFiltersProps {
    filters: Filters;
    onFilterChange: (filters: Filters) => void;
}

export function PropertyFilters({ filters, onFilterChange }: PropertyFiltersProps) {
    const [localFilters, setLocalFilters] = useState<Filters>(filters);

    const handleInputChange = (key: keyof Filters, value: string) => {
        const numValue = value === '' ? undefined : Number(value);
        setLocalFilters(prev => ({ ...prev, [key]: key === 'rooms' ? value || undefined : numValue }));
    };

    const applyFilters = () => {
        onFilterChange(localFilters);
    };

    const resetFilters = () => {
        const empty = {};
        setLocalFilters(empty);
        onFilterChange(empty);
    };

    return (
        <div className="stack">
            <div className="flex items-center justify-between">
                <h3 className="heading-6">Фильтры</h3>
                <button className="btn btn-ghost btn-sm" onClick={resetFilters}>
                    Сбросить
                </button>
            </div>

            <hr className="divider" />

            {/* Price Range */}
            <div className="stack stack-sm">
                <label className="label">Цена, ₽</label>
                <div className="flex gap-2">
                    <input
                        type="number"
                        className="input"
                        placeholder="От"
                        value={localFilters.min_price || ''}
                        onChange={(e) => handleInputChange('min_price', e.target.value)}
                    />
                    <input
                        type="number"
                        className="input"
                        placeholder="До"
                        value={localFilters.max_price || ''}
                        onChange={(e) => handleInputChange('max_price', e.target.value)}
                    />
                </div>
            </div>

            {/* Area Range */}
            <div className="stack stack-sm">
                <label className="label">Площадь, м²</label>
                <div className="flex gap-2">
                    <input
                        type="number"
                        className="input"
                        placeholder="От"
                        value={localFilters.min_area || ''}
                        onChange={(e) => handleInputChange('min_area', e.target.value)}
                    />
                    <input
                        type="number"
                        className="input"
                        placeholder="До"
                        value={localFilters.max_area || ''}
                        onChange={(e) => handleInputChange('max_area', e.target.value)}
                    />
                </div>
            </div>

            {/* Rooms */}
            <div className="stack stack-sm">
                <label className="label">Комнаты</label>
                <div className="cluster cluster-sm">
                    {['Студия', '1', '2', '3', '4+'].map((room) => (
                        <button
                            key={room}
                            className={`btn btn-sm ${localFilters.rooms === room ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => handleInputChange('rooms', localFilters.rooms === room ? '' : room)}
                        >
                            {room}
                        </button>
                    ))}
                </div>
            </div>

            <hr className="divider" />

            {/* Quick Filters */}
            <div className="stack stack-sm">
                <label className="label">Быстрые фильтры</label>
                <div className="stack stack-sm">
                    <label className="flex items-center gap-3 cursor-pointer" style={{ padding: '8px 0' }}>
                        <input type="checkbox" className="checkbox" />
                        <span className="body-small">С видом на море</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer" style={{ padding: '8px 0' }}>
                        <input type="checkbox" className="checkbox" />
                        <span className="body-small">С бассейном</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer" style={{ padding: '8px 0' }}>
                        <input type="checkbox" className="checkbox" />
                        <span className="body-small">Новостройка</span>
                    </label>
                </div>
            </div>

            <hr className="divider" />

            <button className="btn btn-primary w-full" onClick={applyFilters}>
                Применить фильтры
            </button>
        </div>
    );
}
