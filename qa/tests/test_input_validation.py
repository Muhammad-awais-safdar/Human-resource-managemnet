import pytest

@pytest.mark.security
def test_valid_employee_creation_payload(tenant_admin_client):
    payload = {
        "firstName": "Awais",
        "lastName": "Safdar",
        "email": "awais.safdar@example.com",
        "department": "Engineering",
        "salary": "125000.00"
    }
    resp = tenant_admin_client.post("/employees", json_data=payload)
    assert resp.status_code in [200, 201], f"Valid employee creation failed: {resp.status_code}"

@pytest.mark.security
def test_invalid_employee_missing_required_fields(tenant_admin_client):
    payload = {"validation_missing": True}
    resp = tenant_admin_client.post("/employees", json_data=payload)
    assert resp.status_code == 400, f"Missing required fields payload accepted: {resp.status_code}"

@pytest.mark.security
def test_invalid_email_format_validation(tenant_admin_client):
    payload = {
        "firstName": "Test",
        "lastName": "User",
        "email": "invalid-email-format",
        "department": "Sales"
    }
    resp = tenant_admin_client.post("/employees", json_data=payload)
    assert resp.status_code == 400, f"Invalid email payload accepted: {resp.status_code}"

@pytest.mark.security
def test_invalid_negative_financial_amount_validation(tenant_admin_client):
    payload = {
        "amount": "-5000.00",
        "recipient": "EMP-001"
    }
    resp = tenant_admin_client.post("/payroll/disbursements", json_data=payload)
    assert resp.status_code == 400, f"Negative financial amount accepted: {resp.status_code}"

@pytest.mark.security
def test_invalid_industry_type_validation(tenant_admin_client):
    payload = {"industryType": "INVALID_SUPER_UNKNOWN"}
    resp = tenant_admin_client.put("/tenants/current/industry", json_data=payload)
    assert resp.status_code == 400, f"Invalid industry type accepted: {resp.status_code}"

@pytest.mark.security
def test_excessive_payload_length_validation(tenant_admin_client):
    payload = {
        "excessive_name": "A" * 5000
    }
    resp = tenant_admin_client.post("/employees", json_data=payload)
    assert resp.status_code == 400, f"Excessive string length payload accepted: {resp.status_code}"
