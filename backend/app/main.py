"""WasteLink Bali — FastAPI Main Application Entry Point.

Configures application lifespan, middlewares, routers, and exception handlers.
"""

from __future__ import annotations

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import api_v1_router
from app.common.request_id import RequestIDMiddleware
from app.core.config import get_settings
from app.core.errors import register_exception_handlers
from app.core.logging import get_logger, setup_logging
from app.core.security import SecurityHeadersMiddleware
from app.db.session import check_db_connection, reset_engine

logger = get_logger("main")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan manager — startup and graceful shutdown."""
    settings = get_settings()
    setup_logging(level=settings.log_level, app_env=settings.app_env.value)
    logger.info(
        "Starting %s v%s [env=%s, debug=%s]",
        settings.app_name,
        settings.app_version,
        settings.app_env.value,
        settings.debug,
    )

    # Check database readiness on startup (non-fatal for app boot)
    db_ready = check_db_connection()
    if db_ready:
        logger.info("Database connection verified successfully.")
    else:
        logger.warning(
            "Database connection could not be established on startup. Readiness probe will report degraded."
        )

    yield

    # Graceful shutdown: dispose database connection pool
    logger.info("Shutting down %s — releasing resources...", settings.app_name)
    reset_engine()
    logger.info("Shutdown complete.")


def create_app() -> FastAPI:
    """Create and configure the FastAPI application instance."""
    settings = get_settings()

    docs_url = "/docs" if settings.enable_docs else None
    redoc_url = "/redoc" if settings.enable_docs else None
    openapi_url = "/openapi.json" if settings.enable_docs else None

    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description=(
            "WasteLink Bali — Backend API modular monolith untuk pengelolaan sampah "
            "komunitas dan ekonomi sirkular berbasis bukti terverifikasi."
        ),
        docs_url=docs_url,
        redoc_url=redoc_url,
        openapi_url=openapi_url,
        lifespan=lifespan,
    )

    # 1. Register global exception handlers
    register_exception_handlers(app)

    # 2. Middlewares (execution order: outermost first)
    # Security Headers
    app.add_middleware(SecurityHeadersMiddleware)

    # Correlation Request ID
    app.add_middleware(RequestIDMiddleware)

    # CORS Middleware — strictly use configured allowlist
    origins = settings.cors_origins_list
    if origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=origins,
            allow_credentials=True,
            allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            allow_headers=["*"],
            expose_headers=["X-Request-ID"],
        )

    # 3. Include API routers
    app.include_router(api_v1_router, prefix=settings.api_prefix)

    # 4. Root information endpoint
    @app.get("/", tags=["Root"], include_in_schema=False)
    async def root_info() -> JSONResponse:
        return JSONResponse(
            content={
                "name": settings.app_name,
                "version": settings.app_version,
                "environment": settings.app_env.value,
                "docs": f"{settings.api_prefix}/health/live",
            }
        )

    return app


app = create_app()
