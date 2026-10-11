from __future__ import annotations

import pytest
from src.sawt.domain.entities import (
    ArabicDialect,
    CallDisposition,
    SentimentTier,
    SpeakerTurn,
)
from src.sawt.services.qa_engine import detect_arabic_dialect, evaluate_qa_scorecard


def test_detect_gulf_dialect() -> None:
    text = "هلا والله شلونك طال عمرك؟ عندي مشكلة وايد صعبة وأبي مساعدة يبا."
    dialect = detect_arabic_dialect(text)
    assert dialect == ArabicDialect.GULF


def test_detect_egyptian_dialect() -> None:
    text = "إزيك يا فندم، أنا عاوز أعرف الحساب بتاعي اتخصم منه فلوس كده ليه دلوقتي؟"
    dialect = detect_arabic_dialect(text)
    assert dialect == ArabicDialect.EGYPTIAN


def test_detect_levantine_dialect() -> None:
    text = "مرحبا كيفك، شو صار بالشحنة؟ كتير هيك تأخير وبدي حل هلأ."
    dialect = detect_arabic_dialect(text)
    assert dialect == ArabicDialect.LEVANTINE


def test_detect_msa_dialect() -> None:
    text = "أهلاً وسهلاً بكم، نرحب بتواصلكم الكريم بخصوص الخدمات الرقمية."
    dialect = detect_arabic_dialect(text)
    assert dialect == ArabicDialect.MSA


def test_evaluate_qa_scorecard_resolved() -> None:
    turns = [
        SpeakerTurn(
            speaker="AGENT",
            start_time_sec=0.0,
            end_time_sec=3.0,
            text_ar="مرحباً بك في خدمة العملاء، كيف أستطيع مساعدتك؟",
            text_en_translation="Welcome to customer service, how can I help?",
            sentiment=SentimentTier.POSITIVE,
        ),
        SpeakerTurn(
            speaker="CUSTOMER",
            start_time_sec=3.5,
            end_time_sec=8.0,
            text_ar="أود الاستفسار عن رصيد الباقة الحالي.",
            text_en_translation="I want to inquire about current balance.",
            sentiment=SentimentTier.NEUTRAL,
        ),
        SpeakerTurn(
            speaker="AGENT",
            start_time_sec=8.5,
            end_time_sec=14.0,
            text_ar="رصيدك المتبقي 15 جيجابايت، شكراً لتواصلك معنا ويومك سعيد.",
            text_en_translation="Remaining balance is 15GB, thank you for contacting us.",
            sentiment=SentimentTier.POSITIVE,
        ),
    ]

    compliance, empathy, overall, disposition, flags = evaluate_qa_scorecard(turns)
    assert compliance >= 90.0
    assert overall >= 85.0
    assert disposition == CallDisposition.RESOLVED
    assert len(flags) == 0


def test_evaluate_qa_scorecard_escalation() -> None:
    turns = [
        SpeakerTurn(
            speaker="AGENT",
            start_time_sec=0.0,
            end_time_sec=2.0,
            text_ar="نعم تفضل.",
            text_en_translation="Yes go ahead.",
            sentiment=SentimentTier.NEUTRAL,
        ),
        SpeakerTurn(
            speaker="CUSTOMER",
            start_time_sec=2.5,
            end_time_sec=7.0,
            text_ar="الخدمة معطلة من أسبوع، أريد التحدث مع المدير فوراً وسأقوم برفع شكوى رسمية!",
            text_en_translation="Service down for a week, want to speak with manager immediately!",
            sentiment=SentimentTier.HIGHLY_FRUSTRATED,
        ),
    ]

    compliance, empathy, overall, disposition, flags = evaluate_qa_scorecard(turns)
    assert disposition == CallDisposition.ESCALATED_TO_TIER2
    assert len(flags) > 0
