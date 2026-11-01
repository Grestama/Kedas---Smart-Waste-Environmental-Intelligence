"""WasteLink Bali — Standardized error handling and API error contract.

All API errors follow a consistent response format:
{
    "code": "ERROR_CODE",
    "message": "Human-readable description (safe for client)",
    "request_id": "correlation-id",
    "details": [...]  // optional, safe field-level info
}

Internal details (stack traces, SQL errors, file paths) are NEVER exposed.
"""

from __future__ import annotations

from enum import StrEnum

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from starlette.exceptions import HTTPException as StarletteHTTPException


class ErrorCode(StrEnum):
    VALIDATION_ERROR = "VALIDATION_ERROR"
    AUTHENTICATION_REQUIRED = "AUTHENTICATION_REQUIRED"
    FORBIDDEN = "FORBIDDEN"
    NOT_FOUND = "NOT_FOUND"
    CONFLICT = "CONFLICT"
    INTERNAL_ERROR = "INTERNAL_ERROR"
    INVALID_STATE_TRANSITION = "INVALID_STATE_TRANSITION"


# --- Error response schema ---


class ErrorDetail(BaseModel):
    """Individual field/validation error detail (safe for client)."""

    field: str | None = None
    message: str
    code: str | None = None


class ErrorResponse(BaseModel):
    """Standard API error response body."""

    code: str
    message: str
    request_id: str | None = None
    details: list[ErrorDetail] | None = None


# --- Application exceptions ---


class AppError(Exception):
    """Base application error."""

    def __init__(
        self,
        code: str = "INTERNAL_ERROR",
        message: str = "Terjadi kesalahan internal.",
        status_code: int = 500,
        details: list[ErrorDetail] | None = None,
    ):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details
        super().__init__(message)


class ValidationError(AppError):
    """Input validation error — 400 or 422."""

    def __init__(
        self, message: str = "Data tidak valid.", details: list[ErrorDetail] | None = None
    ):
        super().__init__(code="VALIDATION_ERROR", message=message, status_code=422, details=details)


class AuthenticationError(AppError):
    """Authentication failure — 401."""

    def __init__(self, message: str = "Autentikasi diperlukan."):
        super().__init__(code="AUTHENTICATION_REQUIRED", message=message, status_code=401)


class AuthorizationError(AppError):
    """Authorization failure — 403."""

    def __init__(self, message: str = "Anda tidak memiliki izin untuk operasi ini."):
        super().__init__(code="FORBIDDEN", message=message, status_code=403)


class NotFoundError(AppError):
    """Resource not found — 404."""

    def __init__(self, message: str = "Data tidak ditemukan."):
        super().__init__(code="NOT_FOUND", message=message, status_code=404)


class ConflictError(AppError):
    """Resource conflict — 409."""

    def __init__(self, message: str = "Konflik: data sudah ada atau sedang diproses pihak lain."):
        super().__init__(code="CONFLICT", message=message, status_code=409)


class RateLimitError(AppError):
    """Rate limit exceeded — 429."""

    def __init__(
        self,
        message: str = "Terlalu banyak percobaan. Silakan coba lagi nanti.",
        retry_after: int | None = None,
    ):
        super().__init__(code="RATE_LIMIT_EXCEEDED", message=message, status_code=429)
        self.retry_after = retry_after


class ServiceUnavailableError(AppError):
    """Service unavailable — 503."""

    def __init__(self, message: str = "Layanan sementara tidak tersedia."):
        super().__init__(code="SERVICE_UNAVAILABLE", message=message, status_code=503)


# --- Error response builder ---


def _build_error_response(
    request: Request,
    status_code: int,
    code: str,
    message: str,
    details: list[ErrorDetail] | None = None,
    headers: dict[str, str] | None = None,
) -> JSONResponse:
    """Build a standardized error JSONResponse."""
    request_id = getattr(request.state, "request_id", None)
    body = ErrorResponse(
        code=code,
        message=message,
        request_id=request_id,
        details=details,
    )
    return JSONResponse(
        status_code=status_code,
        content=body.model_dump(exclude_none=True),
        headers=headers,
    )


# --- Exception handlers ---


def register_exception_handlers(app: FastAPI) -> None:
    """Register global exception handlers on the FastAPI app."""

    @app.exception_handler(AppError)
    async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
        headers: dict[str, str] = {}
        if isinstance(exc, RateLimitError) and exc.retry_after is not None:
            headers["Retry-After"] = str(exc.retry_after)
        return _build_error_response(
            request,
            status_code=exc.status_code,
            code=exc.code,
            message=exc.message,
            details=exc.details,
            headers=headers or None,
        )

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        details = []
        for err in exc.errors():
            loc = err.get("loc", ())
            field = ".".join(str(part) for part in loc if part != "body")
            details.append(
                ErrorDetail(
                    field=field or None,
                    message=err.get("msg", "Validasi gagal."),
                    code=err.get("type"),
                )
            )
        return _build_error_response(
            request,
            status_code=422,
            code="VALIDATION_ERROR",
            message="Data yang dikirim tidak valid.",
            details=details,
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
        code_map: dict[int, str] = {
            400: "BAD_REQUEST",
            401: "AUTHENTICATION_REQUIRED",
            403: "FORBIDDEN",
            404: "NOT_FOUND",
            405: "METHOD_NOT_ALLOWED",
            409: "CONFLICT",
            429: "RATE_LIMIT_EXCEEDED",
            500: "INTERNAL_ERROR",
            503: "SERVICE_UNAVAILABLE",
        }
        code = code_map.get(exc.status_code, "HTTP_ERROR")
        message = str(exc.detail) if exc.detail else "Terjadi kesalahan."
        return _build_error_response(
            request,
            status_code=exc.status_code,
            code=code,
            message=message,
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        # Log the real error internally but NEVER expose it to client
        import logging

        logger = logging.getLogger("wastelink.errors")
        request_id = getattr(request.state, "request_id", "unknown")
        logger.exception("Unhandled exception [request_id=%s]", request_id)

        return _build_error_response(
            request,
            status_code=500,
            code="INTERNAL_ERROR",
            message="Terjadi kesalahan internal. Silakan coba lagi atau hubungi administrator.",
        )
