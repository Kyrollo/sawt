from __future__ import annotations

import re
from src.sawt.domain.entities import (
    ArabicDialect,
    CallDisposition,
    SentimentTier,
    SpeakerTurn,
)

# Regional Arabic dialect vocabulary patterns
GULF_KEYWORDS = {
    "شلونك", "شلونكم", "وايد", "طال عمرك", "يبا", "زين", "أبي", "ماكو", "ريال", "هلا والله",
    "وشلون", "أبشر", "بسعدك", "سم", "سالفة", "الجوال", "هالشهر", "كفو", "بعد راسي", "تسلم يمينك", "ما قصرت", "يا هلا"
}
EGYPTIAN_KEYWORDS = {
    "إزيك", "عايز", "عاوز", "كده", "دلوقتي", "أوي", "ماشي", "برضه", "يا فندم", "بتاع",
    "صباح الفل", "يا بيه", "الحقني", "باصص", "مسمعة", "حقك عليا", "وراسك عندي", "عيني ليك", "ربنا يخليك", "جدعنتك", "يا ابني"
}
LEVANTINE_KEYWORDS = {
    "كيفك", "شو", "هيك", "كتير", "بدي", "منيح", "عم بحكي", "هلأ", "يلا",
    "يسعد صباحك", "تكرم عينك", "فيني", "ناطر", "بدقلكن", "ولا تاكل هم", "يسلمو", "كلك ذوق", "أختي", "شو القصة"
}
MAGHREBI_KEYWORDS = {
    "واش", "بزاف", "دابا", "مزيان", "برشا", "شنو", "علاش",
    "كيداير", "لاباس", "خويا", "نعاونك", "عافاك", "ما كاين", "أ خاي", "الزوينة", "تقيلة", "ديريكت"
}

ESCALATION_KEYWORDS = {"مدير", "مسؤول", "اشتكي", "شكوى", "ألغي", "إلغاء", "سرقة", "نصابين", "غير مقبول", "مصيبة"}
COURTESY_KEYWORDS = {
    "أعتذر", "حقك علينا", "حقك عليا", "يسعدني", "بكل سرور", "تكرم", "أهلاً بك",
    "شكراً لتواصلك", "أبشر", "عيني ليك", "تكرم عينك", "يسلمو", "الله يحفظك", "كفو", "وراسك عندي"
}


def detect_arabic_dialect(text: str) -> ArabicDialect:
    """
    Identifies Arabic dialect from lexical analysis of transcript tokens.
    """
    words = set(re.findall(r"[\u0600-\u06FF]+", text))

    gulf_score = len(words & GULF_KEYWORDS)
    egypt_score = len(words & EGYPTIAN_KEYWORDS)
    levant_score = len(words & LEVANTINE_KEYWORDS)
    maghreb_score = len(words & MAGHREBI_KEYWORDS)

    max_score = max(gulf_score, egypt_score, levant_score, maghreb_score)
    if max_score == 0:
        return ArabicDialect.MSA

    if max_score == gulf_score:
        return ArabicDialect.GULF
    elif max_score == egypt_score:
        return ArabicDialect.EGYPTIAN
    elif max_score == levant_score:
        return ArabicDialect.LEVANTINE
    else:
        return ArabicDialect.MAGHREBI


def evaluate_qa_scorecard(
    turns: list[SpeakerTurn],
) -> tuple[float, float, float, CallDisposition, list[str]]:
    """
    Computes Compliance %, Empathy %, Overall QA Score %, Call Disposition, and Escalation Flags.
    """
    agent_texts = [turn.text_ar for turn in turns if turn.speaker == "AGENT"]
    customer_texts = [turn.text_ar for turn in turns if turn.speaker == "CUSTOMER"]

    all_agent_str = " ".join(agent_texts)
    all_cust_str = " ".join(customer_texts)

    # 1. Compliance Checklist (Greeting, ID confirmation, Professional wrap-up)
    has_greeting = any(
        kw in all_agent_str for kw in ["أهلاً", "مرحباً", "السلام عليكم", "صباح الخير", "مساء الخير"]
    )
    has_closing = any(kw in all_agent_str for kw in ["شكراً", "يوم سعيد", "في خدمتك", "أي خدمة ثانية"])
    compliance_checks = sum([has_greeting, has_closing, len(agent_texts) >= 2])
    compliance_score = round((compliance_checks / 3.0) * 100.0, 1)

    # 2. Empathy Score
    empathy_hits = sum(1 for kw in COURTESY_KEYWORDS if kw in all_agent_str)
    negative_customer_turns = sum(
        1 for t in turns if t.speaker == "CUSTOMER" and t.sentiment in (SentimentTier.NEGATIVE, SentimentTier.HIGHLY_FRUSTRATED)
    )
    base_empathy = 85.0 + (empathy_hits * 5.0)
    if negative_customer_turns > 0 and empathy_hits == 0:
        base_empathy -= 25.0
    empathy_score = round(max(30.0, min(100.0, base_empathy)), 1)

    # 3. Escalation Flags
    escalation_flags: list[str] = []
    for kw in ESCALATION_KEYWORDS:
        if kw in all_cust_str:
            escalation_flags.append(f"Customer triggered escalation intent ('{kw}')")

    # 4. Disposition Determination
    if any("ألغي" in t or "إلغاء" in t for t in customer_texts):
        disposition = CallDisposition.CHURN_RISK
    elif escalation_flags:
        disposition = CallDisposition.ESCALATED_TO_TIER2
    elif compliance_score < 60.0:
        disposition = CallDisposition.COMPLIANCE_BREACH
    else:
        disposition = CallDisposition.RESOLVED

    # 5. Overall QA Score %
    overall_qa = round((compliance_score * 0.45) + (empathy_score * 0.55), 1)

    return compliance_score, empathy_score, overall_qa, disposition, escalation_flags
