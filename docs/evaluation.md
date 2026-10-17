# Sawt Evaluation & Reproducibility Guide

Sawt includes an automated evaluation benchmark runner that measures Arabic dialect identification throughput, QA scorecard compliance and empathy evaluation speed, and live local GPU executive coaching synthesis on the workstation NVIDIA Dedicated NVIDIA GPU.

---

## 1. Running the Evaluation Suite

From the project root:
```bash
python evaluation/harness/runner.py
```

### Outputs Generated
- `evaluation/reports/latest_eval.json`: Full machine-readable benchmark metrics.
- `evaluation/reports/sawt_speech_metrics.svg`: Vector graphic visualization of measured throughput and QA metrics.
- `evaluation/reports/report.md`: Human-readable markdown audit summary.

---

## 2. Key Performance Indicators (KPIs)

- **Dialect Identification Throughput**: Measured processing speed for regional vocabulary token classification (< 5.0 µs per turn).
- **QA Scorecard Calculation**: Speed of multi-criteria compliance, empathy, and escalation keyword checking (< 10.0 µs).
- **GPU Executive Coaching Latency**: Local synthesis duration via on-premise Ollama (~3.0s on Dedicated NVIDIA GPU).
- **Zero-Simulation Guarantee**: Evaluated with `check_no_simulation.py` to ensure complete absence of mock/simulated artifacts in production code.
