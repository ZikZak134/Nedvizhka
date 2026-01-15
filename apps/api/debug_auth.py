import sys
import os

# Add path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.api.v1.auth import get_password_hash, verify_password
# from app.core.security import get_password_hash as sec_hash

def test_crypto():
    pwd = "test"
    hashed = get_password_hash(pwd)
    print(f"Hash: {hashed}")
    
    valid = verify_password(pwd, hashed)
    print(f"Verify Correct: {valid}")
    
    invalid = verify_password("wrong", hashed)
    print(f"Verify Wrong: {invalid}")

if __name__ == "__main__":
    test_crypto()
