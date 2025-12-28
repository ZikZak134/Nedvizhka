"""PriceHistory model for tracking price changes over time."""
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class PriceHistory(Base):
    """Tracks price changes for properties over time.
    
    Designed for time-series analysis. In production with PostgreSQL,
    this table should use TimescaleDB extension for hypertable optimization.
    """
    __tablename__ = "price_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    property_id: Mapped[str] = mapped_column(String(36), ForeignKey("properties.id"), index=True)
    
    # Price data
    price: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="RUB")
    price_per_sqm: Mapped[float] = mapped_column(Float, nullable=True)
    
    # Change tracking
    change_amount: Mapped[float] = mapped_column(Float, nullable=True)  # Absolute change
    change_percent: Mapped[float] = mapped_column(Float, nullable=True)  # Percentage change
    
    # Timestamps
    recorded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    
    def __repr__(self) -> str:
        return f"<PriceHistory(property_id={self.property_id}, price={self.price}, recorded_at={self.recorded_at})>"
