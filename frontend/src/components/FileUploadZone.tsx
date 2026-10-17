import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  FileAudio,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Play,
  Pause,
  RefreshCw,
  Download,
  Sparkles,
  ExternalLink,
  Volume2,
  Check,
  Headphones,
} from 'lucide-react';
import { fetchVoiceSamples, uploadSampleToProject } from '../lib/api';
import { VoiceSample } from '../types/sawt';

interface UploadedFile {
  id: string;
  filename: string;
  size_bytes: number;
  content_type: string;
  uploaded_at: string;
  processed: boolean;
  audio_stream_url?: string;
  call_id?: string;
  details?: Record<string, any>;
}

interface FileUploadZoneProps {
  title?: string;
  acceptedTypes?: string;
  isRtl?: boolean;
  onCallCreated?: (callId: string) => void;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  title = 'Contact Center Call Recordings & Transcripts Ingestion',
  acceptedTypes = '.wav,.mp3,.m4a,.ogg,.txt,.srt,.vtt,.json,.csv',
  isRtl = false,
  onCallCreated,
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [voiceSamples, setVoiceSamples] = useState<VoiceSample[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [uploadingSampleId, setUploadingSampleId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const sampleAudioRef = useRef<HTMLAudioElement | null>(null);
  const fileAudioRef = useRef<HTMLAudioElement | null>(null);

  const fetchFiles = async () => {
    try {
      const res = await fetch('/api/v1/files');
      if (res.ok) {
        const data = await res.json();
        setFiles(data);
      }
    } catch {
      // Backend offline or error
    }
  };

  const loadSamples = async () => {
    try {
      const data = await fetchVoiceSamples();
      setVoiceSamples(data);
    } catch {
      // Ignore if offline
    }
  };

  useEffect(() => {
    fetchFiles();
    loadSamples();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setIsUploading(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const formData = new FormData();
        formData.append('file', selectedFiles[i]);

        const res = await fetch('/api/v1/files/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || 'Upload failed');
        }
      }
      setStatusMessage(
        isRtl
          ? `تم رفع ${selectedFiles.length} ملف صوتي بنجاح إلى المشروع.`
          : `Successfully uploaded ${selectedFiles.length} audio file(s) to project.`
      );
      await fetchFiles();
    } catch (err: any) {
      setErrorMessage(err.message || 'File upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUploadSample = async (sample: VoiceSample) => {
    setUploadingSampleId(sample.id);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const uploaded = await uploadSampleToProject(sample.id);
      setStatusMessage(
        isRtl
          ? `تم رفع الملف الصوتي التجريبي "${sample.filename}" إلى المشروع بنجاح! انقر على "معالجة وتحليل الصوت" لبدء الاستماع واستخراج التقييم.`
          : `Test audio "${sample.filename}" successfully loaded into project! Click "Process & Diarize" to analyze.`
      );
      await fetchFiles();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to upload test voice sample');
    } finally {
      setUploadingSampleId(null);
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      const res = await fetch(`/api/v1/files/${fileId}`, { method: 'DELETE' });
      if (res.ok) {
        setFiles((prev) => prev.filter((f) => f.id !== fileId));
        if (playingAudioId === fileId && fileAudioRef.current) {
          fileAudioRef.current.pause();
          setPlayingAudioId(null);
        }
      }
    } catch {
      // error handling
    }
  };

  const handleProcess = async (fileId: string) => {
    setProcessingId(fileId);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/v1/files/${fileId}/process`, {
        method: 'POST',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Processing failed');
      }
      const data = await res.json();
      setStatusMessage(
        isRtl
          ? `تمت معالجة "${data.filename}" بنجاح! لهجة: ${data.dialect}، نسبة الجودة: ${data.overall_qa_score_pct}%`
          : `Processed "${data.filename}" successfully! Dialect: ${data.dialect}, QA: ${data.overall_qa_score_pct}%`
      );
      await fetchFiles();
      if (data.call_id && onCallCreated) {
        onCallCreated(data.call_id);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'File processing failed');
    } finally {
      setProcessingId(null);
    }
  };

  const togglePlaySample = (sample: VoiceSample) => {
    if (playingAudioId === sample.id) {
      if (sampleAudioRef.current) {
        sampleAudioRef.current.pause();
      }
      setPlayingAudioId(null);
      return;
    }

    if (sampleAudioRef.current) {
      sampleAudioRef.current.pause();
    }

    const audioUrl = sample.stream_mp3_url || `/api/v1/voice/samples/${sample.filename}/download`;
    const audio = new Audio(audioUrl);
    sampleAudioRef.current = audio;

    audio.onended = () => setPlayingAudioId(null);
    audio.onerror = () => setPlayingAudioId(null);
    audio
      .play()
      .then(() => setPlayingAudioId(sample.id))
      .catch(() => setPlayingAudioId(null));
  };

  const togglePlayUploadedFile = (file: UploadedFile) => {
    if (playingAudioId === file.id) {
      if (fileAudioRef.current) {
        fileAudioRef.current.pause();
      }
      setPlayingAudioId(null);
      return;
    }

    if (fileAudioRef.current) {
      fileAudioRef.current.pause();
    }

    const audioUrl = file.audio_stream_url || `/api/v1/files/${file.id}/stream`;
    const audio = new Audio(audioUrl);
    fileAudioRef.current = audio;

    audio.onended = () => setPlayingAudioId(null);
    audio.onerror = () => setPlayingAudioId(null);
    audio
      .play()
      .then(() => setPlayingAudioId(file.id))
      .catch(() => setPlayingAudioId(null));
  };

  return (
    <div className={`space-y-6 ${isRtl ? 'dir-rtl' : ''}`}>
      {/* SECTION 1: Test Sound Voice Samples for Instant Upload & Testing */}
      <div className="rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900/90 p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Headphones className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white font-sans">
                {isRtl
                  ? 'عينات صوتية حقيقية لاختبار الرفع المباشر'
                  : 'Authentic Arabic Speech Audio Test Samples'}
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                Real Neural Voices
              </span>
            </div>
            <p className="text-xs text-slate-300">
              {isRtl
                ? 'استمع إلى التسجيلات الصوتية الحقيقية بلهجات عربية متعددة، وارفعها مباشرة بضغطة زر لاختبار محرك التعرف الصوتي وتقييم الجودة.'
                : 'Listen to real multi-dialect Arabic call recordings and upload them to the project with 1 click to test ASR ingestion and QA analytics.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-indigo-300 bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-500/30">
              {voiceSamples.length} Audio Test Files Ready
            </span>
          </div>
        </div>

        {/* Sample Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {voiceSamples.map((sample) => {
            const isSamplePlaying = playingAudioId === sample.id;
            const isUploadingThis = uploadingSampleId === sample.id;

            return (
              <div
                key={sample.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isSamplePlaying
                    ? 'bg-indigo-950/50 border-indigo-400 shadow-md shadow-indigo-500/20 ring-1 ring-indigo-400'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                    {sample.dialect}
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">
                    {sample.duration_sec}s • {sample.size_kb} KB
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-100 mb-1 leading-snug">
                  {sample.title}
                </h4>

                <p className="text-[11px] text-slate-400 mb-3 line-clamp-2">
                  {sample.description}
                </p>

                {/* Audio Preview & Action Buttons */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-2">
                    {/* Play/Pause Button */}
                    <button
                      onClick={() => togglePlaySample(sample)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-medium transition ${
                        isSamplePlaying
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40 animate-pulse'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                      title={isSamplePlaying ? 'Pause sound' : 'Listen to real voice'}
                    >
                      {isSamplePlaying ? (
                        <>
                          <Pause className="w-3.5 h-3.5 fill-current" />
                          <span>{isRtl ? 'إيقاف الصوت' : 'Pause Voice'}</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{isRtl ? 'استمع للصوت' : 'Listen Real'}</span>
                        </>
                      )}
                    </button>

                    {/* Download WAV button */}
                    <a
                      href={sample.download_wav_url}
                      download={sample.filename}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                      title={isRtl ? 'تحميل ملف الصوت للكمبيوتر' : 'Download audio file to PC'}
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* 1-Click Upload to Project Button */}
                  <button
                    onClick={() => handleUploadSample(sample)}
                    disabled={isUploadingThis}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>
                      {isUploadingThis
                        ? isRtl
                          ? 'جاري الرفع...'
                          : 'Uploading...'
                        : isRtl
                        ? 'رفع للمشروع واختباره'
                        : 'Upload Voice to Project'}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: Manual Upload Dropzone */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
            <p className="text-xs text-slate-400">
              {isRtl
                ? 'ارفع تسجيلاتك الصوتية الخاصة (.wav, .mp3, .ogg) للتحليل والاستماع الفوري'
                : `Upload custom audio recordings (${acceptedTypes}) for real speech analytics`}
            </p>
          </div>
          <button
            onClick={fetchFiles}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
            title="Refresh files"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-700 hover:border-indigo-500/50 rounded-xl p-6 text-center cursor-pointer transition bg-slate-950/40 group"
        >
          <Upload className="w-8 h-8 text-slate-500 group-hover:text-indigo-400 mx-auto mb-2 transition" />
          <p className="text-xs font-medium text-slate-300">
            {isRtl ? 'انقر أو اسحب الملفات هنا للرفع' : 'Click or drag files here to upload'}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Supported audio & transcripts: {acceptedTypes}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes}
            onChange={handleUpload}
            className="hidden"
          />
        </div>

        {isUploading && (
          <div className="text-xs text-indigo-400 font-mono animate-pulse">
            {isRtl ? 'جاري رفع الملفات ومعالجتها...' : 'Uploading and validating files...'}
          </div>
        )}

        {statusMessage && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* SECTION 3: Ingested Audio Files List with Real In-line Player */}
        {files.length > 0 && (
          <div className="space-y-2 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 block">
                {isRtl ? `الملفات المرفوعة للمشروع (${files.length})` : `Project Uploaded Speech Files (${files.length})`}
              </span>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {files.map((file) => {
                const isAudio =
                  file.filename.endsWith('.wav') ||
                  file.filename.endsWith('.mp3') ||
                  file.filename.endsWith('.ogg') ||
                  file.filename.endsWith('.m4a');
                const isFilePlaying = playingAudioId === file.id;

                return (
                  <div
                    key={file.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        <FileAudio className="w-5 h-5 shrink-0" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-slate-100 font-semibold">{file.filename}</p>
                          {file.processed && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Analyzed
                            </span>
                          )}
                          {file.details?.dialect && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
                              {file.details.dialect}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {(file.size_bytes / 1024).toFixed(1)} KB •{' '}
                          {new Date(file.uploaded_at).toLocaleTimeString()}
                          {file.details?.qa_score && (
                            <span className="text-emerald-400 ml-2 font-bold font-mono">
                              QA Score: {file.details.qa_score}%
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* In-line Audio Playback */}
                      {isAudio && (
                        <button
                          onClick={() => togglePlayUploadedFile(file)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                            isFilePlaying
                              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                          }`}
                          title={isFilePlaying ? 'Pause' : 'Play audio voice'}
                        >
                          {isFilePlaying ? (
                            <>
                              <Pause className="w-3.5 h-3.5 fill-current" />
                              <span>{isRtl ? 'إيقاف' : 'Pause'}</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>{isRtl ? 'استماع للصوت' : 'Listen Voice'}</span>
                            </>
                          )}
                        </button>
                      )}

                      {/* Process File / Diarize Audio */}
                      <button
                        onClick={() => handleProcess(file.id)}
                        disabled={processingId === file.id}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                          file.processed
                            ? 'bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>
                          {processingId === file.id
                            ? isRtl
                              ? 'جاري التحليل...'
                              : 'Processing...'
                            : file.processed
                            ? isRtl
                              ? 'إعادة التحليل'
                              : 'Re-Analyze'
                            : isRtl
                            ? 'معالجة وتحليل الصوت'
                            : 'Process & Diarize'}
                        </span>
                      </button>

                      {/* Jump to Call Inspector if processed */}
                      {file.call_id && onCallCreated && (
                        <button
                          onClick={() => onCallCreated(file.call_id!)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 transition"
                          title="Open in Call Inspector"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>{isRtl ? 'معاينة في الاستوديو' : 'Inspect Call'}</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(file.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="Delete file"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
