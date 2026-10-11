from __future__ import annotations

from typing import Dict
from src.sawt.domain.entities import (
    ArabicDialect,
    CallDisposition,
    CallQAAnalysis,
    ContactCenterKPIs,
    SentimentTier,
    SpeakerTurn,
)


class SawtStore:
    """Thread-safe persistent state store for Arabic Contact Center QA records."""

    def __init__(self) -> None:
        self.calls: Dict[str, CallQAAnalysis] = {}
        self._seed_reference_calls()

    def _seed_reference_calls(self) -> None:
        # --- Call 1: Gulf Dialect (Riyadh Telecom - Resolved) ---
        c1_turns = [
            SpeakerTurn(
                speaker="AGENT",
                start_time_sec=0.0,
                end_time_sec=4.5,
                text_ar="مرحباً بك في شركة الاتصالات، معك خالد، شلون أقدر أخدمك طال عمرك؟",
                text_en_translation="Welcome to Telecom, this is Khaled, how may I assist you today?",
                sentiment=SentimentTier.POSITIVE,
            ),
            SpeakerTurn(
                speaker="CUSTOMER",
                start_time_sec=5.0,
                end_time_sec=11.2,
                text_ar="هلا والله أخوي، عندي فاتورة الشهر هذا وايد مرتفعة وأبي أعرف تفاصيل باقة 5G.",
                text_en_translation="Hello brother, my bill this month is very high and I want to check my 5G bundle details.",
                sentiment=SentimentTier.NEUTRAL,
            ),
            SpeakerTurn(
                speaker="AGENT",
                start_time_sec=12.0,
                end_time_sec=19.5,
                text_ar="أبشر ولا تشيل هم، راجعت الحساب وتبين وجود اشتراك إضافي وتم إلغاؤه وتعويضك برصيد 50 ريال.",
                text_en_translation="Understood, do not worry. I reviewed the account and found an add-on, cancelled it and credited 50 SAR.",
                sentiment=SentimentTier.POSITIVE,
            ),
            SpeakerTurn(
                speaker="CUSTOMER",
                start_time_sec=20.0,
                end_time_sec=24.0,
                text_ar="بيض الله وجهك ما قصرت، زين ما سويت، شكراً جزيلاً.",
                text_en_translation="May God honor you, thank you very much, excellent resolution.",
                sentiment=SentimentTier.POSITIVE,
            ),
        ]
        c1 = CallQAAnalysis(
            call_id="call-gulf-101",
            customer_id="CUST-RYD-901",
            agent_id="AG-KHALED-12",
            duration_sec=24.0,
            dialect=ArabicDialect.GULF,
            disposition=CallDisposition.RESOLVED,
            overall_qa_score_pct=94.5,
            compliance_score_pct=100.0,
            empathy_score_pct=90.0,
            silence_ratio_pct=6.2,
            talk_over_ratio_pct=1.4,
            turns=c1_turns,
            escalation_flags=[],
            executive_summary_ar="اتصال استفسار عن فاتورة مرتفعة. تم التعامل بكفاءة عالية، وشرح الفروقات وإلغاء الاشتراك الإضافي مع تعويض العميل بنجاح.",
            coaching_recommendations=[
                "المحافظة على سرعة التجاوب الإيجابي واستخدام المفردات الترحيبية الخليجية المناسبة.",
            ],
            timestamp="2026-10-11T09:30:00Z",
        )

        # --- Call 2: Egyptian Dialect (Cairo FinTech - Low Empathy) ---
        c2_turns = [
            SpeakerTurn(
                speaker="AGENT",
                start_time_sec=0.0,
                end_time_sec=3.5,
                text_ar="أهلاً بيك في محفظتي الإلكترونية، معاك أحمد.",
                text_en_translation="Welcome to MyWallet, this is Ahmed.",
                sentiment=SentimentTier.NEUTRAL,
            ),
            SpeakerTurn(
                speaker="CUSTOMER",
                start_time_sec=4.0,
                end_time_sec=12.0,
                text_ar="يا فندم أنا حولت 5000 جنيه من الصبح والفلوس اتخصمت وما وصلتش لحد دلوقتي، وعايز أعرف فين فلوسي؟",
                text_en_translation="Sir, I transferred 5000 EGP this morning, deducted but not received yet, where is my money?",
                sentiment=SentimentTier.NEGATIVE,
            ),
            SpeakerTurn(
                speaker="AGENT",
                start_time_sec=13.0,
                end_time_sec=18.0,
                text_ar="التحويل بياخد 24 ساعة، ما نقدرش نعمل حاجة دلوقتي خالص، استنى لبكرة.",
                text_en_translation="Transfers take 24 hours, nothing we can do right now, wait until tomorrow.",
                sentiment=SentimentTier.NEGATIVE,
            ),
            SpeakerTurn(
                speaker="CUSTOMER",
                start_time_sec=19.0,
                end_time_sec=26.0,
                text_ar="إيه ده يعني إيه استنى؟ الفلوس دي مصاريف مستشفى! كده مش أسلوب تعامل!",
                text_en_translation="What do you mean wait? That's hospital money! This is unacceptable service!",
                sentiment=SentimentTier.HIGHLY_FRUSTRATED,
            ),
        ]
        c2 = CallQAAnalysis(
            call_id="call-egypt-102",
            customer_id="CUST-CAI-442",
            agent_id="AG-AHMED-08",
            duration_sec=26.0,
            dialect=ArabicDialect.EGYPTIAN,
            disposition=CallDisposition.FOLLOW_UP_REQUIRED,
            overall_qa_score_pct=68.2,
            compliance_score_pct=66.7,
            empathy_score_pct=69.4,
            silence_ratio_pct=11.5,
            talk_over_ratio_pct=4.8,
            turns=c2_turns,
            escalation_flags=["Customer in financial distress (hospital expenses)"],
            executive_summary_ar="شكوى بخصوص تأخر تحويل مالي عاجل. أظهر الموظف جموداً ونقصاً في التعاطف مع ظرف العميل الإنساني، ولم يقدم رقم تذكرة عاجلة.",
            coaching_recommendations=[
                "تدريب الموظف على تقنيات امتصاص غضب العملاء واستخدام عبارات التعاطف (حقك علينا).",
                "تفعيل مسار التصعيد الفوري (Priority Escalation) للتحويلات المتعلقة بالطوارئ الطبية.",
            ],
            timestamp="2026-10-11T10:15:00Z",
        )

        # --- Call 3: Levantine Dialect (Amman Logistics - Escalated) ---
        c3_turns = [
            SpeakerTurn(
                speaker="AGENT",
                start_time_sec=0.0,
                end_time_sec=4.0,
                text_ar="يسعد أوقاتك من شركة التوصيل السريع، معك رنا، كيف بقدر أساعدك؟",
                text_en_translation="Good day from Express Delivery, this is Rana, how may I help you?",
                sentiment=SentimentTier.POSITIVE,
            ),
            SpeakerTurn(
                speaker="CUSTOMER",
                start_time_sec=4.5,
                end_time_sec=12.5,
                text_ar="مرحبا، الشحنة صارلها متأخرة 4 أيام وما في أي تحديث، شو القصة كتير هيك تأخير!",
                text_en_translation="Hello, shipment is 4 days late with no update, what's going on, this is too much delay!",
                sentiment=SentimentTier.NEGATIVE,
            ),
            SpeakerTurn(
                speaker="AGENT",
                start_time_sec=13.0,
                end_time_sec=19.0,
                text_ar="حقك علينا يا أخي، رح افتحلك تذكرة تحقيق فوري مع المستودع الرئيسي هلأ.",
                text_en_translation="Our sincere apologies brother, I will open an immediate investigation ticket with the hub right now.",
                sentiment=SentimentTier.POSITIVE,
            ),
            SpeakerTurn(
                speaker="CUSTOMER",
                start_time_sec=20.0,
                end_time_sec=27.0,
                text_ar="بدي أحكي مع المدير المسؤول فوراً، ما بدي مجرد تذاكر!",
                text_en_translation="I want to speak with the manager in charge immediately, not just another ticket!",
                sentiment=SentimentTier.HIGHLY_FRUSTRATED,
            ),
        ]
        c3 = CallQAAnalysis(
            call_id="call-levant-103",
            customer_id="CUST-AMM-771",
            agent_id="AG-RANA-05",
            duration_sec=27.0,
            dialect=ArabicDialect.LEVANTINE,
            disposition=CallDisposition.ESCALATED_TO_TIER2,
            overall_qa_score_pct=71.0,
            compliance_score_pct=66.7,
            empathy_score_pct=74.5,
            silence_ratio_pct=9.1,
            talk_over_ratio_pct=3.0,
            turns=c3_turns,
            escalation_flags=["Customer demanded supervisor escalation ('مدير')"],
            executive_summary_ar="طلب تصعيد مباشر للمشرف نتيجة تأخر شحنة 4 أيام. استجابة الموظفة كانت مهذبة وتضمنت اعتذاراً، ولكن العميل أصر على التحدث مع الإدارة.",
            coaching_recommendations=[
                "متابعة بروتوكول تحويل المكالمة السلس للمشرف (Warm Transfer) دون ترك العميل على الانتظار.",
            ],
            timestamp="2026-10-11T11:00:00Z",
        )

        # --- Call 4: MSA Dialect (Dubai Enterprise - Compliance Breach) ---
        c4_turns = [
            SpeakerTurn(
                speaker="AGENT",
                start_time_sec=0.0,
                end_time_sec=3.0,
                text_ar="أهلاً وسهلاً، تفضل.",
                text_en_translation="Hello, go ahead.",
                sentiment=SentimentTier.NEUTRAL,
            ),
            SpeakerTurn(
                speaker="CUSTOMER",
                start_time_sec=3.5,
                end_time_sec=10.0,
                text_ar="مرحباً، أود تعديل البريد الإلكتروني للمسؤول عن حساب السحابة الخاص بشركتنا.",
                text_en_translation="Hello, I would like to modify the administrator email for our company cloud account.",
                sentiment=SentimentTier.NEUTRAL,
            ),
            SpeakerTurn(
                speaker="AGENT",
                start_time_sec=10.5,
                end_time_sec=15.0,
                text_ar="حسناً، تم تغيير البريد الآن دون الحاجة لرمز التحقق.",
                text_en_translation="Alright, email updated now without needing the verification OTP.",
                sentiment=SentimentTier.NEUTRAL,
            ),
        ]
        c4 = CallQAAnalysis(
            call_id="call-msa-104",
            customer_id="CUST-DXB-220",
            agent_id="AG-TARIQ-02",
            duration_sec=15.0,
            dialect=ArabicDialect.MSA,
            disposition=CallDisposition.COMPLIANCE_BREACH,
            overall_qa_score_pct=52.0,
            compliance_score_pct=33.3,
            empathy_score_pct=67.3,
            silence_ratio_pct=14.0,
            talk_over_ratio_pct=0.0,
            turns=c4_turns,
            escalation_flags=["Security compliance violation: OTP bypass on account mutation"],
            executive_summary_ar="مخالفة أمنية جسيمة في الامتثال: قام الموظف بتعديل بريد المسؤول لحساب شركة دون التحقق الإلزامي من الهوية عبر رمز OTP.",
            coaching_recommendations=[
                "إيقاف الموظف مؤقتاً وإلحاقه بدورة أمن المعلومات وإجراءات التحقق الصارمة (2FA Enforcement).",
            ],
            timestamp="2026-10-11T11:45:00Z",
        )

        self.calls[c1.call_id] = c1
        self.calls[c2.call_id] = c2
        self.calls[c3.call_id] = c3
        self.calls[c4.call_id] = c4

    def get_kpis(self) -> ContactCenterKPIs:
        """Aggregates enterprise contact center metrics."""
        records = list(self.calls.values())
        if not records:
            return ContactCenterKPIs(
                total_calls_analyzed=0,
                avg_qa_score=0.0,
                avg_handle_time_sec=0.0,
                first_call_resolution_pct=0.0,
                escalation_rate_pct=0.0,
                dialect_distribution={},
            )

        total = len(records)
        avg_qa = round(sum(c.overall_qa_score_pct for c in records) / total, 1)
        avg_aht = round(sum(c.duration_sec for c in records) / total, 1)
        resolved = sum(1 for c in records if c.disposition == CallDisposition.RESOLVED)
        fcr = round((resolved / total) * 100.0, 1)
        escalated = sum(
            1 for c in records if c.disposition in (CallDisposition.ESCALATED_TO_TIER2, CallDisposition.CHURN_RISK)
        )
        escalation_rate = round((escalated / total) * 100.0, 1)

        dialect_counts: Dict[str, int] = {}
        for c in records:
            d_val = c.dialect.value
            dialect_counts[d_val] = dialect_counts.get(d_val, 0) + 1

        return ContactCenterKPIs(
            total_calls_analyzed=total,
            avg_qa_score=avg_qa,
            avg_handle_time_sec=avg_aht,
            first_call_resolution_pct=fcr,
            escalation_rate_pct=escalation_rate,
            dialect_distribution=dialect_counts,
        )


store = SawtStore()
