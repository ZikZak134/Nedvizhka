"""API endpoint для загрузки файлов изображений."""
import os
import uuid
import shutil
from pathlib import Path
from fastapi import APIRouter, File, UploadFile, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/upload", tags=["Upload"])

# Путь к папке uploads в Next.js public
# При разработке используем относительный путь от корня проекта
UPLOAD_DIR = Path(__file__).parent.parent.parent.parent.parent.parent / "apps" / "web" / "public" / "uploads"

# Допустимые расширения файлов
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


class UploadResponse(BaseModel):
    """Ответ после успешной загрузки."""
    url: str
    filename: str
    size: int


@router.post("", response_model=UploadResponse)
async def upload_image(file: UploadFile = File(...)):
    """
    Загрузить изображение на сервер.
    
    Поддерживаемые форматы: JPG, PNG, WebP, GIF.
    Максимальный размер: 10 MB.
    
    Возвращает URL для использования в галерее.
    """
    # Проверяем расширение файла
    if file.filename:
        ext = Path(file.filename).suffix.lower()
    else:
        raise HTTPException(status_code=400, detail="Имя файла не указано")
    
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"Недопустимый формат файла. Разрешены: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Читаем содержимое для проверки размера
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"Файл слишком большой. Максимум: {MAX_FILE_SIZE // (1024 * 1024)} MB"
        )
    
    # Создаём папку uploads если не существует
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    
    # Генерируем уникальное имя файла
    unique_name = f"{uuid.uuid4().hex}{ext}"
    file_path = UPLOAD_DIR / unique_name
    
    # Сохраняем файл
    with open(file_path, "wb") as buffer:
        buffer.write(content)
    
    return UploadResponse(
        url=f"/uploads/{unique_name}",
        filename=unique_name,
        size=len(content)
    )


@router.delete("/{filename}")
async def delete_image(filename: str):
    """Удалить загруженное изображение."""
    file_path = UPLOAD_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Файл не найден")
    
    # Проверка что файл находится в uploads (защита от path traversal)
    try:
        file_path.resolve().relative_to(UPLOAD_DIR.resolve())
    except ValueError:
        raise HTTPException(status_code=400, detail="Недопустимый путь")
    
    os.remove(file_path)
    return {"message": "Файл удалён"}
