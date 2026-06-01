'use client';

import { FileText, ImageIcon, Mic } from 'lucide-react';
import type { SimilarMessage } from '@/lib/types';
import { cn } from '@/lib/utils';

const MODALITY_ICON = {
  text: <FileText className="w-3 h-3" />,
  image: <ImageIcon className="w-3 h-3" />,
  audio: <Mic className="w-3 h-3" />,
};

function scoreColor(s: number) {
  if (s >= 0.82) return { bar: '#ff6b35', text: 'text-threat-high' };
  if (s >= 0.62) return { bar: '#ffd60a', text: 'text-threat-medium' };
  return { bar: '#30d158', text: 'text-threat-low' };
}

interface Props { messages: SimilarMessage[]; }

export function SimilarityMeter({ messages }: Props) {
  return (
    <div className="space-y-2.5">
      {messages.length === 0 && (
        <p className="text-ink-3 text-sm text-center py-6">No similar scams found in corpus.</p>
      )}
      {messages.map((msg, i) => {
        const { bar, text } = scoreColor(msg.similarity);
        const pct = Math.round(msg.similarity * 100);
        return (
          <div
            key={msg.id}
            className="rounded-xl border border-border bg-surface-3 p-3 space-y-2.5 hover:border-border-2 transition-colors"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <span className="text-xs font-mono text-ink-3 w-5 flex-shrink-0">#{i + 1}</span>
                <span className="flex items-center gap-1 text-[10px] border border-border rounded px-1.5 py-0.5 text-ink-3 flex-shrink-0">
                  {MODALITY_ICON[msg.modality as keyof typeof MODALITY_ICON]}
                  {msg.year}
                </span>
                <span className="text-[10px] border border-border rounded px-1.5 py-0.5 text-ink-2 truncate max-w-[120px]">
                  {msg.family}
                </span>
                {msg.source_label && msg.source_label !== 'Unknown' && (
                  <span className="text-[10px] text-ink-3 italic">{msg.source_label}</span>
                )}
              </div>
              <span className={cn('font-mono font-black text-base flex-shrink-0', text)}>
                {pct}%
              </span>
            </div>

            <div className="h-1.5 bg-void rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${bar}88, ${bar})` }}
              />
            </div>

            <p className="text-xs font-mono text-ink-3 line-clamp-2 leading-relaxed">
              {msg.text}
            </p>
          </div>
        );
      })}
    </div>
  );
}
