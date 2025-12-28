"""API endpoints for seeding demo data."""
import random
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_db
from app.schemas.property import PropertyCreate
from app.services import property_service
from app.services.geocoding_service import get_random_sochi_location, geocode_address_sync

router = APIRouter(prefix="/seed", tags=["Seed Data"])

# Sample data for generating properties
TITLES = [
    "Роскошные апартаменты с видом на море",
    "Современная квартира в центре Сочи",
    "Пентхаус с панорамным видом",
    "Элитная вилла на первой линии",
    "Стильная студия в курортной зоне",
    "Просторная квартира с террасой",
    "Дизайнерские апартаменты у моря",
    "Уютная квартира в тихом районе",
    "Премиум апартаменты с бассейном",
    "Эксклюзивная вилла с садом",
]

DESCRIPTIONS = [
    "Великолепные апартаменты с современным ремонтом и всеми удобствами. Панорамные окна открывают захватывающий вид на Чёрное море.",
    "Просторная квартира в самом сердце Сочи. Рядом все инфраструктурные объекты: магазины, рестораны, пляж.",
    "Уникальное предложение для ценителей комфорта. Дизайнерский интерьер, премиальные материалы отделки.",
    "Идеальный вариант для семейного отдыха или инвестиций. Закрытая территория, подземный паркинг.",
    "Светлые апартаменты с продуманной планировкой. Высокие потолки, качественная мебель в комплекте.",
]

FEATURES_OPTIONS = [
    {"view": "sea", "pool": True, "parking": True},
    {"view": "mountain", "balcony": True, "gym": True},
    {"view": "city", "sauna": True, "security": True},
    {"terrace": True, "furnished": True, "new_building": True},
    {"sea_view": True, "premium": True, "concierge": True},
]


@router.post("")
def seed_demo_data(count: int = 10, db: Session = Depends(get_db)):
    """Generate demo property data for testing UI.
    
    Использует реальные адреса Сочи из geocoding_service для точного размещения на карте.
    """
    created = []
    
    for i in range(count):
        rooms_options = ["Студия", "1", "2", "3", "4+"]
        
        # Получаем реальные координаты из кэша 2GIS
        lat, lon, address = get_random_sochi_location()
        
        # Добавляем небольшой сдвиг для разных объектов по одному адресу
        lat += random.uniform(-0.0005, 0.0005)  # ~50 метров макс
        lon += random.uniform(-0.0005, 0.0005)
        
        property_data = PropertyCreate(
            title=random.choice(TITLES) + f" #{i+1}",
            description=random.choice(DESCRIPTIONS),
            price=random.randint(8_000_000, 150_000_000),
            currency="RUB",
            address=address + f", корп. {random.randint(1, 5)}",
            latitude=lat,
            longitude=lon,
            area_sqm=random.randint(30, 350),
            rooms=random.choice(rooms_options),
            floor=random.randint(1, 25),
            total_floors=random.randint(5, 30),
            source=random.choice(["cian", "avito", "manual"]),
            source_id=f"demo_{i}_{random.randint(1000, 9999)}",
            url=None,
            features=random.choice(FEATURES_OPTIONS),
            images=[],
        )
        
        prop = property_service.create_property(db, property_data)
        created.append({
            "id": prop.id, 
            "title": prop.title,
            "address": address,
            "lat": lat,
            "lon": lon
        })
    
    return {"message": f"Created {len(created)} demo properties", "items": created}



@router.delete("")
def clear_demo_data(db: Session = Depends(get_db)):
    """Delete all demo properties (source_id starts with 'demo_')."""
    from app.models.property import Property
    
    deleted = db.query(Property).filter(Property.source_id.like("demo_%")).delete(synchronize_session=False)
    db.commit()
    
    return {"message": f"Deleted {deleted} demo properties"}
