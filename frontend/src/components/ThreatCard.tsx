'use client';

import { useState } from 'react';
import { ShieldAlert, ShieldCheck, Shield, FileText, Image, Mic, ChevronDown, ChevronUp } from 'lucide-react';
import type { AnalysisResult, ThreatLevel } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const THREAT_CONFIG: Record<ThreatLevel, {
  icon: React.ReactNode;
  label: string;
  color: string;
  bg: string;
  border: string;
  badge: 'high' | 'medium' | 'low';
}> = {
  HIGH: {
    icon: <ShieldAlert className="w-8 h-8" />,
    label: 'HIGH THREAT',
    color: 'text-threat-high',
    bg: 'bg-threat-high-bg',
    border: 'border-threat-high/40',
    badge: 'high',
  },
  MEDIUM: {
    icon: <Shield className="w-8 h-8" />,
    label: 'MEDIUM THREAT',
    color: 'text-threat-medium',
    bg: 'bg-threat-medium-bg',
    border: 'border-threat-medium/40',
    badge: 'medium',
  },
  LOW: {
    icon: <ShieldCheck className="w-8 h-8" />,
    label: 'LOW THREAT',
    color: 'text-threat-low',
    bg: 'bg-threat-low-bg',
    border: 'border-threat-low/40',
    badge: 'low',
  },
};

const MODALITY_ICON: Record<string, React.ReactNode> = {
  text: <FileText className="w-4 h-4" />,
  image: <Image className="w-4 h-4" />,
  audio: <Mic className="w-4 h-4" />,
};

interface Props {
  result: AnalysisResult;
}

export function ThreatCard({ result }: Props) {
  const [showFullText, setShowFullText] = useState(false);
  const cfg = THREAT_CONFIG[result.threat_level];
  const scorePercent = Math.round(result.threat_score * 100);

  return (
    <Card className={cn('border-2', cfg.border)}>
      <CardHeader>
        <CardTitle>Threat Assessment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Threat level + score */}
        <div className={cn('rounded-xl p-5 flex items-center gap-5', cfg.bg)}>
          <div className={cn(cfg.color, result.threat_level === 'HIGH' && 'animate-threat-pulse')}>
            {cfg.icon}
          </div>
          <div className="flex-1">
            <div className={cn('text-2xl font-bold font-mono', cfg.color)}>{cfg.label}</div>
            <div className="text-cyber-muted text-sm mt-0.5">
              Semantic similarity score
            </div>
          </div>
          <div className="text-right">
            <div className={cn('text-4xl font-black font-mono', cfg.color)}>
              {scorePercent}%
            </div>
            <div className="text-cyber-muted text-xs">confidence</div>
          </div>
        </div>

        {/* Family + cluster + modality */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-cyber-border bg-cyber-bg p-3">
            <div className="text-xs text-cyber-muted uppercase tracking-wider mb-1">Detected Family</div>
            <div className="text-cyber-text font-semibold">{result.detected_family}</div>
          </div>
          <div className="rounded-lg border border-cyber-border bg-cyber-bg p-3">
            <div className="text-xs text-cyber-muted uppercase tracking-wider mb-1">Cluster ID</div>
            <div className="font-mono text-cyber-accent">#{result.cluster_id}</div>
          </div>
        </div>

        {/* Modality */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5">
            {MODALITY_ICON[result.modality]}
            {result.modality.toUpperCase()} INPUT
          </Badge>
          <Badge variant={cfg.badge}>{result.threat_level} RISK</Badge>
        </div>

        {/* Extracted text */}
        <div className="space-y-2">
          <div className="text-xs text-cyber-muted uppercase tracking-wider">Analyzed Content</div>
          <div className="rounded-lg border border-cyber-border bg-cyber-bg p-3 font-mono text-sm text-cyber-text/80 relative">
            <p className={cn('leading-relaxed', !showFullText && 'line-clamp-3')}>
              {result.extracted_text}
            </p>
            {result.extracted_text.length > 200 && (
              <button
                onClick={() => setShowFullText(!showFullText)}
                className="flex items-center gap-1 text-cyber-accent text-xs mt-2 hover:underline"
              >
                {showFullText ? <><ChevronUp className="w-3 h-3" />Show less</> : <><ChevronDown className="w-3 h-3" />Show full text</>}
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
