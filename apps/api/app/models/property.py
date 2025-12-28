import uuid
from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, Float, Integer, Boolean, DateTime, CheckConstraint, Index, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.core.db import Base

class Property(Base):
    __tablename__ = "properties"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Core Data
    title: Mapped[str] = mapped_column(String, index=True)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    price: Mapped[float] = mapped_column(Float, index=True)
    currency: Mapped[str] = mapped_column(String(3), default="RUB")
    
    # Location (Sochi)
    address: Mapped[str] = mapped_column(String)
    latitude: Mapped[Optional[float]] = mapped_column(Float)
    longitude: Mapped[Optional[float]] = mapped_column(Float)
    
    # Specs
    area_sqm: Mapped[float] = mapped_column(Float)
    rooms: Mapped[Optional[str]] = mapped_column(String) # "2", "3", "Studio"
    floor: Mapped[Optional[int]] = mapped_column(Integer)
    total_floors: Mapped[Optional[int]] = mapped_column(Integer)
    
    # Metadata
    source: Mapped[str] = mapped_column(String) # "cian", "avito", "manual"
    source_id: Mapped[Optional[str]] = mapped_column(String, index=True)
    url: Mapped[Optional[str]] = mapped_column(String)
    
    # Rich Data
    features: Mapped[dict] = mapped_column(JSON, default={}) # {"pool": true, "view": "sea"}
    images: Mapped[List[str]] = mapped_column(JSON, default=[])
    
    # System
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    __table_args__ = (
        Index("idx_property_location", "latitude", "longitude"),
        CheckConstraint("price > 0", name="check_price_positive"),
    )
