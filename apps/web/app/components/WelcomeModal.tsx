'use client';

import { useEffect, useState } from 'react';

export function WelcomeModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Check if user has visited before
        const hasVisited = localStorage.getItem('estate_has_visited');
        if (!hasVisited) {
            // Small delay for smooth entrance
            const timer = setTimeout(() => setIsOpen(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem('estate_has_visited', 'true');
    };

    if (!mounted) return null;

    return (
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-700 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        >
            {/* Backdrop with Blur */}
            <div
                className="absolute inset-0 bg-[#0a1128]/80 backdrop-blur-md transition-all duration-700"
                onClick={handleClose}
            />

            {/* Modal Content */}
            <div
                className={`
                    relative w-full max-w-lg mx-4 
                    bg-[#0a1128] border border-[#d4af37]/30 
                    rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)]
                    overflow-hidden
                    transform transition-all duration-700 delay-100 ease-out
                    ${isOpen ? 'translate-y-0 scale-100' : 'translate-y-8 scale-95'}
                `}
            >
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/10 blur-[50px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#1a2742]/10 blur-[50px] rounded-full pointer-events-none" />

                <div className="p-8 md:p-10 text-center relative z-10">
                    {/* Icon / Brand */}
                    <div className="mb-6 inline-flex p-4 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20">
                        <span className="text-3xl">🏛️</span>
                    </div>

                    <h2 className="text-3xl md:text-4xl font-serif text-white mb-2 tracking-wide">
                        Estate<span className="text-[#d4af37]">Analytics</span>
                    </h2>

                    <p className="text-[#d4af37] text-sm font-medium tracking-[0.2em] uppercase mb-8 opacity-80">
                        Private Investors Club
                    </p>

                    <div className="space-y-4 mb-10 text-left bg-white/5 p-6 rounded-xl border border-white/5">
                        <FeatureItem
                            icon="💎"
                            title="Эксклюзивная база"
                            desc="Доступ к закрытым объектам Сочи, недоступным на публичных площадках."
                        />
                        <FeatureItem
                            icon="📈"
                            title="Инвестиционная аналитика"
                            desc="Реальная доходность (ROI), история цен и прогнозы роста."
                        />
                        <FeatureItem
                            icon="🤝"
                            title="Прямые контакты"
                            desc="Связь с владельцами и проверенными брокерами без посредников."
                        />
                    </div>

                    <button
                        onClick={handleClose}
                        className="
                            group relative w-full py-4 px-6 
                            bg-gradient-to-r from-[#d4af37] to-[#b4932a]
                            hover:from-[#bf9b30] hover:to-[#a08225]
                            text-[#0a1128] font-bold text-lg tracking-wide
                            rounded-xl shadow-lg shadow-[#d4af37]/20
                            transform transition-all duration-300
                            hover:shadow-[#d4af37]/40 hover:-translate-y-0.5
                            active:translate-y-0
                        "
                    >
                        <span>Войти в клуб</span>
                    </button>

                    <p className="mt-4 text-xs text-white/30 text-center">
                        Только для авторизованных инвесторов
                    </p>
                </div>
            </div>
        </div>
    );
}

function FeatureItem({ icon, title, desc }: { icon: string, title: string, desc: string }) {
    return (
        <div className="flex items-start gap-4">
            <span className="text-xl mt-1">{icon}</span>
            <div>
                <h3 className="text-white font-serif text-lg mb-1">{title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}
