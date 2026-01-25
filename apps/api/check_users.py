
import sys
import os

# Add the app directory to sys.path
sys.path.append(os.getcwd())

# Force localhost for script execution
os.environ["POSTGRES_SERVER"] = "localhost"

from app.core.deps import SessionLocal
from app.models.user import User

def check_users():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print(f"Total users: {len(users)}")
        for user in users:
            print(f"User: {user.username}, Role: {user.role}, Active: {user.is_active}")
    except Exception as e:
        print(f"Error checking users: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_users()
