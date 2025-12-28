"""API endpoint for GeoJSON heatmap data."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List, Dict, Any

from app.core.deps import get_db
from app.models.property import Property

router = APIRouter(prefix="/heatmap", tags=["Heatmap & Analytics"])


@router.get("")
def get_heatmap_data(
    district: Optional[str] = Query(None, description="Filter by district"),
    min_price: Optional[float] = Query(None, description="Minimum price"),
    max_price: Optional[float] = Query(None, description="Maximum price"),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Return GeoJSON FeatureCollection for map visualization.
    
    Each feature contains:
    - coordinates (lat, lng)
    - price, price_per_sqm
    - district, address
    - property_id for linking
    """
    query = db.query(Property).filter(Property.is_active == True)
    
    if district:
        query = query.filter(Property.address.ilike(f"%{district}%"))
    if min_price:
        query = query.filter(Property.price >= min_price)
    if max_price:
        query = query.filter(Property.price <= max_price)
    
    properties = query.all()
    
    features = []
    for prop in properties:
        if prop.latitude and prop.longitude:
            # Calculate price per sqm
            price_per_sqm = prop.price / prop.area_sqm if prop.area_sqm > 0 else 0
            
            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [prop.longitude, prop.latitude]  # GeoJSON: [lng, lat]
                },
                "properties": {
                    "id": prop.id,
                    "title": prop.title,
                    "price": prop.price,
                    "price_per_sqm": round(price_per_sqm),
                    "area_sqm": prop.area_sqm,
                    "rooms": prop.rooms,
                    "address": prop.address,
                    "source": prop.source,
                }
            })
    
    return {
        "type": "FeatureCollection",
        "features": features,
        "metadata": {
            "total": len(features),
            "avg_price": round(sum(f["properties"]["price"] for f in features) / len(features)) if features else 0,
            "avg_price_per_sqm": round(sum(f["properties"]["price_per_sqm"] for f in features) / len(features)) if features else 0,
        }
    }


@router.get("/districts")
def get_district_analytics(
    days: int = Query(30, description="Analysis period in days"),
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    """Get aggregated analytics by district.
    
    Returns price statistics, object count, and avg price per sqm for each district.
    """
    # Get all properties with location data
    properties = db.query(Property).filter(
        Property.is_active == True,
        Property.latitude.isnot(None)
    ).all()
    
    # Group by approximate district (from address or coordinates)
    districts: Dict[str, List[Property]] = {}
    
    for prop in properties:
        # Extract district from address (simplified)
        address_parts = prop.address.split(",") if prop.address else []
        district = address_parts[-1].strip() if len(address_parts) > 1 else "Сочи"
        
        if district not in districts:
            districts[district] = []
        districts[district].append(prop)
    
    # Calculate analytics per district
    result = []
    for district_name, props in districts.items():
        prices = [p.price for p in props]
        areas = [p.area_sqm for p in props if p.area_sqm > 0]
        price_per_sqm = [p.price / p.area_sqm for p in props if p.area_sqm > 0]
        
        # Calculate center coordinates for district
        lats = [p.latitude for p in props if p.latitude]
        lngs = [p.longitude for p in props if p.longitude]
        
        result.append({
            "district": district_name,
            "count": len(props),
            "avg_price": round(sum(prices) / len(prices)) if prices else 0,
            "min_price": min(prices) if prices else 0,
            "max_price": max(prices) if prices else 0,
            "median_price": sorted(prices)[len(prices) // 2] if prices else 0,
            "avg_price_per_sqm": round(sum(price_per_sqm) / len(price_per_sqm)) if price_per_sqm else 0,
            "avg_area": round(sum(areas) / len(areas)) if areas else 0,
            "center": {
                "lat": sum(lats) / len(lats) if lats else 43.585,
                "lng": sum(lngs) / len(lngs) if lngs else 39.720
            }
        })
    
    # Sort by count descending
    result.sort(key=lambda x: x["count"], reverse=True)
    
    return result
