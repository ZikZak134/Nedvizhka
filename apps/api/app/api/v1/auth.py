"""Authentication API endpoints."""
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from sqlalchemy.orm import Session
from jose import JWTError, jwt
import bcrypt

from app.core.deps import get_db
from app.core.config import settings
from app.models.user import User


router = APIRouter(prefix="/auth", tags=["auth"])

# Настройки JWT
SECRET_KEY = getattr(settings, 'SECRET_KEY', 'estate-analytics-super-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 часа

# Хеширование паролей (используем bcrypt напрямую)

# Bearer токен
security = HTTPBearer(auto_error=False)


# === Схемы ===

class LoginRequest(BaseModel):
    """Запрос на вход."""
    username: str
    password: str


class TokenResponse(BaseModel):
    """Ответ с токеном."""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: dict


class UserCreate(BaseModel):
    """Создание пользователя."""
    username: str
    password: str
    display_name: Optional[str] = None
    role: str = "admin"


# === Утилиты ===

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Проверка пароля."""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))


def get_password_hash(password: str) -> str:
    """Хеширование пароля."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Создание JWT токена."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    """Декодирование JWT токена."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


# === Dependency для защиты endpoints ===

def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Получение текущего пользователя из JWT токена.
    Используйте как Depends() для защиты endpoint'ов.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Требуется авторизация",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Недействительный или истёкший токен",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Некорректный токен")
    
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Пользователь не найден")
    
    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    """Проверка что пользователь — администратор."""
    if user.role not in ["admin", "superadmin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Недостаточно прав")
    return user


# === API Endpoints ===

@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    Авторизация пользователя.
    Возвращает JWT токен для последующих запросов.
    """
    user = db.query(User).filter(User.username == request.username).first()
    
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный логин или пароль"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Аккаунт деактивирован"
        )
    
    # Обновляем время последнего входа
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Создаём токен
    access_token = create_access_token(
        data={"sub": user.id, "username": user.username, "role": user.role}
    )
    
    return TokenResponse(
        access_token=access_token,
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user={
            "id": user.id,
            "username": user.username,
            "display_name": user.display_name,
            "role": user.role
        }
    )


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    """Получение данных текущего пользователя."""
    return {
        "id": current_user.id,
        "username": current_user.username,
        "display_name": current_user.display_name,
        "email": current_user.email,
        "role": current_user.role,
        "last_login": current_user.last_login
    }


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(
    user_data: UserCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Создание нового пользователя (только для админов).
    """
    # Проверяем уникальность username
    existing = db.query(User).filter(User.username == user_data.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Пользователь с таким логином уже существует")
    
    new_user = User(
        username=user_data.username,
        password_hash=get_password_hash(user_data.password),
        display_name=user_data.display_name or user_data.username,
        role=user_data.role,
        created_at=datetime.utcnow()
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"id": new_user.id, "username": new_user.username, "message": "Пользователь создан"}


@router.post("/setup", status_code=status.HTTP_201_CREATED)
def setup_admin(request: LoginRequest, db: Session = Depends(get_db)):
    """
    Первичная настройка — создание первого администратора.
    Работает только если в системе нет пользователей.
    """
    # Проверяем что пользователей ещё нет
    user_count = db.query(User).count()
    if user_count > 0:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Первичная настройка уже выполнена. Используйте /login"
        )
    
    # Создаём первого администратора
    admin = User(
        username=request.username,
        password_hash=get_password_hash(request.password),
        display_name="Администратор",
        role="superadmin",
        created_at=datetime.utcnow()
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    
    return {
        "message": "Администратор создан! Теперь вы можете войти через /login",
        "username": admin.username
    }
