from __future__ import annotations

from fastapi import APIRouter, HTTPException, status
from src.sawt.domain.entities import (
    CallQAAnalysis,
    ContactCenterKPIs,
    LiveAnalyzeRequest,
)
from src.sawt.services.coach_engine import (
    UpstreamOllamaError,
    analyze_and_coach_call,
)
from src.sawt.services.store import store

router = APIRouter(tags=["calls"])


@router.get("/calls", response_model=list[CallQAAnalysis])
async def list_calls() -> list[CallQAAnalysis]:
    """Retrieve all Arabic contact center QA audio evaluation records."""
    return list(store.calls.values())


@router.get("/calls/{call_id}", response_model=CallQAAnalysis)
async def get_call(call_id: str) -> CallQAAnalysis:
    """Retrieve detailed diarized Arabic transcript and QA scorecard."""
    c = store.calls.get(call_id)
    if not c:
        raise HTTPException(status_code=404, detail=f"Call record {call_id} not found")
    return c


@router.get("/analytics", response_model=ContactCenterKPIs)
async def get_analytics() -> ContactCenterKPIs:
    """Retrieve contact center aggregated KPIs: QA score, AHT, FCR, and dialect distribution."""
    return store.get_kpis()


@router.post("/analyze", response_model=CallQAAnalysis)
async def run_live_analyze(req: LiveAnalyzeRequest) -> CallQAAnalysis:
    """
    Ingests Arabic transcript, identifies regional dialect, calculates compliance/empathy scores,
    and prompts local GPU Ollama to generate Arabic executive coaching.
    """
    if not req.audio_text_ar.strip():
        raise HTTPException(status_code=400, detail="Arabic transcript text cannot be empty")

    try:
        analysis = await analyze_and_coach_call(req)
        store.calls[analysis.call_id] = analysis
        return analysis
    except UpstreamOllamaError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "type": "https://sawt.ai/errors/upstream-unavailable",
                "title": "Local GPU LLM Engine Unavailable",
                "status": 503,
                "detail": str(exc),
            },
        )
