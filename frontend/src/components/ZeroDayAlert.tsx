'use client';

import { memo } from 'react';
import { CheckCircle2, GitBranch, AlertOctagon, ShieldQuestion } from 'lucide-react';
import type { ZeroDayAlert as ZeroDayAlertType } from '@/lib/types';
import { cn } from '@/lib/utils';

interface Props {
  alert: ZeroDayAlertType;
}

// ── Per-stage visual configuration ───────────────────────────────────────────
const STAGE_CONFIG = {
  known: {
    icon: CheckCircle2,
    borderClass: 'border-emerald-500/40',
    bgClass: 'bg-emerald-500/5',
    iconClass: 'text-emerald-400',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    titleClass: 'text-emerald-400',
    metricClass: 'text-emerald-400',
    label: 'KNOWN THREAT',
    badge: 'CONFIRMED LINEAGE',
    subtitle: 'Known scam family. Strong alignment with fraud database.',
  },
  evolving: {
    icon: GitBranch,
    borderClass: 'border-amber-500/40',
    bgClass: 'bg-amber-500/5',
    iconClass: 'text-amber-400',
    badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    titleClass: 'text-amber-400',
    metricClass: 'text-amber-400',
    label: 'EVOLVING VARIANT',
    badge: 'MUTATION DETECTED',
    subtitle: 'Semantic mutation detected. Moderate novelty within a known lineage.',
  },
  emerging: {
    icon: AlertOctagon,
    borderClass: 'border-rose-500/60',
    bgClass: 'bg-gradient-to-r from-surface-2 to-rose-950/20',
    iconClass: 'text-rose-400 animate-pulse',
    badgeClass: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
    titleClass: 'text-rose-400',
    metricClass: 'text-rose-400',
    label: '⚠ EMERGING VARIANT',
    badge: 'NEW CLUSTER',
    subtitle: 'Low semantic alignment. Possible new scam cluster forming.',
  },
} as const;

export const ZeroDayAlert = memo(function ZeroDayAlert({ alert }: Props) {
  const stage = alert.variant_stage ?? (alert.is_zero_day ? 'emerging' : 'known');
  const cfg = STAGE_CONFIG[stage];
  const Icon = cfg.icon;

  return (
    <div
      className={cn(
        'rounded-xl border-2 p-4',
        cfg.borderClass,
        cfg.bgClass,
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <Icon className={cn('w-6 h-6 flex-shrink-0 mt-0.5', cfg.iconClass)} />

        {/* Body */}
        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={cn('text-sm font-black font-mono tracking-wider', cfg.titleClass)}>
              {cfg.label}
            </span>
            <span
              className={cn(
                'text-[10px] border px-2 py-0.5 rounded-full font-mono',
                cfg.badgeClass,
              )}
            >
              {cfg.badge}
            </span>
          </div>

          {/* Subtitle */}
          <p className="text-xs text-ink-3 leading-relaxed mb-3">{cfg.subtitle}</p>

          {/* Alert message */}
          <p className="text-xs text-ink-2 italic mb-3">{alert.alert_message}</p>

          {/* Metrics strip */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-surface-3/50 border border-border p-2 text-center">
              <div className="text-[10px] text-ink-3 mb-1">Novelty Score</div>
              <div className={cn('text-lg font-black font-mono', cfg.metricClass)}>
                {Math.round(alert.novelty_score * 100)}%
              </div>
            </div>
            <div className="rounded-lg bg-surface-3/50 border border-border p-2 text-center">
              <div className="text-[10px] text-ink-3 mb-1">Closest Family</div>
              <div className="text-[11px] font-semibold text-ink-2 mt-1 truncate">
                {alert.closest_family}
              </div>
            </div>
            <div className="rounded-lg bg-surface-3/50 border border-border p-2 text-center">
              <div className="text-[10px] text-ink-3 mb-1">Similarity</div>
              <div className="text-lg font-black font-mono text-ink-2">
                {Math.round(alert.closest_similarity * 100)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer — only for emerging */}
      {stage === 'emerging' && (
        <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-2">
          <ShieldQuestion className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
          <p className="text-[11px] text-ink-3">
            Consider submitting this to the Community Intel Feed to help protect others.
          </p>
        </div>
      )}
    </div>
  );
});
