'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Image, Mic, Loader2, AlertCircle, Scan } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type Tab = 'text' | 'image' | 'audio';

const SAMPLE_TEXTS = [
  "Your KYC verification is pending. Update immediately to avoid account suspension.",
  "Congratulations! You've won Rs 25 Lakh in KBC. Contact our agent to claim your prize.",
  "Work from home opportunity! Earn Rs 15,000/month. Pay Rs 499 registration fee.",
  "Your UPI account has been compromised. Verify identity to prevent unauthorized access.",
];

export function UploadPanel() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('text');
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) {
      setSelectedFile(accepted[0]);
      setError('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: activeTab === 'image'
      ? { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.bmp'] }
      : { 'audio/*': ['.mp3', '.wav', '.m4a', '.ogg', '.flac'] },
    maxFiles: 1,
  });

  const handleAnalyze = async () => {
    setError('');
    if (activeTab === 'text' && !inputText.trim()) {
      setError('Please enter a message to analyze.');
      return;
    }
    if (activeTab !== 'text' && !selectedFile) {
      setError('Please upload a file to analyze.');
      return;
    }

    setIsLoading(true);
    try {
      const form = new FormData();
      if (activeTab === 'text') {
        form.append('text', inputText.trim());
      } else {
        form.append('file', selectedFile!);
      }

      const result = await api.analyze(form);
      localStorage.setItem('echotrace_result', JSON.stringify(result));
      router.push('/results');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Analysis failed. Is the backend running?';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'text', label: 'Text / Email', icon: <FileText className="w-4 h-4" /> },
    { id: 'image', label: 'Screenshot', icon: <Image className="w-4 h-4" /> },
    { id: 'audio', label: 'Voice / Audio', icon: <Mic className="w-4 h-4" /> },
  ];

  return (
    <div className="rounded-2xl border border-cyber-border bg-cyber-card shadow-xl overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-cyber-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSelectedFile(null); setError(''); }}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'text-cyber-accent border-b-2 border-cyber-accent bg-cyber-accent/5'
                : 'text-cyber-muted hover:text-cyber-text hover:bg-cyber-card2'
            )}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="p-5 space-y-4">
        {/* Text input */}
        {activeTab === 'text' && (
          <div className="space-y-3">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste suspicious message, email, or scam text here..."
              rows={5}
              className={cn(
                'w-full rounded-lg border border-cyber-border bg-cyber-bg',
                'px-4 py-3 text-cyber-text placeholder-cyber-muted/50 font-mono text-sm',
                'focus:outline-none focus:border-cyber-accent/60 resize-none transition-colors'
              )}
            />
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-cyber-muted">Try sample:</span>
              {SAMPLE_TEXTS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setInputText(s)}
                  className="text-xs text-cyber-accent/70 hover:text-cyber-accent underline underline-offset-2 transition-colors"
                >
                  Sample {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* File upload */}
        {activeTab !== 'text' && (
          <div
            {...getRootProps()}
            className={cn(
              'rounded-xl border-2 border-dashed p-10 text-center cursor-pointer transition-all',
              isDragActive
                ? 'border-cyber-accent bg-cyber-accent/10'
                : 'border-cyber-border hover:border-cyber-accent/50 hover:bg-cyber-accent/5',
              selectedFile && 'border-threat-low/50 bg-threat-low/5'
            )}
          >
            <input {...getInputProps()} />
            {selectedFile ? (
              <div className="space-y-2">
                <div className="text-threat-low text-3xl flex justify-center">✓</div>
                <p className="text-cyber-text font-medium">{selectedFile.name}</p>
                <p className="text-cyber-muted text-sm">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload className="w-10 h-10 text-cyber-muted mx-auto" />
                <div>
                  <p className="text-cyber-text font-medium">
                    {isDragActive ? 'Drop file here' : `Drop ${activeTab === 'image' ? 'screenshot' : 'audio file'} here`}
                  </p>
                  <p className="text-cyber-muted text-sm mt-1">
                    {activeTab === 'image'
                      ? 'PNG, JPG, WEBP — scam screenshots, phishing emails'
                      : 'MP3, WAV, M4A — voice messages, call recordings'}
                  </p>
                </div>
                <Button variant="outline" size="sm" type="button">Browse File</Button>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-threat-high/10 border border-threat-high/30 px-4 py-3 text-threat-high text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Analyze button */}
        <Button
          onClick={handleAnalyze}
          disabled={isLoading}
          className="w-full h-12 text-base"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing with Qdrant semantic search...
            </>
          ) : (
            <>
              <Scan className="w-5 h-5" />
              Analyze Threat
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
