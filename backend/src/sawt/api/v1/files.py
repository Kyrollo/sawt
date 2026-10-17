from __future__ import annotations

import json
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel, Field

router = APIRouter(prefix="/files", tags=["files"])

UPLOAD_DIR = Path("data/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

FILE_REGISTRY: dict[str, dict[str, Any]] = {}


class FileMetadata(BaseModel):
    id: str
    filename: str
    size_bytes: int
    content_type: str
    uploaded_at: str
    processed: bool = False
    audio_stream_url: str | None = None
    call_id: str | None = None
    details: dict[str, Any] = Field(default_factory=dict)


@router.post("/upload", response_model=FileMetadata)
async def upload_file(file: UploadFile = File(...)) -> FileMetadata:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename missing")

    ext = Path(file.filename).suffix.lower()
    allowed_extensions = {".wav", ".mp3", ".m4a", ".ogg", ".txt", ".srt", ".vtt", ".json", ".csv"}
    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported format '{ext}'. Allowed: {', '.join(sorted(allowed_extensions))}",
        )

    file_id = f"file_{uuid.uuid4().hex[:10]}"
    dest_path = UPLOAD_DIR / f"{file_id}_{file.filename}"

    content = await file.read()
    dest_path.write_bytes(content)

    audio_stream_url = f"/api/v1/files/{file_id}/stream" if ext in {".wav", ".mp3", ".m4a", ".ogg"} else None

    meta = {
        "id": file_id,
        "filename": file.filename,
        "size_bytes": len(content),
        "content_type": file.content_type or ("audio/wav" if ext == ".wav" else "audio/mpeg" if ext == ".mp3" else "application/octet-stream"),
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
        "processed": False,
        "audio_stream_url": audio_stream_url,
        "call_id": None,
        "stored_path": str(dest_path),
        "details": {"extension": ext},
    }
    FILE_REGISTRY[file_id] = meta

    return FileMetadata(**meta)


@router.get("", response_model=list[FileMetadata])
async def list_files() -> list[FileMetadata]:
    return [FileMetadata(**meta) for meta in FILE_REGISTRY.values()]


@router.get("/{file_id}", response_model=FileMetadata)
async def get_file(file_id: str) -> FileMetadata:
    if file_id not in FILE_REGISTRY:
        raise HTTPException(status_code=404, detail="File record not found")
    return FileMetadata(**FILE_REGISTRY[file_id])


@router.get("/{file_id}/stream")
async def stream_file(file_id: str):
    """Streams uploaded audio file with byte range support for in-browser audio playback."""
    if file_id not in FILE_REGISTRY:
        raise HTTPException(status_code=404, detail="File record not found")

    meta = FILE_REGISTRY[file_id]
    file_path = Path(meta["stored_path"])
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Stored file binary missing")

    ext = Path(meta["filename"]).suffix.lower()
    media_type = "audio/wav" if ext == ".wav" else ("audio/mpeg" if ext == ".mp3" else meta.get("content_type", "application/octet-stream"))

    from fastapi.responses import FileResponse
    return FileResponse(
        path=file_path,
        media_type=media_type,
        filename=meta["filename"],
        headers={"Accept-Ranges": "bytes", "Cache-Control": "public, max-age=86400"},
    )


@router.delete("/{file_id}")
async def delete_file(file_id: str) -> dict[str, str]:
    if file_id not in FILE_REGISTRY:
        raise HTTPException(status_code=404, detail="File record not found")

    stored_path = Path(FILE_REGISTRY[file_id]["stored_path"])
    if stored_path.exists():
        stored_path.unlink()

    del FILE_REGISTRY[file_id]
    return {"status": "deleted", "id": file_id}


@router.post("/{file_id}/process")
async def process_file(file_id: str) -> dict[str, Any]:
    if file_id not in FILE_REGISTRY:
        raise HTTPException(status_code=404, detail="File record not found")

    meta = FILE_REGISTRY[file_id]
    file_path = Path(meta["stored_path"])
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Stored file binary missing")

    ext = Path(meta["filename"]).suffix.lower()

    if ext in {".wav", ".mp3", ".m4a", ".ogg"}:
        from src.sawt.services.voice_service import process_and_transcribe_audio_file
        res = await process_and_transcribe_audio_file(file_path, meta["filename"], file_id)
        meta["processed"] = True
        meta["call_id"] = res.get("call_id")
        meta["details"]["extracted_characters"] = len(res.get("preview", ""))
        meta["details"]["dialect"] = res.get("dialect")
        meta["details"]["qa_score"] = res.get("overall_qa_score_pct")
        meta["details"]["turns_count"] = res.get("turns_count")
        return res

    extracted_text = ""
    lines_count = 0
    if ext == ".json":
        try:
            raw_text = file_path.read_text(encoding="utf-8", errors="replace")
            parsed = json.loads(raw_text)
            if isinstance(parsed, list):
                extracted_text = "\n".join(str(item) for item in parsed)
            elif isinstance(parsed, dict):
                extracted_text = parsed.get("transcript") or parsed.get("text") or str(parsed)
            else:
                extracted_text = raw_text
            lines_count = len(extracted_text.splitlines())
        except Exception:
            extracted_text = file_path.read_text(encoding="utf-8", errors="replace")
            lines_count = len(extracted_text.splitlines())
    else:
        extracted_text = file_path.read_text(encoding="utf-8", errors="replace")
        lines_count = len(extracted_text.splitlines())

    meta["processed"] = True
    meta["details"]["extracted_characters"] = len(extracted_text)
    meta["details"]["lines_count"] = lines_count

    return {
        "status": "success",
        "file_id": file_id,
        "filename": meta["filename"],
        "extracted_characters": len(extracted_text),
        "lines_count": lines_count,
        "preview": extracted_text[:400],
        "message": f"Ingested {meta['filename']} into Sawt speech analytics pipeline.",
    }
