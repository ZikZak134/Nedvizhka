
import os
import requests
import json
import time
from pathlib import Path
from PIL import Image
import io

# Setup
BASE_URL = "http://217.199.254.119/api/v1"
ADMIN_EMAIL = "regit_admin"
ADMIN_PASSWORD = "nimda70"
VERIFICATION_DIR = Path("verification_assets")
VERIFICATION_DIR.mkdir(exist_ok=True)

def get_token():
    print(f"Logging in as {ADMIN_EMAIL}...")
    resp = requests.post(f"{BASE_URL}/auth/login/access-token", data={
        "username": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    if resp.status_code != 200:
        print(f"Login failed: {resp.text}")
        exit(1)
    return resp.json()["access_token"]

def create_dummy_image():
    print("Generating dummy image...")
    path = VERIFICATION_DIR / "test_image.jpg"
    img = Image.new('RGB', (800, 600), color = 'red')
    img.save(path)
    return path

def download_sample_video():
    print("Downloading sample video...")
    path = VERIFICATION_DIR / "test_video.mp4"
    if path.exists():
        return path
        
    # Using a small generic sample video
    url = "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
    try:
        with requests.get(url, stream=True) as r:
            r.raise_for_status()
            with open(path, 'wb') as f:
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk)
        return path
    except Exception as e:
        print(f"Failed to download video: {e}")
        # Fallback: create a dummy file if we can't download (won't play but tests upload)
        with open(path, 'wb') as f:
            f.write(b'fake video content')
        return path

def upload_file(token, file_path):
    print(f"Uploading {file_path}...")
    with open(file_path, "rb") as f:
        files = {"file": (file_path.name, f, "image/jpeg" if file_path.suffix == ".jpg" else "video/mp4")}
        headers = {"Authorization": f"Bearer {token}"}
        resp = requests.post(f"{BASE_URL}/upload", files=files, headers=headers)
        if resp.status_code != 200:
            print(f"Upload failed: {resp.text}")
            return None
        return resp.json()["url"]

def create_property(token, image_url, video_url):
    print("Creating property...")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    data = {
        "title": f"E2E Verification Property {int(time.time())}",
        "description": "This property was created automatically to verify media handling capabilities.",
        "price": 42000000,
        "price_per_sqm": 420000,
        "area_sqm": 100,
        "rooms": "3",
        "floor": 5,
        "total_floors": 10,
        "address": "Test Avenue 123",
        "latitude": 55.75,
        "longitude": 37.61,
        "images": [image_url, "https://picsum.photos/seed/picsum/800/600"],
        "videos": [video_url, "https://www.youtube.com/watch?v=GetO3wI-a-8"],
        "features": {
            "parking": True,
            "pool": True
        },
        "badges": ["Exclusive", "Verified"]
    }
    
    resp = requests.post(f"{BASE_URL}/properties", json=data, headers=headers)
    if resp.status_code != 201:
        print(f"Creation failed: {resp.text}")
        exit(1)
    
    prop = resp.json()
    print(f"Property Created: {prop['id']}")
    print(f"Images: {prop['images']}")
    print(f"Videos: {prop['videos']}")
    return prop['id']

def main():
    try:
        token = get_token()
        img_path = create_dummy_image()
        vid_path = download_sample_video()
        
        img_url = upload_file(token, img_path)
        vid_url = upload_file(token, vid_path)
        
        if not img_url or not vid_url:
            print("Failed to upload media.")
            exit(1)
            
        prop_id = create_property(token, img_url, vid_url)
        print("\nSUCCESS! Verification Property Created.")
        print(f"Check URL: http://217.199.254.119/property/{prop_id}")
    except Exception as e:
        print(f"Error: {e}")
        exit(1)

if __name__ == "__main__":
    main()
