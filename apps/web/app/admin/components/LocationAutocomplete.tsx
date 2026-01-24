'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from '../admin.module.css';

interface Suggestion {
    display_name: string;
    lat: string;
    lon: string;
}

interface LocationAutocompleteProps {
    value: string;
    onChange: (address: string) => void;
    onSelect: (lat: number, lon: number, address: string) => void;
    error?: string;
}

export default function LocationAutocomplete({ value, onChange, onSelect, error }: LocationAutocompleteProps) {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Debounce search
    useEffect(() => {
        if (!value || value.length < 3) {
            setSuggestions([]);
            return;
        }

        // Don't search if specific selection was just made (hacky but effective logic control required externally, 
        // relying on user typing for now)
        // Check if value matches one of suggestions? No. simple debounce.

        const timer = setTimeout(async () => {
            setIsLoading(true);
            try {
                // Bias towards Sochi (viewbox)
                // Sochi Box: 39.5, 43.4, 40.0, 43.7
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&viewbox=39.5,43.4,40.0,43.7&bounded=1&limit=5`,
                    { headers: { 'Accept-Language': 'ru' } }
                );
                if (res.ok) {
                    const data = await res.json();
                    setSuggestions(data);
                    setIsOpen(true);
                }
            } catch (err) {
                console.error('Nominatim search error:', err);
            } finally {
                setIsLoading(false);
            }
        }, 800);

        return () => clearTimeout(timer);
    }, [value]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (s: Suggestion) => {
        setIsOpen(false);
        // Clean address name (Nominatim too prolix)
        // Keep it simple for now
        onChange(s.display_name);
        onSelect(parseFloat(s.lat), parseFloat(s.lon), s.display_name);
    };

    return (
        <div className={styles.inputWrapper} ref={wrapperRef} style={{ position: 'relative' }}>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => { if (suggestions.length > 0) setIsOpen(true); }}
                placeholder="Начните вводить адрес (Сочи...)"
                className={`${styles.formInput} ${error ? styles.inputError : ''}`}
            />
            {isLoading && (
                <div style={{ position: 'absolute', right: '12px', top: '12px', fontSize: '12px' }}>⏳</div>
            )}
            
            {isOpen && suggestions.length > 0 && (
                <ul style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    marginTop: '4px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    zIndex: 1000,
                    listStyle: 'none',
                    padding: 0,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}>
                    {suggestions.map((s, i) => (
                        <li 
                            key={i + s.lat}
                            onClick={() => handleSelect(s)}
                            style={{
                                padding: '8px 12px',
                                cursor: 'pointer',
                                borderBottom: i < suggestions.length - 1 ? '1px solid #334155' : 'none',
                                fontSize: '13px',
                                color: '#e2e8f0',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#334155'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            {s.display_name}
                        </li>
                    ))}
                </ul>
            )}
            {error && <span className={styles.errorMessage}>{error}</span>}
        </div>
    );
}
