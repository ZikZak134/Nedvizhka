export interface NavLink {
    href: string;
    label: string;
    icon?: string;
}

export const NAV_LINKS: NavLink[] = [
    { href: '/', label: 'Главная', icon: '🏠' },
    { href: '/properties', label: 'Объекты', icon: '📋' },
    { href: '/map', label: 'Карта', icon: '🗺️' },
    { href: '/complexes', label: 'ЖК', icon: '🏢' },
    { href: '/analytics', label: 'Аналитика', icon: '📊' },
];

export const UTILITY_LINKS: NavLink[] = [
    { href: '/about', label: 'О проекте' },
    { href: '/showcase', label: 'Витрина компонентов' },
];

export const ALL_ROUTES = [...NAV_LINKS, ...UTILITY_LINKS];
