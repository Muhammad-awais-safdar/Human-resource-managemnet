import pytest

@pytest.mark.integration
def test_webhook_invalid_signature_rejected(unauthenticated_client):
    payload = {"event": "ATTENDANCE_PUNCH", "timestamp": "2026-08-16T00:00:00Z"}
    headers = {"X-Webhook-Signature": "INVALID_SIGNATURE_HASH"}
    resp = unauthenticated_client.post("/webhooks/biometric", json_data=payload, headers=headers)
    assert resp.status_code in [401, 403, 400, 404], f"Webhook with invalid signature was accepted: {resp.status_code}"
