'use client';

import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import type { GenomeData } from '@/lib/types';
import { cn } from '@/lib/utils';

interface Props {
  genome: GenomeData;
}

const DIMENSION_SHORT: Record<string, string> = {
  urgency: 'Urgency',
  authority: 'Authority',
  fear: 'Fear',
  greed: 'Greed',
  trust_abuse: 'Trust',
  credential_harvest: 'Cred. Harvest',
  payment_trap: 'Payment Trap',
  digital_pivot: 'Digital',
};

const COMPLEXITY_LABEL = (c: number) => {
  if (c >= 0.75) return { label: 'COMPLEX', color: 'text-threat-critical' };
  if (c >= 0.5) return { label: 'MODERATE', color: 'text-threat-medium' };
  return { label: 'SIMPLE', color: 'text-threat-low' };
};

export function GenomeRadar({ genome }: Props) {
  const chartData = genome.dimensions.map((d) => ({
    subject: DIMENSION_SHORT[d.key] || d.label,
    score: Math.round(d.score * 100),
    fullMark: 100,
    color: d.color,
    description: d.description,
  }));

  const { label: complexityLabel, color: complexityColor } = COMPLEXITY_LABEL(genome.attack_complexity);
  const dominant = genome.dimensions.find((d) => d.key === genome.dominant_vector);

  return (
    <div className="space-y-4">
      {/* Radar chart */}
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
            <PolarGrid
              stroke="rgba(26,48,96,0.8)"
              strokeDasharray="2 4"
            />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: '#5b7ba8', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              tickLine={false}
            />
            <Radar
              name="Attack Profile"
              dataKey="score"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.15}
              strokeWidth={1.5}
              dot={{ fill: '#60a5fa', r: 3, strokeWidth: 0 }}
            />
            <Tooltip
              contentStyle={{
                background: '#0d1526',
                border: '1px solid #1a3060',
                borderRadius: '8px',
                fontSize: '12px',
                fontFamily: 'JetBrains Mono',
                color: '#e8f0fe',
              }}
              formatter={(value: number) => [`${value}%`, 'Score']}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Dimension bars */}
      <div className="space-y-2">
        {genome.dimensions.map((dim) => (
          <div key={dim.key} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-ink-2 font-medium">{dim.label}</span>
              <span className="font-mono" style={{ color: dim.color }}>
                {Math.round(dim.score * 100)}%
              </span>
            </div>
            <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${dim.score * 100}%`,
                  background: `linear-gradient(90deg, ${dim.color}88, ${dim.color})`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="rounded-lg bg-surface-3 border border-border p-3">
          <div className="text-[10px] text-ink-3 uppercase tracking-wider mb-1">Dominant Vector</div>
          <div className="text-sm font-semibold font-mono truncate" style={{ color: dominant?.color }}>
            {dominant?.label || genome.dominant_vector}
          </div>
        </div>
        <div className="rounded-lg bg-surface-3 border border-border p-3">
          <div className="text-[10px] text-ink-3 uppercase tracking-wider mb-1">Attack Complexity</div>
          <div className={cn('text-sm font-bold font-mono', complexityColor)}>
            {complexityLabel}
          </div>
          <div className="text-[10px] text-ink-3 mt-0.5 font-mono">{Math.round(genome.attack_complexity * 100)}% entropy</div>
        </div>
      </div>
    </div>
  );
}
