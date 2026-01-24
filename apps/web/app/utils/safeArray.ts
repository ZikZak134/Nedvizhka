/**
 * Утилиты для безопасной работы с массивами
 * 
 * Гарантируют, что операции .map(), .filter(), .find() и др.
 * никогда не упадут с ошибкой "e.map is not a function"
 */

/**
 * Преобразует любое значение в массив
 * Если значение уже массив — возвращает его
 * Если null/undefined — возвращает пустой массив
 * Если объект с `items` — извлекает items
 * Если объект с `features` — извлекает features
 */
export function toArray<T>(value: unknown): T[] {
    // Уже массив
    if (Array.isArray(value)) {
        return value as T[];
    }
    
    // null или undefined
    if (value == null) {
        return [];
    }
    
    // Объект с items (пагинированный API ответ)
    if (typeof value === 'object' && 'items' in value) {
        const items = (value as { items?: unknown }).items;
        if (Array.isArray(items)) {
            return items as T[];
        }
    }
    
    // Объект с features (GeoJSON)
    if (typeof value === 'object' && 'features' in value) {
        const features = (value as { features?: unknown }).features;
        if (Array.isArray(features)) {
            return features as T[];
        }
    }
    
    // Всё остальное — пустой массив
    return [];
}

/**
 * Безопасный .map() — никогда не упадёт
 */
export function safeMap<T, R>(
    value: T[] | null | undefined,
    callback: (item: T, index: number, array: T[]) => R
): R[] {
    const arr = toArray<T>(value);
    return arr.map(callback);
}

/**
 * Безопасный .filter() — никогда не упадёт
 */
export function safeFilter<T>(
    value: T[] | null | undefined,
    predicate: (item: T, index: number, array: T[]) => boolean
): T[] {
    const arr = toArray<T>(value);
    return arr.filter(predicate);
}

/**
 * Безопасный .find() — никогда не упадёт
 */
export function safeFind<T>(
    value: T[] | null | undefined,
    predicate: (item: T, index: number, array: T[]) => boolean
): T | undefined {
    const arr = toArray<T>(value);
    return arr.find(predicate);
}

/**
 * Безопасный .forEach() — никогда не упадёт
 */
export function safeForEach<T>(
    value: T[] | null | undefined,
    callback: (item: T, index: number, array: T[]) => void
): void {
    const arr = toArray<T>(value);
    arr.forEach(callback);
}

/**
 * Проверяет, что значение является непустым массивом
 */
export function hasItems<T>(value: unknown): value is T[] {
    return Array.isArray(value) && value.length > 0;
}
