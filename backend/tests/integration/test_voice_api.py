from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_voice_samples(client: AsyncClient) -> None:
    response = await client.get("/api/v1/voice/samples")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 4
    sample_ids = [s["id"] for s in data]
    assert "sample-gulf-telecom" in sample_ids
    assert "sample-egypt-fintech" in sample_ids
    assert "sample-levant-express" in sample_ids
    assert "sample-maghrebi-telecom" in sample_ids


@pytest.mark.asyncio
async def test_download_sample_audio(client: AsyncClient) -> None:
    response = await client.get("/api/v1/voice/samples/test_arabic_call_gulf.wav/download")
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("audio/")
    assert len(response.content) > 1000


@pytest.mark.asyncio
async def test_stream_call_audio(client: AsyncClient) -> None:
    response = await client.get("/api/v1/voice/calls/call-gulf-101")
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("audio/")
    assert len(response.content) > 1000


@pytest.mark.asyncio
async def test_auto_upload_sample_to_project_and_process(client: AsyncClient) -> None:
    # 1. Upload sample to project
    res_upload = await client.post("/api/v1/voice/samples/sample-gulf-telecom/upload-to-project")
    assert res_upload.status_code == 200
    file_data = res_upload.json()
    file_id = file_data["id"]
    assert file_data["filename"] == "test_arabic_call_gulf.wav"
    assert file_data["audio_stream_url"] == f"/api/v1/files/{file_id}/stream"

    # 2. Verify streaming audio for uploaded file
    res_stream = await client.get(file_data["audio_stream_url"])
    assert res_stream.status_code == 200
    assert res_stream.headers["content-type"].startswith("audio/")
    assert len(res_stream.content) > 1000

    # 3. Process the uploaded audio file into Call QA analysis
    res_proc = await client.post(f"/api/v1/files/{file_id}/process")
    assert res_proc.status_code == 200
    proc_data = res_proc.json()
    assert proc_data["status"] == "success"
    assert "call_id" in proc_data
    assert proc_data["dialect"] == "GULF"
    assert proc_data["turns_count"] == 4

    # 4. Verify call is immediately accessible in Call QA records
    res_call = await client.get(f"/api/v1/calls/{proc_data['call_id']}")
    assert res_call.status_code == 200
    call_json = res_call.json()
    assert call_json["dialect"] == "GULF"
    assert call_json["audio_url"] == f"/api/v1/files/{file_id}/stream"


@pytest.mark.asyncio
async def test_voice_engine_config(client: AsyncClient) -> None:
    # 1. Get current config
    res_get = await client.get("/api/v1/voice/config")
    assert res_get.status_code == 200
    cfg = res_get.json()
    assert "provider" in cfg
    assert "available_providers" in cfg

    # 2. Update config
    res_post = await client.post("/api/v1/voice/config", json={"provider": "phonetic-edge"})
    assert res_post.status_code == 200
    updated = res_post.json()
    assert updated["provider"] == "phonetic-edge"
