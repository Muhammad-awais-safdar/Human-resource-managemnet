import pytest
from faker import Faker

fake = Faker()

@pytest.mark.crud
def test_employee_full_crud_lifecycle(tenant_admin_client):
    # 1. CREATE Employee
    create_payload = {
        "firstName": fake.first_name(),
        "lastName": fake.last_name(),
        "email": fake.email(),
        "department": "Engineering",
        "salary": "95000.00"
    }
    create_resp = tenant_admin_client.post("/employees", json_data=create_payload)
    assert create_resp.status_code in [200, 201], f"Create employee failed: {create_resp.status_code}"

    # 2. READ Employee List & Details
    read_resp = tenant_admin_client.get("/employees")
    assert read_resp.status_code == 200, f"Read employees failed: {read_resp.status_code}"

    # 3. UPDATE Employee Profile Info
    update_payload = {"department": "Product & Engineering", "salary": "105000.00"}
    update_resp = tenant_admin_client.put("/employee/EMP-001/info", json_data=update_payload)
    assert update_resp.status_code == 200, f"Update employee info failed: {update_resp.status_code}"

    # 4. DELETE Attendance/Employee Record
    delete_resp = tenant_admin_client.delete("/attendance/ATT-999")
    assert delete_resp.status_code == 200, f"Delete record failed: {delete_resp.status_code}"

@pytest.mark.crud
def test_role_management_crud_lifecycle(tenant_admin_client):
    # 1. CREATE Custom Role
    create_resp = tenant_admin_client.post("/roles", json_data={"roleName": "FINANCE_AUDITOR", "permissions": ["payroll:read"]})
    assert create_resp.status_code in [200, 201], f"Create role failed: {create_resp.status_code}"

    # 2. READ Roles Inventory
    read_resp = tenant_admin_client.get("/roles")
    assert read_resp.status_code == 200, f"Read roles failed: {read_resp.status_code}"

    # 3. UPDATE Role Permissions
    update_resp = tenant_admin_client.put("/roles/ROLE-001/permissions", json_data={"permissions": ["payroll:read", "payroll:write"]})
    assert update_resp.status_code == 200, f"Update permissions failed: {update_resp.status_code}"

    # 4. DELETE Custom Role
    delete_resp = tenant_admin_client.delete("/roles/ROLE-001")
    assert delete_resp.status_code == 200, f"Delete role failed: {delete_resp.status_code}"

@pytest.mark.crud
def test_leave_management_crud_lifecycle(tenant_admin_client):
    # 1. CREATE Leave Request
    create_payload = {"leaveType": "ANNUAL", "startDate": "2026-09-01", "endDate": "2026-09-05"}
    create_resp = tenant_admin_client.post("/leaves/requests", json_data=create_payload)
    assert create_resp.status_code in [200, 201], f"Create leave failed: {create_resp.status_code}"

    # 2. READ Leave Requests
    read_resp = tenant_admin_client.get("/leaves/requests")
    assert read_resp.status_code == 200, f"Read leaves failed: {read_resp.status_code}"

    # 3. UPDATE Leave Request Status
    update_resp = tenant_admin_client.put("/leaves/requests/LEAVE-001/status", json_data={"status": "APPROVED"})
    assert update_resp.status_code == 200, f"Update leave status failed: {update_resp.status_code}"

    # 4. DELETE Leave Request
    delete_resp = tenant_admin_client.delete("/leaves/requests/LEAVE-001")
    assert delete_resp.status_code == 200, f"Delete leave failed: {delete_resp.status_code}"
