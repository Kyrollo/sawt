import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_healthz_endpoint(client: AsyncClient) -> None:
    response = await client.get("/healthz")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["app"] == "sawt"


@pytest.mark.asyncio
async def test_metrics_endpoint(client: AsyncClient) -> None:
    response = await client.get("/metrics")
    assert response.status_code == 200
    assert "sawt_http_requests_total" in response.text
