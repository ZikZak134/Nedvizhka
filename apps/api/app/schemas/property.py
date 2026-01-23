"""Schemas for Property resource."""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class PropertyBase(BaseModel):
    """Base schema for Property."""
    title: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    price_per_sqm: Optional[float] = Field(None, gt=0)
    currency: str = Field(default="RUB", max_length=3)
    address: str
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    area_sqm: float = Field(..., gt=0)
    rooms: Optional[str] = None
    floor: Optional[int] = None
    total_floors: Optional[int] = None
    
    # Range Fields
    area_min: Optional[float] = Field(None, gt=0)
    area_max: Optional[float] = Field(None, gt=0)
    rooms_min: Optional[int] = Field(None, ge=0)
    rooms_max: Optional[int] = Field(None, ge=0)
    floor_min: Optional[int] = Field(None)
    floor_max: Optional[int] = Field(None)
    source: str = Field(default="manual")
    source_id: Optional[str] = None
    url: Optional[str] = None
    features: dict = Field(default_factory=dict)
    images: List[str] = Field(default_factory=list)
    
    # Extended Fields
    quality_score: Optional[int] = Field(default=95, ge=0, le=100)
    complex_name: Optional[str] = None
    district: Optional[str] = None
    badges: List[str] = Field(default_factory=list)
    investment_metrics: dict = Field(default_factory=dict)
    growth_forecasts: List[dict] = Field(default_factory=list)
    development_projects: List[dict] = Field(default_factory=list)
    eco_score: dict = Field(default_factory=dict)
    green_zones: List[dict] = Field(default_factory=list)
    owner_quote: Optional[str] = None
    owner_name: Optional[str] = None
    agent_profile: dict = Field(default_factory=dict)
    
    # Developer Properties (Новостройки)
    property_type: Optional[str] = Field(default="apartment")  # apartment, newbuild, cottage, commercial
    layout_type: Optional[str] = None  # Свободная, Фиксированная, Студия, Евро
    finishing_type: Optional[str] = None  # Черновая, Предчистовая, Чистовая, Дизайнерская
    completion_date: Optional[str] = None  # "4 кв. 2025", "Сдан"
    is_from_developer: bool = Field(default=False)
    developer_name: Optional[str] = None
    developer_comment: Optional[str] = None
    custom_fields: dict = Field(default_factory=dict)
    complex_id: Optional[int] = None


class PropertyCreate(PropertyBase):
    """Schema for creating a Property."""
    pass


class PropertyUpdate(BaseModel):
    """Schema for updating a Property (partial update)."""
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    price_per_sqm: Optional[float] = Field(None, gt=0)
    currency: Optional[str] = Field(None, max_length=3)
    address: Optional[str] = None
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    area_sqm: Optional[float] = Field(None, gt=0)
    rooms: Optional[str] = None
    floor: Optional[int] = None
    total_floors: Optional[int] = None
    
    # Range Fields
    area_min: Optional[float] = Field(None, gt=0)
    area_max: Optional[float] = Field(None, gt=0)
    rooms_min: Optional[int] = Field(None, ge=0)
    rooms_max: Optional[int] = Field(None, ge=0)
    floor_min: Optional[int] = Field(None)
    floor_max: Optional[int] = Field(None)
    source_id: Optional[str] = None
    url: Optional[str] = None
    features: Optional[dict] = None
    images: Optional[List[str]] = None
    
    # Extended Fields (Optional for Update)
    quality_score: Optional[int] = Field(None, ge=0, le=100)
    complex_name: Optional[str] = None
    district: Optional[str] = None
    badges: Optional[List[str]] = None
    investment_metrics: Optional[dict] = None
    growth_forecasts: Optional[List[dict]] = None
    development_projects: Optional[List[dict]] = None
    eco_score: Optional[dict] = None
    green_zones: Optional[List[dict]] = None
    owner_quote: Optional[str] = None
    owner_name: Optional[str] = None
    agent_profile: Optional[dict] = None
    is_active: Optional[bool] = None
    
    # Developer Properties (Новостройки)
    property_type: Optional[str] = None
    layout_type: Optional[str] = None
    finishing_type: Optional[str] = None
    completion_date: Optional[str] = None
    is_from_developer: Optional[bool] = None
    developer_name: Optional[str] = None
    developer_comment: Optional[str] = None
    custom_fields: Optional[dict] = None
    complex_id: Optional[int] = None


class PropertyResponse(PropertyBase):
    """Schema for Property response."""
    id: str
    created_at: datetime
    updated_at: datetime
    is_active: bool

    class Config:
        from_attributes = True


class PropertyListResponse(BaseModel):
    """Schema for paginated property list."""
    items: List[PropertyResponse]
    total: int
    page: int
    size: int
    pages: int


class BulkPropertyCreate(BaseModel):
    """Schema for bulk creating properties (e.g., multiple apartments in a newbuild)."""
    # Template data (applied to all created properties)
    template: PropertyBase
    
    # Floor range to generate
    floor_from: int = Field(..., ge=1, description="Starting floor number")
    floor_to: int = Field(..., ge=1, description="Ending floor number")
    
    # Optional: apartments per floor (creates multiple per floor with suffix)
    apartments_per_floor: int = Field(default=1, ge=1, le=20)
    
    # Optional: price increment per floor (e.g., 100000 RUB per floor)
    price_increment_per_floor: float = Field(default=0, ge=0)


class BulkCreateResponse(BaseModel):
    """Response for bulk create operation."""
    created_count: int
    property_ids: List[str]
    message: str
