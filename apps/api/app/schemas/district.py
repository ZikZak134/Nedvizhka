"""
Pydantic-схемы для District (района).
"""

from typing import Optional, List, Any
from pydantic import BaseModel


class DistrictBase(BaseModel):
    """Базовые поля района."""
    name: str
    center_lat: float
    center_lng: float
    coordinates: Optional[List[List[float]]] = None
    avg_price_sqm: Optional[int] = None
    growth_5y: Optional[float] = None
    growth_10y: Optional[float] = None
    objects_count: Optional[int] = 0
    roi: Optional[float] = None
    risk_level: Optional[str] = "medium"
    description: Optional[str] = None


class DistrictCreate(DistrictBase):
    """Схема создания района."""
    pass


class DistrictUpdate(BaseModel):
    """Схема обновления района (все поля опциональны)."""
    name: Optional[str] = None
    center_lat: Optional[float] = None
    center_lng: Optional[float] = None
    coordinates: Optional[List[List[float]]] = None
    avg_price_sqm: Optional[int] = None
    growth_5y: Optional[float] = None
    growth_10y: Optional[float] = None
    objects_count: Optional[int] = None
    roi: Optional[float] = None
    risk_level: Optional[str] = None
    description: Optional[str] = None


class DistrictResponse(DistrictBase):
    """Схема ответа с районом."""
    id: int
    
    class Config:
        from_attributes = True
