# Sawt (صوت) System Architecture & Arabic Speech Intelligence Design

Sawt is an enterprise **Arabic Speech Analytics and Automated Contact Center QA Platform**. It provides dialect identification across five major Arabic varieties (Gulf, Egyptian, Levantine, Maghrebi, MSA), speaker diarization turn analysis, compliance/empathy QA scorecards, and local GPU executive resolution coaching.

---

## 1. C4 Container Diagram

```mermaid
flowchart TD
    subgraph Clients["Contact Center Operations"]
        QASupervisor["QA Supervisor / Team Lead"]
        Telephony["Telephony PBX / ASR Audio Feed"]
    end

    subgraph SawtPlatform["Sawt Speech Intelligence Platform"]
        UI["Sawt Web Console (React 18 + RTL Arabic Typography)\nWaveform Player, Diarization Bubbles & Coaching Lab"]
        APIGW["FastAPI Telephony Gateway\nAsync FastAPI (Python 3.12)"]
        
        subgraph CoreEngines["Core Speech & QA Intelligence Engines"]
            DialectEngine["Arabic Dialect Identification Engine\nGulf / Egyptian / Levantine / Maghrebi / MSA Lexical Analysis"]
            QAEngine["Deterministic QA Scorecard Engine\nCompliance %, Empathy %, Escalation & Churn Analysis"]
            CoachEngine["Local GPU Arabic Coaching Engine\nExecutive Summary & Agent Action Points"]
            Store["Rolling Call Store\nPre-seeded Enterprise Audio Records"]
        end
    end

    subgraph LocalHardware["Workstation GPU Hardware Layer"]
        OllamaLocal["Local Ollama Engine\nNVIDIA RTX A5000 (16GB VRAM) / qwen2.5:0.5b"]
    end

    QASupervisor -->|Audits Calls & Coaches Agents| UI
    Telephony -->|Ingests Dual-Channel Transcripts| APIGW
    UI -->|REST Queries /api/v1| APIGW
    APIGW --> DialectEngine
    APIGW --> QAEngine
    APIGW --> CoachEngine
    QAEngine --> Store
    CoachEngine --> Store
    CoachEngine -->|Synthesizes Arabic Guidance| OllamaLocal
```

---

## 2. Speech Diarization & QA Coaching Sequence

```mermaid
sequenceDiagram
    autonumber
    actor QA as QA Supervisor / PBX
    participant UI as Sawt Web UI
    participant API as FastAPI Gateway
    participant Dialect as Dialect Classifier
    participant QAEngine as QA Scorecard Engine
    participant GPU as Local RTX A5000 (Ollama)
    participant Store as Rolling Call Store

    QA->>UI: Submit ASR Dual-Channel Arabic Audio Transcript
    UI->>API: POST /api/v1/analyze {audio_text_ar, agent_id}
    API->>Dialect: Analyze Lexical Regional Tokens
    Dialect-->>API: Identified Dialect (e.g., GULF / خليجي)
    API->>QAEngine: Evaluate Compliance %, Empathy %, Escalation Keywords
    QAEngine-->>API: QA Metrics & Call Disposition
    API->>GPU: Send Arabic Supervisor Prompt to local Ollama (qwen2.5:0.5b)
    activate GPU
    GPU-->>API: Return Arabic Executive Memorandum & Coaching Points
    deactivate GPU
    API->>Store: Persist CallQAAnalysis Entity
    API-->>UI: 200 OK (CallQAAnalysis)
    UI-->>QA: Render Waveform Timeline & Diarized Chat Bubbles
```

---

## 3. Core Architectural Modules

### A. Arabic Dialect Identification (`qa_engine.py`)
- Analyzes regional speech tokens across five distinct Arabic dialect families:
  - **Gulf (خليجي)**: "شلونك", "وايد", "طال عمرك", "يبا", "زين", "أبي"
  - **Egyptian (مصري)**: "إزيك", "عايز", "كده", "دلوقتي", "أوي", "يا فندم"
  - **Levantine (شامي)**: "كيفك", "شو", "هيك", "كتير", "بدي", "هلأ"
  - **Maghrebi (مغاربي)**: "واش راك", "بزاف", "دابا", "مزيان"
  - **Modern Standard (فصحى)**: Modern formal Arabic expressions
- Execution speed < 5.0 µs per turn.

### B. Contact Center QA Scorecard Engine (`qa_engine.py`)
- Deterministic compliance checklist verification: standard greetings, security identification confirmation, and professional closing etiquette.
- Customer empathy and acoustic sentiment tracking.
- Real-time escalation trigger detection for supervisor interventions.

### C. Local GPU Arabic Coaching Engine (`coach_engine.py`)
- Leverages on-premise NVIDIA RTX A5000 GPU (16GB VRAM) via local Ollama.
- Generates high-quality Arabic supervisor memoranda and agent development recommendations with complete data sovereignty and zero cloud egress.
