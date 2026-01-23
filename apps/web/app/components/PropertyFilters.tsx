'use client';

import { useState } from 'react';

interface Filters {
    min_price?: number;
    max_price?: number;
    min_area?: number;
    max_area?: number;
    rooms?: string;
    layout_type?: string;
    finishing_type?: string;
    is_from_developer?: boolean;
}

interface PropertyFiltersProps {
    filters: Filters;
    onFilterChange: (filters: Filters) => void;
}

export function PropertyFilters({ filters, onFilterChange }: PropertyFiltersProps) {
    const [localFilters, setLocalFilters] = useState<Filters>(filters);

    const handleInputChange = (key: keyof Filters, value: any) => {
        const numValue = (value === '' || value === undefined) ? undefined : Number(value);
        
        let finalValue = value;
        if (key === 'min_price' || key === 'max_price' || key === 'min_area' || key === 'max_area') {
            finalValue = numValue;
        }
        
        setLocalFilters(prev => ({ ...prev, [key]: finalValue }));
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
                            onClick={() => handleInputChange('rooms', localFilters.rooms === room ? undefined : room)}
                        >
                            {room}
                        </button>
                    ))}
                </div>
            </div>

            {/* Layout Type */}
            <div className="stack stack-sm">
                <label className="label">Планировка</label>
                <select 
                    className="input"
                    value={localFilters.layout_type || ''}
                    onChange={(e) => handleInputChange('layout_type', e.target.value || undefined)}
                >
                    <option value="">Любая</option>
                    <option value="Свободная">Свободная</option>
                    <option value="Фиксированная">Фиксированная</option>
                    <option value="Студия">Студия</option>
                    <option value="Евро">Евро</option>
                </select>
            </div>

            {/* Finishing Type */}
            <div className="stack stack-sm">
                <label className="label">Отделка</label>
                <select 
                    className="input"
                    value={localFilters.finishing_type || ''}
                    onChange={(e) => handleInputChange('finishing_type', e.target.value || undefined)}
                >
                    <option value="">Любая</option>
                    <option value="Черновая">Черновая</option>
                    <option value="Предчистовая">Предчистовая</option>
                    <option value="Чистовая">Чистовая / Под ключ</option>
                    <option value="Дизайнерская">Дизайнерская</option>
                </select>
            </div>

            <hr className="divider" />

            {/* Quick Filters */}
            <div className="stack stack-sm">
                <label className="label">Тип объекта</label>
                <div className="stack stack-sm">
                    <label className="flex items-center gap-3 cursor-pointer" style={{ padding: '8px 0' }}>
                        <input 
                            type="checkbox" 
                            className="checkbox"
                            checked={localFilters.is_from_developer || false}
                            onChange={(e) => handleInputChange('is_from_developer', e.target.checked ? true : undefined)}
                        />
                        <span className="body-small">От застройщика</span>
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
