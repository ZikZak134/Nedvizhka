import { Playfair_Display, Inter, Cormorant_Garamond, Tangerine } from 'next/font/google';

// Luxury Serif for Headings (Sotheby's style)
export const playfair = Playfair_Display({
    subsets: ['latin', 'cyrillic'],
    weight: ['400', '500', '600', '700', '800', '900'],
    display: 'swap',
    variable: '--font-heading',
});

// Clean Sans-serif for Body
export const inter = Inter({
    subsets: ['latin', 'cyrillic'],
    display: 'swap',
    variable: '--font-body',
});

// Accent Serif for Quotes/Highlights
export const cormorant = Cormorant_Garamond({
    subsets: ['latin', 'cyrillic'],
    weight: ['300', '400', '500', '600', '700'],
    display: 'swap',
    variable: '--font-accent',
});

// Handwritten Script for Vintage 19th Century Style
export const tangerine = Tangerine({
    subsets: ['latin'],
    weight: ['400', '700'],
    display: 'swap',
    variable: '--font-handwritten',
});

