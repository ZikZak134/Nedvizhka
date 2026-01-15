"""
Pydantic-схемы для SiteSettings (глобальных настроек).
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class LocationItem(BaseModel):
    """Одна локация."""
    lat: float
    lng: float
    address: str
    district: Optional[str] = None


class SocialLinks(BaseModel):
    """Ссылки на соцсети."""
    telegram: Optional[str] = None
    vk: Optional[str] = None
    instagram: Optional[str] = None
    youtube: Optional[str] = None
    whatsapp: Optional[str] = None


class SiteSettingsBase(BaseModel):
    """Базовые поля настроек."""
    default_images: Optional[List[str]] = []
    default_locations: Optional[List[LocationItem]] = []
    footer_phone: Optional[str] = None
    footer_address: Optional[str] = None
    footer_email: Optional[str] = None
    social_links: Optional[Dict[str, str]] = {}
    footer_description: Optional[str] = None


class SiteSettingsUpdate(SiteSettingsBase):
    """Схема обновления настроек."""
    pass


class SiteSettingsResponse(SiteSettingsBase):
    """Схема ответа с настройками."""
    id: int
    
    class Config:
        from_attributes = True
