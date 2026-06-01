'use client';

import { useEffect, useRef } from 'react';
import type { GraphData } from '@/lib/types';

interface Props {
  graphData: GraphData;
}

export default function CytoscapeWrapper({ graphData }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<unknown>(null);

  useEffect(() => {
    if (!containerRef.current || !graphData.nodes.length) return;

    let active = true;
    let cy: {
      destroy(): void;
    } | null = null;

    (async () => {
      const cytoscape = (await import('cytoscape')).default;
      if (!active || !containerRef.current) return;

      const elements = [
        ...graphData.nodes.map((n) => ({
          data: {
            id: n.id,
            label: n.label,
            size: Math.max(40, Math.min(90, n.size * 3)),
            color: n.color,
            family: n.family,
          },
        })),
        ...graphData.edges.map((e) => ({
          data: {
            id: `${e.source}-${e.target}`,
            source: e.source,
            target: e.target,
            weight: e.weight,
          },
        })),
      ];

      cy = cytoscape({
        container: containerRef.current,
        elements,
        style: [
          {
            selector: 'node',
            style: {
              'background-color': 'data(color)',
              'label': 'data(label)',
              'width': 'data(size)',
              'height': 'data(size)',
              'font-size': '10px',
              'font-family': 'JetBrains Mono, monospace',
              'color': '#e2e8f0',
              'text-valign': 'bottom',
              'text-halign': 'center',
              'text-margin-y': 6,
              'border-width': 2,
              'border-color': 'data(color)',
              'border-opacity': 0.6,
              'text-wrap': 'wrap',
              'text-max-width': '80px',
              'background-opacity': 0.85,
            },
          },
          {
            selector: 'node:hover',
            style: {
              'border-width': 3,
              'border-opacity': 1,
              'background-opacity': 1,
            },
          },
          {
            selector: 'edge',
            style: {
              'width': (ele: { data: (key: string) => number }) => Math.max(1, ele.data('weight') * 4),
              'line-color': '#334155',
              'opacity': 0.7,
              'curve-style': 'bezier',
              'line-style': 'dashed',
              'line-dash-pattern': [6, 3],
            },
          },
          {
            selector: 'edge:hover',
            style: {
              'line-color': '#6366f1',
              'opacity': 1,
            },
          },
        ],
        layout: {
          name: 'cose',
          idealEdgeLength: 150,
          nodeOverlap: 20,
          refresh: 20,
          fit: true,
          padding: 40,
          randomize: false,
          componentSpacing: 100,
          nodeRepulsion: 400000,
          edgeElasticity: 100,
          nestingFactor: 5,
          gravity: 80,
          numIter: 1000,
          animate: true,
          animationDuration: 600,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
        userZoomingEnabled: true,
        userPanningEnabled: true,
        boxSelectionEnabled: false,
      });

      if (!active) {
        cy.destroy();
      } else {
        cyRef.current = cy;
      }
    })();

    return () => {
      active = false;
      if (cy) cy.destroy();
    };
  }, [graphData]);

  return (
    <div
      ref={containerRef}
      className="w-full h-[420px] rounded-lg bg-cyber-bg border border-cyber-border"
      style={{ minHeight: 420 }}
    />
  );
}
