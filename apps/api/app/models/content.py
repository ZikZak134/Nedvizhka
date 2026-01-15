import uuid
from sqlalchemy import String, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.core.db import Base

class ContentBlock(Base):
    """
    Stores dynamic content for Vibe CMS.
    key: "home.hero.title"
    value: {"text": "Elite Real Estate", "color": "#d4af37"}
    """
    __tablename__ = "content_blocks"

    key: Mapped[str] = mapped_column(String, primary_key=True)
    value: Mapped[dict] = mapped_column(JSON, default={})
    description: Mapped[str] = mapped_column(String, nullable=True)
