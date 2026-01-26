'use client';

import React, { useEffect, useState, useCallback } from 'react';
import styles from '../admin.module.css';
import { useAuth } from '../components/AuthGuard';
import { useToast } from '../components/ToastContainer';
import { Section } from '../components/Section';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface S3File {
  key: string;
  size: number;
  last_modified: string;
  url: string;
}

interface FileListResponse {
  files: S3File[];
  next_token?: string;
}

export default function FilesPage() {
  const { token } = useAuth();
  const { showSuccess, showError } = useToast();
  
  const [files, setFiles] = useState<S3File[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextToken, setNextToken] = useState<string | undefined>(undefined);
  const [uploading, setUploading] = useState(false);

  const fetchFiles = useCallback(async (continuationToken?: string) => {
    try {
      const url = new URL('/api/v1/upload/files', window.location.origin);
      url.searchParams.set('limit', '50');
      if (continuationToken) {
        url.searchParams.set('continuation_token', continuationToken);
      }

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Ошибка загрузки списка');
      
      const data: FileListResponse = await res.json();
      
      if (continuationToken) {
        setFiles(prev => [...prev, ...data.files]);
      } else {
        setFiles(data.files);
      }
      setNextToken(data.next_token);
    } catch (err) {
      showError('Не удалось загрузить файлы');
    } finally {
      setLoading(false);
    }
  }, [token, showError]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleDelete = async (key: string) => {
    if (!confirm('Удалить файл навсегда?')) return;

    try {
      const res = await fetch(`/api/v1/upload/${key}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Ошибка удаления');
      
      setFiles(prev => prev.filter(f => f.key !== key));
      showSuccess('Файл удален');
    } catch (err) {
      showError('Не удалось удалить файл');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`/api/v1/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (!res.ok) throw new Error('Ошибка загрузки');
      
      showSuccess('Файл загружен');
      // Refresh list
      fetchFiles();
    } catch (err) {
      showError('Ошибка загрузки');
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isVideo = (key: string) => /\.(mp4|mov|webm)$/i.test(key);

  return (
    <div className={styles.adminContainer}>
      <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className={styles.pageTitle}>Менеджер файлов (S3)</h1>
        
        <div style={{ position: 'relative' }}>
          <input 
            type="file" 
            id="file-upload" 
            multiple={false}
            onChange={handleFileUpload} 
            style={{ display: 'none' }}
          />
          <label 
            htmlFor="file-upload" 
            className={styles.saveBtn} 
            style={{ cursor: uploading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {uploading ? '⏳ Загрузка...' : '☁️ Загрузить файл'}
          </label>
        </div>
      </header>
      
      <Section title={`Все файлы (${files.length})`}>
        {loading && files.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>Загрузка...</div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
            gap: '16px',
            padding: '16px 0'
          }}>
            {files.map(file => (
              <div key={file.key} style={{ 
                background: '#1e293b', 
                borderRadius: '8px', 
                overflow: 'hidden', 
                border: '1px solid #334155',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ 
                  height: '140px', 
                  background: '#0f172a', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  {isVideo(file.key) ? (
                    <video src={file.url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} controls />
                  ) : (
                    <img 
                      src={file.url} 
                      alt={file.key} 
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      loading="lazy"
                    />
                  )}
                </div>
                
                <div style={{ padding: '10px', fontSize: '12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={file.key}>
                    {file.key}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                    <span>{formatSize(file.size)}</span>
                    <span 
                        onClick={() => {
                          navigator.clipboard.writeText(file.url);
                          showSuccess('Ссылка скопирована');
                        }}
                        style={{ cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Copy URL
                    </span>
                  </div>
                  
                  <button 
                    onClick={() => handleDelete(file.key)}
                    style={{ 
                      marginTop: 'auto',
                      background: 'rgba(239, 68, 68, 0.1)', 
                      color: '#ef4444', 
                      border: 'none', 
                      padding: '6px', 
                      borderRadius: '4px',
                      cursor: 'pointer',
                      width: '100%',
                      textAlign: 'center'
                    }}
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && nextToken && (
          <button 
            onClick={() => fetchFiles(nextToken)}
            style={{ 
              display: 'block', 
              margin: '20px auto', 
              padding: '10px 20px', 
              background: '#334155', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: 'pointer' 
            }}
          >
            Загрузить ещё
          </button>
        )}
        
        {!loading && files.length === 0 && (
           <div style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>
             Корзина пуста. Загрузите файлы!
           </div>
        )}
      </Section>
    </div>
  );
}
