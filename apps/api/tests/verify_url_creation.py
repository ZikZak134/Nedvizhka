
import os
import requests
import json
import time

# Setup
BASE_URL = "http://217.199.254.119/api/v1"
ADMIN_EMAIL = "regit_admin"
ADMIN_PASSWORD = "nimda70"

def get_token():
    print(f"Logging in as {ADMIN_EMAIL}...")
    resp = requests.post(f"{BASE_URL}/auth/login", json={
        "username": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    if resp.status_code != 200:
        print(f"Login failed: {resp.text}")
        exit(1)
    return resp.json()["access_token"]

def create_property(token):
    print("Creating property via URL...")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Coordinates in Moscow, near Kremlin for visibility
    lat = 55.75 + (time.time() % 100) / 10000 
    lon = 37.61 + (time.time() % 100) / 10000

    data = {
        "title": f"Test Villa URL Only {int(time.time())}",
        "description": "Property created to verify Map and Video Player (External URL).",
        "price": 55000000,
        "price_per_sqm": 550000,
        "area_sqm": 120,
        "rooms": "3",
        "floor": 2,
        "total_floors": 5,
        "address": "Red Square Test Loc",
        "latitude": lat,
        "longitude": lon,
        "images": [
            "https://picsum.photos/id/10/800/600",
            "https://picsum.photos/id/11/800/600"
        ],
        "videos": [
            "https://www.youtube.com/watch?v=GetO3wI-a-8", # Nature 4K
            "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" # Direct Link
        ],
        "features": {
            "parking": True,
            "gym": True
        }
    }
    
    resp = requests.post(f"{BASE_URL}/properties", json=data, headers=headers)
    if resp.status_code != 201:
        print(f"Creation failed: {resp.text}")
        exit(1)
    
    prop = resp.json()
    print(f"Property Created: {prop['id']}")
    return prop['id']

def main():
    try:
        token = get_token()
        prop_id = create_property(token)
        print("\nSUCCESS! URL-based Property Created.")
        print(f"Check URL: http://217.199.254.119/property/{prop_id}")
    except Exception as e:
        print(f"Error: {e}")
        exit(1)

if __name__ == "__main__":
    main()
