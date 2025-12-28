"""API endpoints for Statistics."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_db
from app.services import property_service

router = APIRouter(prefix="/stats", tags=["Statistics"])


@router.get("")
def get_stats(db: Session = Depends(get_db)):
    """Get aggregate statistics for the platform."""
    property_stats = property_service.get_property_stats(db)
    return {
        "properties": property_stats,
    }
