
import os
import sqlalchemy
from sqlalchemy import create_engine, text

# Use connection logic similar to seed_infra.py
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/nedvizhka_db")

def update_schema():
    print(f"Connecting to {DATABASE_URL}...")
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        print("Connected. Checking columns...")
        
        # List of columns to add
        # Format: (name, type, default)
        new_columns = [
            ("quality_score", "INTEGER", "95"),
            ("complex_name", "VARCHAR", "NULL"),
            ("district", "VARCHAR", "NULL"),
            ("badges", "JSONB", "'[]'"),
            ("investment_metrics", "JSONB", "'{}'"),
            ("growth_forecasts", "JSONB", "'[]'"),
            ("development_projects", "JSONB", "'[]'"),
            ("eco_score", "JSONB", "'{}'"),
            ("green_zones", "JSONB", "'[]'"),
            ("owner_quote", "VARCHAR", "NULL"),
            ("owner_name", "VARCHAR", "NULL"),
            ("agent_profile", "JSONB", "'{}'")
        ]

        for col_name, col_type, default_val in new_columns:
            try:
                # Check if column exists
                check_sql = text(f"SELECT column_name FROM information_schema.columns WHERE table_name='properties' AND column_name='{col_name}'")
                result = conn.execute(check_sql).fetchone()
                
                if not result:
                    print(f"Adding column '{col_name}'...")
                    alter_sql = text(f"ALTER TABLE properties ADD COLUMN {col_name} {col_type} DEFAULT {default_val}")
                    conn.execute(alter_sql)
                    conn.commit()
                    print(f"✓ Added {col_name}")
                else:
                    print(f"• Column '{col_name}' already exists.")
                    
            except Exception as e:
                print(f"Error checking/adding {col_name}: {e}")
                
    print("Schema update complete.")

if __name__ == "__main__":
    update_schema()
