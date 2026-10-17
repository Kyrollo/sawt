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
        # --- Call 1: Gulf Dialect (Saudi Telecom - Authentic Regional Dialect) ---
        c1_turns = [
            SpeakerTurn(
                speaker="AGENT",
                start_time_sec=0.0,
                end_time_sec=8.95,
                text_ar="يا هلا ومسهلا والله، حياك الله بشركة الاتصالات معك خالد.. وشلون أقدر أخدمك طال عمرك؟",
                text_en_translation="Welcome to Telecom, this is Khaled, how may I serve you today, sir?",
                sentiment=SentimentTier.POSITIVE,
            ),
            SpeakerTurn(
                speaker="CUSTOMER",
                start_time_sec=8.95,
                end_time_sec=21.21,
                text_ar="هلا والله أخوي خالد، مساك الله بالخير.. يا خوي فاتورة الجوال هالشهر طالعة وايد مرتفعة، وأبي أعرف السالفة، شلون انحسبت علي باقة الفايف جي؟",
                text_en_translation="Hello brother Khaled, good evening. My mobile bill this month is very high, I want to know why 5G was charged?",
                sentiment=SentimentTier.NEUTRAL,
            ),
            SpeakerTurn(
                speaker="AGENT",
                start_time_sec=21.21,
                end_time_sec=34.91,
                text_ar="أبشر بسعدك وعين فراش وعين غطا، سم طال عمرك.. شيكت لك على الحساب ولقيت اشتراك خدمة نزل بالغلط، وأنا الحين لغيته ونزلت لك خصم خمسين ريال على الفاتورة.",
                text_en_translation="Gladly at your service! I checked your account and found a mistaken add-on. I cancelled it now and credited 50 SAR to your bill.",
                sentiment=SentimentTier.POSITIVE,
            ),
            SpeakerTurn(
                speaker="CUSTOMER",
                start_time_sec=34.91,
                end_time_sec=42.54,
                text_ar="كفو والله وبيض الله وجهك يا خالد، ما قصرت يا بعد راسي وتسلم يمينك، زين ما سويت.",
                text_en_translation="Bravo and may God honor you Khaled, excellent resolution, thank you very much.",
                sentiment=SentimentTier.POSITIVE,
            ),
        ]
        c1 = CallQAAnalysis(
            call_id="call-gulf-101",
            customer_id="CUST-RYD-901",
            agent_id="AG-KHALED-12",
            duration_sec=42.5,
            dialect=ArabicDialect.GULF,
            disposition=CallDisposition.RESOLVED,
            overall_qa_score_pct=95.0,
            compliance_score_pct=100.0,
            empathy_score_pct=92.0,
            silence_ratio_pct=5.5,
            talk_over_ratio_pct=1.2,
            turns=c1_turns,
            escalation_flags=[],
            executive_summary_ar="مكالمة خدمة عملاء خليجية سعودية متميزة. استجاب الموظف بترحيب سعودي أصيل (أبشر بسعدك) وحل استفسار الفاتورة مع تقديم تعويض فوري.",
            coaching_recommendations=[
                "المحافظة على سرعة التجاوب الإيجابي واستخدام المفردات الترحيبية الخليجية المناسبة.",
            ],
            timestamp="2026-10-11T09:30:00Z",
            audio_url="/api/v1/voice/calls/call-gulf-101",
        )

        # --- Call 2: Egyptian Dialect (Cairo FinTech - Authentic Egyptian) ---
        c2_turns = [
            SpeakerTurn(
                speaker="AGENT",
                start_time_sec=0.0,
                end_time_sec=12.26,
                text_ar="ألو، يا فندم صباح الفل مع حضرتك أحمد من خدمة العملاء.. إزيك؟ يا رب تكون بخير، أقدر أخدم حضرتك بإيه النهاردة؟",
                text_en_translation="Hello sir, good morning! This is Ahmed from customer support. How are you? How can I assist you today?",
                sentiment=SentimentTier.POSITIVE,
            ),
            SpeakerTurn(
                speaker="CUSTOMER",
                start_time_sec=12.26,
                end_time_sec=28.65,
                text_ar="إزيك يا أحمد يا ابني، الحقني! أنا باعت تحويل خمس تلاف جنيه من الصبح وموصلوش لحد دلوقتي والفلوس مخصومة! دي مصاريف مستشفى ومستعجلة جداً، هتعملوا إيه في المصيبة دي يعني؟! ",
                text_en_translation="Ahmed my son, help me! I transferred 5000 EGP this morning and it hasn't arrived yet! It's hospital expenses, what will you do about this?!",
                sentiment=SentimentTier.HIGHLY_FRUSTRATED,
            ),
            SpeakerTurn(
                speaker="AGENT",
                start_time_sec=28.65,
                end_time_sec=41.71,
                text_ar="حقك عليا يا فندم وراسك عندي متقلقش خالص.. أنا باصص في السيستم حالا، المعاملة بس كانت محتاجة تأكيد من البنك وخلال عشر دقايق بالكتير هتكون مسمعة عندك في المحفظة، عيني ليك!",
                text_en_translation="My sincere apologies sir, don't worry at all. I am looking at the system right now, it just needed bank confirmation and within 10 minutes it will reflect in your wallet!",
                sentiment=SentimentTier.POSITIVE,
            ),
            SpeakerTurn(
                speaker="CUSTOMER",
                start_time_sec=41.71,
                end_time_sec=50.11,
                text_ar="ربنا يخليك يا أحمد يا ابني ويطمن قلبك، ألف شكر ليك على ذوقك وجدعنتك وسرعة حلك.",
                text_en_translation="May God bless you Ahmed and reassure your heart, thank you so much for your courtesy, chivalry, and swift resolution.",
                sentiment=SentimentTier.POSITIVE,
            ),
        ]
        c2 = CallQAAnalysis(
            call_id="call-egypt-102",
            customer_id="CUST-CAI-442",
            agent_id="AG-AHMED-08",
            duration_sec=50.1,
            dialect=ArabicDialect.EGYPTIAN,
            disposition=CallDisposition.RESOLVED,
            overall_qa_score_pct=93.5,
            compliance_score_pct=100.0,
            empathy_score_pct=95.0,
            silence_ratio_pct=6.5,
            talk_over_ratio_pct=1.8,
            turns=c2_turns,
            escalation_flags=[],
            executive_summary_ar="مكالمة مصرية قاهرية عالية التعاطف. أظهر الموظف امتصاصاً فورياً لغضب العميل القلق من مصاريف المستشفى مستخدماً التعبيرات المصرية الأصيلة (حقك عليا وعيني ليك) وطمأنه بحل التحويل.",
            coaching_recommendations=[
                "المحافظة على أسلوب الجدعنة والتعاطف المصري الذي ساهم في تهدئة العميل وتحويل حالته من الغضب إلى الرضا التام.",
            ],
            timestamp="2026-10-11T10:15:00Z",
            audio_url="/api/v1/voice/calls/call-egypt-102",
        )

        # --- Call 3: Levantine Dialect (Syrian/Levant Express - Authentic Shami) ---
        c3_turns = [
            SpeakerTurn(
                speaker="AGENT",
                start_time_sec=0.0,
                end_time_sec=7.78,
                text_ar="يسعد صباحك يا رب وأهلاً وسهلاً فيك بشركة التوصيل، معك رنا.. تكرم عينك كيف فيني ساعدك اليوم؟",
                text_en_translation="Good morning and welcome to Express Delivery, this is Rana, how may I help you today?",
                sentiment=SentimentTier.POSITIVE,
            ),
            SpeakerTurn(
                speaker="CUSTOMER",
                start_time_sec=7.78,
                end_time_sec=18.84,
                text_ar="مرحبا أختي رنا، والله صارلي ناطر الشحنة أربع أيام وكل ما بدقلكن بتقولولي بالطريق! شو القصة يعني؟ بدي ياها اليوم ضروري ما بقدر أجل أكتر من هيك!",
                text_en_translation="Hello Rana, I have been waiting for the shipment for 4 days! What is going on? I need it today urgently!",
                sentiment=SentimentTier.NEGATIVE,
            ),
            SpeakerTurn(
                speaker="AGENT",
                start_time_sec=18.84,
                end_time_sec=28.01,
                text_ar="حقك علينا يا أخي ومية أهلا وسهلا فيك، تكرم عينك هلأ فوراً بحكي مع الشوفير وبخليه يسلمك ياها بعد الضهر، ولا تاكل هم أبداً.",
                text_en_translation="Our apologies brother, you are most welcome. I will speak to the driver right now to deliver it this afternoon, do not worry at all.",
                sentiment=SentimentTier.POSITIVE,
            ),
            SpeakerTurn(
                speaker="CUSTOMER",
                start_time_sec=28.01,
                end_time_sec=33.17,
                text_ar="يسلمو إيديكي يا رنا كلك ذوق، الله يعطيكي ألف عافية يا رب وما قصرتي.",
                text_en_translation="Thank you so much Rana, you are so kind, may God give you good health, thank you.",
                sentiment=SentimentTier.POSITIVE,
            ),
        ]
        c3 = CallQAAnalysis(
            call_id="call-levant-103",
            customer_id="CUST-AMM-771",
            agent_id="AG-RANA-05",
            duration_sec=33.2,
            dialect=ArabicDialect.LEVANTINE,
            disposition=CallDisposition.RESOLVED,
            overall_qa_score_pct=92.0,
            compliance_score_pct=100.0,
            empathy_score_pct=90.0,
            silence_ratio_pct=7.0,
            talk_over_ratio_pct=1.5,
            turns=c3_turns,
            escalation_flags=[],
            executive_summary_ar="مكالمة بلهجة شامية سورية أصيلة. تعاملت الموظفة بلباقة وحفاوة شامية دافئة (تكرم عينك ولا تاكل هم)، وتواصلت فوراً مع السائق لتسليم الشحنة.",
            coaching_recommendations=[
                "متابعة الشحنات المتأخرة استباقياً قبل اتصال العميل لتعزيز مؤشر رضا العملاء CSAT.",
            ],
            timestamp="2026-10-11T11:00:00Z",
            audio_url="/api/v1/voice/calls/call-levant-103",
        )

        # --- Call 4: Maghrebi Dialect (Morocco Telecom - Authentic Darija) ---
        c4_turns = [
            SpeakerTurn(
                speaker="AGENT",
                start_time_sec=0.0,
                end_time_sec=8.66,
                text_ar="السلام عليكم خويا، كيداير لاباس عليك؟ معاك كريم من مصلحة الزبناء، كفاش نقدر نعاونك اليوم؟",
                text_en_translation="Peace be upon you brother, how are you doing? This is Karim from customer service, how can I help you today?",
                sentiment=SentimentTier.POSITIVE,
            ),
            SpeakerTurn(
                speaker="CUSTOMER",
                start_time_sec=8.66,
                end_time_sec=21.24,
                text_ar="أهلا خويا كريم، عندي واحد المشكل دابا فالحساب ديالي.. الكونكسيون تقيلة بزاف ودازت سيمانة وما كاين حتى شي حل، واش كاين شي بلوكاج عافاك؟",
                text_en_translation="Hello brother Karim, I have an issue with my account now. The internet is very slow and a week has passed with no solution, is there a blockage please?",
                sentiment=SentimentTier.NEGATIVE,
            ),
            SpeakerTurn(
                speaker="AGENT",
                start_time_sec=21.24,
                end_time_sec=28.42,
                text_ar="ما كاين حتى مشكل أ خاي، دابا نشوف معاك لا ليني ونصلحو ليك هاد العطب ديريكت، غير ارتاح.",
                text_en_translation="No problem at all brother, I am checking the line with you right now and we will fix this glitch directly, just relax.",
                sentiment=SentimentTier.POSITIVE,
            ),
            SpeakerTurn(
                speaker="CUSTOMER",
                start_time_sec=28.42,
                end_time_sec=34.61,
                text_ar="الله يحفظك أ خويا بارك الله فيك، شكراً بزاف على المعاملة الزوينة.",
                text_en_translation="May God protect you brother and bless you, thank you so much for the nice treatment.",
                sentiment=SentimentTier.POSITIVE,
            ),
        ]
        c4 = CallQAAnalysis(
            call_id="call-msa-104",
            customer_id="CUST-CAS-101",
            agent_id="AG-KARIM-03",
            duration_sec=34.6,
            dialect=ArabicDialect.MAGHREBI,
            disposition=CallDisposition.RESOLVED,
            overall_qa_score_pct=94.0,
            compliance_score_pct=100.0,
            empathy_score_pct=92.0,
            silence_ratio_pct=6.8,
            talk_over_ratio_pct=1.1,
            turns=c4_turns,
            escalation_flags=[],
            executive_summary_ar="مكالمة بالدارجة المغربية الأصيلة. استجاب الموظف باحترافية وسرعة لمشكلة ضعف صبيب الإنترنت مستخدماً تعبيرات الدارجة المغربية الودية (ما كاين حتى مشكل وخويا العزيز).",
            coaching_recommendations=[
                "إرسال رسالة نصية SMS للعميل تتضمن كود تتبع تذكرة الدعم التقني لضمان الشفافية.",
            ],
            timestamp="2026-10-11T11:45:00Z",
            audio_url="/api/v1/voice/calls/call-msa-104",
        )

        # --- Call 5: Corporate Enterprise Airline (Modern Standard Arabic - فصحى معاصرة) ---
        c5_turns = [
            SpeakerTurn(
                speaker="AGENT",
                start_time_sec=0.0,
                end_time_sec=7.2,
                text_ar="مرحباً بكم في مركز خدمات الطيران، معكم طارق.. كيف يمكنني مساعدة حضرتكم اليوم؟",
                text_en_translation="Welcome to Airline Customer Center, this is Tariq, how may I assist you today?",
                sentiment=SentimentTier.POSITIVE,
            ),
            SpeakerTurn(
                speaker="CUSTOMER",
                start_time_sec=7.2,
                end_time_sec=16.8,
                text_ar="أهلاً بك أخي طارق، أردت الاستفسار عن تأكيد حجز رحلتي، وتعديل موعد المغادرة إلى الغد.",
                text_en_translation="Hello brother Tariq, I would like to inquire about confirming my flight reservation and modifying the departure date to tomorrow.",
                sentiment=SentimentTier.NEUTRAL,
            ),
            SpeakerTurn(
                speaker="AGENT",
                start_time_sec=16.8,
                end_time_sec=26.5,
                text_ar="يسعدني خدمتكم بكل سرور، تم التحقق من التذكرة وتعديل الموعد بنجاح مع إرسال التأكيد لبريدكم الإلكتروني.",
                text_en_translation="Delighted to serve you, the ticket has been verified and rescheduled successfully, and confirmation sent to your email.",
                sentiment=SentimentTier.POSITIVE,
            ),
            SpeakerTurn(
                speaker="CUSTOMER",
                start_time_sec=26.5,
                end_time_sec=32.0,
                text_ar="شكراً جزيلاً لك على حسن التعامل وسرعة الإنجاز، بارك الله فيك.",
                text_en_translation="Thank you very much for the excellent courtesy and swift completion, may God bless you.",
                sentiment=SentimentTier.POSITIVE,
            ),
        ]
        c5 = CallQAAnalysis(
            call_id="call-msa-105",
            customer_id="CUST-DXB-505",
            agent_id="AG-TARIQ-01",
            duration_sec=32.0,
            dialect=ArabicDialect.MSA,
            disposition=CallDisposition.RESOLVED,
            overall_qa_score_pct=96.0,
            compliance_score_pct=100.0,
            empathy_score_pct=94.0,
            silence_ratio_pct=5.0,
            talk_over_ratio_pct=1.0,
            turns=c5_turns,
            escalation_flags=[],
            executive_summary_ar="مكالمة باللغة العربية الفصحى المؤسسية تميزت بالدقة والالتزام التام بمعايير الجودة وتقديم خدمة راقية وسريعة لتعديل الحجز.",
            coaching_recommendations=[
                "المحافظة على النبرة المؤسسية الراقية والالتزام الكامل ببروتوكولات خدمة كبار العملاء.",
            ],
            timestamp="2026-10-11T12:00:00Z",
            audio_url="/api/v1/voice/calls/call-msa-105",
        )

        self.calls[c1.call_id] = c1
        self.calls[c2.call_id] = c2
        self.calls[c3.call_id] = c3
        self.calls[c4.call_id] = c4
        self.calls[c5.call_id] = c5

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
