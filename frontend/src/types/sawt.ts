export type ArabicDialect = 'GULF' | 'EGYPTIAN' | 'LEVANTINE' | 'MAGHREBI' | 'MSA';

export type CallDisposition =
  | 'RESOLVED'
  | 'ESCALATED_TO_TIER2'
  | 'CHURN_RISK'
  | 'COMPLIANCE_BREACH'
  | 'FOLLOW_UP_REQUIRED';

export type SentimentTier = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'HIGHLY_FRUSTRATED';

export interface SpeakerTurn {
  speaker: string; // "AGENT" or "CUSTOMER"
  start_time_sec: number;
  end_time_sec: number;
  text_ar: string;
  text_en_translation: string;
  sentiment: SentimentTier;
  confidence: number;
  acoustic_pitch_hz: number;
  audio_url?: string;
}

export interface CallQAAnalysis {
  call_id: string;
  customer_id: string;
  agent_id: string;
  duration_sec: number;
  dialect: ArabicDialect;
  disposition: CallDisposition;
  overall_qa_score_pct: number;
  compliance_score_pct: number;
  empathy_score_pct: number;
  silence_ratio_pct: number;
  talk_over_ratio_pct: number;
  turns: SpeakerTurn[];
  escalation_flags: string[];
  executive_summary_ar: string;
  coaching_recommendations: string[];
  timestamp: string;
  audio_url?: string;
}

export interface VoiceSample {
  id: string;
  filename: string;
  mp3_filename: string;
  title: string;
  dialect: ArabicDialect;
  duration_sec: number;
  size_kb: number;
  agent: string;
  customer: string;
  description: string;
  sample_text: string;
  download_wav_url: string;
  download_mp3_url: string;
  stream_mp3_url: string;
}

export interface ContactCenterKPIs {
  total_calls_analyzed: number;
  avg_qa_score: number;
  avg_handle_time_sec: number;
  first_call_resolution_pct: number;
  escalation_rate_pct: number;
  dialect_distribution: Record<string, number>;
}

export interface LiveAnalyzeRequest {
  audio_text_ar: string;
  agent_id?: string;
  customer_id?: string;
  model?: string;
}
