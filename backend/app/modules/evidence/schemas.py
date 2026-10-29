"""WasteLink Bali — Evidence Schemas."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class EvidenceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    storage_key: str
    original_filename: str
    mime_type: str
    file_size_bytes: int
    sha256_hash: str
    uploader_id: str
    entity_type: str
    entity_id: str
    status: str
    created_at: datetime
