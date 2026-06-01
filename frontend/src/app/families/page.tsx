'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, TrendingUp } from 'lucide-react';
import type { FamilyStats } from '@/lib/types';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function FamiliesPage() {
  const [families, setFamilies] = useState<FamilyStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getFamilies()
      .then(setFamilies)
      .finally(() => setLoading(false));
  }, []);

  const chartData = families.map((f) => ({
    name: f.family.split(' ')[0],
    count: f.count,
    color: f.color,
  }));

  return (
    <div className="min-h-screen bg-grid-pattern">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-neon" />
          <h1 className="text-2xl font-black text-ink">Fraud Families</h1>
          <span className="text-xs font-mono bg-neon/10 text-neon border border-neon/30 px-2 py-0.5 rounded-full">
            {families.length} tracked
          </span>
        </div>

        {/* Bar chart */}
        {!loading && families.length > 0 && (
          <div className="rounded-2xl border border-border bg-surface-2 p-5">
            <div className="text-[10px] text-ink-3 uppercase tracking-widest mb-4 font-mono">Message Count by Family</div>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barSize={32}>
                  <XAxis dataKey="name" tick={{ fill: '#5b7ba8', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ background: '#0d1526', border: '1px solid #1a3060', borderRadius: '8px', fontSize: '11px', fontFamily: 'JetBrains Mono', color: '#e8f0fe' }}
                    formatter={(v: number) => [v, 'Messages']}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} opacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Family cards */}
        {loading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-36 rounded-2xl skeleton" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {families.map((family) => (
              <div
                key={family.family}
                className="rounded-2xl border border-border bg-surface-2 p-5 hover:border-border-2 transition-all space-y-4"
                style={{ borderLeftColor: family.color, borderLeftWidth: 3 }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-bold text-ink">{family.family}</div>
                    <div className="text-xs text-ink-3 mt-0.5">
                      {family.years[0]} – {family.years[family.years.length - 1]}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-2xl font-black font-mono" style={{ color: family.color }}>
                      {family.count}
                    </div>
                    <div className="text-[10px] text-ink-3">samples</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-surface-3 border border-border px-3 py-2">
                    <div className="text-ink-3 mb-0.5">Avg Confidence</div>
                    <div className="font-bold font-mono" style={{ color: family.color }}>
                      {Math.round(family.avg_confidence * 100)}%
                    </div>
                  </div>
                  <div className="rounded-lg bg-surface-3 border border-border px-3 py-2">
                    <div className="text-ink-3 mb-0.5">Active Years</div>
                    <div className="font-bold font-mono text-ink">{family.years.length}</div>
                  </div>
                </div>

                {/* Year dots */}
                <div className="flex flex-wrap gap-1.5">
                  {family.years.map((y) => (
                    <span
                      key={y}
                      className="text-[10px] font-mono border rounded px-1.5 py-0.5"
                      style={{ borderColor: family.color + '60', color: family.color + 'bb' }}
                    >
                      {y}
                    </span>
                  ))}
                </div>

                <Link
                  href={`/analyze`}
                  className="flex items-center gap-1.5 text-xs font-medium transition-colors"
                  style={{ color: family.color }}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  Analyze {family.family.split(' ')[0]} scam
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
