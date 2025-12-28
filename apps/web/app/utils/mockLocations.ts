/**
 * Реальные локации недвижимости в Сочи.
 * 
 * Координаты взяты из 2GIS и соответствуют реальным адресам на суше.
 * Используются для моковых данных карты, когда API недоступен.
 */

export interface SochiLocation {
    lat: number;
    lng: number;
    address: string;
    district?: string;
}

export const SOCHI_LOCATIONS: SochiLocation[] = [
    // Центральный район
    { lat: 43.5807, lng: 39.7188, address: "Hyatt Regency Sochi, ул. Орджоникидзе, 17", district: "Центральный" },
    { lat: 43.5802, lng: 39.7214, address: "ЖК Александрийский маяк, пер. Морской, 1", district: "Центральный" },
    { lat: 43.5689, lng: 39.7395, address: "ЖК Королевский парк, Курортный пр., 105Б", district: "Центральный" },
    { lat: 43.5815, lng: 39.7196, address: "Grand Karat Sochi, ул. Орджоникидзе, 11А", district: "Центральный" },
    { lat: 43.5701, lng: 39.7342, address: "ЖК Миллениум Тауэр, ул. Гагринская, 10", district: "Центральный" },
    { lat: 43.5840, lng: 39.7225, address: "ЖК Красная Площадь, ул. Войкова, 21", district: "Центральный" },
    { lat: 43.6052, lng: 39.7041, address: "Мамайка, ул. Плеханова, 34Б", district: "Мамайка" },
    { lat: 43.5612, lng: 39.7521, address: "ЖК Идеал Хаус, Курортный пр., 92/5", district: "Центральный" },
    { lat: 43.5885, lng: 39.7145, address: "Ривьера Парк, ул. Егорова, 1", district: "Центральный" },
    { lat: 43.5744, lng: 39.7297, address: "Зимний театр, ул. Театральная, 2", district: "Центральный" },
    { lat: 43.5668, lng: 39.7423, address: "ЖК Сан-Сити, Курортный пр., 108", district: "Центральный" },
    { lat: 43.5635, lng: 39.7482, address: "ЖК Актер Гэлакси, Курортный пр., 105", district: "Центральный" },
    { lat: 43.5950, lng: 39.7280, address: "Заречный район, ул. Чайковского, 15", district: "Заречный" },
    { lat: 43.5866, lng: 39.7170, address: "Навагинская ул., 9Д", district: "Центральный" },
    { lat: 43.5550, lng: 39.7600, address: "Приморье, ул. Есауленко, 4", district: "Хоста" },

    // Дополнительные адреса — все на суше!
    { lat: 43.5823, lng: 39.7201, address: "ул. Приморская, 15", district: "Центральный" },
    { lat: 43.5698, lng: 39.7378, address: "Курортный проспект, 100", district: "Центральный" },
    { lat: 43.5871, lng: 39.7165, address: "ул. Навагинская, 8", district: "Центральный" },
    { lat: 43.5789, lng: 39.7245, address: "ул. Виноградная, 22", district: "Центральный" },
    { lat: 43.5756, lng: 39.7312, address: "ул. Парковая, 5", district: "Центральный" },
    { lat: 43.5834, lng: 39.7189, address: "ул. Горького, 45", district: "Центральный" },
    { lat: 43.5812, lng: 39.7223, address: "ул. Красноармейская, 7", district: "Центральный" },
    { lat: 43.5751, lng: 39.7289, address: "ул. Театральная, 28", district: "Центральный" },

    // Адлер
    { lat: 43.4312, lng: 39.9187, address: "Адлер, ул. Ленина, 219", district: "Адлер" },
    { lat: 43.4256, lng: 39.9234, address: "Адлер, ул. Демократическая, 38", district: "Адлер" },
    { lat: 43.4055, lng: 39.9431, address: "Сириус, Mantera Seaview Residence", district: "Сириус" },

    // Красная Поляна
    { lat: 43.6789, lng: 40.2012, address: "Красная Поляна, ул. Защитников Кавказа, 1", district: "Красная Поляна" },
    { lat: 43.6831, lng: 40.2048, address: "Горки Город, ул. Горная, 5", district: "Красная Поляна" },
];

/**
 * Возвращает локацию по индексу (циклически).
 */
export const getMockLocation = (index: number): SochiLocation => {
    return SOCHI_LOCATIONS[index % SOCHI_LOCATIONS.length];
};

/**
 * Возвращает случайную локацию.
 */
export const getRandomLocation = (): SochiLocation => {
    const index = Math.floor(Math.random() * SOCHI_LOCATIONS.length);
    return SOCHI_LOCATIONS[index];
};

/**
 * Фильтрует локации по району.
 */
export const getLocationsByDistrict = (district: string): SochiLocation[] => {
    return SOCHI_LOCATIONS.filter(loc => loc.district === district);
};
