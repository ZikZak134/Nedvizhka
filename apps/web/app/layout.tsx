import type { Metadata, Viewport } from 'next';
import './globals.css';
import './styles/elite-theme.css';
import './styles/luxury-property.css';
import './styles/luxury-typography.css';
import { ThemeProvider } from './providers/ThemeProvider';
import { GlowTrailOverlay } from './components/effects/GlowTrailOverlay';
import { ElitePreloader } from './components/effects/ElitePreloader';
import { playfair, inter, cormorant, tangerine } from './fonts/luxury';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0f172a',
};

export const metadata: Metadata = {
  title: 'EstateAnalytics — Аналитика элитной недвижимости Сочи', // Modified title
  description: 'Интерактивная карта и аналитика премиум-недвижимости с прогнозами роста цен', // Modified description
  keywords: ['real estate', 'sochi', 'analytics', 'luxury'], // Kept existing keywords
  manifest: '/manifest.json', // Kept existing manifest
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'EstateAnalytics',
  }, // Kept existing appleWebApp
  formatDetection: {
    telephone: false,
  }, // Kept existing formatDetection
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={`${playfair.variable} ${inter.variable} ${cormorant.variable} ${tangerine.variable} elite-animated-bg`}
        suppressHydrationWarning
      >
        {/* Elite Effects */}
        <GlowTrailOverlay /> {/* Added effect component */}
        <ElitePreloader /> {/* Added effect component */}

        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
