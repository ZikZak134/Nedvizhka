"""
Pydantic-схемы для Complex (ЖК).
"""

from typing import Optional, List
from pydantic import BaseModel


class ComplexBase(BaseModel):
    """Базовые поля ЖК."""
    name: str
    center_lat: float
    center_lng: float
    growth: Optional[float] = None
    price_sqm: Optional[int] = None
    min_price: Optional[int] = None
    tags: Optional[List[str]] = []
    image: Optional[str] = None
    description: Optional[str] = None
    district: Optional[str] = None


class ComplexCreate(ComplexBase):
    """Схема создания ЖК."""
    pass


class ComplexUpdate(BaseModel):
    """Схема обновления ЖК (все поля опциональны)."""
    name: Optional[str] = None
    center_lat: Optional[float] = None
    center_lng: Optional[float] = None
    growth: Optional[float] = None
    price_sqm: Optional[int] = None
    min_price: Optional[int] = None
    tags: Optional[List[str]] = None
    image: Optional[str] = None
    description: Optional[str] = None
    district: Optional[str] = None


class ComplexResponse(ComplexBase):
    """Схема ответа с ЖК."""
    id: int
    
    class Config:
        from_attributes = True
