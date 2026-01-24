'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div style={{ 
        height: 'calc(100vh - 80px)', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        textAlign: 'center',
        padding: '20px',
        color: 'white'
    }}>
      <h2 style={{ color: '#d4af37', marginBottom: '16px', fontSize: '24px' }}>Произошла ошибка</h2>
      <p style={{ color: '#94a3b8', marginBottom: '32px', maxWidth: '500px' }}>
        Не удалось загрузить часть контента. Попробуйте повторить попытку.
      </p>
      <button
        onClick={() => reset()}
        style={{
            background: 'transparent',
            color: '#d4af37',
            border: '1px solid #d4af37',
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
        }}
      >
        Повторить попытку
      </button>
      {process.env.NODE_ENV === 'development' && (
          <div style={{ 
              marginTop: '40px', 
              padding: '16px', 
              background: 'rgba(255,255,255,0.05)', 
              borderRadius: '8px',
              color: '#ef4444',
              textAlign: 'left',
              maxWidth: '600px',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
          }}>
              <p style={{ margin: 0, fontWeight: 'bold' }}>{error.name}: {error.message}</p>
          </div>
      )}
    </div>
  );
}
