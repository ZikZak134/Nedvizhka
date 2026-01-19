import httpx
import asyncio

async def test_geocode():
    address = "Сочи, ул. Роз 1"
    headers = {"User-Agent": "EstateAnalyticsDevLocal/1.0 (gramazeka1342@example.com)"}
    url = "https://photon.komoot.io/api/"
    params = {
        "q": address,
        "limit": 1
    }
    
    print(f"Geocoding: {address}")
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, params=params, headers=headers)
            response.raise_for_status()
            data = response.json()
            if data and data.get("features"):
                location = data["features"][0]
                coords = location["geometry"]["coordinates"]
                # Photon returns [lon, lat]
                print(f"Found: {location['properties'].get('name')}, {location['properties'].get('city')}")
                print(f"Lat: {coords[1]}, Lon: {coords[0]}")
            else:
                print("Not found")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_geocode())
