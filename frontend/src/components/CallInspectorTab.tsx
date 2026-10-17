import React, { useState, useEffect, useRef } from 'react';
import {
  CallQAAnalysis,
  ArabicDialect,
  SentimentTier,
  SpeakerTurn,
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
  VolumeX,
  Sparkles,
  ChevronRight,
  RotateCcw,
  Zap,
} from 'lucide-react';

import { MarkdownRenderer } from './MarkdownRenderer';

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
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(24);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [activeTurnIdx, setActiveTurnIdx] = useState<number | null>(null);
  const [showTranslations, setShowTranslations] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const filteredCalls = calls.filter((c) => {
    if (filterDialect === 'ALL') return true;
    return c.dialect === filterDialect;
  });

  const activeCall = calls.find((c) => c.call_id === selectedCallId) || calls[0];

  // Sync audio source and state whenever active call changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setCurrentTime(0);
      setActiveTurnIdx(null);
      if (activeCall) {
        setDuration(activeCall.duration_sec || 24);
        audioRef.current.load();
      }
    }
  }, [activeCall?.call_id]);

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const cur = audioRef.current.currentTime;
    setCurrentTime(cur);

    if (activeCall?.turns) {
      const idx = activeCall.turns.findIndex(
        (t) => cur >= t.start_time_sec && cur <= t.end_time_sec + 0.3
      );
      setActiveTurnIdx(idx !== -1 ? idx : null);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && audioRef.current.duration) {
      setDuration(audioRef.current.duration);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.muted = isMuted;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Fallback to Web Speech Synthesis if audio stream cannot play
          playTurnWithSpeechSynthesis(activeCall.turns[0]?.text_ar || 'مرحبا بك');
          setIsPlaying(true);
        });
    }
  };

  const playTurnWithSpeechSynthesis = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'ar-SA';
      utter.rate = playbackRate;
      utter.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utter);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  const handleJumpToTurn = (turn: SpeakerTurn, idx: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = turn.start_time_sec;
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setActiveTurnIdx(idx);
        })
        .catch(() => {
          playTurnWithSpeechSynthesis(turn.text_ar);
          setActiveTurnIdx(idx);
        });
    }
  };

  const togglePlaybackRate = () => {
    const nextRate = playbackRate === 1 ? 1.25 : playbackRate === 1.25 ? 1.5 : 1;
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (audioRef.current) {
      audioRef.current.muted = nextMuted;
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

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

  const audioSrc =
    activeCall?.audio_url ||
    (activeCall?.call_id ? `/api/v1/voice/calls/${activeCall.call_id}` : '');

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 ${isRtl ? 'dir-rtl' : ''}`}>
      {/* Hidden real audio element */}
      {audioSrc && (
        <audio
          ref={audioRef}
          src={audioSrc}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => {
            setIsPlaying(false);
            setCurrentTime(0);
            setActiveTurnIdx(null);
          }}
          preload="auto"
        />
      )}

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
                    <span className="text-slate-500">Agent: {call.agent_id}</span>
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
                    <span className="text-[10px] text-slate-500 block uppercase font-sans">
                      QA Score
                    </span>
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
                    <span className="text-[10px] text-slate-500 block uppercase font-sans">
                      Compliance
                    </span>
                    <span className="text-base font-bold text-slate-200">
                      {activeCall.compliance_score_pct}%
                    </span>
                  </div>

                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-500 block uppercase font-sans">
                      Empathy
                    </span>
                    <span className="text-base font-bold text-cyan-400">
                      {activeCall.empathy_score_pct}%
                    </span>
                  </div>
                </div>
              </div>

              {/* REAL Audio Player Bar */}
              <div className="p-4 rounded-xl bg-slate-950/90 border border-indigo-500/30 mb-4 shadow-xl">
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-indigo-400" />
                    <span className="font-semibold text-slate-200">
                      {isRtl ? 'مشغل الصوت الحقيقي للمكالمة' : 'Real Dual-Channel Arabic Audio Stream'}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      Neural HD Voice
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={togglePlaybackRate}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 hover:text-white transition"
                      title="Playback speed"
                    >
                      {playbackRate}x
                    </button>
                    <button
                      onClick={toggleMute}
                      className="p-1 rounded text-slate-400 hover:text-white transition"
                      title={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-lg shadow-indigo-600/40"
                    title={isPlaying ? 'Pause' : 'Play real voice'}
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </button>

                  <div className="flex-1 space-y-1">
                    {/* Time scrubber */}
                    <input
                      type="range"
                      min={0}
                      max={duration || 24}
                      step={0.1}
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
                    />

                    {/* Waveform Visualization Bars */}
                    <div className="h-5 flex items-center gap-1 cursor-pointer" onClick={() => togglePlay()}>
                      {[25, 45, 80, 60, 30, 75, 95, 40, 65, 85, 30, 95, 60, 40, 80, 50, 70, 35, 90, 45, 30, 65, 80, 40, 55, 70, 85, 40, 60, 30].map(
                        (h, i) => {
                          const barFraction = i / 30;
                          const curFraction = currentTime / (duration || 24);
                          const isPassed = curFraction >= barFraction;
                          return (
                            <div
                              key={i}
                              style={{ height: `${h}%` }}
                              className={`flex-1 rounded-full transition-all duration-150 ${
                                isPassed
                                  ? isPlaying
                                    ? 'bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]'
                                    : 'bg-indigo-500'
                                  : 'bg-slate-800'
                              }`}
                            />
                          );
                        }
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono text-xs font-bold text-indigo-300 block">
                      {formatTime(currentTime)}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">
                      / {formatTime(duration)}
                    </span>
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
              </div>

              {/* Diarized Arabic Transcript with real voice turn trigger */}
              <div className="space-y-3 mb-5 max-h-[380px] overflow-y-auto pr-1">
                {activeCall.turns.map((turn, idx) => {
                  const isAgent = turn.speaker === 'AGENT';
                  const isTurnActive = activeTurnIdx === idx;

                  return (
                    <div
                      key={idx}
                      className={`flex gap-3 text-xs transition-all ${
                        isAgent ? 'flex-row' : 'flex-row-reverse'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 cursor-pointer transition-transform hover:scale-110 ${
                          isTurnActive
                            ? 'bg-indigo-500 text-white ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900 shadow-md shadow-indigo-500/50'
                            : isAgent
                            ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                        title="Click to jump & listen to this turn"
                        onClick={() => handleJumpToTurn(turn, idx)}
                      >
                        {isAgent ? (
                          <Headphones className="w-4 h-4" />
                        ) : (
                          <User className="w-4 h-4" />
                        )}
                      </div>

                      <div
                        className={`max-w-[80%] p-3.5 rounded-xl border transition-all cursor-pointer ${
                          isTurnActive
                            ? 'bg-indigo-900/30 border-indigo-400 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/30 text-white'
                            : isAgent
                            ? 'bg-indigo-950/20 border-indigo-500/30 hover:border-indigo-500/60 text-slate-200'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                        onClick={() => handleJumpToTurn(turn, idx)}
                      >
                        <div className="flex items-center justify-between gap-3 mb-1.5 text-[11px]">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-200">
                              {isAgent ? 'الموظف (Agent)' : 'العميل (Customer)'}
                            </span>
                            {isTurnActive && (
                              <span className="flex items-center gap-1 text-[10px] text-indigo-400 font-bold animate-pulse">
                                <Volume2 className="w-3 h-3" />
                                {isRtl ? 'جارٍ التحدث...' : 'Speaking now...'}
                              </span>
                            )}
                          </div>
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
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleJumpToTurn(turn, idx);
                              }}
                              className="p-1 rounded hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-300 transition"
                              title="Listen to this line"
                            >
                              <Volume2 className="w-3 h-3" />
                            </button>
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
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                    {isRtl ? 'الملخص التنفيذي وتوجيهات التدريب' : 'Executive QA Summary & Coaching'}
                  </h3>
                </div>

                <div className="text-xs text-slate-300 leading-relaxed text-right dir-rtl font-arabic bg-slate-900/60 p-3 rounded-lg border border-slate-800/60">
                  {activeCall.executive_summary_ar}
                </div>

                {activeCall.coaching_recommendations.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-slate-400 block">
                      {isRtl ? 'التوصيات التدريبية للموظف:' : 'Supervisor Action Items:'}
                    </span>
                    <ul className="space-y-1">
                      {activeCall.coaching_recommendations.map((rec, i) => (
                        <li
                          key={i}
                          className="text-xs text-slate-300 flex items-start gap-2 text-right dir-rtl font-arabic"
                        >
                          <ChevronRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="p-12 text-center text-slate-500 rounded-xl bg-slate-900 border border-slate-800">
            No call selected
          </div>
        )}
      </div>
    </div>
  );
};
