"""Parser service for ingesting property data from external sources.

This module provides a skeleton for parsing property data from:
- ЦИАН (Cian.ru)
- Авито (Avito.ru)
- Manual input

In production, implement actual scraping logic with proper rate limiting,
error handling, and proxy rotation.
"""
from typing import List, Optional, Dict, Any
from datetime import datetime
from dataclasses import dataclass
from enum import Enum
import random


from app.parsers import CianParser, AvitoParser
from app.services.geocoding_service import geocode_address_2gis

class PropertySource(str, Enum):
    CIAN = "cian"
    AVITO = "avito"
    MANUAL = "manual"


@dataclass
class ParsedProperty:
    """Represents a property parsed from an external source."""
    title: str
    description: str
    price: float
    currency: str
    address: str
    area_sqm: float
    rooms: Optional[str]
    floor: Optional[int]
    total_floors: Optional[int]
    source: PropertySource
    source_id: str
    url: Optional[str]
    images: List[str]
    features: Dict[str, Any]
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class ParserService:
    """Service for parsing property listings from external sources."""
    
    def __init__(self):
        self.sources = {
            PropertySource.CIAN: self._parse_cian,
            PropertySource.AVITO: self._parse_avito,
        }
    
    async def parse_url(self, url: str) -> Optional[ParsedProperty]:
        """Parse a single property URL and return parsed data."""
        # Detect source from URL
        if "cian.ru" in url:
            return await self._parse_cian(url)
        elif "avito.ru" in url:
            return await self._parse_avito(url)
        else:
            return None
    
    async def _enrich_coordinates(self, prop: ParsedProperty) -> ParsedProperty:
        """Enrich property with coordinates if missing."""
        if prop.latitude is None or prop.longitude is None:
            # Try to geocode
            try:
                coords = await geocode_address_2gis(prop.address, city="Сочи")
                if coords:
                    prop.latitude, prop.longitude = coords
            except Exception as e:
                print(f"Geocoding failed for {prop.address}: {e}")
        return prop

    async def _parse_cian(self, url: str) -> Optional[ParsedProperty]:
        """Parse property from CIAN.
        """
        parser = CianParser()
        cian_prop = await parser.parse_listing(url)
        
        if not cian_prop:
            return None
            
        parsed = ParsedProperty(
            title=cian_prop.title,
            description=cian_prop.description,
            price=cian_prop.price,
            currency=cian_prop.currency,
            address=cian_prop.address,
            area_sqm=cian_prop.area_sqm,
            rooms=cian_prop.rooms,
            floor=cian_prop.floor,
            total_floors=cian_prop.total_floors,
            source=PropertySource.CIAN,
            source_id=cian_prop.source_id,
            url=cian_prop.url,
            images=cian_prop.images,
            features=cian_prop.features,
            latitude=cian_prop.latitude,
            longitude=cian_prop.longitude,
        )
        
        return await self._enrich_coordinates(parsed)
    
    async def _parse_avito(self, url: str) -> Optional[ParsedProperty]:
        """Parse property from Avito.
        """
        parser = AvitoParser()
        avito_prop = await parser.parse_listing(url)
        
        if not avito_prop:
            return None
            
        parsed = ParsedProperty(
            title=avito_prop.title,
            description=avito_prop.description,
            price=avito_prop.price,
            currency=avito_prop.currency,
            address=avito_prop.address,
            area_sqm=avito_prop.area_sqm,
            rooms=avito_prop.rooms,
            floor=avito_prop.floor,
            total_floors=avito_prop.total_floors,
            source=PropertySource.AVITO,
            source_id=avito_prop.source_id,
            url=avito_prop.url,
            images=avito_prop.images,
            features=avito_prop.features,
            latitude=avito_prop.latitude,
            longitude=avito_prop.longitude,
        )

        return await self._enrich_coordinates(parsed)
    
    def generate_demo_properties(self, count: int = 10) -> List[ParsedProperty]:
        """Generate demo properties for testing UI."""
        titles = [
            "Роскошные апартаменты с видом на море",
            "Современная квартира в центре Сочи",
            "Пентхаус с панорамным видом",
            "Элитная вилла на первой линии",
            "Стильная студия в курортной зоне",
            "Просторная квартира с террасой",
            "Дизайнерские апартаменты у моря",
            "Уютная квартира в тихом районе",
            "Премиум апартаменты с бассейном",
            "Эксклюзивная вилла с садом",
        ]
        
        addresses = [
            "ул. Приморская, 15",
            "Курортный проспект, 100",
            "ул. Навагинская, 8",
            "ул. Виноградная, 22",
            "ул. Орджоникидзе, 34",
            "ул. Парковая, 5",
            "ул. Морской переулок, 12",
            "ул. Горького, 45",
        ]
        
        descriptions = [
            "Великолепные апартаменты с современным ремонтом и всеми удобствами.",
            "Просторная квартира в самом сердце Сочи.",
            "Уникальное предложение для ценителей комфорта.",
            "Идеальный вариант для семейного отдыха или инвестиций.",
            "Светлые апартаменты с продуманной планировкой.",
        ]
        
        properties = []
        for i in range(count):
            prop = ParsedProperty(
                title=f"{random.choice(titles)} #{i+1}",
                description=random.choice(descriptions),
                price=random.randint(8_000_000, 150_000_000),
                currency="RUB",
                address=f"{random.choice(addresses)}, корп. {random.randint(1, 5)}",
                area_sqm=random.randint(30, 350),
                rooms=random.choice(["Студия", "1", "2", "3", "4+"]),
                floor=random.randint(1, 25),
                total_floors=random.randint(5, 30),
                source=random.choice([PropertySource.CIAN, PropertySource.AVITO, PropertySource.MANUAL]),
                source_id=f"demo_{i}_{random.randint(1000, 9999)}",
                url=None,
                images=[],
                features=random.choice([
                    {"view": "sea", "pool": True},
                    {"view": "mountain", "balcony": True},
                    {"terrace": True, "new_building": True},
                ]),
                latitude=43.585 + random.uniform(-0.05, 0.05),
                longitude=39.720 + random.uniform(-0.05, 0.05),
            )
            properties.append(prop)
        
        return properties


# Singleton instance
parser_service = ParserService()
