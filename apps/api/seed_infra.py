import asyncio
import os
import sys

# Add project root to python path so we can import app modules
sys.path.append(os.getcwd())

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

# Define DB URL (Defaulting to local docker port)
# POSTGRES_USER=postgres, POSTGRES_PASSWORD=postgres, POSTGRES_DB=estate_db, PORT=5432
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/estate_db"
if os.getenv("POSTGRES_SERVER"):
    server = os.getenv("POSTGRES_SERVER")
    SQLALCHEMY_DATABASE_URL = f"postgresql://postgres:postgres@{server}:5432/estate_db"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

from app.models.infrastructure import Infrastructure, InfraType
from app.core.db import Base # Base is still needed for models to register, though we might need to create tables if they don't exist
from app.models.infrastructure import Infrastructure, InfraType
from sqlalchemy import text

def seed_infrastructure():
    # Create tables if they don't exist (Lazy Migration)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if already seeded
        count = db.query(Infrastructure).count()
        if count > 0:
            print("Infrastructure already seeded.")
            return

        print("Seeding Infrastructure...")
        
        items = [
            # Transport
            {
                "name": "Аэропорт Сочи (AER)",
                "type": InfraType.AIRPORT,
                "latitude": 43.4499,
                "longitude": 39.9566,
                "address": "Адлер, ул. Мира",
                "rating": 4.5
            },
            # Nature / Sea (Points along the coast)
            {
                "name": "Пляж Ривьера",
                "type": InfraType.SEA,
                "latitude": 43.5805,
                "longitude": 39.7126,
                "address": "Центральная набережная",
                "rating": 5.0
            },
            {
                "name": "Имеретинский Пляж",
                "type": InfraType.SEA,
                "latitude": 43.3957,
                "longitude": 39.9620,
                "address": "Сириус",
                "rating": 5.0
            },
             # Education
            {
                "name": "Гимназия №1",
                "type": InfraType.SCHOOL,
                "latitude": 43.5855,
                "longitude": 39.7231, # Approx center
                "address": "ул. Воровского, 22",
                "rating": 4.8
            },
            {
                "name": "Лицей №59",
                "type": InfraType.SCHOOL,
                "latitude": 43.4300,
                "longitude": 39.9200, # Adler
                "address": "Адлер, ул. Просвещения",
                "rating": 4.6
            },
            # Shopping
            {
                "name": "ТЦ МореМолл",
                "type": InfraType.SHOP,
                "latitude": 43.6067,
                "longitude": 39.7335,
                "address": "ул. Новая Заря, 7",
                "rating": 4.9
            }
        ]

        for item in items:
            infra = Infrastructure(**item)
            db.add(infra)
        
        db.commit()
        print(f"Successfully seeded {len(items)} infrastructure points!")
        
    except Exception as e:
        print(f"Error seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_infrastructure()
