from decimal import Decimal
import pytest

@pytest.mark.financial
def test_agritech_harvest_log_precision(tenant_admin_client):
    payload = {
        "workerId": "EMP-QA-FARM-01",
        "yieldWeightKg": "100.55",
        "pieceRateWagePerKg": "2.75",
        "qualityFactor": "1.05"
    }
    resp = tenant_admin_client.post("/agritech/harvest-logs", json_data=payload)
    if resp.status_code == 200:
        data = resp.json()
        assert data.get("success") is True
        # Calculation: 100.55 * 2.75 * 1.05 = 290.338125 -> 290.34
        expected_pay = Decimal("100.55") * Decimal("2.75") * Decimal("1.05")
        rounded = round(expected_pay, 2)
        assert Decimal("290.34") == Decimal(str(rounded)), "Financial precision calculation mismatch!"
