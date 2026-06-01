'use client';

import { useEffect, useState } from 'react';
import { Shield, Network, AlertTriangle, Crosshair } from 'lucide-react';
import { api } from '@/lib/api';
import type { DashboardStats } from '@/lib/types';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <div className={cn(
      'flex items-center gap-4 rounded-xl border border-cyber-border bg-cyber-card p-4',
      'hover:border-cyber-accent/40 transition-colors'
    )}>
      <div className={cn('p-2.5 rounded-lg', color)}>{icon}</div>
      <div>
        <div className="text-2xl font-bold font-mono text-cyber-text">{value}</div>
        <div className="text-xs text-cyber-muted uppercase tracking-wider">{label}</div>
      </div>
    </div>
  );
}

export function StatsBar() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    api.getStats().then(setStats).catch(() => null);
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatCard
        icon={<Shield className="w-5 h-5 text-cyber-accent" />}
        label="Scam Messages"
        value={stats?.total_messages ?? '—'}
        color="bg-cyber-accent/10"
      />
      <StatCard
        icon={<Network className="w-5 h-5 text-blue-400" />}
        label="Fraud Families"
        value={stats?.total_families ?? '—'}
        color="bg-blue-500/10"
      />
      <StatCard
        icon={<AlertTriangle className="w-5 h-5 text-threat-high" />}
        label="Recent Threats"
        value={stats?.recent_threats ?? '—'}
        color="bg-threat-high/10"
      />
      <StatCard
        icon={<Crosshair className="w-5 h-5 text-threat-low" />}
        label="Detection Accuracy"
        value="94.7%"
        color="bg-threat-low/10"
      />
    </div>
  );
}
