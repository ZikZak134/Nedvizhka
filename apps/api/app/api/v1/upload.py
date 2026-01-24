"""API endpoint для загрузки файлов изображений."""
import os
import uuid
import shutil
from pathlib import Path
from fastapi import APIRouter, File, UploadFile, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/upload", tags=["Upload"])

# Путь к папке uploads. Храним локально в API.
# В продакшене (Render) это временное хранилище (очищается при деплое).
# Для постоянного хранения нужен S3. Но для MVP это решит проблему 404.
UPLOAD_DIR = Path("uploads")

# Допустимые расширения файлов
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".mp4", ".mov", ".webm"}
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100 MB


class UploadResponse(BaseModel):
    """Ответ после успешной загрузки."""
    url: str
    filename: str
    size: int


@router.post("", response_model=UploadResponse)
async def upload_image(file: UploadFile = File(...)):
    """
    Загрузить изображение или видео на сервер.
    
    Поддерживаемые форматы: JPG, PNG, WebP, GIF, MP4, MOV, WEBM.
    Максимальный размер: 100 MB.
    
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
