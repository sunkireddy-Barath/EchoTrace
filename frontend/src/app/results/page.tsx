'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Clock, Zap, Dna, Share2, Brain, GitBranch } from 'lucide-react';
import type { AnalysisResult } from '@/lib/types';
import { ThreatCard } from '@/components/ThreatCard';
import { SimilarityMeter } from '@/components/SimilarityMeter';
import { EvolutionTimeline } from '@/components/EvolutionTimeline';
import { ThreatGraph } from '@/components/ThreatGraph';
import { ZeroDayAlert } from '@/components/ZeroDayAlert';
import { GenomeRadar } from '@/components/GenomeRadar';
import { cn } from '@/lib/utils';

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-3">
      <div className="text-[10px] text-ink-3 uppercase tracking-widest font-mono mb-0.5">{title}</div>
      {sub && <div className="text-xs text-ink-3">{sub}</div>}
    </div>
  );
}

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [ts] = useState(() => new Date().toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  }));

  useEffect(() => {
    const raw = localStorage.getItem('echotrace_result');
    if (!raw) { router.push('/analyze'); return; }
    try { setResult(JSON.parse(raw)); } catch { router.push('/analyze'); }
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
      <div className="min-h-screen bg-grid-pattern flex items-center justify-center">
        <div className="text-center space-y-3">
          <Zap className="w-10 h-10 text-neon mx-auto animate-pulse" />
          <p className="text-ink-3 font-mono text-sm">Loading intelligence report...</p>
        </div>
      </div>
    );
  }

  const threatBorderMap: Record<string, string> = {
    HIGH: 'border-l-threat-high',
    MEDIUM: 'border-l-yellow-500',
    LOW: 'border-l-threat-low',
    'ZERO-DAY': 'border-l-threat-zeroday',
  };

  return (
    <div className="min-h-screen bg-grid-pattern">
      {/* Topbar */}
      <div className="sticky top-0 z-30 border-b border-border bg-void/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-5 py-2.5 flex items-center gap-3">
          <button
            onClick={() => router.push('/analyze')}
            className="flex items-center gap-1.5 text-ink-3 hover:text-ink text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            New Analysis
          </button>

          <div className="flex-1 flex items-center gap-2 justify-center">
            <span className={cn(
              'text-xs font-black font-mono px-2.5 py-1 rounded border-l-2',
              result.threat_level === 'HIGH'     ? 'bg-threat-high/10 text-threat-high border-l-threat-high' :
              result.threat_level === 'MEDIUM'   ? 'bg-yellow-500/10 text-threat-medium border-l-yellow-500' :
              result.threat_level === 'ZERO-DAY' ? 'bg-rose-500/10 text-rose-400 border-l-rose-500' :
              result.variant_stage === 'evolving' ? 'bg-amber-500/10 text-amber-400 border-l-amber-500' :
              'bg-emerald-500/10 text-emerald-400 border-l-emerald-500',
            )}>
              {result.threat_level}
            </span>
            <span className="text-xs text-ink-2 font-medium">{result.detected_family}</span>
            <span className="text-xs text-ink-3 font-mono">·</span>
            <span className="text-xs text-ink-3 font-mono">{Math.round(result.threat_score * 100)}% match</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-ink-3 font-mono hidden sm:flex">
              <Clock className="w-3 h-3" />{ts}
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 text-xs border border-border px-3 py-1.5 rounded-lg text-ink-2 hover:border-border-2 hover:text-ink transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 py-7 animate-fade-up">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-5">
          {/* ── Left column ── */}
          <div className="space-y-5">
            {/* Threat card */}
            <ThreatCard result={result} />

            {/* Final Insight Briefing Card */}
            <div className="rounded-2xl border border-neon/30 bg-neon/5 overflow-hidden">
              <div className="px-5 py-4 flex gap-4">
                <Brain className="w-5 h-5 text-neon flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] text-ink-3 uppercase tracking-widest font-mono mb-1">
                    Psychological Intelligence Briefing
                  </div>
                  <p className="text-sm text-ink-2 font-medium leading-relaxed">
                    {result.insight_text}
                  </p>
                </div>
              </div>
            </div>

            {/* Threat Radar (all variants — always show) */}
            <ZeroDayAlert alert={result.zero_day} />

            {/* Incubation summary for evolving/emerging */}
            {(result.variant_stage === 'evolving' || result.variant_stage === 'emerging') && result.incubation_summary && (
              <div className="flex items-start gap-3 rounded-xl border border-border bg-surface-2 p-3.5">
                <GitBranch className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-ink-3 leading-relaxed">{result.incubation_summary}</p>
              </div>
            )}

            {/* Semantic Genome */}
            <div className="rounded-2xl border border-border bg-surface-2 overflow-hidden">
              <div className="px-5 pt-4 pb-3 border-b border-border flex items-center gap-3">
                <Dna className="w-4 h-4 text-neon" />
                <div>
                  <div className="text-[10px] text-ink-3 uppercase tracking-widest mb-0.5">Semantic Genome</div>
                  <div className="text-sm font-bold text-ink">Psychological Attack Profile</div>
                </div>
              </div>
              <div className="p-5">
                <GenomeRadar genome={result.genome} />
              </div>
              <div className="px-5 py-3 bg-surface-3/20 border-t border-border">
                <p className="text-[10px] text-ink-3">
                  8 psychological manipulation dimensions scored using Qdrant probe embedding similarity.
                  Dominant vector: <span className="text-neon">{result.genome.dominant_vector}</span>
                </p>
              </div>
            </div>

            {/* Hidden Psychological Relatives */}
            <div className="rounded-2xl border border-border bg-surface-2 overflow-hidden">
              <div className="px-5 pt-4 pb-3 border-b border-border flex items-center gap-3">
                <Dna className="w-4 h-4 text-neon" />
                <div>
                  <div className="text-[10px] text-ink-3 uppercase tracking-widest mb-0.5">Cross-Family Lineage</div>
                  <div className="text-sm font-bold text-ink">Hidden Psychological Relatives</div>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-xs text-ink-3 leading-relaxed">
                  The following scams belong to different semantic families but share high structural alignment across the 8 psychological vectors.
                </p>
                {result.psychological_relatives && result.psychological_relatives.length > 0 ? (
                  <div className="space-y-4">
                    {result.psychological_relatives.map((rel) => (
                      <div key={rel.id} className="p-3.5 rounded-xl bg-surface-3 border border-border space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-ink-2 font-mono uppercase tracking-wider">{rel.family}</span>
                          <span className="font-mono text-neon font-black bg-neon/10 px-2 py-0.5 rounded border border-neon/20">
                            {Math.round(rel.dna_similarity * 100)}% DNA Match
                          </span>
                        </div>
                        <p className="text-xs text-ink-3 italic line-clamp-2">
                          &ldquo;{rel.text}&rdquo;
                        </p>
                        <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[10px] text-ink-3 font-mono">
                          <span>Dominant Vector: <span className="text-ink-2 font-semibold capitalize">{rel.dominant_vector.replace('_', ' ')}</span></span>
                          <span>Semantic Sim: {Math.round(rel.similarity * 100)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 border border-dashed border-border rounded-xl">
                    <span className="text-xs text-ink-3 font-mono">No cross-family psychological alignments detected.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="space-y-5">
            {/* Similar messages */}
            <div className="rounded-2xl border border-border bg-surface-2 overflow-hidden">
              <div className="px-5 pt-4 pb-3 border-b border-border">
                <SectionHeader
                  title="Semantically Similar Scams"
                  sub="Nearest Qdrant vector neighbors — same intent, different wording"
                />
              </div>
              <div className="p-4">
                <SimilarityMeter messages={result.similar_messages} />
              </div>
            </div>

            {/* Evolution */}
            <EvolutionTimeline
              timeline={result.evolution_timeline}
              family={result.detected_family}
            />

            {/* Threat graph */}
            <ThreatGraph graphData={result.graph_data} />
          </div>
        </div>

        {/* Bottom — Qdrant intelligence note */}
        <div className="mt-6 rounded-2xl border border-neon/20 bg-neon/5 p-5">
          <div className="flex gap-4">
            <Zap className="w-5 h-5 text-neon flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-ink mb-1">How EchoTrace uses Qdrant</p>
              <p className="text-xs text-ink-2 leading-relaxed">
                All {result.similar_messages.length} similar scams were retrieved from Qdrant&apos;s HNSW vector
                index (INT8 quantized, 384-dim cosine space) in milliseconds. The evolution timeline uses a
                family-filtered <code className="text-neon font-mono">query_points()</code> call sorted by year.
                The Semantic Genome is computed by dot-product against 8 pre-embedded psychological probe vectors.
                No keyword matching — pure semantic vector intelligence.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
