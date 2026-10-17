from __future__ import annotations

import shutil
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

from fastapi import APIRouter, HTTPException, Query, status
from fastapi.responses import FileResponse, Response
from pydantic import BaseModel, Field

from src.sawt.domain.entities import ArabicDialect
from src.sawt.services.voice_service import (
    VOICE_ENGINE_CONFIG,
    VOICE_SAMPLES,
    get_call_audio_path,
    get_sample_audio_path,
    synthesize_arabic_text,
)
from src.sawt.api.v1.files import FILE_REGISTRY, UPLOAD_DIR, FileMetadata

router = APIRouter(prefix="/voice", tags=["voice"])


class SynthesizeRequest(BaseModel):
    text: str
    dialect: ArabicDialect = ArabicDialect.MSA
    speaker: str = "AGENT"
    gender: str = "MALE"


@router.get("/samples")
async def list_voice_samples() -> list[dict[str, Any]]:
    """List available authentic Arabic test speech audio files for upload and testing."""
    results = []
    for s in VOICE_SAMPLES:
        results.append(
            {
                **s,
                "download_wav_url": f"/api/v1/voice/samples/{s['filename']}/download",
                "download_mp3_url": f"/api/v1/voice/samples/{s['mp3_filename']}/download",
                "stream_mp3_url": f"/api/v1/voice/samples/{s['mp3_filename']}/download",
            }
        )
    return results


@router.get("/samples/{filename}/download")
async def download_sample_audio(filename: str):
    """Streams or downloads an authentic Arabic test speech sample file."""
    path = get_sample_audio_path(filename)
    if not path or not path.exists():
        raise HTTPException(
            status_code=404, detail=f"Sample audio file '{filename}' not found on server"
        )

    media_type = "audio/wav" if path.suffix.lower() == ".wav" else "audio/mpeg"
    return FileResponse(
        path=path,
        media_type=media_type,
        filename=path.name,
        headers={"Accept-Ranges": "bytes", "Cache-Control": "public, max-age=86400"},
    )


@router.post("/samples/{sample_id}/upload-to-project", response_model=FileMetadata)
async def auto_upload_sample_to_project(sample_id: str) -> FileMetadata:
    """
    Directly ingests one of the test voice audio samples into the project's uploaded files registry.
    Allows 1-click test upload with real authentic Arabic voice audio!
    """
    sample = next((s for s in VOICE_SAMPLES if s["id"] == sample_id or s["filename"] == sample_id), None)
    if not sample:
        raise HTTPException(status_code=404, detail=f"Sample '{sample_id}' not found")

    src_path = get_sample_audio_path(sample["filename"])
    if not src_path or not src_path.exists():
        raise HTTPException(status_code=404, detail="Sample binary missing from disk")

    file_id = f"file_{uuid.uuid4().hex[:10]}"
    dest_path = UPLOAD_DIR / f"{file_id}_{sample['filename']}"
    shutil.copy2(src_path, dest_path)

    content_size = dest_path.stat().st_size
    meta = {
        "id": file_id,
        "filename": sample["filename"],
        "size_bytes": content_size,
        "content_type": "audio/wav",
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
        "processed": False,
        "audio_stream_url": f"/api/v1/files/{file_id}/stream",
        "call_id": None,
        "stored_path": str(dest_path),
        "details": {
            "extension": ".wav",
            "dialect": sample["dialect"],
            "title": sample["title"],
            "description": sample["description"],
        },
    }
    FILE_REGISTRY[file_id] = meta
    return FileMetadata(**meta)


@router.get("/calls/{call_id}")
async def stream_call_audio(call_id: str):
    """Streams high-fidelity dual-channel real voice audio for a recorded call."""
    path = get_call_audio_path(call_id)
    if not path or not path.exists():
        raise HTTPException(
            status_code=404, detail=f"Real audio recording for call '{call_id}' not found"
        )

    media_type = "audio/mpeg" if path.suffix.lower() == ".mp3" else "audio/wav"
    return FileResponse(
        path=path,
        media_type=media_type,
        filename=path.name,
        headers={
            "Accept-Ranges": "bytes",
            "Cache-Control": "public, max-age=86400",
        },
    )


@router.post("/synthesize")
async def synthesize_arabic_voice(req: SynthesizeRequest):
    """Generates authentic Arabic neural speech MP3 on the fly for arbitrary text."""
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Arabic text cannot be empty")

    try:
        audio_path = await synthesize_arabic_text(
            text=req.text.strip(),
            dialect=req.dialect,
            speaker=req.speaker,
            gender=req.gender,
        )
        return FileResponse(
            path=audio_path,
            media_type="audio/mpeg",
            filename=f"tts_{req.dialect.value.lower()}.mp3",
            headers={"Accept-Ranges": "bytes"},
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500, detail=f"Neural speech synthesis error: {str(exc)}"
        )


class VoiceConfigPayload(BaseModel):
    provider: Optional[str] = None
    elevenlabs_api_key: Optional[str] = None
    elevenlabs_model_id: Optional[str] = None
    openai_api_key: Optional[str] = None


@router.get("/config")
async def get_voice_config() -> dict[str, Any]:
    """Retrieves active voice synthesis provider and engine configuration."""
    return {
        "provider": VOICE_ENGINE_CONFIG.get("provider", "phonetic-edge"),
        "has_elevenlabs_key": bool(VOICE_ENGINE_CONFIG.get("elevenlabs_api_key")),
        "elevenlabs_model_id": VOICE_ENGINE_CONFIG.get("elevenlabs_model_id", "eleven_multilingual_v2"),
        "has_openai_key": bool(VOICE_ENGINE_CONFIG.get("openai_api_key")),
        "available_providers": ["phonetic-edge", "elevenlabs", "openai"],
    }


@router.post("/config")
async def update_voice_config(payload: VoiceConfigPayload) -> dict[str, Any]:
    """Updates voice engine provider or API keys at runtime."""
    if payload.provider:
        if payload.provider not in {"phonetic-edge", "elevenlabs", "openai"}:
            raise HTTPException(status_code=400, detail=f"Unknown provider '{payload.provider}'")
        VOICE_ENGINE_CONFIG["provider"] = payload.provider
    if payload.elevenlabs_api_key is not None:
        VOICE_ENGINE_CONFIG["elevenlabs_api_key"] = payload.elevenlabs_api_key
    if payload.elevenlabs_model_id:
        VOICE_ENGINE_CONFIG["elevenlabs_model_id"] = payload.elevenlabs_model_id
    if payload.openai_api_key is not None:
        VOICE_ENGINE_CONFIG["openai_api_key"] = payload.openai_api_key

    return await get_voice_config()
