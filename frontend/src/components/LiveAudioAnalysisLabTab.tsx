import React, { useState, useRef } from 'react';
import { runLiveAnalyze, synthesizeVoice } from '../lib/api';
import { CallQAAnalysis } from '../types/sawt';
import {
  Play,
  Pause,
  Volume2,
  Cpu,
  Sparkles,
  AlertTriangle,
  Award,
  Globe,
  FileText,
  MessageSquare,
  Scale,
} from 'lucide-react';

import { MarkdownRenderer } from './MarkdownRenderer';

interface LiveAudioAnalysisLabTabProps {
  onAnalyzeComplete: (analysis: CallQAAnalysis) => void;
  isRtl: boolean;
}

const PRESET_CONVERSATIONS = [
  {
    title: 'Saudi/Gulf Telecom (خليجي سعودي)',
    dialect: 'GULF',
    agentId: 'AG-KHALED-12',
    customerId: 'CUST-RYD-901',
    text: `الموظف: يَا هَلَا وِمِسْهَلَا وَالله، حَيَّاكِ الله بْشَرِكِةِ الاِتِّصَالَاتْ مَعَكْ خَالِدْ.. وِشْلُونْ أَقْدَرْ أَخْدِمِكْ طَالْ عُمْرِكْ؟
العميل: هَلَا وَالله أَخُويْ خَالِدْ، مَسَّاكِ الله بَالْخِيرْ.. يَا خُويْ فَاتُورَة الجَوَّالْ هَالشَّهَرْ طَالْعَة وَايِدْ مِرْتَفْعَة، وِأَبِي أَعْرِفِ السَّالْفَة، شْلُونِ انْحِسْبَتْ عَلَيَّ بَاقِةْ الفَايْفْ جِي؟
الموظف: أَبْشِرْ بْسَعْدِكْ وِعَيْنْ فْرَاشْ وِعَيْنْ غَطَا، سَمّْ طَالْ عُمْرِكْ.. شَيَّكْتْ لِكْ عَالْحِسَابْ وِلْقِيتِ اشْتِرَاكْ خِدْمَة نِزِلْ بَالْغَلَطْ، وِأَنَا الحِينْ لِغِيتَهْ وِنَزَّلْتْ لِكْ خَصِمْ خَمْسِينْ رِيَالْ عَالْفَاتُورَة.
العميل: كِفُو وَالله وِبَيَّضِ الله وِجْهِكْ يَا خَالِدْ، مَا قَصَّرْتْ يَا بَعَدْ رَاسِي وِتِسْلَمْ يِمِينِكْ، زِينْ مَا سَوِّيتْ.`,
  },
  {
    title: 'Cairo FinTech Wallet (مصري قاهري)',
    dialect: 'EGYPTIAN',
    agentId: 'AG-AHMED-08',
    customerId: 'CUST-CAI-442',
    text: `الموظف: أَلُو، يَا فَنْدِمْ صَبَاحِ الفُلّْ! مَعَ حَضْرِتَكْ أَحْمَدْ مِنْ خِدْمِةْ العُمَلَا.. إِزَّيَّكْ؟ يَا رَبّْ تْكُونْ بْخِيرْ، أَقْدَرْ أَخْدِمْ حَضْرِتَكْ بِإِيهِ النَّهَارْدَهْ؟
العميل: إِزَّيَّكْ يَا أَحْمَدْ يَا بْنِي، إِلْحَأْنِي! أَنَا بَاعِتْ تَحْوِيلْ خَمَسْتَلَافْ جِنِيهْ مِنَ الصُّبْحْ وِمَوَصَلُوشْ لِحَدْ دِلْوَأْتِي وِالفِلُوسْ مَخْصُومَة! دِي مَصَارِيفْ مُسْتَشْفَى وِمِسْتَعْجِلْ جِدًّا، هَتِعْمِلُوا إِيه فِي المُصِيبَة دِي يَعْنِي؟! 
الموظف: حَقَّكْ عَلَيَّا يَا فَنْدِمْ وِرَاسَكْ عَنْدِي مَتِئْلَقْشِ خَالِصْ.. أَنَا بَاصِصْ فِي السِّيسْتِمْ حَالاً، المُعَامَلَة بَسّْ كَانِتْ مِحْتَاجَة تَأْكِيدْ مِنَ البَنْكْ وِخِلَالْ عَشَرْ دَقَايِقْ بِالكِتِيرْ هَتْكُونْ مْسَمَّعَة عَنْدَكْ فِي المَحْفَظَة، عِينِي لِيكْ!
العميل: رَبِّنَا يِخَلِّيكْ يَا أَحْمَدْ يَا بْنِي وِيْطَمِّنْ قَلْبَكْ، أَلْفِ شُكْرْ لِيكْ عَلَى ذُوقَكْ وِجَدْعَنْتَكْ وِسُرْعِةْ حَلَّكْ.`,
  },
  {
    title: 'Damascus Express Delivery (شامي سوري)',
    dialect: 'LEVANTINE',
    agentId: 'AG-RANA-05',
    customerId: 'CUST-AMM-771',
    text: `الموظف: يِسْعَدْ صَبَاحَكْ يَا رَبّْ وِأَهْلًا وِسَهْلًا فِيكْ بْشِرْكِةْ التَّوْصِيلْ، مَعَكْ رَنَا.. تِكْرَمْ عَيْنَكْ كِيفْ فِينِي سَاعْدَكِ اليَوْمْ؟
العميل: مَرْحَبَا أُخْتِي رَنَا، وَالله صَارْلِي نَاطِرْ الشَّحْنِةْ أَرْبَعْ أَيَّامْ وِكِلْ مَا بْدِءِّلْكُنْ بِتْئُولُولِي بِالطَّرِيءْ! شُو الأِصَّة يَعْنِي؟ بِدِّي يَاهَا اليَوْمْ ضَرُورِي مَا بِئْدَرْ أَجِّلْ أَكْتَرْ مِنْ هِيكْ!
الموظف: حَقَّكْ عَلَيْنَا يَا أَخِي وِمِيِّةْ أَهْلًا وِسَهْلًا فِيكْ، تِكْرَمْ عَيْنَكْ هَلَّأْ فَوْرًا بَحْكِي مَعَ الشُّوفِيرْ وِبْخَلِّيهْ يْسَلْمَكْ يَاهَا بَعْدِ الضُّهْرْ، وَلَا تَاكُلْ هَمّْ أَبَدًا.
العميل: يِسْلَمُوا إِيدِيكِي يَا رَنَا كِلِّكْ ذُوقْ، الله يَعْطِيكِي أَلْفْ عَافْيِةْ يَا رَبّْ وِمَا قَصَّرْتِي.`,
  },
  {
    title: 'Casablanca Tech Support (مغاربي مغربي)',
    dialect: 'MAGHREBI',
    agentId: 'AG-KARIM-03',
    customerId: 'CUST-CAS-101',
    text: `الموظف: السَّلَامُ عَلَيْكُمْ خُويَا، كِيدَايِرْ لَابَاسْ عْلِيكْ؟ مْعَاكْ كَرِيمْ مِنْ مَصْلَحَةِ الزَّبَنَاءْ، كِفَاشْ نْقْدَرْ نْعَاوْنَكِ اليُومْ؟
العميل: أَهْلًا خُويَا كَرِيمْ، عَنْدِي وَاحِدْ الْمُشْكِلْ دَابَا فَالْحِسَابْ دْيَالِي.. الكُونَكْسْيُونْ تْقِيلَة بْزَّافْ وِدَازَتْ سِيمَانَة وِمَا كَايِنْ حْتَّى شِي حَلّْ، وَاشْ كَايِنْ شِي بْلُوكَاجْ عَاَفَاكْ؟
الموظف: مَا كَايِنْ حْتَّى مُشْكِلْ أَ خَايْ، دَابَا نْشُوفْ مْعَاكْ لَا لِينِي وِنْصَلْحُو لِيكْ هَادْ العَطَبْ دِيرِيكْتْ، غِيرْ اِرْتَاحْ.
العميل: الله يِحْفَظَكْ أَ خُويَا بَارَكَ الله فِيكْ، شُكْرًا بْزَّافْ عَلَى المْعَامْلَة الزْوِينَة.`,
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
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAnalysis, setLastAnalysis] = useState<CallQAAnalysis | null>(null);

  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const handleToggleSpeak = async () => {
    if (!audioTextAr.trim()) return;

    if (isSpeaking) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    try {
      const currentPreset = PRESET_CONVERSATIONS[selectedPreset];
      const lines = audioTextAr.split('\n').filter((l) => l.trim().length > 0);
      const firstTurn = lines[0] || audioTextAr;
      const isCustomer = firstTurn.startsWith('العميل:');
      const speaker = isCustomer ? 'CUSTOMER' : 'AGENT';
      const cleanText = firstTurn.replace(/^(الموظف:|العميل:)/, '').trim();
      const dialect = currentPreset?.dialect || 'GULF';

      const audioUrl = await synthesizeVoice(cleanText, dialect, speaker);
      const audio = new Audio(audioUrl);
      audioPlayerRef.current = audio;
      audio.onended = () => setIsSpeaking(false);
      audio.onerror = () => {
        fallbackSpeechSynthesis();
      };
      await audio.play();
    } catch {
      fallbackSpeechSynthesis();
    }
  };

  const fallbackSpeechSynthesis = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(audioTextAr.slice(0, 150));
      utter.lang = 'ar-SA';
      utter.onend = () => setIsSpeaking(false);
      utter.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utter);
    } else {
      setIsSpeaking(false);
    }
  };

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

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleSpeak}
              disabled={!audioTextAr.trim()}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold text-xs tracking-wide uppercase border flex items-center justify-center gap-2 transition-all ${
                isSpeaking
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/30 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              {isSpeaking ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>{isRtl ? 'إيقاف الصوت' : 'Stop Speaking'}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-indigo-400" />
                  <span>{isRtl ? 'استماع للصوت الحقيقي' : 'Listen Real Voice'}</span>
                </>
              )}
            </button>

            <button
              onClick={handleRunAnalyze}
              disabled={isAnalyzing || !audioTextAr.trim()}
              className="flex-1 py-3 px-4 rounded-xl font-semibold text-xs tracking-wide uppercase bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <Cpu className="w-4 h-4 animate-spin text-white" />
                  <span>{isRtl ? 'جارٍ التحليل...' : 'Analyzing QA...'}</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-white fill-current" />
                  <span>{isRtl ? 'تحليل وإصدار التقييم' : 'Analyze GPU QA'}</span>
                </>
              )}
            </button>
          </div>

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
            {/* AI Supervisor Coaching & Executive Summary */}
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-sans">
                  {isRtl ? 'ملخص تنفيذي للمشرف وتوجيهات الجودة' : 'Executive Arabic Coaching Memorandum (Local GPU)'}
                </h3>
              </div>
              <MarkdownRenderer
                content={[
                  lastAnalysis.executive_summary_ar,
                  lastAnalysis.coaching_recommendations.length > 0
                    ? '\n\n**توصيات تدريب الموظف:**\n' + lastAnalysis.coaching_recommendations.map((r) => `- ${r}`).join('\n')
                    : '',
                ].join('')}
                title={isRtl ? 'تقرير التقييم والتوجيه' : 'Evaluation & Coaching Report'}
                isRtl={true}
                maxInitialHeight="max-h-[350px]"
              />
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
