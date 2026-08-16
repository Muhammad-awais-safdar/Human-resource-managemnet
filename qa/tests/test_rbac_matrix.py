import pytest

@pytest.mark.rbac
@pytest.mark.security
def test_system_admin_has_full_access(system_admin_client):
    # System Admin should be authorized to access platform settings and super admin metrics
    resp = system_admin_client.get("/super-admin/metrics")
    # Should yield 200 OK or handled state, never 403 Forbidden for System Admin
    assert resp.status_code != 403, f"SYSTEM_ADMIN unexpectedly forbidden: {resp.status_code}"

@pytest.mark.rbac
@pytest.mark.security
def test_employee_forbidden_from_super_admin_endpoints(employee_client):
    resp = employee_client.get("/super-admin/metrics")
    assert resp.status_code in [401, 403], f"EMPLOYEE unexpectedly granted super admin access: {resp.status_code}"

@pytest.mark.rbac
@pytest.mark.security
def test_employee_forbidden_from_role_management(employee_client):
    resp = employee_client.post("/roles", json_data={"name": "HACKER_ROLE"})
    assert resp.status_code in [401, 403], f"EMPLOYEE unexpectedly permitted to create roles: {resp.status_code}"

@pytest.mark.rbac
def test_tenant_admin_role_management_access(tenant_admin_client):
    resp = tenant_admin_client.get("/roles")
    assert resp.status_code != 403, f"TENANT_ADMIN forbidden from viewing tenant roles: {resp.status_code}"
