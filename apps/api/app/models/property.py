import uuid
from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, Float, Integer, Boolean, DateTime, CheckConstraint, Index, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.db import Base

class Property(Base):
    __tablename__ = "properties"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Core Data
    title: Mapped[str] = mapped_column(String, index=True)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    price: Mapped[float] = mapped_column(Float, index=True)
    price_per_sqm: Mapped[Optional[float]] = mapped_column(Float, nullable=True) # Recommended for Complexes
    currency: Mapped[str] = mapped_column(String(3), default="RUB")
    
    # Location (Sochi)
    address: Mapped[str] = mapped_column(String)
    latitude: Mapped[Optional[float]] = mapped_column(Float)
    longitude: Mapped[Optional[float]] = mapped_column(Float)
    
    # Specs (Single unit fields kept for compatibility)
    area_sqm: Mapped[float] = mapped_column(Float)
    rooms: Mapped[Optional[str]] = mapped_column(String) # "2", "3", "Studio"
    floor: Mapped[Optional[int]] = mapped_column(Integer)
    total_floors: Mapped[Optional[int]] = mapped_column(Integer)

    # Specs (Range fields for Complexes)
    area_min: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    area_max: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    rooms_min: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    rooms_max: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    floor_min: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    floor_max: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    # Metadata
    source: Mapped[str] = mapped_column(String) # "cian", "avito", "manual"
    source_id: Mapped[Optional[str]] = mapped_column(String, index=True)
    url: Mapped[Optional[str]] = mapped_column(String)
    
    # Rich Data
    features: Mapped[dict] = mapped_column(JSON, default={}) # {"pool": true, "view": "sea"}
    distances: Mapped[dict] = mapped_column(JSON, default={}) # {"sea": 800, "airport": 25000}
    images: Mapped[List[str]] = mapped_column(JSON, default=[])
    
    # Extended Data (Admin Full Control)
    quality_score: Mapped[Optional[int]] = mapped_column(Integer, default=95)
    complex_name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    district: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    badges: Mapped[List[str]] = mapped_column(JSON, default=[]) # e.g. ["Exclusive", "Sea View"]
    
    # Investment & Analytics
    investment_metrics: Mapped[dict] = mapped_column(JSON, default={}) # {roi: 15, growth: 120}
    growth_forecasts: Mapped[List[dict]] = mapped_column(JSON, default=[]) # [{year: "2025", val: 10}]
    development_projects: Mapped[List[dict]] = mapped_column(JSON, default=[]) # [{name: "New Marina", status: "planned"}]
    
    # Environment
    eco_score: Mapped[dict] = mapped_column(JSON, default={}) # {air: 5, noise: 4}
    green_zones: Mapped[List[dict]] = mapped_column(JSON, default=[]) # [{name: "Park", dist: "100m"}]
    
    # Owner & Agent
    owner_quote: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    owner_name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    agent_profile: Mapped[dict] = mapped_column(JSON, default={}) # {name: "Anna", role: "Expert", photo: "url"}
    
    # Developer Properties (Новостройки)
    property_type: Mapped[Optional[str]] = mapped_column(String, nullable=True, default="apartment")  # apartment, newbuild, cottage, commercial
    layout_type: Mapped[Optional[str]] = mapped_column(String, nullable=True)  # Свободная, Фиксированная, Студия, Евро
    finishing_type: Mapped[Optional[str]] = mapped_column(String, nullable=True)  # Черновая, Предчистовая, Чистовая, Дизайнерская
    completion_date: Mapped[Optional[str]] = mapped_column(String, nullable=True)  # "4 кв. 2025", "Сдан"
    is_from_developer: Mapped[bool] = mapped_column(Boolean, default=False)
    developer_name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    developer_comment: Mapped[Optional[str]] = mapped_column(String, nullable=True)  # Вместо owner_quote для застройщиков
    custom_fields: Mapped[dict] = mapped_column(JSON, default={})  # Поля свободной формы
    complex_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("complexes.id"), nullable=True, index=True)
    
    # Relationships
    complex = relationship("Complex", back_populates="properties")
    
    # System
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    __table_args__ = (
        Index("idx_property_location", "latitude", "longitude"),
        CheckConstraint("price > 0", name="check_price_positive"),
    )
