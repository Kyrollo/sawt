from __future__ import annotations

from enum import Enum
from typing import Any
from pydantic import BaseModel, Field


class ArabicDialect(str, Enum):
    GULF = "GULF"  # خليجي
    EGYPTIAN = "EGYPTIAN"  # مصري
    LEVANTINE = "LEVANTINE"  # شامي
    MAGHREBI = "MAGHREBI"  # مغاربي
    MSA = "MSA"  # فصحى حديثة


class CallDisposition(str, Enum):
    RESOLVED = "RESOLVED"
    ESCALATED_TO_TIER2 = "ESCALATED_TO_TIER2"
    CHURN_RISK = "CHURN_RISK"
    COMPLIANCE_BREACH = "COMPLIANCE_BREACH"
    FOLLOW_UP_REQUIRED = "FOLLOW_UP_REQUIRED"


class SentimentTier(str, Enum):
    POSITIVE = "POSITIVE"
    NEUTRAL = "NEUTRAL"
    NEGATIVE = "NEGATIVE"
    HIGHLY_FRUSTRATED = "HIGHLY_FRUSTRATED"


class SpeakerTurn(BaseModel):
    speaker: str  # "AGENT" or "CUSTOMER"
    start_time_sec: float
    end_time_sec: float
    text_ar: str
    text_en_translation: str
    sentiment: SentimentTier
    confidence: float = 0.95
    acoustic_pitch_hz: float = 145.0


class CallQAAnalysis(BaseModel):
    call_id: str
    customer_id: str
    agent_id: str
    duration_sec: float
    dialect: ArabicDialect
    disposition: CallDisposition
    overall_qa_score_pct: float
    compliance_score_pct: float
    empathy_score_pct: float
    silence_ratio_pct: float
    talk_over_ratio_pct: float
    turns: list[SpeakerTurn] = Field(default_factory=list)
    escalation_flags: list[str] = Field(default_factory=list)
    executive_summary_ar: str
    coaching_recommendations: list[str] = Field(default_factory=list)
    timestamp: str


class ContactCenterKPIs(BaseModel):
    total_calls_analyzed: int
    avg_qa_score: float
    avg_handle_time_sec: float
    first_call_resolution_pct: float
    escalation_rate_pct: float
    dialect_distribution: dict[str, int] = Field(default_factory=dict)


class LiveAnalyzeRequest(BaseModel):
    audio_text_ar: str
    agent_id: str = "AG-8821"
    customer_id: str = "CUST-4409"
    model: str = "qwen2.5:0.5b"
