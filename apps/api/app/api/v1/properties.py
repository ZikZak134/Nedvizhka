"""API endpoints for Properties resource."""
import math
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.deps import get_db
from app.schemas.property import (
    PropertyCreate,
    PropertyUpdate,
    PropertyResponse,
    PropertyListResponse,
    BulkPropertyCreate,
    BulkCreateResponse,
)
from app.services import property_service

from app.api.v1.auth import require_admin
from app.models.user import User

router = APIRouter(prefix="/properties", tags=["Properties"])


@router.get("", response_model=PropertyListResponse)
def list_properties(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Items per page"),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    min_area: Optional[float] = Query(None, ge=0),
    max_area: Optional[float] = Query(None, ge=0),
    rooms: Optional[str] = Query(None),
    source: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """List properties with filters and pagination."""
    skip = (page - 1) * size
    items, total = property_service.get_properties(
        db=db,
        skip=skip,
        limit=size,
        min_price=min_price,
        max_price=max_price,
        min_area=min_area,
        max_area=max_area,
        rooms=rooms,
        source=source,
    )
    pages = math.ceil(total / size) if total > 0 else 1
    
    return PropertyListResponse(
        items=items,
        total=total,
        page=page,
        size=size,
        pages=pages,
    )


@router.get("/{property_id}", response_model=PropertyResponse)
def get_property(property_id: str, db: Session = Depends(get_db)):
    """Get a single property by ID."""
    db_property = property_service.get_property(db, property_id)
    if not db_property:
        raise HTTPException(status_code=404, detail="Property not found")
    return db_property


@router.post("", response_model=PropertyResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
def create_property(
    property_data: PropertyCreate, 
    db: Session = Depends(get_db),
    # current_user is now enforced by dependency above, but we can keep it for logging if needed
    current_user: User = Depends(require_admin)
):
    """Create a new property."""
    return property_service.create_property(db, property_data)


@router.patch("/{property_id}", response_model=PropertyResponse)
def update_property(
    property_id: str,
    property_data: PropertyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update an existing property (partial update)."""
    db_property = property_service.update_property(db, property_id, property_data)
    if not db_property:
        raise HTTPException(status_code=404, detail="Property not found")
    return db_property


@router.delete("/{property_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin)])
def delete_property(
    property_id: str, 
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Soft delete a property."""
    success = property_service.delete_property(db, property_id)
    if not success:
        raise HTTPException(status_code=404, detail="Property not found")
    return None


@router.post("/bulk", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
def bulk_create_properties(
    bulk_data: "BulkPropertyCreate",
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Bulk create properties for a newbuild complex.
    
    Creates multiple apartments based on a template and floor range.
    Example: floors 2-10, 2 apartments per floor = 18 properties created.
    """
    from app.schemas.property import BulkPropertyCreate, BulkCreateResponse
    
    # Validate floor range
    if bulk_data.floor_to < bulk_data.floor_from:
        raise HTTPException(status_code=400, detail="floor_to must be >= floor_from")
    
    created_ids = []
    base_price = bulk_data.template.price
    
    for floor in range(bulk_data.floor_from, bulk_data.floor_to + 1):
        for apt_num in range(1, bulk_data.apartments_per_floor + 1):
            # Calculate floor-adjusted price
            floor_offset = floor - bulk_data.floor_from
            adjusted_price = base_price + (floor_offset * bulk_data.price_increment_per_floor)
            
            # Create property data from template
            property_dict = bulk_data.template.model_dump()
            property_dict['floor'] = floor
            property_dict['price'] = adjusted_price
            
            # Add apartment suffix to title if multiple per floor
            if bulk_data.apartments_per_floor > 1:
                property_dict['title'] = f"{property_dict['title']} (эт. {floor}, кв. {apt_num})"
            else:
                property_dict['title'] = f"{property_dict['title']} (эт. {floor})"
            
            # Create the property
            property_data = PropertyCreate(**property_dict)
            new_property = property_service.create_property(db, property_data)
            created_ids.append(new_property.id)
    
    return BulkCreateResponse(
        created_count=len(created_ids),
        property_ids=created_ids,
        message=f"Создано {len(created_ids)} объектов для этажей {bulk_data.floor_from}-{bulk_data.floor_to}"
    )
