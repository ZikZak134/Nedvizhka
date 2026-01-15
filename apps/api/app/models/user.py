"""User model for authentication."""
import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.core.db import Base


class User(Base):
    """Модель пользователя для аутентификации в админке."""
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Аутентификация
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    
    # Профиль
    display_name: Mapped[str] = mapped_column(String(100), nullable=True)
    email: Mapped[str] = mapped_column(String(255), nullable=True)
    
    # Права
    role: Mapped[str] = mapped_column(String(20), default="admin")  # admin, editor, viewer
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Аудит
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    last_login: Mapped[datetime] = mapped_column(DateTime, nullable=True)
