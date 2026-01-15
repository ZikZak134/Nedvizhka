import pytest
from httpx import AsyncClient

async def get_admin_header(client: AsyncClient):
    # Ensure user exists (Setup)
    await client.post("/api/v1/auth/setup", json={
        "username": "prop_admin",
        "password": "securepassword",
        "display_name": "Property Admin"
    })
    # Login
    response = await client.post("/api/v1/auth/login", json={
        "username": "prop_admin",
        "password": "securepassword"
    })
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.mark.asyncio
async def test_property_crud(client: AsyncClient):
    auth_headers = await get_admin_header(client)
    
    # 1. Create Property
    payload = {
        "title": "Luxury Villa",
        "price": 50000000.0,
        "address": "Lenina 1",
        "area_sqm": 120.0,
        "rooms": "3",
        "district": "Center"
    }
    response = await client.post("/api/v1/properties", json=payload, headers=auth_headers)
    assert response.status_code == 201
    prop_data = response.json()
    prop_id = prop_data["id"]
    assert prop_data["title"] == payload["title"]
    
    # 2. List Properties (Public)
    response = await client.get("/api/v1/properties")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert data["items"][0]["id"] == prop_id
    
    # 3. Update Property
    update_payload = {"title": "Super Luxury Villa", "price": 60000000.0}
    response = await client.patch(f"/api/v1/properties/{prop_id}", json=update_payload, headers=auth_headers)
    assert response.status_code == 200
    updated = response.json()
    assert updated["title"] == "Super Luxury Villa"
    
    # 4. Delete Property
    response = await client.delete(f"/api/v1/properties/{prop_id}", headers=auth_headers)
    assert response.status_code == 204
    
    # 5. Verify Delete (Soft Delete)
    response = await client.get(f"/api/v1/properties/{prop_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["is_active"] is False

@pytest.mark.asyncio
async def test_property_unauthorized_write(client: AsyncClient):
    # Try to create without token
    payload = {
        "title": "Hacker Villa",
        "price": 100.0,
        "address": "Unknown",
        "area_sqm": 10.0
    }
    response = await client.post("/api/v1/properties", json=payload)
    assert response.status_code == 403 or response.status_code == 401
