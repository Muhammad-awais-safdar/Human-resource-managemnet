import pytest

@pytest.mark.tenant
@pytest.mark.security
def test_cross_tenant_employee_access_blocked(tenant_a_client):
    # Tenant A attempts to fetch an employee from Tenant B
    resp = tenant_a_client.get("/employees/EMP-TENANT-B-999")
    assert resp.status_code in [403, 404, 400], f"Cross-tenant access yielded unexpected status: {resp.status_code}"

@pytest.mark.tenant
@pytest.mark.security
def test_cross_tenant_document_access_blocked(tenant_a_client):
    resp = tenant_a_client.get("/documents/DOC-TENANT-B-CONFIDENTIAL")
    assert resp.status_code in [403, 404, 400], f"Cross-tenant document access returned unexpected status: {resp.status_code}"

@pytest.mark.tenant
def test_list_endpoint_tenant_isolation(tenant_a_client):
    resp = tenant_a_client.get("/employees")
    if resp.status_code == 200:
        data = resp.json()
        if isinstance(data, dict) and "data" in data:
            records = data["data"]
            for r in records:
                tenant_id = r.get("tenantId", r.get("tenant_id"))
                if tenant_id:
                    assert tenant_id != "TENANT_BETA", "Tenant A list query returned Tenant B record!"

@pytest.mark.tenant
def test_update_tenant_industry_type(tenant_admin_client):
    resp = tenant_admin_client.put("/tenants/current/industry", json_data={"industryType": "HEALTHCARE"})
    assert resp.status_code == 200
    data = resp.json()
    assert data.get("success") is True
    assert data.get("industryType") == "HEALTHCARE"
    assert "CLINICAL_LMS" in data.get("activeModules", [])

