'use client';

import dynamic from 'next/dynamic';
import { Network } from 'lucide-react';
import type { GraphData } from '@/lib/types';
import { cn } from '@/lib/utils';

const CytoscapeWrapper = dynamic(() => import('./CytoscapeWrapper'), { ssr: false });

interface Props {
  graphData: GraphData;
  className?: string;
}

export function ThreatGraph({ graphData, className }: Props) {
  const nodeCount = graphData.nodes.length;
  const edgeCount = graphData.edges.length;

  return (
    <div className={cn('rounded-2xl border border-border bg-surface-2 overflow-hidden', className)}>
      <div className="px-5 pt-4 pb-3 border-b border-border flex items-center justify-between">
        <div>
          <div className="text-[10px] text-ink-3 uppercase tracking-widest mb-0.5">Threat Mutation Graph</div>
          <div className="text-sm font-bold text-ink">Fraud Family Network</div>
        </div>
        <div className="flex items-center gap-3 text-xs text-ink-3 font-mono">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-neon" />
            {nodeCount} families
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded bg-border" />
            {edgeCount} links
          </span>
        </div>
      </div>

      {nodeCount === 0 ? (
        <div className="h-[400px] flex items-center justify-center">
          <div className="text-center space-y-2">
            <Network className="w-10 h-10 mx-auto text-ink-3 opacity-30" />
            <p className="text-sm text-ink-3">Graph unavailable</p>
          </div>
        </div>
      ) : (
        <CytoscapeWrapper graphData={graphData} />
      )}

      {nodeCount > 0 && (
        <div className="px-5 py-3 border-t border-border flex flex-wrap gap-3">
          {graphData.nodes.map((n) => (
            <div key={n.id} className="flex items-center gap-1.5 text-xs text-ink-3">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: n.color }} />
              {n.label}
            </div>
          ))}
        </div>
      )}

      <div className="px-5 py-3 bg-surface-3/20 border-t border-border">
        <p className="text-[10px] text-ink-3">
          Edges show semantic proximity (cosine similarity &gt;0.45) between fraud family centroids stored in Qdrant.
        </p>
      </div>
    </div>
  );
}
