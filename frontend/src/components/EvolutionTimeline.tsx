'use client';

import { memo, useMemo } from 'react';
import { ArrowDownCircle, Sparkles } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import type { EvolutionEntry } from '@/lib/types';
import { cn } from '@/lib/utils';

interface Props {
  timeline: EvolutionEntry[];
  family: string;
}

export const EvolutionTimeline = memo(function EvolutionTimeline({ timeline, family }: Props) {
  const chartData = useMemo(
    () => (timeline ?? []).map((e) => ({
      year: e.year,
      sim: Math.round(e.similarity * 100),
    })),
    [timeline],
  );

  if (!timeline?.length) {
    return (
      <div className="rounded-2xl border border-border bg-surface-2 p-5">
        <div className="text-sm text-ink-3 text-center py-6">No evolution data available.</div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface-2 overflow-hidden">
      <div className="px-5 pt-4 pb-3 border-b border-border flex items-center justify-between">
        <div>
          <div className="text-[10px] text-ink-3 uppercase tracking-widest mb-0.5">Fraud Evolution Timeline</div>
          <div className="text-sm font-bold text-ink">{family}</div>
        </div>
        <div className="text-xs font-mono text-ink-3">
          {timeline[0].year} → {timeline[timeline.length - 1].year}
        </div>
      </div>

      {/* Similarity trend chart */}
      <div className="px-4 pt-3">
        <div className="h-[80px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(26,48,96,0.5)" vertical={false} />
              <XAxis dataKey="year" tick={{ fill: '#5b7ba8', fontSize: 9, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
              <YAxis hide domain={[0, 100]} />
              <Tooltip
                contentStyle={{ background: '#0d1526', border: '1px solid #1a3060', borderRadius: '6px', fontSize: '11px', fontFamily: 'JetBrains Mono', color: '#e8f0fe' }}
                formatter={(v: number) => [`${v}%`, 'Similarity']}
              />
              <Line type="monotone" dataKey="sim" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#60a5fa', r: 3, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Timeline entries */}
      <div className="p-4 space-y-1">
        {timeline.map((entry, idx) => {
          const isLatest = idx === timeline.length - 1;
          const isFirst = idx === 0;
          return (
            <div key={`${entry.year}-${idx}`}>
              <div className="flex gap-3 items-start">
                {/* Year badge */}
                <div className={cn(
                  'flex-shrink-0 w-14 h-10 rounded-lg border flex items-center justify-center',
                  'font-mono font-bold text-xs',
                  isLatest
                    ? 'border-neon bg-neon/10 text-neon-2'
                    : isFirst
                    ? 'border-border/50 bg-surface-3/50 text-ink-3'
                    : 'border-border bg-surface-3 text-ink-3',
                )}>
                  {entry.year}
                </div>

                {/* Entry */}
                <div className={cn(
                  'flex-1 rounded-lg border p-3 mb-2',
                  isLatest ? 'border-neon/30 bg-neon/5' : 'border-border bg-surface-3',
                )}>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    {isLatest && (
                      <span className="flex items-center gap-1 text-[10px] bg-neon/20 text-neon border border-neon/30 rounded px-1.5 py-0.5">
                        <Sparkles className="w-2.5 h-2.5" />
                        Latest Variant
                      </span>
                    )}
                    <span className="text-[10px] text-ink-3 font-mono ml-auto">
                      {Math.round(entry.similarity * 100)}% match
                    </span>
                  </div>
                  <p className="text-xs font-mono text-ink-2 leading-relaxed line-clamp-2">{entry.text}</p>
                </div>
              </div>

              {!isLatest && (
                <div className="flex pl-5 -mt-1 mb-0">
                  <ArrowDownCircle className="w-4 h-4 text-border" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="px-5 py-3 border-t border-border bg-surface-3/30">
        <p className="text-[10px] text-ink-3 leading-relaxed">
          <span className="text-neon font-semibold">Semantic lineage</span>: Qdrant vector search traces how the same fraud intent
          evolved across {timeline.length} variants — same attack, different words.
        </p>
      </div>
    </div>
  );
});
