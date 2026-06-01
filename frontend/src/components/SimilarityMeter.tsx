'use client';

import { FileText, Image, Mic } from 'lucide-react';
import type { SimilarMessage } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const MODALITY_ICON: Record<string, React.ReactNode> = {
  text: <FileText className="w-3 h-3" />,
  image: <Image className="w-3 h-3" />,
  audio: <Mic className="w-3 h-3" />,
};

function getScoreColor(score: number) {
  if (score >= 0.82) return { bar: 'bg-threat-high', text: 'text-threat-high' };
  if (score >= 0.62) return { bar: 'bg-threat-medium', text: 'text-threat-medium' };
  return { bar: 'bg-threat-low', text: 'text-threat-low' };
}

interface Props {
  messages: SimilarMessage[];
}

export function SimilarityMeter({ messages }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Semantically Similar Scams</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {messages.length === 0 && (
          <p className="text-cyber-muted text-sm text-center py-4">No similar scams found.</p>
        )}
        {messages.map((msg, i) => {
          const { bar, text } = getScoreColor(msg.similarity);
          const pct = Math.round(msg.similarity * 100);
          return (
            <div
              key={msg.id}
              className="rounded-lg border border-cyber-border bg-cyber-bg p-3 space-y-2"
            >
              {/* Header row */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-mono text-cyber-muted w-4 flex-shrink-0">
                    #{i + 1}
                  </span>
                  <Badge variant="secondary" className="gap-1 flex-shrink-0 text-xs">
                    {MODALITY_ICON[msg.modality]}
                    {msg.year}
                  </Badge>
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    {msg.family}
                  </Badge>
                </div>
                <span className={cn('font-mono font-bold text-sm flex-shrink-0', text)}>
                  {pct}%
                </span>
              </div>

              {/* Progress bar */}
              <Progress
                value={pct}
                barClassName={bar}
                className="h-1.5"
              />

              {/* Message text */}
              <p className="text-cyber-text/70 text-xs font-mono leading-relaxed line-clamp-2">
                {msg.text}
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
