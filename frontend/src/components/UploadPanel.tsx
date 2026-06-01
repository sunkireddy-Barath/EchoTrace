'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import {
  Upload, FileText, ImageIcon, Mic, Loader2, AlertCircle, Scan,
  CheckCircle2,
} from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

type Tab = 'text' | 'image' | 'audio';

const SAMPLES = [
  "Your KYC is expired. Update immediately to avoid account suspension.",
  "OTP verification required. Share your 6-digit OTP to confirm identity.",
  "Work from home! Earn Rs 15,000/month. Pay Rs 499 registration fee.",
  "You've won Rs 25 Lakh in KBC. Contact agent to claim prize.",
  "Congratulations! Pay Rs 1,800 GST to receive your iPhone 14 prize.",
];

const TABS: { id: Tab; label: string; icon: React.ReactNode; accept: Record<string, string[]> }[] = [
  {
    id: 'text',
    label: 'Text / Email',
    icon: <FileText className="w-4 h-4" />,
    accept: {},
  },
  {
    id: 'image',
    label: 'Screenshot',
    icon: <ImageIcon className="w-4 h-4" />,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.bmp'] },
  },
  {
    id: 'audio',
    label: 'Voice / Audio',
    icon: <Mic className="w-4 h-4" />,
    accept: { 'audio/*': ['.mp3', '.wav', '.m4a', '.ogg'] },
  },
];

export function UploadPanel() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('text');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onDrop = useCallback((files: File[]) => {
    if (files[0]) { setFile(files[0]); setError(''); }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: TABS.find((t) => t.id === tab)?.accept || {},
    maxFiles: 1,
  });

  const handleAnalyze = async () => {
    setError('');
    if (tab === 'text' && !text.trim()) return setError('Enter a message to analyze.');
    if (tab !== 'text' && !file) return setError('Upload a file to analyze.');

    setLoading(true);
    try {
      const form = new FormData();
      if (tab === 'text') form.append('text', text.trim());
      else form.append('file', file!);

      const result = await api.analyze(form);
      localStorage.setItem('echotrace_result', JSON.stringify(result));
      router.push('/results');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Analysis failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-surface-2 overflow-hidden shadow-card">
      {/* Tabs */}
      <div className="flex border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setFile(null); setError(''); }}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-all',
              tab === t.id
                ? 'text-neon-2 bg-neon/8 border-b-2 border-neon'
                : 'text-ink-3 hover:text-ink-2 hover:bg-surface-3',
            )}
          >
            {t.icon}
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="p-5 space-y-4">
        {/* Text input */}
        {tab === 'text' && (
          <div className="space-y-3">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste suspicious message, phishing email, or scam text here..."
              rows={5}
              className={cn(
                'w-full rounded-xl border border-border bg-void px-4 py-3',
                'text-ink placeholder-ink-3/40 font-mono text-sm resize-none',
                'focus:outline-none focus:border-neon/50 focus:ring-1 focus:ring-neon/20 transition-all',
              )}
            />
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-[10px] text-ink-3 uppercase tracking-wider">Try:</span>
              {SAMPLES.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setText(s)}
                  className="text-[10px] text-neon/60 hover:text-neon border border-neon/20 hover:border-neon/50 rounded px-2 py-0.5 transition-colors font-mono"
                >
                  Sample {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* File drop */}
        {tab !== 'text' && (
          <div
            {...getRootProps()}
            className={cn(
              'rounded-xl border-2 border-dashed p-10 text-center cursor-pointer transition-all',
              isDragActive ? 'drop-zone-active' : 'border-border hover:border-border-2 hover:bg-surface-3/40',
              file && 'border-threat-low/50 bg-threat-low/5',
            )}
          >
            <input {...getInputProps()} />
            {file ? (
              <div className="space-y-2">
                <CheckCircle2 className="w-10 h-10 text-threat-low mx-auto" />
                <p className="text-sm font-semibold text-ink">{file.name}</p>
                <p className="text-xs text-ink-3">{(file.size / 1024).toFixed(1)} KB — ready to analyze</p>
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="text-xs text-ink-3 hover:text-threat-high underline mt-1"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload className="w-10 h-10 text-ink-3 mx-auto" />
                <div>
                  <p className="text-sm font-medium text-ink-2">
                    {isDragActive
                      ? 'Drop it here'
                      : `Drop ${tab === 'image' ? 'screenshot' : 'audio file'} here`}
                  </p>
                  <p className="text-xs text-ink-3 mt-1">
                    {tab === 'image'
                      ? 'PNG, JPG, WEBP — scam screenshots, phishing screenshots'
                      : 'MP3, WAV, M4A — voice messages, phone recordings'}
                  </p>
                </div>
                <span className="inline-block text-xs border border-border px-3 py-1.5 rounded-lg text-ink-3 hover:text-ink-2 transition-colors">
                  Browse File
                </span>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-red-950/40 border border-threat-high/30 px-4 py-3 text-sm text-threat-high">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* CTA button */}
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className={cn(
            'w-full h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2.5 transition-all',
            loading
              ? 'bg-surface-3 text-ink-3 cursor-not-allowed'
              : 'bg-gradient-to-r from-neon to-indigo-500 text-white hover:from-neon/90 hover:to-indigo-500/90 glow-blue hover:shadow-neon-strong',
          )}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Searching Qdrant vectors...
            </>
          ) : (
            <>
              <Scan className="w-4 h-4" />
              Run Semantic Analysis
            </>
          )}
        </button>
      </div>
    </div>
  );
}
