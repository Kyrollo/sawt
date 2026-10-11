# Sawt Data Model & Speech Telemetry Schema

The Sawt data model organizes audio conversations into speaker turns, dialect classifications, acoustic metrics, and QA scorecard evaluations.

---

## 1. Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    CALL_QA_ANALYSIS ||--|{ SPEAKER_TURN : "contains"
    CONTACT_CENTER_KPIS ||--o{ CALL_QA_ANALYSIS : "aggregates"

    CALL_QA_ANALYSIS {
        string call_id PK "Unique Call Identifier"
        string customer_id "Customer account reference"
        string agent_id "Contact center agent ID"
        float duration_sec "Call duration in seconds"
        enum dialect "GULF | EGYPTIAN | LEVANTINE | MAGHREBI | MSA"
        enum disposition "RESOLVED | ESCALATED_TO_TIER2 | CHURN_RISK | COMPLIANCE_BREACH | FOLLOW_UP_REQUIRED"
        float overall_qa_score_pct "Composite QA score percentage"
        float compliance_score_pct "Standard operating procedure score"
        float empathy_score_pct "Customer courtesy & empathy score"
        float silence_ratio_pct "Dead air percentage"
        float talk_over_ratio_pct "Speech cross-talk ratio"
        string executive_summary_ar "Arabic executive summary"
        json coaching_recommendations "Actionable agent advice"
        string timestamp "ISO 8601 creation time"
    }

    SPEAKER_TURN {
        string speaker "AGENT | CUSTOMER"
        float start_time_sec "Offset start timestamp"
        float end_time_sec "Offset end timestamp"
        string text_ar "Arabic speech transcription"
        string text_en_translation "English reference translation"
        enum sentiment "POSITIVE | NEUTRAL | NEGATIVE | HIGHLY_FRUSTRATED"
        float confidence "ASR transcription confidence"
        float acoustic_pitch_hz "Fundamental frequency pitch"
    }

    CONTACT_CENTER_KPIS {
        int total_calls_analyzed "Total calls evaluated"
        float avg_qa_score "Mean overall QA score"
        float avg_handle_time_sec "Average handle time"
        float first_call_resolution_pct "FCR resolution percentage"
        float escalation_rate_pct "Supervisor escalation rate"
        json dialect_distribution "Calls per regional dialect"
    }
```

---

## 2. Arabic Dialect Typology

| Dialect Code | Region | Native Name | Sample Lexical Markers |
| :--- | :--- | :--- | :--- |
| `GULF` | Saudi Arabia, UAE, Kuwait, Qatar, Bahrain, Oman | خليجي | "شلونك", "وايد", "طال عمرك", "يبا", "زين", "أبي" |
| `EGYPTIAN` | Egypt, Sudan | مصري | "إزيك", "عايز", "كده", "دلوقتي", "أوي", "يا فندم" |
| `LEVANTINE` | Lebanon, Syria, Jordan, Palestine | شامي | "كيفك", "شو", "هيك", "كتير", "بدي", "هلأ" |
| `MAGHREBI` | Morocco, Algeria, Tunisia | مغاربي | "واش راك", "بزاف", "دابا", "مزيان", "برشا" |
| `MSA` | Pan-Arab Media, Formal Business, Legal | فصحى حديثة | "أهلاً وسهلاً", "مرحباً", "بخصوص", "أرجو" |
