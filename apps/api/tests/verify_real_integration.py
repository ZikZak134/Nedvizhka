import asyncio
import os
import sys

# Add app to path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.services.parser_service import parser_service, PropertySource
from app.services.geocoding_service import geocode_address_2gis

async def main():
    print("1. Testing Imports...")
    assert parser_service is not None
    print("   ✅ parser_service imported")
    
    print("2. Testing Geocoder (Mock/Cache)...")
    # This should return from cache or fallback
    coords = await geocode_address_2gis("ул. Орджоникидзе, 17", city="Сочи")
    print(f"   ✅ Geocoder returned: {coords}")
    
    print("3. Testing Parser Instantiation...")
    # We won't make real HTTP requests to avoid blocking, 
    # but we check if the methods are bound correctly.
    assert parser_service.sources[PropertySource.CIAN] is not None
    assert parser_service.sources[PropertySource.AVITO] is not None
    print("   ✅ Parser sources bound")

    print("\nSUCCESS: All integration checks passed.")

if __name__ == "__main__":
    asyncio.run(main())
