'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Clock, Zap } from 'lucide-react';
import type { AnalysisResult } from '@/lib/types';
import { ThreatCard } from '@/components/ThreatCard';
import { SimilarityMeter } from '@/components/SimilarityMeter';
import { EvolutionTimeline } from '@/components/EvolutionTimeline';
import { ThreatGraph } from '@/components/ThreatGraph';
import { Button } from '@/components/ui/button';

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [timestamp] = useState(() => new Date().toLocaleString());

  useEffect(() => {
    const raw = localStorage.getItem('echotrace_result');
    if (!raw) {
      router.push('/');
      return;
    }
    try {
      setResult(JSON.parse(raw));
    } catch {
      router.push('/');
    }
  }, [router]);

  const handleExport = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `echotrace-${result.detected_family.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!result) {
    return (
      <div className="min-h-screen cyber-grid flex items-center justify-center">
        <div className="text-center space-y-3">
          <Zap className="w-10 h-10 text-cyber-accent mx-auto animate-pulse" />
          <p className="text-cyber-muted font-mono text-sm">Loading analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen cyber-grid">
      {/* Top bar */}
      <div className="sticky top-0 z-50 border-b border-cyber-border bg-cyber-bg/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
            <ArrowLeft className="w-4 h-4" />
            New Analysis
          </Button>

          <div className="flex items-center gap-2 text-xs text-cyber-muted font-mono">
            <Clock className="w-3 h-3" />
            <span className="hidden sm:inline">{timestamp}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-cyber-muted font-mono hidden md:inline">
              {result.detected_family}
            </span>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Header banner */}
      <div className="border-b border-cyber-border bg-cyber-card">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-cyber-accent" />
            <div>
              <h1 className="text-base font-bold text-cyber-text font-mono">
                EchoTrace Threat Intelligence Report
              </h1>
              <p className="text-xs text-cyber-muted mt-0.5">
                Powered by Qdrant semantic vector search · {result.similar_messages.length} similar scams found
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8 animate-slide-up">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-6">
            <ThreatCard result={result} />
            <SimilarityMeter messages={result.similar_messages} />
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <EvolutionTimeline
              timeline={result.evolution_timeline}
              family={result.detected_family}
            />
            <ThreatGraph graphData={result.graph_data} />
          </div>
        </div>

        {/* Bottom context note */}
        <div className="mt-8 rounded-xl border border-cyber-border bg-cyber-card p-5">
          <div className="flex gap-4">
            <Zap className="w-5 h-5 text-cyber-accent flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-cyber-text">Why EchoTrace uses Qdrant</h3>
              <p className="text-cyber-muted text-sm leading-relaxed">
                Traditional keyword detection misses scams that change wording. EchoTrace stores all scam messages
                as 384-dimensional semantic vectors in Qdrant. When you submit content, it is embedded by
                SentenceTransformers and searched against the corpus using cosine similarity — finding semantically
                identical fraud even when every word is different. The evolution timeline and mutation graph are
                built entirely from Qdrant query results.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
