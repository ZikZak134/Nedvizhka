"""Real Avito parser for property listings.

Uses httpx for HTTP requests with anti-bot measures.
Avito has stronger protections, so this includes more evasion techniques.
"""
import asyncio
import random
import re
from typing import Optional, List, Dict, Any
from datetime import datetime
from dataclasses import dataclass
import json

try:
    import httpx
except ImportError:
    httpx = None  # type: ignore

try:
    from bs4 import BeautifulSoup
except ImportError:
    BeautifulSoup = None  # type: ignore


@dataclass
class AvitoProperty:
    """Parsed property data from Avito."""
    title: str
    description: str
    price: float
    currency: str
    address: str
    area_sqm: float
    rooms: Optional[str]
    floor: Optional[int]
    total_floors: Optional[int]
    source_id: str
    url: str
    images: List[str]
    features: Dict[str, Any]
    seller_name: Optional[str] = None
    seller_type: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class AvitoParser:
    """Parser for Avito real estate listings.
    
    Avito has stronger anti-bot protections than CIAN.
    Consider using:
    - Rotating residential proxies
    - Browser automation (Selenium/Playwright) for JS-rendered content
    - Longer delays between requests
    """
    
    BASE_URL = "https://www.avito.ru"
    SEARCH_URL = "https://www.avito.ru/api/14/items"
    
    USER_AGENTS = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    ]
    
    def __init__(self, proxy: Optional[str] = None):
        """Initialize parser with optional proxy.
        
        Args:
            proxy: Proxy URL. For Avito, residential proxies work best.
        """
        self.proxy = proxy
        self._rate_limit_delay = (3.0, 7.0)  # Avito needs longer delays
        self._last_request_time = 0.0
    
    def _get_headers(self) -> Dict[str, str]:
        """Generate headers mimicking real browser."""
        return {
            "User-Agent": random.choice(self.USER_AGENTS),
            "Accept": "application/json, text/javascript, */*",
            "Accept-Language": "ru-RU,ru;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Referer": "https://www.avito.ru/sochi/kvartiry/prodam-ASgBAgICAUSSA8YQ",
            "Sec-Ch-Ua": '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
            "Sec-Ch-Ua-Mobile": "?0",
            "Sec-Ch-Ua-Platform": '"Windows"',
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
        }
    
    async def _rate_limit(self):
        """Apply stricter rate limiting for Avito."""
        now = datetime.now().timestamp()
        elapsed = now - self._last_request_time
        delay = random.uniform(*self._rate_limit_delay)
        
        if elapsed < delay:
            await asyncio.sleep(delay - elapsed)
        
        self._last_request_time = datetime.now().timestamp()
    
    async def search_sochi(
        self,
        min_price: Optional[int] = None,
        max_price: Optional[int] = None,
        rooms: Optional[List[int]] = None,
        page: int = 1,
    ) -> List[AvitoProperty]:
        """Search for properties in Sochi.
        
        Args:
            min_price: Minimum price filter
            max_price: Maximum price filter
            rooms: Room count filter
            page: Page number
        
        Returns:
            List of parsed properties
        
        Note:
            Avito API requires authentication for full access.
            This implementation uses mock data as fallback when
            dependencies are unavailable or requests are blocked.
        """
        if httpx is None:
            return self._generate_mock_data(5)
        
        await self._rate_limit()
        
        # Avito API parameters
        params = {
            "key": "af0deccbgcgidddjgnvljitntccdduijhdinfgjgfjir",
            "categoryId": 24,  # Квартиры
            "locationId": 637640,  # Сочи
            "priceMin": min_price or "",
            "priceMax": max_price or "",
            "page": page,
        }
        
        try:
            async with httpx.AsyncClient(proxies=self.proxy, http2=True) as client:
                # Add cookies to appear more legitimate
                cookies = {
                    "_ym_uid": str(random.randint(100000000, 999999999)),
                    "f": str(random.randint(1000000000, 9999999999)),
                }
                
                response = await client.get(
                    self.SEARCH_URL,
                    params=params,
                    headers=self._get_headers(),
                    cookies=cookies,
                    timeout=30.0,
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return self._parse_search_results(data)
                elif response.status_code == 429:
                    print("Avito rate limit hit, backing off...")
                    await asyncio.sleep(60)
                    return self._generate_mock_data(5)
                elif response.status_code == 403:
                    print("Avito blocked request (403), need proxy rotation")
                    return self._generate_mock_data(5)
                else:
                    print(f"Avito returned {response.status_code}")
                    return self._generate_mock_data(5)
                    
        except Exception as e:
            print(f"Avito parser error: {e}")
            return self._generate_mock_data(5)
    
    async def parse_listing(self, url: str) -> Optional[AvitoProperty]:
        """Parse a single Avito listing.
        
        Args:
            url: Full URL to Avito listing
        
        Returns:
            Parsed property or None if failed
        
        Note:
            Avito listings are JS-rendered, so simple HTTP requests
            may not get full content. Consider Playwright/Selenium.
        """
        if httpx is None or BeautifulSoup is None:
            return self._generate_mock_data(1)[0] if url else None
        
        await self._rate_limit()
        
        try:
            async with httpx.AsyncClient(proxies=self.proxy, http2=True) as client:
                response = await client.get(
                    url,
                    headers=self._get_headers(),
                    timeout=30.0,
                    follow_redirects=True,
                )
                
                if response.status_code == 200:
                    return self._parse_listing_html(response.text, url)
                else:
                    print(f"Avito listing returned {response.status_code}")
                    return None
                    
        except Exception as e:
            print(f"Avito listing error: {e}")
            return None
    
    def _parse_search_results(self, data: Dict[str, Any]) -> List[AvitoProperty]:
        """Parse Avito API search results."""
        properties = []
        
        items = data.get("result", {}).get("items", [])
        
        for item in items:
            try:
                value = item.get("value", {})
                
                # Skip promoted items
                if item.get("type") != "item":
                    continue
                
                prop = AvitoProperty(
                    title=value.get("title", "Квартира"),
                    description=value.get("description", ""),
                    price=float(value.get("priceDetailed", {}).get("value", 0)),
                    currency="RUB",
                    address=value.get("location", {}).get("address", ""),
                    area_sqm=self._extract_area(value.get("parameters", [])),
                    rooms=self._extract_rooms(value.get("parameters", [])),
                    floor=self._extract_floor(value.get("parameters", [])),
                    total_floors=None,
                    source_id=f"avito_{value.get('id', '')}",
                    url=f"{self.BASE_URL}{value.get('uri', '')}",
                    images=[img.get("640x480", "") for img in value.get("images", [])],
                    features={
                        "category": value.get("category", {}).get("name"),
                    },
                    seller_name=value.get("seller", {}).get("name"),
                    seller_type="agency" if value.get("seller", {}).get("isOfficial") else "individual",
                    latitude=value.get("geo", {}).get("lat"),
                    longitude=value.get("geo", {}).get("lng"),
                )
                properties.append(prop)
            except Exception as e:
                print(f"Error parsing Avito item: {e}")
                continue
        
        return properties
    
    def _extract_area(self, params: List[Dict]) -> float:
        """Extract area from parameters."""
        for p in params:
            if "площадь" in p.get("label", "").lower():
                val = re.sub(r"[^\d.,]", "", p.get("value", ""))
                if val:
                    return float(val.replace(",", "."))
        return 0.0
    
    def _extract_rooms(self, params: List[Dict]) -> Optional[str]:
        """Extract room count from parameters."""
        for p in params:
            label = p.get("label", "").lower()
            if "комнат" in label or "студия" in label:
                return p.get("value", "")
        return None
    
    def _extract_floor(self, params: List[Dict]) -> Optional[int]:
        """Extract floor from parameters."""
        for p in params:
            if "этаж" in p.get("label", "").lower():
                val = p.get("value", "")
                match = re.search(r"(\d+)", val)
                if match:
                    return int(match.group(1))
        return None
    
    def _parse_listing_html(self, html: str, url: str) -> Optional[AvitoProperty]:
        """Parse Avito listing HTML."""
        soup = BeautifulSoup(html, "html.parser")
        
        try:
            # Extract price
            price_elem = soup.select_one("[itemprop='price']")
            price = 0.0
            if price_elem:
                price = float(price_elem.get("content", 0))
            
            # Extract title
            title = soup.select_one("h1")
            title_text = title.text.strip() if title else "Квартира"
            
            # Extract address
            address_elem = soup.select_one("[itemprop='address']")
            address = address_elem.text.strip() if address_elem else ""
            
            # Extract images
            images = []
            for img in soup.select("[data-marker='gallery-img-frame'] img"):
                src = img.get("src", "")
                if src and "placeholder" not in src:
                    images.append(src)
            
            # Extract source ID
            source_id_match = re.search(r"_(\d+)$", url.rstrip("/"))
            source_id = f"avito_{source_id_match.group(1)}" if source_id_match else f"avito_{hash(url)}"
            
            return AvitoProperty(
                title=title_text,
                description="",
                price=price,
                currency="RUB",
                address=address,
                area_sqm=0.0,
                rooms=None,
                floor=None,
                total_floors=None,
                source_id=source_id,
                url=url,
                images=images[:10],
                features={},
            )
            
        except Exception as e:
            print(f"Error parsing Avito HTML: {e}")
            return None
    
    def _generate_mock_data(self, count: int) -> List[AvitoProperty]:
        """Generate mock data for testing."""
        properties = []
        
        titles = [
            "2-к квартира в ЖК Горки Город",
            "Студия с ремонтом у моря",
            "3-к квартира в новостройке",
            "Апартаменты в Имеретинской бухте",
            "1-к квартира в Адлере",
        ]
        
        addresses = [
            "Сочи, Адлерский р-н, ул. Ленина, 50",
            "Сочи, Центральный р-н, ул. Морская, 12",
            "Сочи, Хостинский р-н, ул. Платановая, 8",
            "Красная Поляна, ул. Олимпийская, 25",
            "Сочи, Лазаревский р-н, ул. Победы, 100",
        ]
        
        for i in range(count):
            prop = AvitoProperty(
                title=titles[i % len(titles)],
                description="Объект спарсен с Авито (mock данные)",
                price=float(random.randint(8_000_000, 120_000_000)),
                currency="RUB",
                address=addresses[i % len(addresses)],
                area_sqm=float(random.randint(30, 180)),
                rooms=random.choice(["Студия", "1", "2", "3"]),
                floor=random.randint(1, 15),
                total_floors=random.randint(5, 25),
                source_id=f"avito_mock_{i}_{random.randint(1000, 9999)}",
                url=f"https://www.avito.ru/sochi/kvartiry/{random.randint(1000000000, 9999999999)}",
                images=[],
                features={"source": "avito_mock"},
                seller_name="Продавец",
                seller_type=random.choice(["individual", "agency"]),
                latitude=43.585 + random.uniform(-0.1, 0.1),
                longitude=39.720 + random.uniform(-0.1, 0.1),
            )
            properties.append(prop)
        
        return properties


# Usage example
async def main():
    parser = AvitoParser()
    properties = await parser.search_sochi(min_price=10_000_000, max_price=80_000_000)
    
    for prop in properties:
        print(f"{prop.title}: {prop.price:,.0f} ₽ - {prop.address}")


if __name__ == "__main__":
    asyncio.run(main())
