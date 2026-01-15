'use client';

import React, { useState, useRef, useCallback } from 'react';

interface ImageGalleryEditorProps {
    images: string[];
    onChange: (images: string[]) => void;
}

export default function ImageGalleryEditor({ images, onChange }: ImageGalleryEditorProps) {
    const [newUrl, setNewUrl] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    // Загрузка файла на сервер
    const uploadFile = async (file: File): Promise<string | null> => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${API_URL}/api/v1/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Ошибка загрузки');
            }

            const data = await response.json();
            return data.url; // /uploads/filename.ext
        } catch (error) {
            console.error('Upload error:', error);
            return null;
        }
    };

    // Обработка загрузки файлов
    const handleFiles = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        setIsUploading(true);
        const newImages: string[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            setUploadProgress(`Загрузка ${i + 1}/${files.length}: ${file.name}`);
            
            const url = await uploadFile(file);
            if (url) {
                newImages.push(url);
            }
        }

        if (newImages.length > 0) {
            onChange([...images, ...newImages]);
        }

        setIsUploading(false);
        setUploadProgress('');
    };

    // Добавление по URL
    const addImage = () => {
        if (newUrl.trim()) {
            onChange([...images, newUrl.trim()]);
            setNewUrl('');
        }
    };

    // Удаление изображения
    const removeImage = (index: number) => {
        const updated = images.filter((_, i) => i !== index);
        onChange(updated);
    };

    // Drag & Drop handlers
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

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        
        const files = e.dataTransfer.files;
        handleFiles(files);
    }, [images, onChange]);

    // Клик по кнопке выбора файла
    const handleFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <label style={{ display: 'block', marginBottom: '12px', fontWeight: 600 }}>🖼️ Галерея изображений</label>
            
            {/* Превью загруженных изображений */}
            {images.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                    {images.map((url, index) => (
                        <div key={index} style={{ position: 'relative', aspectRatio: '1/1', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <img src={url} alt={`Preview ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button 
                                type="button"
                                onClick={() => removeImage(index)}
                                style={{ 
                                    position: 'absolute', top: '4px', right: '4px', background: 'rgba(220, 38, 38, 0.8)', 
                                    color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '2px 6px', fontSize: '10px' 
                                }}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Зона Drag & Drop */}
            <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={handleFileSelect}
                style={{
                    border: `2px dashed ${isDragging ? '#d4af37' : 'rgba(255,255,255,0.2)'}`,
                    borderRadius: '12px',
                    padding: '32px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    marginBottom: '16px',
                    background: isDragging ? 'rgba(212, 175, 55, 0.1)' : 'rgba(255,255,255,0.02)',
                    transition: 'all 0.2s ease',
                }}
            >
                {isUploading ? (
                    <div>
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
                        <p style={{ color: '#d4af37', fontSize: '14px' }}>{uploadProgress}</p>
                    </div>
                ) : (
                    <>
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>📤</div>
                        <p style={{ color: isDragging ? '#d4af37' : '#94a3b8', fontSize: '14px', margin: 0 }}>
                            {isDragging ? 'Отпустите для загрузки' : 'Перетащите изображения сюда'}
                        </p>
                        <p style={{ color: '#64748b', fontSize: '12px', margin: '8px 0 0 0' }}>
                            или нажмите для выбора файлов
                        </p>
                    </>
                )}
            </div>

            {/* Скрытый input для файлов */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                onChange={handleInputChange}
                style={{ display: 'none' }}
            />

            {/* Разделитель */}
            <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0', gap: '12px' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                <span style={{ color: '#64748b', fontSize: '12px' }}>или добавьте по ссылке</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
            </div>

            {/* Добавление по URL */}
            <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                    type="text"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                    placeholder="URL изображения (https://...)"
                    style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                />
                <button 
                    type="button"
                    onClick={addImage}
                    style={{ padding: '10px 16px', background: 'rgba(212, 175, 55, 0.2)', color: '#d4af37', border: '1px solid #d4af37', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                >
                    Добавить
                </button>
            </div>

            <p style={{ marginTop: '12px', fontSize: '11px', color: '#64748b' }}>
                Поддерживаемые форматы: JPG, PNG, WebP, GIF. Макс. размер: 10 MB
            </p>
        </div>
    );
}
