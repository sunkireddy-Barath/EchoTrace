'use client';

import { AlertOctagon, ShieldQuestion, CheckCircle2 } from 'lucide-react';
import type { ZeroDayAlert as ZeroDayAlertType } from '@/lib/types';
import { cn } from '@/lib/utils';

interface Props {
  alert: ZeroDayAlertType;
}

export function ZeroDayAlert({ alert }: Props) {
  if (!alert.is_zero_day) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-border bg-surface-2 p-4">
        <CheckCircle2 className="w-5 h-5 text-threat-low flex-shrink-0 mt-0.5" />
        <div>
          <div className="text-sm font-semibold text-threat-low">Known Pattern Matched</div>
          <p className="text-xs text-ink-3 mt-0.5">{alert.alert_message}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-ink-3 font-mono">
            <span>Closest: <span className="text-ink-2">{alert.closest_family}</span></span>
            <span>Similarity: <span className="text-ink-2">{Math.round(alert.closest_similarity * 100)}%</span></span>
            <span>Novelty: <span className="text-ink-2">{Math.round(alert.novelty_score * 100)}%</span></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'rounded-xl border-2 p-5 border-threat-zeroday animate-zeroday',
      'bg-gradient-to-r from-surface-2 to-purple-950/20',
    )}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <AlertOctagon className="w-8 h-8 text-threat-zeroday animate-pulse" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-lg font-black text-threat-zeroday font-mono tracking-wider">
              ⚠ ZERO-DAY THREAT
            </span>
            <span className="text-xs bg-threat-zeroday/20 text-threat-zeroday border border-threat-zeroday/40 px-2 py-0.5 rounded-full font-mono">
              NEW VARIANT
            </span>
          </div>
          <p className="text-sm text-ink-2 leading-relaxed">{alert.alert_message}</p>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="rounded-lg bg-surface-3/50 border border-border p-2.5 text-center">
              <div className="text-xs text-ink-3 mb-1">Novelty Score</div>
              <div className="text-xl font-black text-threat-zeroday font-mono">
                {Math.round(alert.novelty_score * 100)}%
              </div>
            </div>
            <div className="rounded-lg bg-surface-3/50 border border-border p-2.5 text-center">
              <div className="text-xs text-ink-3 mb-1">Closest Family</div>
              <div className="text-xs font-semibold text-ink-2 mt-1">{alert.closest_family}</div>
            </div>
            <div className="rounded-lg bg-surface-3/50 border border-border p-2.5 text-center">
              <div className="text-xs text-ink-3 mb-1">Max Similarity</div>
              <div className="text-xl font-black text-ink-2 font-mono">
                {Math.round(alert.closest_similarity * 100)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-2">
        <ShieldQuestion className="w-4 h-4 text-threat-zeroday flex-shrink-0" />
        <p className="text-xs text-ink-3">
          Consider submitting this to the Community Intel Feed to help protect others.
        </p>
      </div>
    </div>
  );
}
