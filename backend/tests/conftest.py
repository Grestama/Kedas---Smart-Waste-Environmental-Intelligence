"""WasteLink Bali — Global Pytest Fixtures and Test Configuration."""

import os
from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

# Set test environment variables BEFORE importing app config
os.environ["APP_ENV"] = "test"
os.environ["DEBUG"] = "false"
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["DATABASE_URL_TEST"] = "sqlite:///:memory:"
os.environ["SESSION_SECRET_KEY"] = "test_environment_secret_key_minimum_32_characters"
os.environ["CORS_ALLOWED_ORIGINS"] = "http://localhost:3000,http://test.local"

from app.core.config import get_settings
from app.db.base import Base
from app.db.session import get_db_session, reset_engine, set_engine
from app.main import create_app


@pytest.fixture(scope="session")
def test_settings():
    """Return test settings."""
    # Clear lru_cache so environment variables take effect
    get_settings.cache_clear()
    return get_settings()


@pytest.fixture(scope="function")
def test_db_engine():
    """Create a fresh in-memory SQLite database for each test function."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    set_engine(engine)
    yield engine
    Base.metadata.drop_all(bind=engine)
    reset_engine()


@pytest.fixture(scope="function")
def db_session(test_db_engine) -> Generator[Session, None, None]:
    """Yield a database session bound to the test in-memory database."""
    session_factory = sessionmaker(bind=test_db_engine, autocommit=False, autoflush=False)
    session = session_factory()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture(scope="function")
def client(test_db_engine) -> Generator[TestClient, None, None]:
    """Provide a TestClient with overridden database session."""
    app = create_app()

    def override_get_db_session():
        session_factory = sessionmaker(bind=test_db_engine, autocommit=False, autoflush=False)
        session = session_factory()
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_db_session] = override_get_db_session

    with TestClient(app, base_url="http://testserver") as test_client:
        yield test_client
