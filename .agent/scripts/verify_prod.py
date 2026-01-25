import requests
import json
import base64

BASE_URL = "http://217.199.254.119/api/v1"
ADMIN_USER = "admin"
ADMIN_PASS = "password"

def run_verification():
    print(f"Checking API at {BASE_URL}...")
    
    # 1. Check Health
    try:
        r = requests.get(f"{BASE_URL}/healthz")
        if r.status_code == 200:
            print("✅ API Health: OK")
        else:
            print(f"⚠️ API Health: {r.status_code} (Might be path issue, proceeding...)")
    except Exception as e:
        print(f"❌ API Unreachable: {e}")
        return

    # 2. Setup or Login
    session = requests.Session()
    token = None
    
    # Try Setup
    print("Attempting Setup...")
    r = requests.post(f"{BASE_URL}/auth/setup", json={"username": ADMIN_USER, "password": ADMIN_PASS})
    if r.status_code in [200, 201]:
        print("✅ Admin created via Setup.")
    elif r.status_code == 403:
        print("ℹ️ Setup already done. Attempting login...")
    else:
        print(f"❌ Setup error: {r.text}")

    # Login
    print("Logging in...")
    r = requests.post(f"{BASE_URL}/auth/login", json={"username": ADMIN_USER, "password": ADMIN_PASS})
    if r.status_code == 200:
        token = r.json()["access_token"]
        print("✅ Login Success!")
    else:
        print(f"❌ Login Failed: {r.text}")
        return

    headers = {"Authorization": f"Bearer {token}"}

    # 3. Create District
    print("Creating Test District...")
    district_data = {
        "name": "Test District Central",
        "description": "Verification district",
        "coordinates": [[43.58, 39.72], [43.59, 39.73], [43.58, 39.73]], # Simple triangle
        "center_lat": 43.585,
        "center_lng": 39.725
    }
    # Check if exists first? (Naive implementation)
    r = requests.post(f"{BASE_URL}/districts", json=district_data, headers=headers)
    if r.status_code in [200, 201]:
        print("✅ District created.")
        district_id = r.json()["id"]
    else:
        print(f"⚠️ District create failed (maybe exists): {r.text}")
        # Try to find existing
        r_list = requests.get(f"{BASE_URL}/districts", headers=headers)
        if r_list.ok and len(r_list.json()) > 0:
             district_id = r_list.json()[0]["id"]
             print(f"ℹ️ Used existing district ID: {district_id}")
        else:
             print("❌ Cannot proceed without district")
             return

    # 4. Create Complex
    print("Creating Test Complex...")
    complex_data = {
        "name": "Test Complex Royale",
        "description": "Best complex ever",
        "center_lat": 43.585,
        "center_lng": 39.725
    }
    r = requests.post(f"{BASE_URL}/complexes-admin", json=complex_data, headers=headers)
    if r.status_code in [200, 201]:
         print("✅ Complex created.")
         complex_id = r.json()["id"]
    else:
         print(f"⚠️ Complex create failed: {r.text}")
         # Try find
         r_list = requests.get(f"{BASE_URL}/complexes-admin", headers=headers)
         if r_list.ok and len(r_list.json()) > 0:
              complex_id = r_list.json()[0]["id"]
              print(f"ℹ️ Used existing complex ID: {complex_id}")
         else:
              complex_id = None

    # 5. Create Property
    print("Creating Test Property...")
    prop_data = {
        "title": "Luxury Penthouse Test",
        "description": "Verification unit",
        "price": 50000000,
        "area_sqm": 120.5,
        "address": "Kurortny Prospekt 1",
        "price_per_sqm": 414937,
        "currency": "RUB",
        "images": ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"],
        "district_id": district_id,
        "complex_id": complex_id,
        "latitude": 43.585,
        "longitude": 39.725
    }
    r = requests.post(f"{BASE_URL}/properties", json=prop_data, headers=headers)
    if r.status_code in [200, 201]:
        print("✅ Property created.")
        print(f"🔗 Link: http://217.199.254.119/properties/{r.json()['id']}")
    else:
        print(f"❌ Property create failed: {r.text}")

if __name__ == "__main__":
    run_verification()
