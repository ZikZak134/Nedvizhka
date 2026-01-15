"""
Модель глобальных настроек сайта (SiteSettings).
"""

from sqlalchemy import Column, Integer, String, JSON

from app.core.db import Base


class SiteSettings(Base):
    """
    Глобальные настройки сайта (singleton).
    
    Атрибуты:
        default_images: Массив URL дефолтных изображений
        default_locations: Массив дефолтных локаций [{lat, lng, address, district}]
        footer_phone: Телефон в футере
        footer_address: Адрес в футере
        footer_email: Email в футере
        social_links: Словарь соцсетей {telegram, vk, instagram, youtube}
        footer_description: Описание компании в футере
    """
    __tablename__ = "site_settings"

    id = Column(Integer, primary_key=True, index=True)
    
    # Дефолтные изображения и локации
    default_images = Column(JSON, default=list)    # ["url1", "url2", ...]
    default_locations = Column(JSON, default=list) # [{lat, lng, address}]
    
    # Контакты
    footer_phone = Column(String(50), nullable=True)
    footer_address = Column(String(300), nullable=True)
    footer_email = Column(String(100), nullable=True)
    
    # Соцсети
    social_links = Column(JSON, default=dict)  # {telegram: "", vk: "", ...}
    
    # Описание
    footer_description = Column(String(1000), nullable=True)
