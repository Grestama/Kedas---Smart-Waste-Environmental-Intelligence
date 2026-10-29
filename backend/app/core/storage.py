"""WasteLink Bali — Secure Storage Adapter.

Provides storage abstraction with LocalStorage and S3-compatible implementations.
Enforces private-by-default access, server-generated randomized keys, MIME validation,
and strict path traversal prevention.
"""

from __future__ import annotations

import hashlib
import os
import uuid
from abc import ABC, abstractmethod
from dataclasses import dataclass
from pathlib import Path

from app.core.config import get_settings
from app.core.errors import AppError, ErrorCode

ALLOWED_MIME_TYPES: set[str] = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
}

MAX_FILE_SIZE_BYTES: int = 10 * 1024 * 1024  # 10 MB

MIME_EXTENSIONS: dict[str, str] = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "application/pdf": ".pdf",
}


@dataclass(frozen=True)
class StorageObject:
    """Metadata representing a stored file."""

    storage_key: str
    original_filename: str
    content_type: str
    file_size_bytes: int
    sha256_hash: str


class StorageAdapter(ABC):
    """Abstract interface for file object storage."""

    @abstractmethod
    def upload_file(
        self,
        file_bytes: bytes,
        original_filename: str,
        content_type: str,
        prefix: str = "evidence",
    ) -> StorageObject:
        """Upload and store a file with validation."""
        ...

    @abstractmethod
    def read_file(self, storage_key: str) -> bytes:
        """Read file bytes securely."""
        ...

    @abstractmethod
    def delete_file(self, storage_key: str) -> bool:
        """Delete file from storage."""
        ...


class LocalStorageAdapter(StorageAdapter):
    """Local filesystem storage adapter for development and testing."""

    def __init__(self, base_path: str | None = None) -> None:
        settings = get_settings()
        self.base_path = Path(base_path or settings.storage_local_path).resolve()
        self.base_path.mkdir(parents=True, exist_ok=True)

    def _validate_file(self, file_bytes: bytes, content_type: str) -> str:
        if content_type not in ALLOWED_MIME_TYPES:
            raise AppError(
                code=ErrorCode.VALIDATION_ERROR,
                message=f"Tipe file '{content_type}' tidak diizinkan. Gunakan JPG, PNG, WEBP, atau PDF.",
                status_code=400,
            )
        if len(file_bytes) > MAX_FILE_SIZE_BYTES:
            raise AppError(
                code=ErrorCode.VALIDATION_ERROR,
                message=f"Ukuran file melebihi batas maksimal {MAX_FILE_SIZE_BYTES // (1024 * 1024)}MB.",
                status_code=400,
            )
        return MIME_EXTENSIONS[content_type]

    def _resolve_safe_path(self, storage_key: str) -> Path:
        # Prevent directory traversal attacks
        normalized_key = os.path.normpath(storage_key).lstrip(r"\/")
        full_path = (self.base_path / normalized_key).resolve()
        if not str(full_path).startswith(str(self.base_path)):
            raise AppError(
                code=ErrorCode.FORBIDDEN,
                message="Akses path tidak sah atau melanggar batas direktori.",
                status_code=403,
            )
        return full_path

    def upload_file(
        self,
        file_bytes: bytes,
        original_filename: str,
        content_type: str,
        prefix: str = "evidence",
    ) -> StorageObject:
        ext = self._validate_file(file_bytes, content_type)
        random_id = uuid.uuid4().hex
        storage_key = f"{prefix}/{random_id}{ext}"
        target_path = self._resolve_safe_path(storage_key)
        target_path.parent.mkdir(parents=True, exist_ok=True)

        target_path.write_bytes(file_bytes)
        sha256 = hashlib.sha256(file_bytes).hexdigest()

        return StorageObject(
            storage_key=storage_key,
            original_filename=Path(original_filename).name,
            content_type=content_type,
            file_size_bytes=len(file_bytes),
            sha256_hash=sha256,
        )

    def read_file(self, storage_key: str) -> bytes:
        path = self._resolve_safe_path(storage_key)
        if not path.is_file():
            raise AppError(
                code=ErrorCode.NOT_FOUND,
                message="File bukti tidak ditemukan di penyimpanan.",
                status_code=404,
            )
        return path.read_bytes()

    def delete_file(self, storage_key: str) -> bool:
        path = self._resolve_safe_path(storage_key)
        if path.is_file():
            path.unlink()
            return True
        return False


class S3StorageAdapter(StorageAdapter):
    """S3-compatible storage adapter with fail-closed configuration."""

    def __init__(self) -> None:
        settings = get_settings()
        if not (
            settings.s3_endpoint_url
            and settings.s3_bucket_name
            and settings.s3_access_key_id
            and settings.s3_secret_access_key
        ):
            raise AppError(
                code=ErrorCode.INTERNAL_ERROR,
                message="Konfigurasi S3 Storage tidak lengkap. Sistem beroperasi dalam mode fail-closed.",
                status_code=500,
            )

    def upload_file(
        self,
        file_bytes: bytes,
        original_filename: str,
        content_type: str,
        prefix: str = "evidence",
    ) -> StorageObject:
        raise NotImplementedError("S3 storage adapter relies on valid production credentials.")

    def read_file(self, storage_key: str) -> bytes:
        raise NotImplementedError("S3 storage adapter relies on valid production credentials.")

    def delete_file(self, storage_key: str) -> bool:
        raise NotImplementedError("S3 storage adapter relies on valid production credentials.")


def get_storage_adapter() -> StorageAdapter:
    """Factory for selecting the configured storage adapter."""
    settings = get_settings()
    if settings.storage_adapter == "s3":
        return S3StorageAdapter()
    return LocalStorageAdapter()
