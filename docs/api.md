# Sawt REST API Reference

Sawt provides an asynchronous REST API under `/api/v1` for managing contact center call recordings, retrieving speech QA analytics, and running live Arabic dialect analysis.

---

## Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/info` | Service metadata, architecture archetype, and version |
| `GET` | `/api/v1/healthz` | Kubernetes liveness probe |
| `GET` | `/api/v1/readyz` | Kubernetes readiness probe (validates local GPU LLM upstream) |
| `GET` | `/api/v1/calls` | Returns all recorded Arabic contact center QA call records |
| `GET` | `/api/v1/calls/{call_id}` | Detailed diarized speech transcript and QA scorecard |
| `GET` | `/api/v1/analytics` | High-level contact center KPIs: QA scores, AHT, dialect distribution |
| `POST` | `/api/v1/analyze` | Executes live dialect identification and GPU coaching synthesis |

---

## 1. List Call Records
- **Endpoint**: `GET /api/v1/calls`
- **Response**: `200 OK`
```json
[
  {
    "call_id": "call-gulf-101",
    "customer_id": "CUST-RYD-901",
    "agent_id": "AG-KHALED-12",
    "duration_sec": 24.0,
    "dialect": "GULF",
    "disposition": "RESOLVED",
    "overall_qa_score_pct": 94.5,
    "compliance_score_pct": 100.0,
    "empathy_score_pct": 90.0,
    "silence_ratio_pct": 6.2,
    "talk_over_ratio_pct": 1.4,
    "turns": [ ... ],
    "executive_summary_ar": "اتصال استفسار عن فاتورة مرتفعة...",
    "coaching_recommendations": [ ... ],
    "timestamp": "2026-10-11T09:30:00Z"
  }
]
```

---

## 2. Get Contact Center Analytics
- **Endpoint**: `GET /api/v1/analytics`
- **Response**: `200 OK`
```json
{
  "total_calls_analyzed": 5,
  "avg_qa_score": 72.1,
  "avg_handle_time_sec": 22.8,
  "first_call_resolution_pct": 40.0,
  "escalation_rate_pct": 20.0,
  "dialect_distribution": {
    "GULF": 2,
    "EGYPTIAN": 1,
    "LEVANTINE": 1,
    "MSA": 1
  }
}
```

---

## 3. Run Live Speech Analysis
- **Endpoint**: `POST /api/v1/analyze`
- **Request Body**:
```json
{
  "audio_text_ar": "الموظف: مرحباً بك في خدمة العملاء، معك طارق.\nالعميل: هلا والله أخوي، عندي استفسار عن الباقة.",
  "agent_id": "AG-TARIQ-02",
  "customer_id": "CUST-RYD-901",
  "model": "qwen2.5:0.5b"
}
```
- **Response**: `200 OK` (`CallQAAnalysis`)
