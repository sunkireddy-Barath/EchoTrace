'use client';

import { useEffect, useState } from 'react';
import { Radio, RefreshCw, FileText, ImageIcon, Mic, Send, AlertCircle } from 'lucide-react';
import type { FeedItem } from '@/lib/types';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { SemanticThreatMap } from '@/components/SemanticThreatMap';

const MODALITY_ICON = {
  text: <FileText className="w-3.5 h-3.5" />,
  image: <ImageIcon className="w-3.5 h-3.5" />,
  audio: <Mic className="w-3.5 h-3.5" />,
};

function scoreColor(s: number) {
  if (s >= 0.82) return 'text-threat-high border-threat-high/40 bg-threat-high/10';
  if (s >= 0.62) return 'text-threat-medium border-yellow-600/40 bg-yellow-500/10';
  return 'text-threat-low border-threat-low/40 bg-threat-low/10';
}

function timeAgo(ts: string) {
  if (!ts) return 'Unknown';
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function FeedPage() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reportText, setReportText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState('');

  const loadFeed = async () => {
    try {
      const data = await api.getFeed(20);
      setItems(data);
    } catch {
      // Feed may be empty
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadFeed(); }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadFeed();
  };

  const handleSubmit = async () => {
    if (!reportText.trim()) return;
    setSubmitting(true);
    setSubmitMsg('');
    try {
      const form = new FormData();
      form.append('text', reportText.trim());
      form.append('source_label', 'Community');
      const result = await api.reportScam(form);
      setSubmitMsg(`✓ Contributed to community corpus — detected as ${result.detected_family} (${Math.round(result.threat_score * 100)}%)`);
      setReportText('');
      setTimeout(loadFeed, 1000);
    } catch {
      setSubmitMsg('✗ Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-grid-pattern">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Radio className="w-5 h-5 text-threat-zeroday" />
            <h1 className="text-2xl font-black text-ink">Live Intel Feed</h1>
            <span className="w-2 h-2 rounded-full bg-threat-low animate-pulse" />
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 text-xs border border-border px-3 py-1.5 rounded-lg text-ink-2 hover:border-border-2 transition-all"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', refreshing && 'animate-spin')} />
            Refresh
          </button>
        </div>

        {/* Semantic Threat Map */}
        <SemanticThreatMap />

        {/* Submit new report */}
        <div className="rounded-2xl border border-border bg-surface-2 p-5 space-y-3">
          <div className="text-[10px] text-ink-3 uppercase tracking-widest font-mono">
            Contribute to Community Intel Corpus
          </div>
          <div className="text-sm text-ink-2">
            Submit a scam you encountered. It will be analyzed by EchoTrace and added to the Qdrant corpus
            to protect others.
          </div>
          <textarea
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            placeholder="Paste the suspicious message you received..."
            rows={3}
            className="w-full rounded-xl border border-border bg-void px-4 py-3 text-sm font-mono text-ink placeholder-ink-3/40 focus:outline-none focus:border-neon/50 resize-none transition-all"
          />
          {submitMsg && (
            <div className={cn(
              'flex items-start gap-2 rounded-lg px-3 py-2 text-xs',
              submitMsg.startsWith('✓')
                ? 'bg-threat-low/10 text-threat-low border border-threat-low/30'
                : 'bg-threat-high/10 text-threat-high border border-threat-high/30',
            )}>
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              {submitMsg}
            </div>
          )}
          <button
            onClick={handleSubmit}
            disabled={submitting || !reportText.trim()}
            className={cn(
              'flex items-center gap-2 text-sm px-5 py-2.5 rounded-xl font-semibold transition-all',
              submitting || !reportText.trim()
                ? 'bg-surface-3 text-ink-3 cursor-not-allowed'
                : 'bg-gradient-to-r from-neon to-indigo-500 text-white glow-blue hover:shadow-neon-strong',
            )}
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Analyzing & Contributing...' : 'Submit to Community Corpus'}
          </button>
        </div>

        {/* Feed */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-24 rounded-xl skeleton" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface-2 p-10 text-center">
            <Radio className="w-10 h-10 text-ink-3 opacity-30 mx-auto mb-3" />
            <p className="text-ink-3 text-sm">No community reports yet.</p>
            <p className="text-ink-3 text-xs mt-1">Be the first to contribute above!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-border bg-surface-2 p-4 hover:border-border-2 transition-all space-y-3"
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn(
                      'inline-flex items-center text-[10px] font-bold font-mono px-2 py-0.5 rounded border',
                      scoreColor(item.threat_score),
                    )}>
                      {Math.round(item.threat_score * 100)}%
                    </span>
                    <span className="text-xs border border-border rounded px-2 py-0.5 text-ink-2 font-medium">
                      {item.detected_family}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-ink-3">
                      {MODALITY_ICON[item.modality as keyof typeof MODALITY_ICON]}
                      {item.source_label}
                    </span>
                  </div>
                  <span className="text-[10px] text-ink-3 font-mono flex-shrink-0">
                    {timeAgo(item.timestamp)}
                  </span>
                </div>
                <p className="text-xs font-mono text-ink-2 line-clamp-2 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
