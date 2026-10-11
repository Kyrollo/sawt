from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_calls(client: AsyncClient) -> None:
    response = await client.get("/api/v1/calls")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 4
    call_ids = [c["call_id"] for c in data]
    assert "call-gulf-101" in call_ids
    assert "call-egypt-102" in call_ids
    assert "call-levant-103" in call_ids
    assert "call-msa-104" in call_ids


@pytest.mark.asyncio
async def test_get_call_detail(client: AsyncClient) -> None:
    response = await client.get("/api/v1/calls/call-gulf-101")
    assert response.status_code == 200
    data = response.json()
    assert data["call_id"] == "call-gulf-101"
    assert data["dialect"] == "GULF"
    assert len(data["turns"]) == 4
    assert data["overall_qa_score_pct"] > 90.0


@pytest.mark.asyncio
async def test_get_call_not_found(client: AsyncClient) -> None:
    response = await client.get("/api/v1/calls/call-not-found-000")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_get_analytics(client: AsyncClient) -> None:
    response = await client.get("/api/v1/analytics")
    assert response.status_code == 200
    data = response.json()
    assert data["total_calls_analyzed"] >= 4
    assert data["avg_qa_score"] > 0
    assert "dialect_distribution" in data
    assert "GULF" in data["dialect_distribution"]


@pytest.mark.asyncio
async def test_analyze_empty_validation(client: AsyncClient) -> None:
    response = await client.post("/api/v1/analyze", json={"audio_text_ar": "   "})
    assert response.status_code == 400
