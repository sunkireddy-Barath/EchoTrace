'use client';

import { ArrowDown } from 'lucide-react';
import type { EvolutionEntry } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

function getYearColor(idx: number, total: number) {
  const ratio = idx / Math.max(total - 1, 1);
  if (ratio < 0.33) return 'border-cyber-accent/30 text-cyber-accent/60';
  if (ratio < 0.66) return 'border-cyber-accent/60 text-cyber-accent/80';
  return 'border-cyber-accent text-cyber-accent';
}

interface Props {
  timeline: EvolutionEntry[];
  family: string;
}

export function EvolutionTimeline({ timeline, family }: Props) {
  if (!timeline || timeline.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Fraud Evolution Timeline</CardTitle></CardHeader>
        <CardContent>
          <p className="text-cyber-muted text-sm text-center py-4">
            No evolution data available.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Fraud Evolution Timeline</CardTitle>
          <Badge variant="default" className="text-xs">{family}</Badge>
        </div>
        <p className="text-xs text-cyber-muted mt-1">
          How this scam family mutated over {timeline[0].year}–{timeline[timeline.length - 1].year}
        </p>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Vertical spine */}
          <div className="absolute left-6 top-3 bottom-3 w-px bg-cyber-border" />

          <div className="space-y-1">
            {timeline.map((entry, idx) => {
              const yearColor = getYearColor(idx, timeline.length);
              const isLast = idx === timeline.length - 1;
              return (
                <div key={`${entry.year}-${idx}`}>
                  <div className="flex gap-4 items-start">
                    {/* Year circle */}
                    <div className={cn(
                      'relative z-10 flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center',
                      'bg-cyber-bg font-mono font-bold text-xs',
                      yearColor
                    )}>
                      {entry.year}
                    </div>

                    {/* Content card */}
                    <div className={cn(
                      'flex-1 rounded-lg border p-3 mb-3 transition-all',
                      isLast
                        ? 'border-cyber-accent/40 bg-cyber-accent/5'
                        : 'border-cyber-border bg-cyber-bg'
                    )}>
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          Cluster #{entry.cluster_id}
                        </Badge>
                        {isLast && (
                          <Badge variant="high" className="text-xs">Latest Variant</Badge>
                        )}
                        <span className="text-xs text-cyber-muted ml-auto font-mono">
                          {Math.round(entry.similarity * 100)}% match
                        </span>
                      </div>
                      <p className="text-cyber-text/80 text-sm font-mono leading-relaxed line-clamp-3">
                        {entry.text}
                      </p>
                    </div>
                  </div>

                  {/* Arrow connector */}
                  {!isLast && (
                    <div className="flex justify-start pl-4 -mt-1 mb-1">
                      <ArrowDown className="w-4 h-4 text-cyber-border" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        <div className="mt-4 rounded-lg border border-cyber-accent/20 bg-cyber-accent/5 p-3 text-xs text-cyber-muted">
          <span className="text-cyber-accent font-semibold">Fraud Lineage:</span>{' '}
          Qdrant semantic search reveals how the same fraud intent has been rephrased
          {timeline.length > 1 ? ` across ${timeline.length} distinct variants` : ''} to evade keyword detection.
        </div>
      </CardContent>
    </Card>
  );
}
