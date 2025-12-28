from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional
import asyncio
from app.services.geocoding_service import search_items_2gis
from pydantic import BaseModel

router = APIRouter()

class InfrastructureItem(BaseModel):
    id: str
    name: str = "Unknown"
    address: Optional[str] = None
    lat: float
    lon: float
    type: str

@router.get("/", response_model=List[InfrastructureItem])
async def get_infrastructure(
    lat: float,
    lon: float,
    radius: int = 1000,
    types: Optional[str] = Query(None, description="Comma separated types: school,park,shop")
):
    """
    Search for infrastructure items near coordinates via 2GIS.
    """
    if not types:
        types = "school,park,shop"
    
    type_list = types.split(",")
    map_types = {
        "school": "школа",
        "kindergarten": "детский сад",
        "university": "университет",
        "park": "парк",
        "hospital": "больница",
        "shop": "супермаркет",
        "food": "ресторан",
        "sport": "фитнес",
        "entertainment": "развлечения",
        "pharmacy": "аптека"
    }

    tasks = []
    for t in type_list:
        query = map_types.get(t.strip(), t.strip())
        tasks.append(search_items_2gis(lat, lon, query, radius))

    results_list = await asyncio.gather(*tasks)
    
    # Flatten and deduplicate by ID
    all_items = []
    seen_ids = set()
    
    for i, res in enumerate(results_list):
        # res is list of dicts
        requested_type = type_list[i].strip()
        for item in res:
            if item["id"] not in seen_ids:
                item["type"] = requested_type # Override type with our internal type code
                all_items.append(item)
                seen_ids.add(item["id"])
            
    return all_items
