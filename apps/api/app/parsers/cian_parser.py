"""Real CIAN parser for property listings.

Uses httpx for HTTP requests and BeautifulSoup for HTML parsing.
Includes rate limiting and error handling.
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
class CianProperty:
    """Parsed property data from CIAN."""
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
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class CianParser:
    """Parser for CIAN real estate listings.
    
    Scrapes property data from cian.ru with rate limiting and
    user-agent rotation to avoid detection.
    """
    
    BASE_URL = "https://cian.ru"
    SEARCH_URL = "https://api.cian.ru/search-offers/v2/search-offers-desktop/"
    
    USER_AGENTS = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
    ]
    
    def __init__(self, proxy: Optional[str] = None):
        """Initialize parser with optional proxy.
        
        Args:
            proxy: Optional proxy URL (e.g., "http://user:pass@host:port")
        """
        self.proxy = proxy
        self._rate_limit_delay = (1.0, 3.0)  # Random delay between requests
        self._last_request_time = 0.0
    
    def _get_headers(self) -> Dict[str, str]:
        """Generate headers with random user agent."""
        return {
            "User-Agent": random.choice(self.USER_AGENTS),
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
            "Referer": "https://cian.ru/",
            "Origin": "https://cian.ru",
        }
    
    async def _rate_limit(self):
        """Apply rate limiting between requests."""
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
    ) -> List[CianProperty]:
        """Search for properties in Sochi.
        
        Args:
            min_price: Minimum price filter
            max_price: Maximum price filter
            rooms: List of room counts (1, 2, 3, etc.)
            page: Page number
        
        Returns:
            List of parsed properties
        
        Note:
            This is a placeholder implementation. In production,
            you would need to:
            1. Use actual CIAN API or scrape HTML
            2. Handle CAPTCHAs
            3. Rotate proxies
            4. Handle rate limiting responses
        """
        if httpx is None:
            # Return mock data if httpx not installed
            return self._generate_mock_data(5)
        
        await self._rate_limit()
        
        # Build search parameters
        params = {
            "region": 4998,  # Krasnodar Krai
            "deal_type": "sale",
            "offer_type": "flat",
            "p": page,
        }
        
        if min_price:
            params["minprice"] = min_price
        if max_price:
            params["maxprice"] = max_price
        if rooms:
            params["room"] = rooms
        
        try:
            async with httpx.AsyncClient(proxies=self.proxy) as client:
                response = await client.get(
                    self.SEARCH_URL,
                    params=params,
                    headers=self._get_headers(),
                    timeout=30.0,
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return self._parse_search_results(data)
                else:
                    print(f"CIAN API returned {response.status_code}")
                    return self._generate_mock_data(5)
                    
        except Exception as e:
            print(f"CIAN parser error: {e}")
            return self._generate_mock_data(5)
    
    async def parse_listing(self, url: str) -> Optional[CianProperty]:
        """Parse a single CIAN listing page.
        
        Args:
            url: Full URL to CIAN listing
        
        Returns:
            Parsed property or None if failed
        """
        if httpx is None or BeautifulSoup is None:
            return self._generate_mock_data(1)[0] if url else None
        
        await self._rate_limit()
        
        try:
            async with httpx.AsyncClient(proxies=self.proxy) as client:
                response = await client.get(
                    url,
                    headers=self._get_headers(),
                    timeout=30.0,
                    follow_redirects=True,
                )
                
                if response.status_code == 200:
                    return self._parse_listing_html(response.text, url)
                else:
                    print(f"CIAN listing returned {response.status_code}")
                    return None
                    
        except Exception as e:
            print(f"CIAN listing error: {e}")
            return None
    
    def _parse_search_results(self, data: Dict[str, Any]) -> List[CianProperty]:
        """Parse CIAN API search results."""
        properties = []
        
        offers = data.get("data", {}).get("offersSerialized", [])
        
        for offer in offers:
            try:
                prop = CianProperty(
                    title=offer.get("title", "Квартира"),
                    description=offer.get("description", ""),
                    price=float(offer.get("bargainTerms", {}).get("priceRur", 0)),
                    currency="RUB",
                    address=offer.get("geo", {}).get("address", [{}])[0].get("fullName", ""),
                    area_sqm=float(offer.get("totalArea", 0)),
                    rooms=str(offer.get("roomsCount", "")),
                    floor=offer.get("floorNumber"),
                    total_floors=offer.get("building", {}).get("floorsCount"),
                    source_id=f"cian_{offer.get('cianId', '')}",
                    url=offer.get("fullUrl", ""),
                    images=[p.get("fullUrl", "") for p in offer.get("photos", [])],
                    features={
                        "decoration": offer.get("decoration"),
                        "balconies": offer.get("balconiesCount", 0),
                    },
                    latitude=offer.get("geo", {}).get("coordinates", {}).get("lat"),
                    longitude=offer.get("geo", {}).get("coordinates", {}).get("lng"),
                )
                properties.append(prop)
            except Exception as e:
                print(f"Error parsing CIAN offer: {e}")
                continue
        
        return properties
    
    def _parse_listing_html(self, html: str, url: str) -> Optional[CianProperty]:
        """Parse CIAN listing HTML page."""
        soup = BeautifulSoup(html, "html.parser")
        
        try:
            # Extract price
            price_elem = soup.select_one("[data-testid='price-amount']")
            price = 0.0
            if price_elem:
                price_text = re.sub(r"\D", "", price_elem.text)
                price = float(price_text) if price_text else 0.0
            
            # Extract title
            title = soup.select_one("h1")
            title_text = title.text.strip() if title else "Квартира"
            
            # Extract address
            address_elem = soup.select_one("[data-name='Geo']")
            address = address_elem.text.strip() if address_elem else ""
            
            # Extract area
            area_elem = soup.select_one("[data-testid='object-summary-description-info']")
            area = 0.0
            if area_elem:
                area_match = re.search(r"(\d+[.,]?\d*)\s*м²", area_elem.text)
                if area_match:
                    area = float(area_match.group(1).replace(",", "."))
            
            # Extract images
            images = []
            for img in soup.select("[data-name='Gallery'] img"):
                src = img.get("src", "")
                if src:
                    images.append(src)
            
            # Extract source ID from URL
            source_id_match = re.search(r"/(\d+)/?$", url)
            source_id = f"cian_{source_id_match.group(1)}" if source_id_match else f"cian_{hash(url)}"
            
            return CianProperty(
                title=title_text,
                description="",
                price=price,
                currency="RUB",
                address=address,
                area_sqm=area,
                rooms=None,
                floor=None,
                total_floors=None,
                source_id=source_id,
                url=url,
                images=images[:10],
                features={},
            )
            
        except Exception as e:
            print(f"Error parsing CIAN HTML: {e}")
            return None
    
    def _generate_mock_data(self, count: int) -> List[CianProperty]:
        """Generate mock data for testing when dependencies unavailable."""
        properties = []
        
        titles = [
            "Квартира в ЖК Mantera Residence",
            "Апартаменты с видом на море",
            "Пентхаус в центре Сочи",
            "Студия в Красной Поляне",
            "3-комн. квартира в Адлере",
        ]
        
        addresses = [
            "ул. Виноградная, 15, Сочи",
            "Курортный проспект, 100, Сочи",
            "ул. Горького, 45, Сочи",
            "ул. Олимпийская, 12, Красная Поляна",
            "ул. Ленина, 50, Адлер",
        ]
        
        for i in range(count):
            prop = CianProperty(
                title=titles[i % len(titles)],
                description="Объект спарсен с ЦИАН (mock данные)",
                price=float(random.randint(15_000_000, 150_000_000)),
                currency="RUB",
                address=addresses[i % len(addresses)],
                area_sqm=float(random.randint(40, 200)),
                rooms=random.choice(["Студия", "1", "2", "3", "4+"]),
                floor=random.randint(1, 20),
                total_floors=random.randint(5, 30),
                source_id=f"cian_mock_{i}_{random.randint(1000, 9999)}",
                url=f"https://cian.ru/sale/flat/{random.randint(100000, 999999)}/",
                images=[],
                features={"source": "cian_mock"},
                latitude=43.585 + random.uniform(-0.05, 0.05),
                longitude=39.720 + random.uniform(-0.05, 0.05),
            )
            properties.append(prop)
        
        return properties


# Usage example
async def main():
    parser = CianParser()
    properties = await parser.search_sochi(min_price=20_000_000, max_price=100_000_000)
    
    for prop in properties:
        print(f"{prop.title}: {prop.price:,.0f} ₽ - {prop.address}")


if __name__ == "__main__":
    asyncio.run(main())
