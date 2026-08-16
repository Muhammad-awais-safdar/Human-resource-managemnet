import pytest

@pytest.mark.security
def test_maker_checker_self_approval_blocked(tenant_admin_client):
    # Maker creates disbursement request
    create_resp = tenant_admin_client.post("/payroll/disbursements", json_data={"amount": "5000.00", "recipient": "EMP-001"})
    if create_resp.status_code == 201 or create_resp.status_code == 200:
        req_id = create_resp.json().get("id", "DISB-001")
        # Maker attempts self approval
        approve_resp = tenant_admin_client.post(f"/payroll/disbursements/{req_id}/approve")
        assert approve_resp.status_code in [403, 400], "Maker was improperly allowed to self-approve!"
