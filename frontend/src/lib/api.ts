import { CallQAAnalysis, ContactCenterKPIs, LiveAnalyzeRequest } from '../types/sawt';

const BASE_URL = '/api/v1';

export async function fetchCalls(): Promise<CallQAAnalysis[]> {
  const res = await fetch(`${BASE_URL}/calls`);
  if (!res.ok) {
    throw new Error(`Failed to fetch call records: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchCall(id: string): Promise<CallQAAnalysis> {
  const res = await fetch(`${BASE_URL}/calls/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch call ${id}: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchAnalytics(): Promise<ContactCenterKPIs> {
  const res = await fetch(`${BASE_URL}/analytics`);
  if (!res.ok) {
    throw new Error(`Failed to fetch contact center KPIs: ${res.statusText}`);
  }
  return res.json();
}

export async function runLiveAnalyze(payload: LiveAnalyzeRequest): Promise<CallQAAnalysis> {
  const res = await fetch(`${BASE_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    const message = errorBody?.detail?.detail || errorBody?.detail || res.statusText;
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }
  return res.json();
}

export async function fetchVoiceSamples() {
  const res = await fetch(`${BASE_URL}/voice/samples`);
  if (!res.ok) {
    throw new Error(`Failed to fetch voice samples: ${res.statusText}`);
  }
  return res.json();
}

export async function uploadSampleToProject(sampleId: string) {
  const res = await fetch(`${BASE_URL}/voice/samples/${sampleId}/upload-to-project`, {
    method: 'POST',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to upload sample to project');
  }
  return res.json();
}

export async function synthesizeVoice(text: string, dialect = 'MSA', speaker = 'AGENT') {
  const res = await fetch(`${BASE_URL}/voice/synthesize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, dialect, speaker }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Voice synthesis failed');
  }
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}
