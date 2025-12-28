"""API endpoint for triggering real parsers."""
from fastapi import APIRouter, Depends, Query, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
import asyncio

from app.core.deps import get_db
from app.schemas.property import PropertyCreate
from app.services import property_service
from app.parsers import CianParser, AvitoParser

router = APIRouter(prefix="/parse", tags=["Data Parsers"])


class ParseRequest(BaseModel):
    source: str  # "cian" or "avito"
    min_price: Optional[int] = None
    max_price: Optional[int] = None
    max_pages: int = 1


class ParseResponse(BaseModel):
    status: str
    source: str
    items_found: int
    items_saved: int
    errors: List[str]


@router.post("/run", response_model=ParseResponse)
async def run_parser(
    request: ParseRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
) -> ParseResponse:
    """Run parser for specified source.
    
    Parses properties from CIAN or Avito and saves to database.
    
    Args:
        request: Parser configuration
        background_tasks: FastAPI background tasks
        db: Database session
    
    Returns:
        Parse results with counts and errors
    """
    errors = []
    items_found = 0
    items_saved = 0
    
    if request.source.lower() == "cian":
        parser = CianParser()
        
        for page in range(1, request.max_pages + 1):
            properties = await parser.search_sochi(
                min_price=request.min_price,
                max_price=request.max_price,
                page=page
            )
            
            items_found += len(properties)
            
            for prop in properties:
                try:
                    # Check if already exists
                    existing = db.query(property_service.Property).filter(
                        property_service.Property.source_id == prop.source_id
                    ).first()
                    
                    if existing:
                        continue
                    
                    # Create new property
                    property_create = PropertyCreate(
                        title=prop.title,
                        description=prop.description,
                        price=prop.price,
                        currency=prop.currency,
                        address=prop.address,
                        latitude=prop.latitude,
                        longitude=prop.longitude,
                        area_sqm=prop.area_sqm,
                        rooms=prop.rooms,
                        floor=prop.floor,
                        total_floors=prop.total_floors,
                        source="cian",
                        source_id=prop.source_id,
                        url=prop.url,
                        images=prop.images,
                        features=prop.features,
                    )
                    
                    property_service.create_property(db, property_create)
                    items_saved += 1
                    
                except Exception as e:
                    errors.append(f"CIAN save error: {str(e)[:100]}")
    
    elif request.source.lower() == "avito":
        parser = AvitoParser()
        
        for page in range(1, request.max_pages + 1):
            properties = await parser.search_sochi(
                min_price=request.min_price,
                max_price=request.max_price,
                page=page
            )
            
            items_found += len(properties)
            
            for prop in properties:
                try:
                    existing = db.query(property_service.Property).filter(
                        property_service.Property.source_id == prop.source_id
                    ).first()
                    
                    if existing:
                        continue
                    
                    property_create = PropertyCreate(
                        title=prop.title,
                        description=prop.description,
                        price=prop.price,
                        currency=prop.currency,
                        address=prop.address,
                        latitude=prop.latitude,
                        longitude=prop.longitude,
                        area_sqm=prop.area_sqm,
                        rooms=prop.rooms,
                        floor=prop.floor,
                        total_floors=prop.total_floors,
                        source="avito",
                        source_id=prop.source_id,
                        url=prop.url,
                        images=prop.images,
                        features=prop.features,
                    )
                    
                    property_service.create_property(db, property_create)
                    items_saved += 1
                    
                except Exception as e:
                    errors.append(f"Avito save error: {str(e)[:100]}")
    
    else:
        errors.append(f"Unknown source: {request.source}")
    
    return ParseResponse(
        status="completed" if not errors else "completed_with_errors",
        source=request.source,
        items_found=items_found,
        items_saved=items_saved,
        errors=errors[:10]  # Limit errors in response
    )


@router.get("/sources")
def list_sources() -> List[Dict[str, Any]]:
    """List available parser sources."""
    return [
        {
            "id": "cian",
            "name": "ЦИАН",
            "description": "Парсер ЦИАН.ru - крупнейший сервис недвижимости",
            "rate_limit": "1-3 requests/sec",
            "status": "active"
        },
        {
            "id": "avito",
            "name": "Авито",
            "description": "Парсер Avito.ru - доска объявлений",
            "rate_limit": "3-7 sec delay (strict anti-bot)",
            "status": "active"
        }
    ]


@router.post("/url")
async def parse_url(
    url: str = Query(..., description="URL объявления"),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Parse a single listing URL.
    
    Detects source automatically and parses the listing.
    """
    if "cian.ru" in url:
        parser = CianParser()
        prop = await parser.parse_listing(url)
        source = "cian"
    elif "avito.ru" in url:
        parser = AvitoParser()
        prop = await parser.parse_listing(url)
        source = "avito"
    else:
        return {"error": "Unsupported URL. Use cian.ru or avito.ru"}
    
    if not prop:
        return {"error": "Failed to parse URL"}
    
    # Save to database
    try:
        property_create = PropertyCreate(
            title=prop.title,
            description=prop.description,
            price=prop.price,
            currency=prop.currency,
            address=prop.address,
            latitude=prop.latitude,
            longitude=prop.longitude,
            area_sqm=prop.area_sqm,
            rooms=prop.rooms,
            floor=prop.floor,
            total_floors=prop.total_floors,
            source=source,
            source_id=prop.source_id,
            url=prop.url,
            images=prop.images,
            features=prop.features,
        )
        
        saved = property_service.create_property(db, property_create)
        
        return {
            "success": True,
            "property_id": saved.id,
            "title": saved.title,
            "price": saved.price,
            "source": source
        }
    except Exception as e:
        return {"error": f"Failed to save: {str(e)}"}
