import sys
import os

# Add current directory to path (apps/api)
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.core.deps import get_db
from app.models.user import User
from app.api.v1.auth import get_password_hash

def create_admin():
    db = next(get_db())
    try:
        username = "admin"
        password = "admin123" # Simple password for local dev
        
        # Check if exists
        curr = db.query(User).filter(User.username == username).first()
        if curr:
            print(f"User '{username}' already exists.")
            # Reset password just in case
            curr.password_hash = get_password_hash(password)
            db.commit()
            print(f"Password reset to '{password}'")
            return

        new_user = User(
            username=username,
            password_hash=get_password_hash(password),
            role="admin",
            display_name="Admin User",
            email="admin@example.com"
        )
        db.add(new_user)
        db.commit()
        print(f"Created user: {username} / {password}")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
