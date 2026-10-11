import React, { useState } from 'react';
import { runLiveAnalyze } from '../lib/api';
import { CallQAAnalysis } from '../types/sawt';
import {
  Play,
  Cpu,
  Sparkles,
  AlertTriangle,
  Award,
  Globe,
  FileText,
  MessageSquare,
  Scale,
} from 'lucide-react';

interface LiveAudioAnalysisLabTabProps {
  onAnalyzeComplete: (analysis: CallQAAnalysis) => void;
  isRtl: boolean;
}

const PRESET_CONVERSATIONS = [
  {
    title: 'Riyadh Telecom 5G (خليجي)',
    agentId: 'AG-KHALED-12',
    customerId: 'CUST-RYD-901',
    text: `الموظف: مرحباً بك في شركة الاتصالات، معك خالد، شلون أقدر أخدمك طال عمرك؟
العميل: هلا والله أخوي، عندي مشكلة وايد صعبة في سرعة النت وأبي فني يفحص الراوتر زين.
الموظف: أبشر ولا تشيل هم، رفعت لك طلب فحص فوري وسيتواصل معك الفني خلال ساعتين.
العميل: بيض الله وجهك يا خالد، ما قصرت وشكراً جزيلاً.`,
  },
  {
    title: 'Cairo FinTech Wallet (مصري)',
    agentId: 'AG-AHMED-08',
    customerId: 'CUST-CAI-442',
    text: `الموظف: أهلاً بحضرتك في خدمة الدعم المالي، معاك أحمد.
العميل: إزيك يا فندم، أنا عاوز أعرف ليه التحويل بتاعي اتأخر لحد دلوقتي؟ الفلوس مخصومة!
الموظف: بعتذر جداً لحضرتك على التأخير، راجعت المعاملة وحالياً بتتم معالجتها وهتوصل خلال نصف ساعة.
العميل: ماشي يا فندم، متشكر جداً لمساعدتك واهتمامك.`,
  },
  {
    title: 'Amman Logistics Delivery (شامي)',
    agentId: 'AG-RANA-05',
    customerId: 'CUST-AMM-771',
    text: `الموظف: يسعد صباحك من شركة الشحن، معك رنا، كيف بقدر أساعدك؟
العميل: مرحبا، شو صار بطرد الكتب؟ صارله كتير متأخر وبدي استلمه اليوم ضروري!
الموظف: تكرم عينك، تواصلت مع السائق هلأ وهو بالطريق لعندك ورح يوصل خلال 40 دقيقة.
العميل: يسلمو كتير رنا، يعطيكي ألف عافية.`,
  },
];

export const LiveAudioAnalysisLabTab: React.FC<LiveAudioAnalysisLabTabProps> = ({
  onAnalyzeComplete,
  isRtl,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<number>(0);
  const [agentId, setAgentId] = useState<string>(PRESET_CONVERSATIONS[0].agentId);
  const [customerId, setCustomerId] = useState<string>(PRESET_CONVERSATIONS[0].customerId);
  const [audioTextAr, setAudioTextAr] = useState<string>(PRESET_CONVERSATIONS[0].text);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAnalysis, setLastAnalysis] = useState<CallQAAnalysis | null>(null);

  const handleRunAnalyze = async () => {
    if (!audioTextAr.trim()) return;
    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await runLiveAnalyze({
        audio_text_ar: audioTextAr.trim(),
        agent_id: agentId,
        customer_id: customerId,
        model: 'qwen2.5:0.5b',
      });
      setLastAnalysis(result);
      onAnalyzeComplete(result);
    } catch (err: any) {
      setError(err?.message || 'Failed to analyze Arabic speech audio');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 ${isRtl ? 'dir-rtl' : ''}`}>
      {/* Left Column: Form & Dialect Transcripts */}
      <div className="lg:col-span-6 space-y-4">
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-bold text-white font-sans">
                {isRtl ? 'مختبر تحليل المحادثات الصوتية الحي' : 'Live Arabic Speech QA Lab'}
              </h2>
            </div>
            <span className="px-2 py-0.5 text-xs font-mono rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Ollama RTX A5000
            </span>
          </div>

          {/* Quick Presets */}
          <div className="mb-4">
            <span className="text-xs text-slate-400 block mb-2 font-medium">
              {isRtl ? 'نماذج محادثات بلهجات مختلفة:' : 'Dialect Audio Scenarios:'}
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESET_CONVERSATIONS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedPreset(idx);
                    setAgentId(preset.agentId);
                    setCustomerId(preset.customerId);
                    setAudioTextAr(preset.text);
                  }}
                  className={`px-2.5 py-1 text-xs rounded-lg transition-colors border ${
                    selectedPreset === idx
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                      : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700/60'
                  }`}
                >
                  {preset.title}
                </button>
              ))}
            </div>
          </div>

          {/* Metadata Row */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1 font-medium">
                Agent ID:
              </label>
              <input
                type="text"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500/50"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1 font-medium">
                Customer ID:
              </label>
              <input
                type="text"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500/50"
              />
            </div>
          </div>

          {/* Arabic Speech Transcript Textarea */}
          <div className="mb-5">
            <label className="text-xs text-slate-400 block mb-1.5 font-medium">
              {isRtl ? 'نص المحادثة المستخرج من محرك ASR:' : 'Raw Speech Recognition (ASR) Arabic Text:'}
            </label>
            <textarea
              rows={7}
              value={audioTextAr}
              onChange={(e) => setAudioTextAr(e.target.value)}
              className="w-full p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-sm font-arabic leading-relaxed text-right dir-rtl text-white focus:outline-none focus:border-indigo-500/50 resize-none"
              placeholder="اكتب أو الصق نص المحادثة باللغة العربية..."
            />
          </div>

          {/* Action Button */}
          <button
            onClick={handleRunAnalyze}
            disabled={isAnalyzing || !audioTextAr.trim()}
            className="w-full py-3 px-4 rounded-xl font-semibold text-xs tracking-wide uppercase bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <>
                <Cpu className="w-4 h-4 animate-spin text-white" />
                <span>{isRtl ? 'جارٍ تحليل اللهجة وتوليد التوجيهات...' : 'Analyzing Dialect & Generating Coaching on GPU...'}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-white fill-current" />
                <span>{isRtl ? 'تحليل المكالمة وإصدار التقييم' : 'Analyze Arabic Speech & GPU QA'}</span>
              </>
            )}
          </button>

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-start gap-2 text-xs text-rose-300">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Live Analysis Output */}
      <div className="lg:col-span-6 space-y-4">
        {lastAnalysis ? (
          <div className="space-y-4">
            {/* KPI Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-0.5">Dialect Detected</span>
                <div className="font-sans font-bold text-indigo-400 text-sm">
                  {lastAnalysis.dialect}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-0.5">QA Score</span>
                <div
                  className={`font-mono font-bold text-base ${
                    lastAnalysis.overall_qa_score_pct >= 85
                      ? 'text-emerald-400'
                      : 'text-amber-400'
                  }`}
                >
                  {lastAnalysis.overall_qa_score_pct}%
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-0.5">Disposition</span>
                <div className="font-mono font-semibold text-slate-200 text-xs">
                  {lastAnalysis.disposition.replace('_', ' ')}
                </div>
              </div>
            </div>

            {/* Compliance & Empathy Meters */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Compliance Protocol:</span>
                  <span className="font-mono text-emerald-400">
                    {lastAnalysis.compliance_score_pct}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    style={{ width: `${lastAnalysis.compliance_score_pct}%` }}
                    className="h-full rounded-full bg-emerald-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Customer Empathy:</span>
                  <span className="font-mono text-cyan-400">
                    {lastAnalysis.empathy_score_pct}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    style={{ width: `${lastAnalysis.empathy_score_pct}%` }}
                    className="h-full rounded-full bg-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* GPU Synthesized Executive Coaching Memorandum */}
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-sans">
                  {isRtl ? 'ملخص تنفيذي للمشرف (qwen2.5:0.5b)' : 'Executive Arabic Coaching Memorandum (Local GPU)'}
                </h3>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-arabic text-right dir-rtl mb-3">
                {lastAnalysis.executive_summary_ar}
              </p>

              {lastAnalysis.coaching_recommendations.length > 0 && (
                <div className="pt-2 border-t border-slate-800 space-y-1.5">
                  <span className="text-[11px] font-semibold text-indigo-400 block">
                    توصيات تدريب الموظف:
                  </span>
                  {lastAnalysis.coaching_recommendations.map((rec, i) => (
                    <div key={i} className="text-xs text-slate-300 text-right dir-rtl font-arabic">
                      &bull; {rec}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-12 text-center rounded-xl bg-slate-900 border border-slate-800 text-slate-500 space-y-3">
            <Globe className="w-10 h-10 text-slate-700 mx-auto" />
            <p className="text-xs">
              {isRtl
                ? 'قم بتنفيذ تحليل لمحادثة عربية لاستخراج اللهجة وتقييم الامتثال وإصدار توجيهات الجودة عبر المعالج المحلي.'
                : 'Execute an Arabic speech evaluation to detect regional dialect, compute QA metrics, and generate coaching on the local GPU.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
