'use client';

import { memo, useState } from 'react';
import {
  ShieldAlert, ShieldCheck, Shield, ShieldQuestion,
  FileText, ImageIcon, Mic, ChevronDown, ChevronUp,
  AlertCircle,
} from 'lucide-react';
import type { AnalysisResult, ThreatLevel } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ThreatConfig {
  icon: React.ReactNode;
  label: string;
  color: string;
  bg: string;
  borderClass: string;
  scoreColor: string;
}

const THREAT: Record<ThreatLevel, ThreatConfig> = {
  HIGH: {
    icon: <ShieldAlert className="w-9 h-9" />,
    label: 'HIGH THREAT',
    color: 'text-threat-high',
    bg: 'bg-gradient-to-r from-orange-950/40 to-surface-2',
    borderClass: 'border-threat-high',
    scoreColor: 'text-threat-high',
  },
  MEDIUM: {
    icon: <Shield className="w-9 h-9" />,
    label: 'MEDIUM THREAT',
    color: 'text-threat-medium',
    bg: 'bg-gradient-to-r from-yellow-950/30 to-surface-2',
    borderClass: 'border-yellow-600/40',
    scoreColor: 'text-threat-medium',
  },
  LOW: {
    icon: <ShieldCheck className="w-9 h-9" />,
    label: 'LOW THREAT',
    color: 'text-threat-low',
    bg: 'bg-gradient-to-r from-green-950/30 to-surface-2',
    borderClass: 'border-green-700/40',
    scoreColor: 'text-threat-low',
  },
  'ZERO-DAY': {
    icon: <ShieldQuestion className="w-9 h-9 animate-pulse" />,
    label: 'ZERO-DAY',
    color: 'text-threat-zeroday',
    bg: 'bg-gradient-to-r from-purple-950/40 to-surface-2',
    borderClass: 'border-threat-zeroday',
    scoreColor: 'text-threat-zeroday',
  },
};

const MODALITY_ICON = {
  text: <FileText className="w-3.5 h-3.5" />,
  image: <ImageIcon className="w-3.5 h-3.5" />,
  audio: <Mic className="w-3.5 h-3.5" />,
};

interface Props { result: AnalysisResult; }

export const ThreatCard = memo(function ThreatCard({ result }: Props) {
  const [expanded, setExpanded] = useState(false);
  const cfg = THREAT[result.threat_level];
  const pct = Math.round(result.threat_score * 100);

  return (
    <div className={cn('rounded-2xl border-2 overflow-hidden shadow-card', cfg.borderClass)}>
      {/* Score header */}
      <div className={cn('p-5', cfg.bg)}>
        <div className="flex items-center gap-5">
          <div className={cn(cfg.color, result.threat_level === 'HIGH' && 'animate-pulse-threat')}>
            {cfg.icon}
          </div>
          <div className="flex-1">
            <div className={cn('text-xl font-black font-mono tracking-widest', cfg.color)}>
              {cfg.label}
            </div>
            <div className="text-ink-3 text-xs mt-0.5">Qdrant semantic similarity</div>
          </div>
          <div className="text-right">
            <div className={cn('text-5xl font-black font-mono leading-none', cfg.scoreColor)}>
              {pct}
              <span className="text-xl">%</span>
            </div>
            <div className="text-ink-3 text-xs mt-1">confidence</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-2 bg-black/30 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${pct}%`,
              background: `linear-gradient(90deg, ${
                result.threat_level === 'HIGH' ? '#ff6b35, #ff2d55' :
                result.threat_level === 'MEDIUM' ? '#f59e0b, #ffd60a' :
                result.threat_level === 'ZERO-DAY' ? '#9333ea, #bf5af2' :
                '#22c55e, #30d158'
              })`,
            }}
          />
        </div>
      </div>

      {/* Details */}
      <div className="p-5 space-y-4 bg-surface-2">
        {/* Family + Cluster + Modality */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-border bg-surface-3 p-3">
            <div className="text-[10px] text-ink-3 uppercase tracking-widest mb-1.5">Fraud Family</div>
            <div className="text-sm font-bold text-ink truncate">{result.detected_family}</div>
          </div>
          <div className="rounded-lg border border-border bg-surface-3 p-3">
            <div className="text-[10px] text-ink-3 uppercase tracking-widest mb-1.5">Cluster</div>
            <div className="text-sm font-bold font-mono text-neon-2">#{result.cluster_id}</div>
          </div>
          <div className="rounded-lg border border-border bg-surface-3 p-3">
            <div className="text-[10px] text-ink-3 uppercase tracking-widest mb-1.5">Modality</div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-ink-2">
              {MODALITY_ICON[result.modality]}
              {result.modality.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Risk indicators */}
        <div className="space-y-2">
          <div className="text-[10px] text-ink-3 uppercase tracking-widest">Risk Signals</div>
          <div className="space-y-1.5">
            {result.risk_indicators.map((indicator, i) => (
              <div
                key={i}
                className="text-xs text-ink-2 bg-surface-3 border border-border rounded-lg px-3 py-2 leading-relaxed"
              >
                {indicator}
              </div>
            ))}
          </div>
        </div>

        {/* Extracted text */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-ink-3" />
            <div className="text-[10px] text-ink-3 uppercase tracking-widest">Analyzed Content</div>
          </div>
          <div className="rounded-lg border border-border bg-void/60 p-3">
            <p className={cn(
              'text-xs font-mono text-ink-2 leading-relaxed',
              !expanded && 'line-clamp-3',
            )}>
              {result.extracted_text}
            </p>
            {result.extracted_text.length > 200 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-neon text-xs mt-2 hover:text-neon-2 transition-colors"
              >
                {expanded
                  ? <><ChevronUp className="w-3 h-3" />Show less</>
                  : <><ChevronDown className="w-3 h-3" />Read full</>
                }
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
