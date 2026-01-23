'use client';

import { useState } from 'react';
import styles from '../admin.module.css';

interface VideoEditorProps {
  videos: string[];
  onChange: (videos: string[]) => void;
}

/**
 * Компонент для добавления видео по URL (YouTube, Vimeo, прямые ссылки).
 */
export function VideoEditor({ videos, onChange }: VideoEditorProps) {
  const [newUrl, setNewUrl] = useState('');
  const [error, setError] = useState('');

  // Проверка и нормализация URL
  const normalizeVideoUrl = (url: string): string | null => {
    const trimmed = url.trim();
    if (!trimmed) return null;

    // YouTube
    const ytMatch = trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) {
      return `https://www.youtube.com/embed/${ytMatch[1]}`;
    }

    // Vimeo
    const vimeoMatch = trimmed.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    // Direct video URL (mp4, webm, etc.)
    if (/\.(mp4|webm|ogg|mov)$/i.test(trimmed) || trimmed.startsWith('http')) {
      return trimmed;
    }

    return null;
  };

  const addVideo = () => {
    const normalized = normalizeVideoUrl(newUrl);
    if (!normalized) {
      setError('Некорректный URL. Поддерживаются: YouTube, Vimeo, прямые ссылки на видео.');
      return;
    }

    if (videos.includes(normalized)) {
      setError('Это видео уже добавлено');
      return;
    }

    onChange([...videos, normalized]);
    setNewUrl('');
    setError('');
  };

  const removeVideo = (index: number) => {
    onChange(videos.filter((_, i) => i !== index));
  };

  // Определяем тип видео для превью
  const getVideoType = (url: string): 'youtube' | 'vimeo' | 'direct' => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('vimeo.com')) return 'vimeo';
    return 'direct';
  };

  const getYouTubeThumbnail = (url: string): string => {
    const match = url.match(/embed\/([a-zA-Z0-9_-]{11})/);
    return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : '';
  };

  return (
    <div className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionIcon}>🎬</span>
        <h3 className={styles.sectionTitle}>Видео</h3>
      </div>

      {/* Список видео */}
      {videos.length > 0 && (
        <div className={styles.videoGrid}>
          {videos.map((url, idx) => {
            const type = getVideoType(url);
            return (
              <div key={idx} className={styles.videoItem}>
                {type === 'youtube' ? (
                  <img 
                    src={getYouTubeThumbnail(url)} 
                    alt="YouTube video" 
                    className={styles.videoThumb}
                  />
                ) : type === 'vimeo' ? (
                  <div className={styles.videoPlaceholder}>
                    <span>▶️ Vimeo</span>
                  </div>
                ) : (
                  <video src={url} className={styles.videoThumb} muted />
                )}
                <div className={styles.videoOverlay}>
                  <span className={styles.videoType}>{type.toUpperCase()}</span>
                  <button 
                    type="button"
                    onClick={() => removeVideo(idx)}
                    className={styles.videoRemove}
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Добавление нового видео */}
      <div className={styles.videoAddRow}>
        <input
          type="text"
          value={newUrl}
          onChange={(e) => { setNewUrl(e.target.value); setError(''); }}
          placeholder="Вставьте ссылку на YouTube, Vimeo или прямую ссылку на видео"
          className={styles.formInput}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addVideo())}
        />
        <button 
          type="button"
          onClick={addVideo}
          className={styles.btnSecondary}
        >
          + Добавить
        </button>
      </div>

      {error && <p className={styles.formError}>{error}</p>}

      <p className={styles.helperText}>
        Поддерживаются: YouTube, Vimeo, прямые ссылки на .mp4/.webm файлы
      </p>
    </div>
  );
}
