import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_auth_flow(client: AsyncClient):
    # 1. Setup Admin
    setup_payload = {
        "username": "admin_test",
        "password": "securepassword",
        "display_name": "Test Admin"
    }
    response = await client.post("/api/v1/auth/setup", json=setup_payload)
    
    # If setup already happened (global state?), it might fail.
    # But with clean DB fixture, it should succeed.
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "admin_test"
    
    # 2. Login
    login_payload = {
        "username": "admin_test",
        "password": "securepassword"
    }
    response = await client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == 200
    token_data = response.json()
    assert "access_token" in token_data
    token = token_data["access_token"]
    
    # 3. Verify Token (/me)
    response = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    me_data = response.json()
    assert me_data["username"] == "admin_test"
    
    # 4. Fail Login
    response = await client.post("/api/v1/auth/login", json={
        "username": "admin_test",
        "password": "wrongpassword"
    })
    assert response.status_code == 401
