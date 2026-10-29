"""Unit tests for error contract, custom exceptions, and security redaction."""

from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.core.errors import (
    AuthenticationError,
    AuthorizationError,
    ConflictError,
    NotFoundError,
    ValidationError,
    register_exception_handlers,
)


def create_error_test_app() -> FastAPI:
    """Create a minimal app with registered exception handlers for error testing."""
    test_app = FastAPI()
    register_exception_handlers(test_app)

    @test_app.get("/trigger-validation")
    def trigger_validation():
        raise ValidationError("Field 'category' is required.")

    @test_app.get("/trigger-auth")
    def trigger_auth():
        raise AuthenticationError()

    @test_app.get("/trigger-forbidden")
    def trigger_forbidden():
        raise AuthorizationError()

    @test_app.get("/trigger-not-found")
    def trigger_not_found():
        raise NotFoundError("Resource pickup_123 not found.")

    @test_app.get("/trigger-conflict")
    def trigger_conflict():
        raise ConflictError("Task already claimed.")

    @test_app.get("/trigger-unexpected")
    def trigger_unexpected():
        # Raise unexpected internal error with sensitive stack
        raise RuntimeError("FATAL_SECRET_DATABASE_FAILURE: at /secret/path/to/db.py line 42")

    return test_app


def test_validation_error_contract():
    client = TestClient(create_error_test_app(), raise_server_exceptions=False)
    response = client.get("/trigger-validation")
    assert response.status_code == 422
    data = response.json()
    assert data["code"] == "VALIDATION_ERROR"
    assert data["message"] == "Field 'category' is required."


def test_auth_error_contract():
    client = TestClient(create_error_test_app(), raise_server_exceptions=False)
    response = client.get("/trigger-auth")
    assert response.status_code == 401
    data = response.json()
    assert data["code"] == "AUTHENTICATION_REQUIRED"


def test_forbidden_error_contract():
    client = TestClient(create_error_test_app(), raise_server_exceptions=False)
    response = client.get("/trigger-forbidden")
    assert response.status_code == 403
    data = response.json()
    assert data["code"] == "FORBIDDEN"


def test_not_found_error_contract():
    client = TestClient(create_error_test_app(), raise_server_exceptions=False)
    response = client.get("/trigger-not-found")
    assert response.status_code == 404
    data = response.json()
    assert data["code"] == "NOT_FOUND"


def test_conflict_error_contract():
    client = TestClient(create_error_test_app(), raise_server_exceptions=False)
    response = client.get("/trigger-conflict")
    assert response.status_code == 409
    data = response.json()
    assert data["code"] == "CONFLICT"


def test_unexpected_error_does_not_leak_details():
    """Unexpected exceptions return 500 without leaking stack traces or internal secrets."""
    client = TestClient(create_error_test_app(), raise_server_exceptions=False)
    response = client.get("/trigger-unexpected")
    assert response.status_code == 500
    data = response.json()
    assert data["code"] == "INTERNAL_ERROR"
    # Verify sensitive error string or file path is NOT in the response
    assert "FATAL_SECRET_DATABASE_FAILURE" not in response.text
    assert "/secret/path" not in response.text
    assert "Traceback" not in response.text
