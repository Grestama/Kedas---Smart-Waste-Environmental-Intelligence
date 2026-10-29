"""WasteLink Bali — Core Configuration.

Validated settings loaded from environment variables via Pydantic Settings.
"""

from __future__ import annotations

from enum import StrEnum
from functools import lru_cache
from typing import Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class AppEnvironment(StrEnum):
    LOCAL = "local"
    TEST = "test"
    STAGING = "staging"
    PRODUCTION = "production"


class Settings(BaseSettings):
    """Application settings — loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # --- Application ---
    app_name: str = "WasteLink Bali"
    app_version: str = "0.1.0"
    app_env: AppEnvironment = AppEnvironment.LOCAL
    debug: bool = False
    api_prefix: str = "/api/v1"
    log_level: str = "INFO"

    # --- Database ---
    database_url: str
    database_url_test: str = ""
    db_pool_size: int = Field(default=5, ge=1, le=50)
    db_max_overflow: int = Field(default=10, ge=0, le=100)
    db_pool_timeout: int = Field(default=30, ge=5, le=120)

    # --- Security / Session ---
    session_secret_key: str
    session_lifetime_seconds: int = Field(default=86400, ge=300)
    session_cookie_name: str = "wastelink_session"
    session_cookie_secure: bool = False
    session_cookie_samesite: Literal["lax", "strict", "none"] = "lax"

    csrf_secret_key: str = ""

    # --- CORS ---
    cors_allowed_origins: str = ""

    # --- Object Storage ---
    storage_adapter: str = "local"
    storage_local_path: str = "./uploads"
    s3_endpoint_url: str = ""
    s3_bucket_name: str = ""
    s3_access_key_id: str = ""
    s3_secret_access_key: str = ""
    s3_region: str = "auto"

    # --- Upload ---
    upload_max_size_bytes: int = Field(default=10_485_760, ge=1024)
    upload_allowed_mime_types: str = "image/jpeg,image/png,image/webp,application/pdf"

    # --- Docs ---
    enable_docs: bool = True

    @field_validator("session_secret_key")
    @classmethod
    def validate_session_secret(cls, v: str) -> str:
        if len(v) < 32:
            raise ValueError(
                "SESSION_SECRET_KEY must be at least 32 characters. "
                "Generate a strong random value for non-local environments."
            )
        return v

    @field_validator("database_url")
    @classmethod
    def validate_database_url(cls, v: str) -> str:
        if not v or v.strip() == "":
            raise ValueError("DATABASE_URL is required and cannot be empty.")
        return v

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse comma-separated CORS origins into a list."""
        if not self.cors_allowed_origins:
            return []
        return [o.strip() for o in self.cors_allowed_origins.split(",") if o.strip()]

    @property
    def allowed_mime_types_list(self) -> list[str]:
        """Parse comma-separated MIME types into a list."""
        if not self.upload_allowed_mime_types:
            return []
        return [m.strip() for m in self.upload_allowed_mime_types.split(",") if m.strip()]

    @property
    def is_production(self) -> bool:
        return self.app_env == AppEnvironment.PRODUCTION

    @property
    def is_testing(self) -> bool:
        return self.app_env == AppEnvironment.TEST

    @property
    def effective_database_url(self) -> str:
        """Return test DB URL when in test environment, otherwise main URL."""
        if self.is_testing and self.database_url_test:
            return self.database_url_test
        return self.database_url


@lru_cache
def get_settings() -> Settings:
    """Cached settings instance — call once at startup."""
    return Settings()
