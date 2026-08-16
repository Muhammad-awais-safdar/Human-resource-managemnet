import json
import os
import pytest

@pytest.mark.api
@pytest.mark.smoke
def test_endpoint_discovery_inventory_exists():
    inventory_path = "qa/reports/endpoints.json"
    assert os.path.exists(inventory_path), "endpoints.json inventory file must exist"
    
    with open(inventory_path, "r", encoding="utf-8") as f:
        endpoints = json.load(f)

    assert len(endpoints) >= 400, f"Expected at least 400 discovered endpoints, found {len(endpoints)}"

@pytest.mark.api
def test_controller_coverage_gap_detection():
    inventory_path = "qa/reports/endpoints.json"
    with open(inventory_path, "r", encoding="utf-8") as f:
        endpoints = json.load(f)

    controllers = set(ep["controller"] for ep in endpoints)
    assert len(controllers) >= 80, f"Expected at least 80 discovered controllers, found {len(controllers)}"

    # Ensure critical core controllers are present
    critical_controllers = [
        "EmployeeController", "PayrollController", "TenantController",
        "RoleController", "AttendanceController", "LeaveController",
        "AgritechCropYieldController", "BFSIServicesController", "SuperAdminController"
    ]
    for ctrl in critical_controllers:
        assert ctrl in controllers, f"Critical controller {ctrl} missing from discovery inventory"
