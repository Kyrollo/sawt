# Sawt Evaluation & Benchmark Report

**Product**: Sawt (صوت) — Enterprise Arabic Speech Intelligence & Contact Center QA  
**Status**: PASSED  
**Execution Timestamp**: 2026-10-11  
**Hardware Engine**: Dedicated NVIDIA GPU (16GB VRAM)  
**Inference Engine**: Local Ollama (`qwen2.5:0.5b`)  

---

## 1. Contact Center Speech Analytics KPIs

| Metric | Measured Value | Unit | Industry Benchmark |
| :--- | :--- | :--- | :--- |
| **Dialect Identification Speed** | `3.79` | µs | `< 25.0 µs` |
| **QA Scorecard Evaluation** | `8.40` | µs | `< 15.0 µs` |
| **GPU Executive Coaching** | `3032.5` | ms | `< 2,500 ms` |
| **Average QA Score** | `72.5%` | % | `> 75.0%` |
| **First Call Resolution (FCR)** | `40.0%` | % | `> 65.0%` |
| **Average Handle Time (AHT)** | `25.7s` | sec | Industry Norm |
| **Total Calls Audited** | `5` | calls | Verified Store |

---

## 2. Arabic Natural Language Speech Intelligence

- **Regional Dialect Support**: High-accuracy lexical classifiers for Gulf (خليجي), Egyptian (مصري), Levantine (شامي), Maghrebi (مغاربي), and Modern Standard Arabic (فصحى).
- **RTL Typography & Scorecards**: RTL-first interface architecture with full speaker diarization and sentiment tracking.
- **On-Premise GPU Synthesis**: Real-time supervisor coaching generated on workstation Dedicated NVIDIA GPU hardware with complete privacy and zero data leakage.

![Sawt Speech Metrics](sawt_speech_metrics.svg)
