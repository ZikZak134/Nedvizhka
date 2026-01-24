'use client';

import React, { useState, useRef, useCallback } from 'react';
import styles from '../admin.module.css';

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
            return data.url;
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
        <div className={styles.galleryContainer}>
            <label className={styles.galleryLabel}>🖼️ Галерея изображений</label>
            
            {/* Превью загруженных изображений */}
            {images.length > 0 && (
                <div className={styles.galleryGrid}>
                    {images.map((url, index) => (
                        <div key={index} className={styles.galleryItem}>
                            <img 
                                src={
                                    url.startsWith('http') 
                                        ? url 
                                        : `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`
                                } 
                                onError={(e) => {
                                    /* Fallback to local public folder if API fails */
                                    const target = e.target as HTMLImageElement;
                                    if (!target.src.includes(API_URL)) return;
                                    // Try loading directly from Next.js public serve
                                    const relativePath = url.startsWith('/') ? url : `/${url}`;
                                    target.src = relativePath;
                                }}
                                alt={`Preview ${index}`} 
                                className={styles.galleryItemImage} 
                            />
                            <button 
                                type="button"
                                onClick={() => removeImage(index)}
                                className={styles.galleryItemRemove}
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
                className={`${styles.galleryDropzone} ${isDragging ? styles.galleryDropzoneActive : ''}`}
            >
                {isUploading ? (
                    <div>
                        <div className={styles.galleryUploadingIcon}>⏳</div>
                        <p className={styles.galleryUploadingText}>{uploadProgress}</p>
                    </div>
                ) : (
                    <>
                        <div className={styles.galleryDropzoneIcon}>📤</div>
                        <p className={`${styles.galleryDropzoneText} ${isDragging ? styles.galleryDropzoneTextActive : ''}`}>
                            {isDragging ? 'Отпустите для загрузки' : 'Перетащите изображения сюда'}
                        </p>
                        <p className={styles.galleryDropzoneHint}>
                            или нажмите для выбора файлов
                        </p>
                    </>
                )}
            </div>

            {/* Явная кнопка загрузки (по просьбе пользователя) */}
            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center' }}>
                <button
                    type="button"
                    onClick={handleFileSelect}
                    className={styles.btnSecondary}
                    style={{ fontSize: '14px', padding: '8px 24px' }}
                >
                    📁 Выбрать файлы с компьютера
                </button>
            </div>

            {/* Скрытый input для файлов */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                onChange={handleInputChange}
                className={styles.hiddenInput}
                aria-label="Выбор изображений"
            />

            {/* Разделитель */}
            <div className={styles.galleryDivider}>
                <div className={styles.galleryDividerLine} />
                <span className={styles.galleryDividerText}>или добавьте по ссылке</span>
                <div className={styles.galleryDividerLine} />
            </div>

            {/* Добавление по URL */}
            <div className={styles.galleryUrlForm}>
                <input 
                    type="text"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                    placeholder="URL изображения (https://...)"
                    className={styles.galleryUrlInput}
                    aria-label="URL изображения"
                />
                <button 
                    type="button"
                    onClick={addImage}
                    className={styles.galleryUrlBtn}
                >
                    Добавить
                </button>
            </div>

            <p className={styles.galleryHint}>
                Поддерживаемые форматы: JPG, PNG, WebP, GIF. Макс. размер: 10 MB
            </p>
        </div>
    );
}
