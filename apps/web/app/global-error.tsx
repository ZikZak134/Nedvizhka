'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global Error:', error);
  }, [error]);

  return (
    <html>
      <body style={{ margin: 0, padding: 0, background: '#0f172a', color: 'white', fontFamily: 'sans-serif' }}>
        <div style={{ 
            height: '100vh', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            textAlign: 'center',
            padding: '20px'
        }}>
          <h1 style={{ color: '#d4af37', marginBottom: '16px' }}>Что-то пошло не так</h1>
          <p style={{ color: '#94a3b8', marginBottom: '32px', maxWidth: '500px' }}>
            Произошла критическая ошибка. Мы уже работаем над её устранением.
            Попробуйте обновить страницу.
          </p>
          <button
            onClick={() => reset()}
            style={{
                background: '#d4af37',
                color: '#000',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
            }}
          >
            Обновить страницу
          </button>
          {process.env.NODE_ENV === 'development' && (
              <pre style={{ 
                  marginTop: '40px', 
                  padding: '20px', 
                  background: 'rgba(0,0,0,0.3)', 
                  borderRadius: '8px',
                  color: '#ef4444',
                  textAlign: 'left',
                  maxWidth: '800px',
                  overflow: 'auto'
              }}>
                  {error.message}
                  {error.stack}
              </pre>
          )}
        </div>
      </body>
    </html>
  );
}
