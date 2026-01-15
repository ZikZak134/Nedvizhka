import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

def test_login():
    print("Testing Login...")
    try:
        resp = requests.post(
            f"{BASE_URL}/auth/login",
            json={"username": "admin", "password": "admin123"},
            headers={"Content-Type": "application/json"}
        )
        print(f"Login Status: {resp.status_code}")
        print(f"Login Resp: {resp.text}")
    except Exception as e:
        print(f"Login Failed: {e}")

def test_create_unauth():
    print("\nTesting Unauth Create...")
    try:
        resp = requests.post(
            f"{BASE_URL}/properties",
            json={
                "title": "Security Probe",
                "price": 100,
                "area_sqm": 50,
                "status": "active",
                "description": "Probe",
                "address": "Probe St",
                "currency": "RUB",
                "source": "manual",
                "rooms": "1",
                "floor": 1,
                "total_floors": 1
            },
            headers={"Content-Type": "application/json"}
        )
        print(f"Create Status: {resp.status_code}")
        print(f"Create Resp: {resp.text}")
    except Exception as e:
        print(f"Create Failed: {e}")

if __name__ == "__main__":
    test_login()
    test_create_unauth()
