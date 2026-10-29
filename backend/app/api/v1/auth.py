"""WasteLink Bali — Authentication API Endpoints."""

from __future__ import annotations

from typing import Annotated, Any

from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.dependencies import get_current_session
from app.db.session import get_db_session
from app.modules.account import service as account_service
from app.modules.account.models import AuthSession
from app.modules.account.schemas import (
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
)

router = APIRouter()


def _set_auth_cookie(response: Response, token: str) -> None:
    settings = get_settings()
    response.set_cookie(
        key=settings.session_cookie_name,
        value=token,
        max_age=settings.session_lifetime_seconds,
        httponly=True,
        secure=settings.session_cookie_secure,
        samesite=settings.session_cookie_samesite,
    )


@router.post(
    "/register",
    response_model=dict[str, Any],
    status_code=201,
    summary="Registrasi akun warga",
    description="Mendaftar akun baru dengan role default USER.",
)
async def register(
    req: UserRegisterRequest,
    response: Response,
    request: Request,
    db: Annotated[Session, Depends(get_db_session)],
) -> dict[str, Any]:
    user = account_service.register_user(db, req)
    token, _ = account_service.login_user(
        db,
        UserLoginRequest(identifier=req.email or req.phone or "", password=req.password),
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    _set_auth_cookie(response, token)
    return {
        "user": UserResponse.model_validate(user),
        "session_token": token,
    }


@router.post(
    "/login",
    response_model=dict[str, Any],
    summary="Login pengguna",
    description="Autentikasi kredensial login dan pembuatan sesi server-side.",
)
async def login(
    req: UserLoginRequest,
    response: Response,
    request: Request,
    db: Annotated[Session, Depends(get_db_session)],
) -> dict[str, Any]:
    token, user = account_service.login_user(
        db,
        req,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    _set_auth_cookie(response, token)
    return {
        "user": UserResponse.model_validate(user),
        "session_token": token,
    }


@router.post(
    "/logout",
    status_code=200,
    summary="Logout pengguna",
    description="Mencabut sesi aktif di server dan menghapus cookie autentikasi.",
)
async def logout(
    response: Response,
    session: Annotated[AuthSession, Depends(get_current_session)],
    db: Annotated[Session, Depends(get_db_session)],
) -> dict[str, Any]:
    account_service.logout_user(db, session)
    settings = get_settings()
    response.delete_cookie(settings.session_cookie_name)
    return {"message": "Sesi berhasil diakhiri."}
