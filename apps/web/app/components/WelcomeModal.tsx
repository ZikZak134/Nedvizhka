'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center">
                    {/* Backdrop with Blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.7 }}
                        className="absolute inset-0 bg-[#0a1128]/80 backdrop-blur-md"
                        onClick={handleClose}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.95 }}
                        transition={{ 
                            duration: 0.7, 
                            delay: 0.1, 
                            ease: [0.22, 1, 0.36, 1] 
                        }}
                        className="
                            relative w-full max-w-lg mx-4 
                            bg-[#0a1128] border border-[#d4af37]/30 
                            rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)]
                            overflow-hidden
                        "
                    >
                        {/* Decorative Elements */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/10 blur-[50px] rounded-full pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#1a2742]/10 blur-[50px] rounded-full pointer-events-none" />

                        <div className="p-8 md:p-10 text-center relative z-10">
                            {/* Icon / Brand */}
                            <motion.div 
                                initial={{ scale: 0, rotate: -20 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                                className="mb-6 inline-flex p-4 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20"
                            >
                                <span className="text-3xl">🏛️</span>
                            </motion.div>

                            <motion.h2 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="text-3xl md:text-4xl font-serif text-white mb-2 tracking-wide"
                            >
                                Estate<span className="text-[#d4af37]">Analytics</span>
                            </motion.h2>

                            <motion.p 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.8 }}
                                transition={{ delay: 0.5 }}
                                className="text-[#d4af37] text-sm font-medium tracking-[0.2em] uppercase mb-8"
                            >
                                Private Investors Club
                            </motion.p>

                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="space-y-4 mb-10 text-left bg-white/5 p-6 rounded-xl border border-white/5"
                            >
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
                            </motion.div>

                            <motion.button
                                onClick={handleClose}
                                whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(212, 175, 55, 0.4)' }}
                                whileTap={{ scale: 0.98 }}
                                className="
                                    group relative w-full py-4 px-6 
                                    bg-gradient-to-r from-[#d4af37] to-[#b4932a]
                                    text-[#0a1128] font-bold text-lg tracking-wide
                                    rounded-xl shadow-lg shadow-[#d4af37]/20
                                "
                            >
                                <span>Войти в клуб</span>
                            </motion.button>

                            <motion.p 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                                className="mt-4 text-xs text-white/30 text-center"
                            >
                                Только для авторизованных инвесторов
                            </motion.p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
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
