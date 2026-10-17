import React from 'react';
import { Mic, Award, Clock, CheckCircle2, Cpu, RefreshCw, Languages } from 'lucide-react';
import { ContactCenterKPIs } from '../types/sawt';

interface HeaderProps {
  kpis: ContactCenterKPIs | null;
  isLoading: boolean;
  onRefresh: () => void;
  isRtl: boolean;
  onToggleRtl: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  kpis,
  isLoading,
  onRefresh,
  isRtl,
  onToggleRtl,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50 px-6 py-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-700 text-white shadow-lg shadow-indigo-500/20">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white font-sans">
                Sawt <span className="text-indigo-400 font-arabic">صوت</span>
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                Arabic Speech QA
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Multilingual Speech Analytics, Dialect Identification &amp; Contact Center QA Scorecards
            </p>
          </div>
        </div>

        {/* Real-time KPI Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <Award className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400">Avg QA Score:</span>
            <span className="font-semibold text-slate-200">
              {kpis ? `${kpis.avg_qa_score}%` : '—'}
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Avg Handle Time:</span>
            <span className="font-semibold text-slate-200">
              {kpis ? `${kpis.avg_handle_time_sec}s` : '—'}
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">FCR Rate:</span>
            <span className="font-semibold text-emerald-400">
              {kpis ? `${kpis.first_call_resolution_pct}%` : '—'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-emerald-500/30 text-xs text-emerald-400">
            <Cpu className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dedicated NVIDIA GPU</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>

          {/* RTL / LTR Toggle */}
          <button
            onClick={onToggleRtl}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
            title="Toggle RTL / LTR Layout"
          >
            <Languages className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isRtl ? 'RTL عربي' : 'LTR EN'}</span>
          </button>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors disabled:opacity-50"
            title="Refresh Speech Analytics"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
