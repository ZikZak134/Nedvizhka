"""
API endpoints для управления ЖК (Complexes).
CRUD операции для админ-панели.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.deps import get_db
from app.models.complex import Complex
from app.schemas.complex import ComplexCreate, ComplexUpdate, ComplexResponse

router = APIRouter(prefix="/complexes-admin", tags=["complexes-admin"])


@router.get("", response_model=List[ComplexResponse])
async def list_complexes_admin(db: Session = Depends(get_db)):
    """Получить список всех ЖК для админки."""
    return db.query(Complex).all()


@router.get("/{complex_id}", response_model=ComplexResponse)
async def get_complex_admin(complex_id: int, db: Session = Depends(get_db)):
    """Получить ЖК по ID."""
    complex_obj = db.query(Complex).filter(Complex.id == complex_id).first()
    if not complex_obj:
        raise HTTPException(status_code=404, detail="ЖК не найден")
    return complex_obj


@router.post("", response_model=ComplexResponse, status_code=status.HTTP_201_CREATED)
async def create_complex(data: ComplexCreate, db: Session = Depends(get_db)):
    """Создать новый ЖК."""
    existing = db.query(Complex).filter(Complex.name == data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="ЖК с таким названием уже существует")
    
    complex_obj = Complex(**data.model_dump())
    db.add(complex_obj)
    db.commit()
    db.refresh(complex_obj)
    return complex_obj


@router.put("/{complex_id}", response_model=ComplexResponse)
async def update_complex(complex_id: int, data: ComplexUpdate, db: Session = Depends(get_db)):
    """Обновить ЖК."""
    complex_obj = db.query(Complex).filter(Complex.id == complex_id).first()
    if not complex_obj:
        raise HTTPException(status_code=404, detail="ЖК не найден")
    
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(complex_obj, key, value)
    
    db.commit()
    db.refresh(complex_obj)
    return complex_obj


@router.delete("/{complex_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_complex(complex_id: int, db: Session = Depends(get_db)):
    """Удалить ЖК."""
    complex_obj = db.query(Complex).filter(Complex.id == complex_id).first()
    if not complex_obj:
        raise HTTPException(status_code=404, detail="ЖК не найден")
    
    db.delete(complex_obj)
    db.commit()
    return None
