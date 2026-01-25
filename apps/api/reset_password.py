import os
import sys
import bcrypt
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Default to local settings, can be overridden by env vars
DB_USER = os.getenv("POSTGRES_USER", "postgres")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD", "postgres")
DB_SERVER = os.getenv("POSTGRES_SERVER", "localhost")
DB_PORT = os.getenv("POSTGRES_PORT", "5432")
DB_NAME = os.getenv("POSTGRES_DB", "estate_db")

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_SERVER}:{DB_PORT}/{DB_NAME}"

if os.getenv("ENVIRONMENT") == "local" and DB_SERVER == "localhost":
    # Fallback to SQLite if configured that way in main app, but usually logic is in config.py
    # Here we assume if they run this script they want to hit the DB defined in env
    pass

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def reset_password(username, new_password):
    print(f"Connecting to {DATABASE_URL}...")
    try:
        engine = create_engine(DATABASE_URL)
        SessionLocal = sessionmaker(bind=engine)
        session = SessionLocal()
        
        # Check if user exists
        # We use raw SQL to avoid importing models/dependencies that might be missing in standalone run
        result = session.execute(text("SELECT id, username FROM users WHERE username = :username"), {"username": username})
        user = result.fetchone()
        
        if not user:
            print(f"User '{username}' not found. Creating...")
            if True: # Force create

                print("Creating user...")
                # This requires knowing the schema structure exactly
                # Safer: Insert with minimal fields
                pw_hash = get_password_hash(new_password)
                import uuid
                from datetime import datetime
                user_id = str(uuid.uuid4())
                now = datetime.utcnow()
                
                session.execute(text("""
                    INSERT INTO users (id, username, password_hash, role, is_active, created_at, display_name)
                    VALUES (:id, :username, :password_hash, 'admin', true, :created_at, 'Admin')
                """), {
                    "id": user_id,
                    "username": username,
                    "password_hash": pw_hash,
                    "created_at": now
                })
                session.commit()
                print(f"User '{username}' created with password '{new_password}'")
            return

        print(f"User found: {user.username}")
        
        # Update password
        pw_hash = get_password_hash(new_password)
        session.execute(text("UPDATE users SET password_hash = :pw_hash WHERE username = :username"), 
                        {"pw_hash": pw_hash, "username": username})
        session.commit()
        print(f"Password for '{username}' updated successfully.")
        
    except Exception as e:
        print(f"Error: {e}")
        print("Ensure you are running this where the DB is accessible (e.g. inside docker container or on server).")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python reset_password.py <username> <new_password>")
        sys.exit(1)
    
    username = sys.argv[1]
    password = sys.argv[2]
    reset_password(username, password)
