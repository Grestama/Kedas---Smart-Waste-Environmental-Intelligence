"""API tests for Request ID and Security Headers middleware."""


def test_request_id_generated_automatically(client):
    """X-Request-ID header is generated and returned if not provided by client."""
    response = client.get("/api/v1/health/live")
    assert response.status_code == 200
    assert "X-Request-ID" in response.headers
    request_id = response.headers["X-Request-ID"]
    assert len(request_id) > 10


def test_valid_request_id_preserved(client):
    """Valid client-provided X-Request-ID is preserved and echoed."""
    custom_id = "test-corr-id-12345678"
    response = client.get("/api/v1/health/live", headers={"X-Request-ID": custom_id})
    assert response.status_code == 200
    assert response.headers["X-Request-ID"] == custom_id


def test_invalid_request_id_replaced(client):
    """Invalid client X-Request-ID (malicious characters or overlong) is replaced with a safe UUID."""
    malicious_id = "bad<script>alert(1)</script>"
    response = client.get("/api/v1/health/live", headers={"X-Request-ID": malicious_id})
    assert response.status_code == 200
    returned_id = response.headers["X-Request-ID"]
    assert returned_id != malicious_id
    assert "<" not in returned_id


def test_security_headers_present(client):
    """Standard security headers are injected on all responses."""
    response = client.get("/api/v1/health/live")
    assert response.headers["X-Content-Type-Options"] == "nosniff"
    assert response.headers["X-Frame-Options"] == "DENY"
    assert "strict-origin-when-cross-origin" in response.headers["Referrer-Policy"]
