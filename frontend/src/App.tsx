import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { CallInspectorTab } from './components/CallInspectorTab';
import { CenterAnalyticsTab } from './components/CenterAnalyticsTab';
import { LiveAudioAnalysisLabTab } from './components/LiveAudioAnalysisLabTab';
import { fetchCalls, fetchAnalytics } from './lib/api';
import { CallQAAnalysis, ContactCenterKPIs } from './types/sawt';
import { GitCommit, Headphones, BarChart3, PlayCircle } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calls' | 'analytics' | 'lab'>('calls');
  const [calls, setCalls] = useState<CallQAAnalysis[]>([]);
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [kpis, setKpis] = useState<ContactCenterKPIs | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRtl, setIsRtl] = useState<boolean>(false);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [fetchedCalls, fetchedKPIs] = await Promise.all([
        fetchCalls(),
        fetchAnalytics(),
      ]);
      setCalls(fetchedCalls);
      setKpis(fetchedKPIs);
      if (fetchedCalls.length > 0 && !selectedCallId) {
        setSelectedCallId(fetchedCalls[0].call_id);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load Arabic speech analytics records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAnalyzeComplete = (newCall: CallQAAnalysis) => {
    setCalls((prev) => [newCall, ...prev]);
    setSelectedCallId(newCall.call_id);
    fetchAnalytics().then(setKpis).catch(() => {});
  };

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30"
    >
      {/* Sawt Header */}
      <Header
        kpis={kpis}
        isLoading={isLoading}
        onRefresh={loadData}
        isRtl={isRtl}
        onToggleRtl={() => setIsRtl(!isRtl)}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 gap-2">
          <button
            onClick={() => setActiveTab('calls')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'calls'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Headphones className="w-4 h-4" />
            {isRtl ? `تسجيلات المكالمات (${calls.length})` : `Call Diarization & QA (${calls.length})`}
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'analytics'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            {isRtl ? 'إحصائيات مركز الاتصال' : 'Contact Center Analytics'}
          </button>

          <button
            onClick={() => setActiveTab('lab')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'lab'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <PlayCircle className="w-4 h-4" />
            {isRtl ? 'المختبر الصوتي المباشر' : 'Live Arabic Speech Lab'}
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Tab Views */}
        {activeTab === 'calls' && (
          <CallInspectorTab
            calls={calls}
            selectedCallId={selectedCallId}
            onSelectCall={setSelectedCallId}
            isRtl={isRtl}
          />
        )}

        {activeTab === 'analytics' && (
          <CenterAnalyticsTab kpis={kpis} calls={calls} isRtl={isRtl} />
        )}

        {activeTab === 'lab' && (
          <LiveAudioAnalysisLabTab
            onAnalyzeComplete={handleAnalyzeComplete}
            isRtl={isRtl}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 px-6 py-4 text-center text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-mono">
          <GitCommit className="w-3.5 h-3.5 text-indigo-500" />
          <span>Sawt Production v1.0.0</span>
          <span>•</span>
          <span>Multilingual Arabic Speech QA Architecture</span>
        </div>
        <div>
          <span>Local Engine: NVIDIA RTX A5000 Laptop GPU (16GB VRAM)</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
