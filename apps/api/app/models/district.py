"""
Модель района (District) для управления аналитикой районов Сочи.
"""

from sqlalchemy import Column, Integer, String, Float, JSON

from app.core.db import Base


class District(Base):
    """
    Район города с аналитикой инвестиционного потенциала.
    
    Атрибуты:
        name: Название района (уникальное)
        center_lat: Широта центра района
        center_lng: Долгота центра района
        coordinates: GeoJSON полигон границ района
        avg_price_sqm: Средняя цена за м² в районе
        growth_5y: Рост стоимости за 5 лет (%)
        growth_10y: Рост стоимости за 10 лет (%)
        objects_count: Количество объектов в районе
        roi: Средний ROI (%)
        risk_level: Уровень риска ('low', 'medium', 'high')
        description: Описание района
    """
    __tablename__ = "districts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    
    # Геолокация
    center_lat = Column(Float, nullable=False)
    center_lng = Column(Float, nullable=False)
    coordinates = Column(JSON, nullable=True)  # GeoJSON полигон
    
    # Аналитика
    avg_price_sqm = Column(Integer, nullable=True)  # Средняя цена за м²
    growth_5y = Column(Float, nullable=True)         # Рост за 5 лет (%)
    growth_10y = Column(Float, nullable=True)        # Рост за 10 лет (%)
    objects_count = Column(Integer, default=0)       # Количество объектов
    roi = Column(Float, nullable=True)               # ROI (%)
    risk_level = Column(String(20), default='medium')  # low/medium/high
    
    # Описание
    description = Column(String(1000), nullable=True)
