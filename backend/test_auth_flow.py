from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_register_and_login_user():
    email = "demo@example.com"
    password = "StrongPass123!"

    register_response = client.post(
        "/api/auth/register",
        json={
            "name": "Demo User",
            "email": email,
            "password": password,
        },
    )

    assert register_response.status_code == 201, register_response.text
    data = register_response.json()
    assert data["email"] == email
    assert "password" not in data

    login_response = client.post(
        "/api/auth/login",
        json={"email": email, "password": password},
    )

    assert login_response.status_code == 200, login_response.text
    body = login_response.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"


def test_protected_transaction_endpoint_requires_auth():
    response = client.get("/api/transactions")
    assert response.status_code == 401, response.text
