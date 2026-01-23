export const formatNumber = (value: number | string | null | undefined): string => {
    if (value === null || value === undefined) return '';
    const clean = String(value).replace(/\D/g, ''); // Remove non-digits
    if (!clean) return '';
    return clean.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

export const cleanNumber = (value: string): string => {
    return value.replace(/\s/g, '');
};

export const formatCurrency = (value: number | string | null | undefined): string => {
    if (!value) return '';
    return formatNumber(value) + ' ₽';
};
