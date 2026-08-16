import pytest

@pytest.mark.security
def test_unauthenticated_request_rejected(unauthenticated_client):
    resp = unauthenticated_client.get("/employees")
    assert resp.status_code in [401, 403], f"Unauthenticated request accepted with status {resp.status_code}"

@pytest.mark.security
def test_malformed_jwt_token_rejected():
    from conftest import APIClient, BASE_URL
    malformed_client = APIClient(BASE_URL, token="INVALID.CORRUPTED.TOKEN")
    resp = malformed_client.get("/employees")
    assert resp.status_code in [401, 403], f"Malformed JWT accepted with status {resp.status_code}"

@pytest.mark.security
def test_sql_injection_sanitization(tenant_admin_client):
    sql_payload = "' OR '1'='1"
    resp = tenant_admin_client.get(f"/employees?search={sql_payload}")
    assert resp.status_code != 500, f"SQL injection attempt caused 500 Internal Server Error"

@pytest.mark.security
def test_sensitive_field_redaction(system_admin_client):
    resp = system_admin_client.get("/auth/me")
    if resp.status_code == 200:
        data = resp.json()
        raw_text = str(data).lower()
        assert "passwordhash" not in raw_text, "Sensitive passwordHash leaked in API response!"
        assert "clientsecret" not in raw_text, "Sensitive clientSecret leaked in API response!"
