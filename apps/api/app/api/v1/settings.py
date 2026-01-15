"""
API endpoints для глобальных настроек сайта (SiteSettings).
Singleton — только GET и PUT.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_db
from app.models.site_settings import SiteSettings
from app.schemas.site_settings import SiteSettingsUpdate, SiteSettingsResponse

router = APIRouter(prefix="/settings", tags=["settings"])


def get_or_create_settings(db: Session) -> SiteSettings:
    """Получить или создать singleton-запись настроек."""
    settings = db.query(SiteSettings).first()
    if not settings:
        settings = SiteSettings(
            default_images=[],
            default_locations=[],
            social_links={},
            footer_phone="+7 (800) 555-35-35",
            footer_email="info@estateanalytics.ru",
            footer_address="354000, г. Сочи, ул. Навагинская, 9Д",
            footer_description="Премиальная недвижимость Сочи"
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@router.get("", response_model=SiteSettingsResponse)
async def get_settings(db: Session = Depends(get_db)):
    """Получить глобальные настройки сайта."""
    return get_or_create_settings(db)


@router.put("", response_model=SiteSettingsResponse)
async def update_settings(data: SiteSettingsUpdate, db: Session = Depends(get_db)):
    """Обновить глобальные настройки сайта."""
    settings = get_or_create_settings(db)
    
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(settings, key, value)
    
    db.commit()
    db.refresh(settings)
    return settings
