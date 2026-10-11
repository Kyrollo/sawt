import React, { useState } from 'react';
import {
  CallQAAnalysis,
  ArabicDialect,
  CallDisposition,
  SentimentTier,
} from '../types/sawt';
import {
  Play,
  Pause,
  Award,
  Clock,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  User,
  Headphones,
  FileText,
  Volume2,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

interface CallInspectorTabProps {
  calls: CallQAAnalysis[];
  selectedCallId: string | null;
  onSelectCall: (id: string) => void;
  isRtl: boolean;
}

export const CallInspectorTab: React.FC<CallInspectorTabProps> = ({
  calls,
  selectedCallId,
  onSelectCall,
  isRtl,
}) => {
  const [filterDialect, setFilterDialect] = useState<string>('ALL');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showTranslations, setShowTranslations] = useState<boolean>(false);

  const filteredCalls = calls.filter((c) => {
    if (filterDialect === 'ALL') return true;
    return c.dialect === filterDialect;
  });

  const activeCall = calls.find((c) => c.call_id === selectedCallId) || calls[0];

  const getDialectLabel = (dialect: ArabicDialect) => {
    switch (dialect) {
      case 'GULF':
        return { en: 'Gulf Arabic', ar: 'لهجة خليجية' };
      case 'EGYPTIAN':
        return { en: 'Egyptian Arabic', ar: 'لهجة مصرية' };
      case 'LEVANTINE':
        return { en: 'Levantine Arabic', ar: 'لهجة شامية' };
      case 'MAGHREBI':
        return { en: 'Maghrebi Arabic', ar: 'لهجة مغاربية' };
      case 'MSA':
        return { en: 'Modern Standard (MSA)', ar: 'فصحى حديثة' };
    }
  };

  const getSentimentBadge = (sentiment: SentimentTier) => {
    switch (sentiment) {
      case 'POSITIVE':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'NEUTRAL':
        return 'bg-slate-700/50 text-slate-300 border-slate-600/50';
      case 'NEGATIVE':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'HIGHLY_FRUSTRATED':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    }
  };

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 ${isRtl ? 'dir-rtl' : ''}`}>
      {/* Left Column: Call Selection Queue */}
      <div className="lg:col-span-4 space-y-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-200">
              {isRtl ? 'سجل المكالمات المسجلة' : 'Recorded Call QA Stream'}
            </h3>
            <span className="text-xs text-slate-500">{filteredCalls.length} calls</span>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {['ALL', 'GULF', 'EGYPTIAN', 'LEVANTINE', 'MSA'].map((dl) => (
              <button
                key={dl}
                onClick={() => setFilterDialect(dl)}
                className={`px-2 py-1 text-[11px] rounded-lg font-medium transition-colors ${
                  filterDialect === dl
                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                {dl === 'ALL' ? (isRtl ? 'الكل' : 'All') : dl}
              </button>
            ))}
          </div>

          {/* Call List */}
          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {filteredCalls.map((call) => {
              const isSelected = activeCall?.call_id === call.call_id;
              const dialectInfo = getDialectLabel(call.dialect);

              return (
                <div
                  key={call.call_id}
                  onClick={() => onSelectCall(call.call_id)}
                  className={`p-3 rounded-lg cursor-pointer transition-all border text-left ${
                    isSelected
                      ? 'bg-slate-800 border-indigo-500/50 shadow-md shadow-indigo-500/5'
                      : 'bg-slate-900/60 hover:bg-slate-800/40 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs text-slate-300 font-medium">
                      {call.call_id}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono font-bold text-slate-200">
                        {call.overall_qa_score_pct}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-200">
                      {isRtl ? dialectInfo.ar : dialectInfo.en}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {call.duration_sec}s
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">
                      Agent: {call.agent_id}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        call.disposition === 'RESOLVED'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-amber-500/10 text-amber-400'
                      }`}
                    >
                      {call.disposition.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Column: Interactive Diarization & QA Scorecard */}
      <div className="lg:col-span-8 space-y-4">
        {activeCall ? (
          <>
            {/* Call Header Banner */}
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-indigo-400 font-semibold">
                      CALL: {activeCall.call_id}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded uppercase bg-indigo-500/20 text-indigo-400">
                      {getDialectLabel(activeCall.dialect).ar} • {getDialectLabel(activeCall.dialect).en}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-white">
                    Agent {activeCall.agent_id} &bull; Customer {activeCall.customer_id}
                  </h2>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-500 block uppercase font-sans">QA Score</span>
                    <span
                      className={`text-base font-bold ${
                        activeCall.overall_qa_score_pct >= 85
                          ? 'text-emerald-400'
                          : activeCall.overall_qa_score_pct >= 65
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {activeCall.overall_qa_score_pct}%
                    </span>
                  </div>

                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-500 block uppercase font-sans">Compliance</span>
                    <span className="text-base font-bold text-slate-200">
                      {activeCall.compliance_score_pct}%
                    </span>
                  </div>

                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-500 block uppercase font-sans">Empathy</span>
                    <span className="text-base font-bold text-cyan-400">
                      {activeCall.empathy_score_pct}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Audio Waveform Player Bar */}
              <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 mb-4 flex items-center gap-4">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-9 h-9 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shrink-0 transition-colors shadow-lg shadow-indigo-600/30"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>

                <div className="flex-1">
                  <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                    <span>0:00</span>
                    <div className="flex items-center gap-1.5 text-indigo-400 text-xs">
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>48kHz Dual-Channel Audio</span>
                    </div>
                    <span>0:{Math.round(activeCall.duration_sec)}</span>
                  </div>

                  {/* Waveform Visualization Bars */}
                  <div className="h-6 flex items-center gap-1">
                    {[30, 45, 80, 60, 20, 75, 90, 40, 65, 85, 30, 95, 60, 40, 80, 50, 70, 35, 90, 45, 20, 65, 80, 40, 55].map(
                      (h, i) => (
                        <div
                          key={i}
                          style={{ height: `${h}%` }}
                          className={`flex-1 rounded-full transition-all ${
                            isPlaying && i % 3 === 0
                              ? 'bg-indigo-400 animate-pulse'
                              : 'bg-slate-700/60'
                          }`}
                        />
                      )
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setShowTranslations(!showTranslations)}
                  className={`px-2.5 py-1.5 text-xs rounded-lg border font-medium transition-colors shrink-0 ${
                    showTranslations
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {showTranslations ? 'Hide English' : 'Show English'}
                </button>
              </div>

              {/* Diarized Arabic Transcript */}
              <div className="space-y-3 mb-5 max-h-[380px] overflow-y-auto pr-1">
                {activeCall.turns.map((turn, idx) => {
                  const isAgent = turn.speaker === 'AGENT';
                  return (
                    <div
                      key={idx}
                      className={`flex gap-3 text-xs ${
                        isAgent ? 'flex-row' : 'flex-row-reverse'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          isAgent
                            ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {isAgent ? (
                          <Headphones className="w-3.5 h-3.5" />
                        ) : (
                          <User className="w-3.5 h-3.5" />
                        )}
                      </div>

                      <div
                        className={`max-w-[80%] p-3.5 rounded-xl border ${
                          isAgent
                            ? 'bg-indigo-950/20 border-indigo-500/30 text-slate-200'
                            : 'bg-slate-900 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 mb-1.5 text-[11px]">
                          <span className="font-semibold text-slate-300">
                            {isAgent ? 'الموظف (Agent)' : 'العميل (Customer)'}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-500">
                              {turn.start_time_sec}s - {turn.end_time_sec}s
                            </span>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[10px] font-semibold border ${getSentimentBadge(
                                turn.sentiment
                              )}`}
                            >
                              {turn.sentiment}
                            </span>
                          </div>
                        </div>

                        {/* Arabic Transcript Body */}
                        <p className="text-sm font-sans leading-relaxed text-right dir-rtl font-arabic text-white mb-1">
                          {turn.text_ar}
                        </p>

                        {/* Optional English Translation */}
                        {showTranslations && (
                          <p className="text-xs text-slate-400 italic font-sans mt-1 pt-1 border-t border-slate-800/80">
                            {turn.text_en_translation}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* AI Supervisor Coaching & Executive Summary */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                    ملخص تنفيذي للمشرف وتوجيهات الجودة (Executive Coaching)
                  </h3>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed font-arabic text-right dir-rtl mb-3">
                  {activeCall.executive_summary_ar}
                </p>

                {activeCall.coaching_recommendations.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-900">
                    <span className="text-[11px] font-semibold text-indigo-400 block">
                      توصيات تدريبية للموظف:
                    </span>
                    {activeCall.coaching_recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-300 text-right dir-rtl font-arabic">
                        <span className="text-indigo-400 font-bold">&bull;</span>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="p-12 text-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
            No call selected
          </div>
        )}
      </div>
    </div>
  );
};
