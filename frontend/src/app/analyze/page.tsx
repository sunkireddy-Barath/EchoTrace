import { Scan, FileText, ImageIcon, Mic } from 'lucide-react';
import { UploadPanel } from '@/components/UploadPanel';

export default function AnalyzePage() {
  return (
    <div className="min-h-screen bg-grid-pattern">
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Scan className="w-5 h-5 text-neon" />
            <h1 className="text-2xl font-black text-ink">Threat Analysis</h1>
          </div>
          <p className="text-sm text-ink-2">
            Submit any suspicious content for Qdrant-powered semantic analysis.
            The engine searches 82+ scam vectors and returns a full intelligence report.
          </p>
        </div>

        {/* How it works */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <FileText className="w-4 h-4" />, step: '01', label: 'Input', desc: 'Text, screenshot, or voice' },
            { icon: <Scan className="w-4 h-4" />, step: '02', label: 'Embed + Search', desc: 'Qdrant vector search' },
            { icon: <ImageIcon className="w-4 h-4" />, step: '03', label: 'Intelligence', desc: 'Genome + evolution report' },
          ].map((s) => (
            <div key={s.step} className="rounded-xl border border-border bg-surface-2 p-3 text-center space-y-1.5">
              <div className="text-[10px] font-mono text-ink-3 uppercase tracking-widest">{s.step}</div>
              <div className="flex justify-center text-neon">{s.icon}</div>
              <div className="text-xs font-semibold text-ink">{s.label}</div>
              <div className="text-[10px] text-ink-3">{s.desc}</div>
            </div>
          ))}
        </div>

        {/* Upload panel */}
        <UploadPanel />

        {/* Supported inputs */}
        <div className="rounded-xl border border-border bg-surface-2 p-4">
          <div className="text-[10px] text-ink-3 uppercase tracking-widest mb-3 font-mono">Supported Input Types</div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <FileText className="w-4 h-4 text-neon" />, label: 'Text / Email', formats: 'Direct text, phishing emails' },
              { icon: <ImageIcon className="w-4 h-4 text-threat-medium" />, label: 'Screenshots', formats: 'PNG, JPG, WEBP via OCR' },
              { icon: <Mic className="w-4 h-4 text-threat-high" />, label: 'Audio / Voice', formats: 'MP3, WAV via Whisper' },
            ].map((i) => (
              <div key={i.label} className="space-y-1">
                <div className="flex items-center gap-2">
                  {i.icon}
                  <span className="text-xs font-semibold text-ink">{i.label}</span>
                </div>
                <p className="text-[10px] text-ink-3">{i.formats}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
