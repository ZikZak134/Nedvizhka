import uuid
from typing import Optional
from sqlalchemy import String, Float, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column
from app.core.db import Base
import enum

class InfraType(str, enum.Enum):
    AIRPORT = "airport"
    SCHOOL = "school"
    SEA = "sea"
    PARK = "park"
    SHOP = "shop"
    HOSPITAL = "hospital"

class Infrastructure(Base):
    __tablename__ = "infrastructure"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    name: Mapped[str] = mapped_column(String, index=True)
    type: Mapped[InfraType] = mapped_column(SQLEnum(InfraType))
    
    # Location
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    
    address: Mapped[Optional[str]] = mapped_column(String)
    rating: Mapped[Optional[float]] = mapped_column(Float) # e.g. 5.0 for schools
