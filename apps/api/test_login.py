"""Скрипт для тестирования API логина."""
import requests

API_URL = "http://localhost:8000/api/v1"

def test_login():
    """Тестирует логин через API."""
    response = requests.post(
        f"{API_URL}/auth/login",
        json={"username": "admin", "password": "admin123"}
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"\n✅ LOGIN SUCCESS!")
        print(f"Token: {data['access_token'][:50]}...")
        return data['access_token']
    else:
        print(f"\n❌ LOGIN FAILED")
        return None

def test_protected_endpoint(token: str = None):
    """Тестирует защищённый эндпоинт."""
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    # Попробуем создать property без токена
    response = requests.post(
        f"{API_URL}/properties",
        json={
            "title": "Test Property",
            "price": 1000000,
            "area_sqm": 50,
            "rooms": 2,
            "latitude": 55.75,
            "longitude": 37.62
        },
        headers=headers
    )
    print(f"\nPOST /properties (auth={'YES' if token else 'NO'})")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text[:200] if response.text else 'empty'}")

if __name__ == "__main__":
    print("=" * 50)
    print("1. Тестирование логина")
    print("=" * 50)
    token = test_login()
    
    print("\n" + "=" * 50)
    print("2. Тестирование защищённого эндпоинта БЕЗ токена")
    print("=" * 50)
    test_protected_endpoint(None)
    
    if token:
        print("\n" + "=" * 50)
        print("3. Тестирование защищённого эндпоинта С токеном")
        print("=" * 50)
        test_protected_endpoint(token)
