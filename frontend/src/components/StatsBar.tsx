'use client';

import { memo, useEffect, useState } from 'react';
import { Database, Network, Zap, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';
import type { DashboardStats } from '@/lib/types';
import { cn } from '@/lib/utils';

interface StatProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  glowClass?: string;
}

const StatCard = memo(function StatCard({ icon, label, value, sub, color, glowClass }: StatProps) {
  return (
    <div className={cn(
      'rounded-xl border border-border bg-surface-2 p-4 flex items-center gap-4',
      'hover:border-border-2 transition-all',
      glowClass,
    )}>
      <div className={cn('p-2.5 rounded-xl flex-shrink-0', color + '/10')}>
        <div className={color}>{icon}</div>
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-black font-mono text-ink">{value}</div>
        <div className="text-xs font-medium text-ink-3 uppercase tracking-wider mt-0.5">{label}</div>
        {sub && <div className="text-[10px] text-ink-3 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
});

export const StatsBar = memo(function StatsBar() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.getStats()
      .then((data) => { if (!cancelled) setStats(data); })
      .catch(() => null)
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const placeholder = loading ? '…' : '—';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard
        icon={<Database className="w-5 h-5" />}
        label="Scam Vectors"
        value={stats?.total_messages ?? placeholder}
        sub="in Qdrant corpus"
        color="text-neon"
      />
      <StatCard
        icon={<Network className="w-5 h-5" />}
        label="Fraud Families"
        value={stats?.total_families ?? placeholder}
        sub="tracked clusters"
        color="text-neon-2"
      />
      <StatCard
        icon={<AlertTriangle className="w-5 h-5" />}
        label="2024–25 Threats"
        value={stats?.recent_threats ?? placeholder}
        sub="active families"
        color="text-threat-high"
      />
      <StatCard
        icon={<Zap className="w-5 h-5" />}
        label="Community Reports"
        value={stats?.zero_day_count ?? (loading ? '…' : 0)}
        sub="crowd-sourced intel"
        color="text-threat-zeroday"
      />
    </div>
  );
});
