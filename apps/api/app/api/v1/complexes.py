"""API endpoints for residential complex (ЖК) analytics."""
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta

from app.core.deps import get_db
from app.models.property import Property
from app.models.complex import Complex
from app.schemas.property import PropertyResponse

router = APIRouter(prefix="/complexes", tags=["Complex Analytics"])


@router.get("/{complex_id}/apartments", response_model=List[PropertyResponse])
def get_complex_apartments(
    complex_id: int,
    db: Session = Depends(get_db)
):
    """Get all apartments belonging to a specific complex ID."""
    complex_obj = db.query(Complex).filter(Complex.id == complex_id).first()
    if not complex_obj:
        raise HTTPException(status_code=404, detail="Complex not found")
        
    properties = db.query(Property).filter(
        Property.complex_id == complex_id,
        Property.is_active == True
    ).order_by(Property.price).all()
    
    return properties


# Known residential complexes in Sochi
KNOWN_COMPLEXES = [
    {"name": "Mantera Residence", "keywords": ["mantera", "мантера"]},
    {"name": "Sochi Lighthouse", "keywords": ["lighthouse", "лайтхаус"]},
    {"name": "Residence (Красная Поляна)", "keywords": ["residence", "резиденс"]},
    {"name": "Corum", "keywords": ["corum", "корум"]},
    {"name": "Elite Park", "keywords": ["elite park", "элит парк"]},
    {"name": "Актёр Гэлакси", "keywords": ["актёр", "гэлакси", "galaxy"]},
    {"name": "Александрийский маяк", "keywords": ["александрийский", "маяк"]},
    {"name": "Горки Город", "keywords": ["горки город", "gorki"]},
]


@router.get("")
def list_complexes(db: Session = Depends(get_db)) -> List[Dict[str, Any]]:
    """List all detected residential complexes with property counts."""
    properties = db.query(Property).filter(Property.is_active == True).all()
    
    result = []
    for complex_info in KNOWN_COMPLEXES:
        # Find properties matching this complex
        matching = [
            p for p in properties
            if any(kw.lower() in (p.title + " " + p.address).lower() 
                   for kw in complex_info["keywords"])
        ]
        
        if matching:
            prices = [p.price for p in matching]
            areas = [p.area_sqm for p in matching if p.area_sqm > 0]
            price_per_sqm = [p.price / p.area_sqm for p in matching if p.area_sqm > 0]
            
            result.append({
                "name": complex_info["name"],
                "count": len(matching),
                "avg_price": round(sum(prices) / len(prices)),
                "min_price": min(prices),
                "max_price": max(prices),
                "avg_price_per_sqm": round(sum(price_per_sqm) / len(price_per_sqm)) if price_per_sqm else 0,
                "avg_area": round(sum(areas) / len(areas)) if areas else 0,
            })
    
    # Add "Другие" for properties not matching any complex
    matched_ids = set()
    for complex_info in KNOWN_COMPLEXES:
        for p in properties:
            if any(kw.lower() in (p.title + " " + p.address).lower() 
                   for kw in complex_info["keywords"]):
                matched_ids.add(p.id)
    
    other = [p for p in properties if p.id not in matched_ids]
    if other:
        prices = [p.price for p in other]
        result.append({
            "name": "Другие объекты",
            "count": len(other),
            "avg_price": round(sum(prices) / len(prices)),
            "min_price": min(prices),
            "max_price": max(prices),
            "avg_price_per_sqm": 0,
            "avg_area": 0,
        })
    
    # Sort by count
    result.sort(key=lambda x: x["count"], reverse=True)
    return result


@router.get("/{complex_name}")
def get_complex_detail(
    complex_name: str,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get detailed analytics for a specific complex."""
    # Find complex keywords
    complex_info = next(
        (c for c in KNOWN_COMPLEXES if c["name"].lower() == complex_name.lower()),
        None
    )
    
    if not complex_info:
        # Try partial match
        complex_info = next(
            (c for c in KNOWN_COMPLEXES if complex_name.lower() in c["name"].lower()),
            None
        )
    
    if not complex_info:
        raise HTTPException(status_code=404, detail=f"Complex '{complex_name}' not found")
    
    # Find matching properties
    properties = db.query(Property).filter(Property.is_active == True).all()
    matching = [
        p for p in properties
        if any(kw.lower() in (p.title + " " + p.address).lower() 
               for kw in complex_info["keywords"])
    ]
    
    if not matching:
        raise HTTPException(status_code=404, detail=f"No properties found in '{complex_info['name']}'")
    
    # Calculate statistics
    prices = [p.price for p in matching]
    areas = [p.area_sqm for p in matching if p.area_sqm > 0]
    price_per_sqm = [p.price / p.area_sqm for p in matching if p.area_sqm > 0]
    
    # Room distribution
    room_distribution = {}
    for p in matching:
        room = p.rooms or "Не указано"
        room_distribution[room] = room_distribution.get(room, 0) + 1
    
    # Price distribution (buckets)
    price_ranges = [
        {"label": "< 15M", "min": 0, "max": 15_000_000},
        {"label": "15-30M", "min": 15_000_000, "max": 30_000_000},
        {"label": "30-50M", "min": 30_000_000, "max": 50_000_000},
        {"label": "50-100M", "min": 50_000_000, "max": 100_000_000},
        {"label": "> 100M", "min": 100_000_000, "max": float('inf')},
    ]
    
    price_distribution = []
    for range_info in price_ranges:
        count = len([p for p in matching if range_info["min"] <= p.price < range_info["max"]])
        price_distribution.append({
            "range": range_info["label"],
            "count": count,
            "percentage": round(count / len(matching) * 100, 1) if matching else 0
        })
    
    # Source distribution
    source_distribution = {}
    for p in matching:
        source = p.source or "unknown"
        source_distribution[source] = source_distribution.get(source, 0) + 1
    
    # Build property list
    property_list = [
        {
            "id": p.id,
            "title": p.title,
            "price": p.price,
            "area_sqm": p.area_sqm,
            "rooms": p.rooms,
            "price_per_sqm": round(p.price / p.area_sqm) if p.area_sqm > 0 else 0,
            "source": p.source,
        }
        for p in sorted(matching, key=lambda x: x.price)
    ]
    
    return {
        "name": complex_info["name"],
        "statistics": {
            "total_count": len(matching),
            "avg_price": round(sum(prices) / len(prices)),
            "min_price": min(prices),
            "max_price": max(prices),
            "median_price": sorted(prices)[len(prices) // 2],
            "avg_price_per_sqm": round(sum(price_per_sqm) / len(price_per_sqm)) if price_per_sqm else 0,
            "min_price_per_sqm": round(min(price_per_sqm)) if price_per_sqm else 0,
            "max_price_per_sqm": round(max(price_per_sqm)) if price_per_sqm else 0,
            "avg_area": round(sum(areas) / len(areas)) if areas else 0,
        },
        "room_distribution": room_distribution,
        "price_distribution": price_distribution,
        "source_distribution": source_distribution,
        "properties": property_list[:20],  # Limit to 20
        "investment_metrics": {
            "est_rental_yield": 4.5,  # % annual - placeholder
            "price_trend_30d": 0,      # % change - needs PriceHistory data
            "days_on_market_avg": 45,  # placeholder
        }
    }


@router.get("/{complex_name}/compare")
def compare_complexes(
    complex_name: str,
    compare_with: str = Query(..., description="Name of complex to compare with"),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Compare two residential complexes."""
    complex1 = get_complex_detail(complex_name, db)
    complex2 = get_complex_detail(compare_with, db)
    
    return {
        "complex_a": {
            "name": complex1["name"],
            **complex1["statistics"]
        },
        "complex_b": {
            "name": complex2["name"],
            **complex2["statistics"]
        },
        "comparison": {
            "price_diff_percent": round(
                (complex1["statistics"]["avg_price"] - complex2["statistics"]["avg_price"]) 
                / complex2["statistics"]["avg_price"] * 100, 1
            ) if complex2["statistics"]["avg_price"] else 0,
            "price_per_sqm_diff_percent": round(
                (complex1["statistics"]["avg_price_per_sqm"] - complex2["statistics"]["avg_price_per_sqm"]) 
                / complex2["statistics"]["avg_price_per_sqm"] * 100, 1
            ) if complex2["statistics"]["avg_price_per_sqm"] else 0,
            "count_diff": complex1["statistics"]["total_count"] - complex2["statistics"]["total_count"],
        }
    }
