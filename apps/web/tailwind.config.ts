import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                primary: {
                    50: "var(--color-primary-50)",
                    100: "var(--color-primary-100)",
                    200: "var(--color-primary-200)",
                    300: "var(--color-primary-300)",
                    400: "var(--color-primary-400)",
                    500: "var(--color-primary-500)",
                    600: "var(--color-primary-600)",
                    700: "var(--color-primary-700)",
                    800: "var(--color-primary-800)",
                    900: "var(--color-primary-900)",
                },
                accent: {
                    50: "var(--color-accent-50)",
                    100: "var(--color-accent-100)",
                    200: "var(--color-accent-200)",
                    300: "var(--color-accent-300)",
                    400: "var(--color-accent-400)",
                    500: "var(--color-accent-500)",
                    600: "var(--color-accent-600)",
                    700: "var(--color-accent-700)",
                    800: "var(--color-accent-800)",
                    900: "var(--color-accent-900)",
                },
                neutral: {
                    50: "var(--color-neutral-50)",
                    100: "var(--color-neutral-100)",
                    200: "var(--color-neutral-200)",
                    300: "var(--color-neutral-300)",
                    400: "var(--color-neutral-400)",
                    500: "var(--color-neutral-500)",
                    600: "var(--color-neutral-600)",
                    700: "var(--color-neutral-700)",
                    800: "var(--color-neutral-800)",
                    900: "var(--color-neutral-900)",
                    950: "var(--color-neutral-950)",
                }
            },
            fontFamily: {
                sans: ['var(--font-sans)', 'sans-serif'],
                display: ['var(--font-display)', 'sans-serif'],
                mono: ['var(--font-mono)', 'monospace'],
            },
            transitionDuration: {
                'fast': 'var(--transition-fast)',
                'normal': 'var(--transition-normal)',
                'slow': 'var(--transition-slow)',
                'slower': 'var(--transition-slower)',
            },
            animation: {
                'fadeIn': 'fadeIn var(--transition-normal) ease-out',
                'fadeInUp': 'fadeInUp var(--transition-normal) ease-out',
                'slideInRight': 'slideInRight var(--transition-normal) ease-out',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            boxShadow: {
                'premium-sm': 'var(--shadow-sm)',
                'premium-md': 'var(--shadow-md)',
                'premium-lg': 'var(--shadow-lg)',
                'premium-xl': 'var(--shadow-xl)',
                'premium-2xl': 'var(--shadow-2xl)',
            }
        },
    },
    plugins: [],
};
export default config;
