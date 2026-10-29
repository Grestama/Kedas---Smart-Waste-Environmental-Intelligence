"""API tests for health probes (liveness and readiness)."""

from unittest.mock import patch


def test_health_live(client):
    """Liveness probe returns 200 with status ok."""
    response = client.get("/api/v1/health/live")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "app" in data
    assert "version" in data
    assert "environment" in data
    assert "timestamp" in data


def test_health_ready_success(client):
    """Readiness probe returns 200 when database is healthy."""
    response = client.get("/api/v1/health/ready")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["checks"]["database"] == "ok"


def test_health_ready_db_down(client):
    """Readiness probe returns 503 when database is unavailable."""
    with patch("app.api.v1.health.check_db_connection", return_value=False):
        response = client.get("/api/v1/health/ready")
        assert response.status_code == 503
        data = response.json()
        assert data["status"] == "degraded"
        assert data["checks"]["database"] == "unavailable"
