"""
Модель жилого комплекса (Complex) для управления ЖК.
"""

from sqlalchemy import Column, Integer, String, Float, JSON

from app.core.db import Base
from sqlalchemy.orm import relationship


class Complex(Base):
    """
    Жилой комплекс с аналитикой.
    
    Атрибуты:
        name: Название ЖК (уникальное)
        center_lat: Широта центра ЖК
        center_lng: Долгота центра ЖК
        growth: Рост стоимости (%)
        price_sqm: Цена за м²
        min_price: Минимальная цена объекта
        tags: Теги ЖК (массив строк)
        image: URL изображения ЖК
        description: Описание ЖК
        district: Привязка к району
    """
    __tablename__ = "complexes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), unique=True, nullable=False, index=True)
    
    # Геолокация
    center_lat = Column(Float, nullable=False)
    center_lng = Column(Float, nullable=False)
    
    # Аналитика
    growth = Column(Float, nullable=True)      # Рост стоимости (%)
    price_sqm = Column(Integer, nullable=True) # Цена за м²
    min_price = Column(Integer, nullable=True) # Минимальная цена
    
    # Метаданные
    tags = Column(JSON, default=list)           # ['Deluxe', 'Sea View', 'Pool']
    image = Column(String(500), nullable=True)   # URL изображения
    description = Column(String(2000), nullable=True)
    district = Column(String(100), nullable=True)  # Название района
    
    # Relationships
    properties = relationship("Property", back_populates="complex", cascade="all, delete-orphan")
