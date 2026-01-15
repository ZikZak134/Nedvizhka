"""Schemas for Property resource."""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class PropertyBase(BaseModel):
    """Base schema for Property."""
    title: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    currency: str = Field(default="RUB", max_length=3)
    address: str
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    area_sqm: float = Field(..., gt=0)
    rooms: Optional[str] = None
    floor: Optional[int] = None
    total_floors: Optional[int] = None
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


class PropertyCreate(PropertyBase):
    """Schema for creating a Property."""
    pass


class PropertyUpdate(BaseModel):
    """Schema for updating a Property (partial update)."""
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    currency: Optional[str] = Field(None, max_length=3)
    address: Optional[str] = None
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    area_sqm: Optional[float] = Field(None, gt=0)
    rooms: Optional[str] = None
    floor: Optional[int] = None
    total_floors: Optional[int] = None
    source: Optional[str] = None
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
