'use client';

import dynamic from 'next/dynamic';
import { Network } from 'lucide-react';
import type { GraphData } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Cytoscape.js uses window/document — must not run on the server
const CytoscapeWrapper = dynamic(() => import('./CytoscapeWrapper'), { ssr: false });

interface Props {
  graphData: GraphData;
}

export function ThreatGraph({ graphData }: Props) {
  const nodeCount = graphData.nodes.length;
  const edgeCount = graphData.edges.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Threat Mutation Graph</CardTitle>
          <div className="flex items-center gap-3 text-xs text-cyber-muted font-mono">
            <span>{nodeCount} families</span>
            <span>{edgeCount} connections</span>
          </div>
        </div>
        <p className="text-xs text-cyber-muted mt-1">
          Edges show semantic proximity between fraud families (cosine similarity &gt; 0.45)
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {nodeCount === 0 ? (
          <div className="h-[420px] flex items-center justify-center text-cyber-muted">
            <div className="text-center space-y-2">
              <Network className="w-10 h-10 mx-auto opacity-30" />
              <p className="text-sm">Graph data unavailable</p>
            </div>
          </div>
        ) : (
          <CytoscapeWrapper graphData={graphData} />
        )}

        {/* Legend */}
        {nodeCount > 0 && (
          <div className="flex flex-wrap gap-3 pt-1">
            {graphData.nodes.map((n) => (
              <div key={n.id} className="flex items-center gap-1.5 text-xs text-cyber-muted">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: n.color }} />
                {n.label}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
