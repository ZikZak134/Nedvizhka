"""
API endpoints для управления районами (Districts).
CRUD операции для админ-панели.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.deps import get_db
from app.models.district import District
from app.schemas.district import DistrictCreate, DistrictUpdate, DistrictResponse

router = APIRouter(prefix="/districts", tags=["districts"])


@router.get("", response_model=List[DistrictResponse])
async def list_districts(db: Session = Depends(get_db)):
    """Получить список всех районов."""
    return db.query(District).all()


@router.get("/{district_id}", response_model=DistrictResponse)
async def get_district(district_id: int, db: Session = Depends(get_db)):
    """Получить район по ID."""
    district = db.query(District).filter(District.id == district_id).first()
    if not district:
        raise HTTPException(status_code=404, detail="Район не найден")
    return district


@router.post("", response_model=DistrictResponse, status_code=status.HTTP_201_CREATED)
async def create_district(data: DistrictCreate, db: Session = Depends(get_db)):
    """Создать новый район."""
    # Проверка уникальности имени
    existing = db.query(District).filter(District.name == data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Район с таким названием уже существует")
    
    district = District(**data.model_dump())
    db.add(district)
    db.commit()
    db.refresh(district)
    return district


@router.put("/{district_id}", response_model=DistrictResponse)
async def update_district(district_id: int, data: DistrictUpdate, db: Session = Depends(get_db)):
    """Обновить район."""
    district = db.query(District).filter(District.id == district_id).first()
    if not district:
        raise HTTPException(status_code=404, detail="Район не найден")
    
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(district, key, value)
    
    db.commit()
    db.refresh(district)
    return district


@router.delete("/{district_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_district(district_id: int, db: Session = Depends(get_db)):
    """Удалить район."""
    district = db.query(District).filter(District.id == district_id).first()
    if not district:
        raise HTTPException(status_code=404, detail="Район не найден")
    
    db.delete(district)
    db.commit()
    return None
