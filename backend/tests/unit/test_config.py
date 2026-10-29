"""Unit tests for configuration validation and environment settings."""

import pytest
from pydantic import ValidationError

from app.core.config import AppEnvironment, Settings


def test_valid_settings():
    """Valid settings are successfully parsed."""
    settings = Settings(
        app_name="WasteLink Test",
        app_env=AppEnvironment.TEST,
        database_url="postgresql://user:pass@localhost:5432/db",
        session_secret_key="a" * 32,
        cors_allowed_origins="http://localhost:3000,http://app.local",
    )
    assert settings.app_name == "WasteLink Test"
    assert settings.app_env == AppEnvironment.TEST
    assert len(settings.cors_origins_list) == 2
    assert "http://localhost:3000" in settings.cors_origins_list
    assert "http://app.local" in settings.cors_origins_list


def test_session_secret_key_too_short():
    """Settings reject SESSION_SECRET_KEY shorter than 32 characters."""
    with pytest.raises(ValidationError) as exc_info:
        Settings(
            database_url="postgresql://user:pass@localhost:5432/db",
            session_secret_key="short_secret",
        )
    assert "SESSION_SECRET_KEY must be at least 32 characters" in str(exc_info.value)


def test_empty_database_url_rejected():
    """Settings reject empty DATABASE_URL."""
    with pytest.raises(ValidationError) as exc_info:
        Settings(
            database_url="",
            session_secret_key="a" * 32,
        )
    assert "DATABASE_URL is required" in str(exc_info.value)


def test_mime_types_parsing():
    """MIME types are correctly parsed into a list."""
    settings = Settings(
        database_url="sqlite:///test.db",
        session_secret_key="a" * 32,
        upload_allowed_mime_types="image/jpeg, image/png , application/pdf",
    )
    assert settings.allowed_mime_types_list == [
        "image/jpeg",
        "image/png",
        "application/pdf",
    ]


def test_environment_helpers():
    """Environment helper properties function correctly."""
    prod_settings = Settings(
        app_env=AppEnvironment.PRODUCTION,
        database_url="postgresql://user:pass@localhost:5432/db",
        session_secret_key="a" * 32,
    )
    assert prod_settings.is_production is True
    assert prod_settings.is_testing is False

    test_settings = Settings(
        app_env=AppEnvironment.TEST,
        database_url="postgresql://user:pass@localhost:5432/db",
        database_url_test="sqlite:///:memory:",
        session_secret_key="a" * 32,
    )
    assert test_settings.is_production is False
    assert test_settings.is_testing is True
    assert test_settings.effective_database_url == "sqlite:///:memory:"
