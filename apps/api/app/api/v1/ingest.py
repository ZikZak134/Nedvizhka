"""API endpoints for data ingestion from external sources."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.core.deps import get_db
from app.schemas.property import PropertyCreate
from app.services import property_service
from app.services.parser_service import parser_service, PropertySource

router = APIRouter(prefix="/ingest", tags=["Data Ingestion"])


class ParseUrlRequest(BaseModel):
    url: str


class ParseUrlResponse(BaseModel):
    success: bool
    property_id: Optional[str] = None
    message: str


@router.post("/parse-url", response_model=ParseUrlResponse)
async def parse_url(request: ParseUrlRequest, db: Session = Depends(get_db)):
    """Parse a property listing URL and save to database.
    
    Supports:
    - ЦИАН (cian.ru)
    - Авито (avito.ru)
    """
    parsed = await parser_service.parse_url(request.url)
    
    if not parsed:
        raise HTTPException(
            status_code=400,
            detail="Unsupported URL. Please provide a CIAN or Avito listing URL."
        )
    
    # Convert ParsedProperty to PropertyCreate
    property_create = PropertyCreate(
        title=parsed.title,
        description=parsed.description,
        price=parsed.price,
        currency=parsed.currency,
        address=parsed.address,
        latitude=parsed.latitude,
        longitude=parsed.longitude,
        area_sqm=parsed.area_sqm,
        rooms=parsed.rooms,
        floor=parsed.floor,
        total_floors=parsed.total_floors,
        source=parsed.source.value,
        source_id=parsed.source_id,
        url=parsed.url,
        features=parsed.features,
        images=parsed.images,
    )
    
    # Save to database
    prop = property_service.create_property(db, property_create)
    
    return ParseUrlResponse(
        success=True,
        property_id=prop.id,
        message=f"Successfully parsed and saved property from {parsed.source.value}"
    )


@router.post("/generate-demo")
def generate_demo_data(count: int = 15, db: Session = Depends(get_db)):
    """Generate demo properties for UI testing.
    
    Args:
        count: Number of demo properties to generate (default: 15, max: 50)
    """
    if count > 50:
        count = 50
    
    parsed_properties = parser_service.generate_demo_properties(count)
    created = []
    
    for parsed in parsed_properties:
        property_create = PropertyCreate(
            title=parsed.title,
            description=parsed.description,
            price=parsed.price,
            currency=parsed.currency,
            address=parsed.address,
            latitude=parsed.latitude,
            longitude=parsed.longitude,
            area_sqm=parsed.area_sqm,
            rooms=parsed.rooms,
            floor=parsed.floor,
            total_floors=parsed.total_floors,
            source=parsed.source.value,
            source_id=parsed.source_id,
            url=parsed.url,
            features=parsed.features,
            images=parsed.images,
        )
        
        prop = property_service.create_property(db, property_create)
        created.append({"id": prop.id, "title": prop.title})
    
    return {
        "message": f"Created {len(created)} demo properties",
        "count": len(created),
        "items": created[:5]  # Show first 5 only
    }
