import os
import uuid
import shutil
import time
from pathlib import Path
from fastapi import APIRouter, File, UploadFile, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/upload", tags=["Upload"])

# Локальная папка для хранения (внутри контейнера будет /app/uploads)
UPLOAD_DIR = Path("uploads")
# Убедимся, что папка существует
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Допустимые расширения
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".mp4", ".mov", ".webm"}
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100 MB

# Базовый URL для раздачи статики (Nginx или FastAPI static mount)
# В продакшене Nginx будет перехватывать /uploads/
STATIC_URL_PREFIX = "/uploads"

class UploadResponse(BaseModel):
    url: str
    filename: str
    size: int

class FileItem(BaseModel):
    key: str # Используем key для совместимости с фронтендом, это будет filename
    size: int
    last_modified: str
    url: str

class FileListResponse(BaseModel):
    files: list[FileItem]
    # next_token не нужен для локальной папки пока, или можно реализовать offset

@router.post("", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename required")
    
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Invalid extension. Allowed: {', '.join(ALLOWED_EXTENSIONS)}")
    
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large")
    
    # Генерация уникального имени
    unique_name = f"{uuid.uuid4().hex}{ext}"
    file_path = UPLOAD_DIR / unique_name
    
    with open(file_path, "wb") as f:
        f.write(content)
        
    return UploadResponse(
        url=f"{STATIC_URL_PREFIX}/{unique_name}",
        filename=unique_name,
        size=len(content)
    )

@router.delete("/{filename}")
async def delete_file(filename: str):
    file_path = UPLOAD_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        os.remove(file_path)
        return {"message": "Deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Delete error: {e}")

@router.get("/files", response_model=FileListResponse)
async def list_files():
    """Список файлов в локальной папке uploads."""
    try:
        files = []
        # Проходим по папке
        if UPLOAD_DIR.exists():
            with os.scandir(UPLOAD_DIR) as entries:
                for entry in entries:
                    if entry.is_file():
                        stat = entry.stat()
                        files.append(FileItem(
                            key=entry.name,
                            size=stat.st_size,
                            last_modified=time.strftime('%Y-%m-%dT%H:%M:%S', time.gmtime(stat.st_mtime)),
                            url=f"{STATIC_URL_PREFIX}/{entry.name}"
                        ))
        
        # Сортировка по дате (свежие первые)
        files.sort(key=lambda x: x.last_modified, reverse=True)
        
        return FileListResponse(files=files)
        
    except Exception as e:
        print(f"List Error: {e}")
        raise HTTPException(status_code=500, detail=f"List error: {e}")
