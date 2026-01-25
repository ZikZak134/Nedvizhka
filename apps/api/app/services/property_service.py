"""CRUD operations for Property model."""
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.property import Property
from app.schemas.property import PropertyCreate, PropertyUpdate


def get_property(db: Session, property_id: str) -> Optional[Property]:
    """Get a single property by ID."""
    return db.query(Property).filter(Property.id == property_id).first()


def get_properties(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_area: Optional[float] = None,
    max_area: Optional[float] = None,
    rooms: Optional[str] = None,
    source: Optional[str] = None,
    layout_type: Optional[str] = None,
    finishing_type: Optional[str] = None,
    is_from_developer: Optional[bool] = None,
    is_active: bool = True,
) -> tuple[List[Property], int]:
    """Get list of properties with filters and pagination."""
    query = db.query(Property).filter(Property.is_active == is_active)
    
    if min_price is not None:
        query = query.filter(Property.price >= min_price)
    if max_price is not None:
        query = query.filter(Property.price <= max_price)
    if min_area is not None:
        query = query.filter(Property.area_sqm >= min_area)
    if max_area is not None:
        query = query.filter(Property.area_sqm <= max_area)
    if rooms is not None:
        query = query.filter(Property.rooms == rooms)
    if source is not None:
        query = query.filter(Property.source == source)
    if layout_type is not None:
        query = query.filter(Property.layout_type == layout_type)
    if finishing_type is not None:
        query = query.filter(Property.finishing_type == finishing_type)
    if is_from_developer is not None:
        query = query.filter(Property.is_from_developer == is_from_developer)
    
    total = query.count()
    items = query.order_by(Property.created_at.desc()).offset(skip).limit(limit).all()
    
    return items, total


from app.services.geo_service import GeoService

def create_property(db: Session, property_data: PropertyCreate) -> Property:
    """Create a new property."""
    data = property_data.model_dump()
    
    # Auto-Geocode if address provided but coords missing
    if (not data.get('latitude') or not data.get('longitude')) and data.get('address'):
        coords = GeoService.geocode(data['address'])
        if coords:
            data['latitude'], data['longitude'] = coords
    
    # Auto-Calculate Distances
    # if data.get('latitude') and data.get('longitude'):
    #     try:
    #         distances = GeoService.calculate_distances(db, data['latitude'], data['longitude'])
    #         data['distances'] = distances
    #     except Exception:
    #         pass # Ignore geo errors to prevent transaction abort

    db_property = Property(**data)
    db.add(db_property)
    db.commit()
    db.refresh(db_property)
    return db_property


def update_property(db: Session, property_id: str, property_data: PropertyUpdate) -> Optional[Property]:
    """Update an existing property."""
    db_property = get_property(db, property_id)
    if not db_property:
        return None
    
    update_data = property_data.model_dump(exclude_unset=True)
    
    # Auto-Geocode if address changed but coords missing
    if 'address' in update_data and 'latitude' not in update_data:
        coords = GeoService.geocode(update_data['address'])
        if coords:
            update_data['latitude'], update_data['longitude'] = coords
    
    # If location changed, recalculate distances
    if 'latitude' in update_data or 'longitude' in update_data:
        lat = update_data.get('latitude', db_property.latitude)
        lon = update_data.get('longitude', db_property.longitude)
        
        if lat and lon:
            distances = GeoService.calculate_distances(db, lat, lon)
            update_data['distances'] = distances 
            # Also update the object field directly since setattr might miss nested dict update logic if handled poorly
            setattr(db_property, 'distances', distances)

    for field, value in update_data.items():
        setattr(db_property, field, value)
    
    update_data = property_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_property, field, value)
    
    db.commit()
    db.refresh(db_property)
    return db_property


def delete_property(db: Session, property_id: str) -> bool:
    """Soft delete a property (set is_active=False)."""
    db_property = get_property(db, property_id)
    if not db_property:
        return False
    
    db_property.is_active = False
    db.commit()
    return True


def get_property_stats(db: Session) -> dict:
    """Get aggregate statistics for properties."""
    stats = db.query(
        func.count(Property.id).label("total"),
        func.avg(Property.price).label("avg_price"),
        func.min(Property.price).label("min_price"),
        func.max(Property.price).label("max_price"),
        func.avg(Property.area_sqm).label("avg_area"),
    ).filter(Property.is_active == True).first()
    
    return {
        "total_properties": stats.total or 0,
        "avg_price": round(stats.avg_price or 0, 2),
        "min_price": stats.min_price or 0,
        "max_price": stats.max_price or 0,
        "avg_area_sqm": round(stats.avg_area or 0, 2),
    }
