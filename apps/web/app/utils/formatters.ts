export const formatNumber = (value: number | string | null | undefined): string => {
    if (value === null || value === undefined || value === '') return '';
    const clean = String(value).replace(/\s/g, ''); // Remove existing spaces
    if (isNaN(Number(clean))) return String(value); 
    const numericValue = Number(clean);
    return new Intl.NumberFormat('ru-RU').format(numericValue);
};

export const cleanNumber = (value: string): string => {
    return value.replace(/\s/g, '');
};

export const formatCurrency = (value: number | string | null | undefined): string => {
    if (!value) return '';
    return formatNumber(value) + ' ₽';
};
