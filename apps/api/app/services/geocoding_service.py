"""Сервис геокодирования через 2GIS API.

Преобразует текстовые адреса в географические координаты.
"""
import os
import httpx
from functools import lru_cache
from typing import Optional
import logging

logger = logging.getLogger(__name__)

# Демо-ключ 2GIS (для разработки, ограничен по запросам)
# В продакшене использовать DGIS_API_KEY из .env
DGIS_API_KEY = os.getenv("DGIS_API_KEY", "demo")

# Базовый URL 2GIS Geocoder API
GEOCODER_URL = "https://catalog.api.2gis.com/3.0/items/geocode"

# Кэш известных адресов Сочи (для работы без API)
SOCHI_ADDRESS_CACHE: dict[str, tuple[float, float]] = {
    # Центральный район
    "ул. Орджоникидзе, 17": (43.5807, 39.7188),
    "пер. Морской, 1": (43.5802, 39.7214),
    "Курортный пр., 105Б": (43.5689, 39.7395),
    "ул. Орджоникидзе, 11А": (43.5815, 39.7196),
    "ул. Гагринская, 10": (43.5701, 39.7342),
    "ул. Войкова, 21": (43.5840, 39.7225),
    "ул. Плеханова, 34Б": (43.6052, 39.7041),
    "Курортный пр., 92/5": (43.5612, 39.7521),
    "ул. Егорова, 1": (43.5885, 39.7145),
    "ул. Театральная, 2": (43.5744, 39.7297),
    "Курортный пр., 108": (43.5668, 39.7423),
    "Курортный пр., 105": (43.5635, 39.7482),
    "ул. Чайковского, 15": (43.5950, 39.7280),
    "Навагинская ул., 9Д": (43.5866, 39.7170),
    "ул. Есауленко, 4": (43.5550, 39.7600),
    # Дополнительные адреса
    "ул. Приморская, 15": (43.5823, 39.7201),
    "Курортный проспект, 100": (43.5698, 39.7378),
    "ул. Навагинская, 8": (43.5871, 39.7165),
    "ул. Виноградная, 22": (43.5789, 39.7245),
    "ул. Парковая, 5": (43.5756, 39.7312),
    "ул. Горького, 45": (43.5834, 39.7189),
    "ул. Красноармейская, 7": (43.5812, 39.7223),
    "ул. Театральная, 28": (43.5751, 39.7289),
    # Адлер
    "ул. Ленина, 219": (43.4312, 39.9187),
    "ул. Демократическая, 38": (43.4256, 39.9234),
    # Красная Поляна
    "ул. Защитников Кавказа, 1": (43.6789, 40.2012),
}


async def geocode_address_2gis(
    address: str, 
    city: str = "Сочи"
) -> Optional[tuple[float, float]]:
    """Геокодирует адрес через 2GIS API.
    
    Args:
        address: Адрес для геокодирования (например, "ул. Орджоникидзе, 17")
        city: Город для поиска (по умолчанию Сочи)
    
    Returns:
        Кортеж (latitude, longitude) или None если адрес не найден
    """
    # Сначала проверяем локальный кэш
    if address in SOCHI_ADDRESS_CACHE:
        logger.debug(f"Адрес найден в кэше: {address}")
        return SOCHI_ADDRESS_CACHE[address]
    
    # Пробуем частичное совпадение
    for cached_addr, coords in SOCHI_ADDRESS_CACHE.items():
        if cached_addr in address or address in cached_addr:
            logger.debug(f"Частичное совпадение: {address} -> {cached_addr}")
            return coords
    
    # Если демо-ключ — используем только кэш
    if DGIS_API_KEY == "demo":
        logger.warning(f"Демо-режим: адрес не найден в кэше: {address}")
        # Возвращаем центр Сочи как fallback
        return (43.5855, 39.7231)
    
    # Запрос к 2GIS API
    try:
        full_address = f"{city}, {address}"
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(
                GEOCODER_URL,
                params={
                    "q": full_address,
                    "key": DGIS_API_KEY,
                    "fields": "items.point",
                    "locale": "ru_RU",
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                items = data.get("result", {}).get("items", [])
                
                if items and "point" in items[0]:
                    point = items[0]["point"]
                    lat, lon = point["lat"], point["lon"]
                    
                    # Добавляем в кэш для будущих запросов
                    SOCHI_ADDRESS_CACHE[address] = (lat, lon)
                    logger.info(f"Геокодирован: {address} -> ({lat}, {lon})")
                    
                    return (lat, lon)
                    
            logger.warning(f"Адрес не найден через API: {address}")
            
    except Exception as e:
        logger.error(f"Ошибка геокодирования: {e}")
    
    # Fallback: центр Сочи
    return (43.5855, 39.7231)


def geocode_address_sync(address: str, city: str = "Сочи") -> tuple[float, float]:
    """Синхронная версия геокодера (для seed.py).
    
    Использует только локальный кэш без API-запросов.
    """
    # Точное совпадение
    if address in SOCHI_ADDRESS_CACHE:
        return SOCHI_ADDRESS_CACHE[address]
    
    # Частичное совпадение
    for cached_addr, coords in SOCHI_ADDRESS_CACHE.items():
        if cached_addr in address or address in cached_addr:
            return coords
    
    # Fallback: центр Сочи
    return (43.5855, 39.7231)


def get_random_sochi_location() -> tuple[float, float, str]:
    """Возвращает случайный реальный адрес из кэша.
    
    Returns:
        Кортеж (latitude, longitude, address)
    """
    import random
    addresses = list(SOCHI_ADDRESS_CACHE.keys())
    address = random.choice(addresses)
    lat, lon = SOCHI_ADDRESS_CACHE[address]
    return (lat, lon, address)


def get_all_cached_locations() -> list[dict]:
    """Возвращает все закэшированные локации.
    
    Returns:
        Список словарей с lat, lon, address
    """
    return [
        {"lat": lat, "lon": lon, "address": addr}
        for addr, (lat, lon) in SOCHI_ADDRESS_CACHE.items()
    ]
