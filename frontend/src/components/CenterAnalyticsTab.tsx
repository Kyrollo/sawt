import React from 'react';
import { ContactCenterKPIs, CallQAAnalysis } from '../types/sawt';
import {
  Award,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Globe,
  PieChart,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

interface CenterAnalyticsTabProps {
  kpis: ContactCenterKPIs | null;
  calls: CallQAAnalysis[];
  isRtl: boolean;
}

export const CenterAnalyticsTab: React.FC<CenterAnalyticsTabProps> = ({
  kpis,
  calls,
  isRtl,
}) => {
  if (!kpis) {
    return (
      <div className="p-12 text-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
        Loading Contact Center Analytics...
      </div>
    );
  }

  const dialectLabels: Record<string, { en: string; ar: string; color: string }> = {
    GULF: { en: 'Gulf (خليجي)', ar: 'اللهجة الخليجية', color: 'bg-indigo-500' },
    EGYPTIAN: { en: 'Egyptian (مصري)', ar: 'اللهجة المصرية', color: 'bg-amber-500' },
    LEVANTINE: { en: 'Levantine (شامي)', ar: 'اللهجة الشامية', color: 'bg-emerald-500' },
    MSA: { en: 'Modern Standard (فصحى)', ar: 'الفصحى الحديثة', color: 'bg-cyan-500' },
    MAGHREBI: { en: 'Maghrebi (مغاربي)', ar: 'اللهجة المغاربية', color: 'bg-purple-500' },
  };

  return (
    <div className={`space-y-6 ${isRtl ? 'dir-rtl' : ''}`}>
      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Total Audited Calls</span>
            <Award className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {kpis.total_calls_analyzed}
            </span>
            <span className="text-xs text-slate-400">conversations</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Automated speech QA evaluation
          </p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Average QA Score</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {kpis.avg_qa_score}%
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Across compliance &amp; empathy metrics
          </p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Avg Handle Time (AHT)</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-400">
              {kpis.avg_handle_time_sec}s
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Duration per resolved interaction
          </p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">First Call Resolution (FCR)</span>
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-cyan-400">
              {kpis.first_call_resolution_pct}%
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Resolved on initial customer contact
          </p>
        </div>
      </div>

      {/* Regional Dialect Distribution & Agent Scorecard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dialect Distribution */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">
              {isRtl ? 'توزيع اللهجات العربية للمتصلين' : 'Regional Arabic Dialect Footprint'}
            </h3>
          </div>

          <div className="space-y-3">
            {Object.entries(kpis.dialect_distribution).map(([dialect, count]) => {
              const info = dialectLabels[dialect] || {
                en: dialect,
                ar: dialect,
                color: 'bg-indigo-500',
              };
              const total = Math.max(1, kpis.total_calls_analyzed);
              const pct = (count / total) * 100;

              return (
                <div key={dialect} className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between mb-2 text-xs">
                    <span className="text-slate-200 font-medium font-arabic">
                      {isRtl ? info.ar : info.en}
                    </span>
                    <span className="font-mono text-slate-400">
                      {count} calls ({pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full rounded-full ${info.color}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Agent Quality Summary */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <UserCheck className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">
              {isRtl ? 'سجل تقييم أداء موظفي خدمة العملاء' : 'Agent QA Performance Register'}
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500">
                  <th className="pb-2 font-medium">Agent ID</th>
                  <th className="pb-2 font-medium">Dialect Handled</th>
                  <th className="pb-2 text-right font-medium">Compliance</th>
                  <th className="pb-2 text-right font-medium">QA Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                {calls.map((c) => (
                  <tr key={c.call_id}>
                    <td className="py-2.5 font-sans font-medium text-slate-200">
                      {c.agent_id}
                    </td>
                    <td className="py-2.5 text-slate-400 font-sans">
                      {dialectLabels[c.dialect]?.en || c.dialect}
                    </td>
                    <td className="py-2.5 text-right font-bold text-slate-200">
                      {c.compliance_score_pct}%
                    </td>
                    <td
                      className={`py-2.5 text-right font-bold ${
                        c.overall_qa_score_pct >= 85
                          ? 'text-emerald-400'
                          : c.overall_qa_score_pct >= 65
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {c.overall_qa_score_pct}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
