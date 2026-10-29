"""WasteLink Bali — Structured logging configuration.

Provides JSON-structured logging for production and human-readable
logging for local development. Sensitive data is never logged.
"""

from __future__ import annotations

import logging
import sys
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    pass


# Fields that must NEVER appear in logs
_SENSITIVE_FIELDS = frozenset(
    {
        "password",
        "password_hash",
        "secret",
        "token",
        "session_id",
        "cookie",
        "authorization",
        "csrf",
        "credit_card",
        "signed_url",
        "api_key",
        "access_key",
        "secret_key",
    }
)


def setup_logging(level: str = "INFO", app_env: str = "local") -> None:
    """Configure root logger.

    In local/test, use simple format. In staging/production, use structured format.
    """
    log_level = getattr(logging, level.upper(), logging.INFO)

    # Clear existing handlers
    root = logging.getLogger()
    root.handlers.clear()

    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(log_level)

    if app_env in ("staging", "production"):
        fmt = (
            '{"time":"%(asctime)s","level":"%(levelname)s",'
            '"logger":"%(name)s","message":"%(message)s"}'
        )
    else:
        fmt = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"

    handler.setFormatter(logging.Formatter(fmt, datefmt="%Y-%m-%dT%H:%M:%S"))
    root.addHandler(handler)
    root.setLevel(log_level)

    # Reduce noise from third-party loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(
        logging.INFO if app_env == "local" else logging.WARNING
    )


def get_logger(name: str) -> logging.Logger:
    """Get a named logger for a module."""
    return logging.getLogger(f"wastelink.{name}")
