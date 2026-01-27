'use client';

import React, { useState, useRef, useCallback } from 'react';
import styles from '../admin.module.css';

interface MarkerIconEditorProps {
    iconUrl: string | null;
    onChange: (url: string) => void;
}

export default function MarkerIconEditor({ iconUrl, onChange }: MarkerIconEditorProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

    const uploadFile = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const token = localStorage.getItem('admin_token');

        try {
            setIsUploading(true);
            // URL handling logic similar to ImageGalleryEditor
            const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
            const uploadEndpoint = baseUrl.endsWith('/api/v1') 
                ? `${baseUrl}/upload` 
                : `${baseUrl}/api/v1/upload`;

            const response = await fetch(uploadEndpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            if (!response.ok) throw new Error('Upload failed');

            const data = await response.json();
            onChange(data.url);
        } catch (error) {
            console.error('Marker upload error:', error);
            alert('Ошибка загрузки иконки');
        } finally {
            setIsUploading(false);
        }
    };

    const handleFiles = (files: FileList | null) => {
        if (files && files[0]) {
            uploadFile(files[0]);
        }
    };

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
    }, []);

    return (
        <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>
                Кастомный значок (PNG, 64x64)
            </label>
            
            <div 
                style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '16px',
                    padding: '16px',
                    border: `2px dashed ${isDragging ? '#d4af37' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '12px',
                    background: isDragging ? 'rgba(212, 175, 55, 0.05)' : 'transparent',
                    transition: 'all 0.2s'
                }}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {/* Preview */}
                <div style={{ 
                    width: '64px', 
                    height: '64px', 
                    background: 'rgba(255,255,255,0.05)', 
                    borderRadius: '8px',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    overflow: 'hidden',
                    flexShrink: 0
                }}>
                    {iconUrl ? (
                         <img 
                            src={iconUrl.startsWith('http') ? iconUrl : `${API_URL}${iconUrl.startsWith('/') ? '' : '/'}${iconUrl}`} 
                            alt="Marker" 
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                if (!target.src.includes(API_URL)) return;
                                const relativePath = iconUrl.startsWith('/') ? iconUrl : `/${iconUrl}`;
                                target.src = relativePath;
                            }}
                        />
                    ) : (
                        <span style={{ fontSize: '24px', opacity: 0.3 }}>📍</span>
                    )}
                </div>

                {/* Controls */}
                <div style={{ flex: 1 }}>
                    {isUploading ? (
                        <div style={{ color: '#d4af37' }}>Загрузка...</div>
                    ) : (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button 
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className={styles.btnSecondary}
                                style={{ padding: '8px 16px', fontSize: '13px' }}
                            >
                                Загрузить файл
                            </button>
                            {iconUrl && (
                                <button
                                    type="button"
                                    onClick={() => onChange('')}
                                    style={{ 
                                        padding: '8px 12px', 
                                        borderRadius: '8px', 
                                        border: '1px solid rgba(239,68,68,0.3)', 
                                        background: 'rgba(239,68,68,0.1)', 
                                        color: '#ef4444',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Удалить
                                </button>
                            )}
                        </div>
                    )}
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#64748b' }}>
                        Перетащите сюда или выберите PNG файл
                    </div>
                </div>
            </div>
            
            <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/webp"
                onChange={(e) => handleFiles(e.target.files)}
                style={{ display: 'none' }}
            />
        </div>
    );
}
