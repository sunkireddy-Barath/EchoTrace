import { Zap, ArrowRight, Shield, Dna, AlertOctagon, Activity } from 'lucide-react';
import Link from 'next/link';
import { StatsBar } from '@/components/StatsBar';

const FEATURES = [
  {
    icon: <Dna className="w-5 h-5" />,
    title: 'Semantic Genome',
    desc: '8-dimension psychological attack profiling. See WHY a scam works — urgency, fear, authority, credential harvesting — visualized as a radar chart.',
    color: 'text-neon',
    border: 'border-neon/20 hover:border-neon/50',
    bg: 'bg-neon/5',
  },
  {
    icon: <AlertOctagon className="w-5 h-5" />,
    title: 'Zero-Day Detection',
    desc: 'When a scam doesn\'t match any known family, EchoTrace flags it as an EMERGING THREAT with a novelty score — catching mutations before they\'re documented.',
    color: 'text-threat-zeroday',
    border: 'border-threat-zeroday/20 hover:border-threat-zeroday/50',
    bg: 'bg-threat-zeroday/5',
  },
  {
    icon: <Activity className="w-5 h-5" />,
    title: 'Evolution Velocity',
    desc: 'Measures how fast each fraud family is semantically drifting year-over-year. High velocity = rapidly adapting scam, harder to block with static rules.',
    color: 'text-threat-high',
    border: 'border-threat-high/20 hover:border-threat-high/40',
    bg: 'bg-threat-high/5',
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: 'Qdrant-Native Search',
    desc: 'Every detection comes from Qdrant\'s 384-dim HNSW vector index with INT8 quantization. Same fraud, different wording — still caught by cosine similarity.',
    color: 'text-threat-low',
    border: 'border-threat-low/20 hover:border-threat-low/40',
    bg: 'bg-threat-low/5',
  },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-grid-pattern">
      {/* Top bar */}
      <div className="sticky top-0 z-30 border-b border-border bg-void/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-threat-low animate-pulse" />
            <span className="text-xs text-ink-3 font-mono">Qdrant Connected · 82 vectors indexed</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-neon/15 text-neon border border-neon/30 rounded-full px-2.5 py-0.5 font-mono">
              v2.0
            </span>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-12">
        {/* Hero */}
        <section className="relative scan-container rounded-2xl overflow-hidden border border-border bg-surface-2 p-10">
          <div className="scan-line" />
          {/* Background glow */}
          <div className="absolute inset-0 bg-hero-glow pointer-events-none" />

          <div className="relative space-y-6 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-neon/30 bg-neon/8 px-4 py-1.5 text-xs text-neon font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse" />
              World&apos;s First Semantic Fraud Genome Engine
            </div>

            <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-[1.1]">
              <span className="text-ink">Detect Fraud</span>
              <br />
              <span className="text-gradient">Before Keywords Can</span>
            </h1>

            <p className="text-ink-2 text-lg leading-relaxed max-w-2xl mx-auto">
              EchoTrace maps the <span className="text-neon font-semibold">semantic DNA of scams</span> using
              Qdrant vector search — detecting fraud families, tracing linguistic evolution,
              and identifying zero-day threats that keyword systems miss entirely.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/analyze"
                className="inline-flex items-center justify-center gap-2.5 h-12 px-8 rounded-xl bg-gradient-to-r from-neon to-indigo-500 text-white font-semibold text-sm hover:from-neon/90 hover:to-indigo-500/90 glow-blue transition-all"
              >
                <Zap className="w-4 h-4" />
                Analyze a Scam Now
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="http://localhost:8000/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl border border-border bg-surface-3 text-ink-2 text-sm hover:border-border-2 hover:text-ink transition-all"
              >
                API Documentation
              </a>
            </div>
          </div>
        </section>

        {/* Live stats */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="text-xs text-ink-3 uppercase tracking-widest font-mono">Live Intelligence</div>
            <div className="flex-1 h-px bg-border" />
          </div>
          <StatsBar />
        </section>

        {/* Novel features */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="text-xs text-ink-3 uppercase tracking-widest font-mono">Novel Capabilities</div>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className={`rounded-xl border ${f.border} ${f.bg} p-5 space-y-3 transition-all`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-surface-3 ${f.color}`}>{f.icon}</div>
                  <h3 className="font-bold text-ink">{f.title}</h3>
                </div>
                <p className="text-sm text-ink-2 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Why EchoTrace wins */}
        <section className="rounded-2xl border border-border bg-surface-2 p-8">
          <div className="text-xs text-ink-3 uppercase tracking-widest font-mono mb-4">Why EchoTrace Beats Keyword Systems</div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              ['Keyword Filter', ['❌ Bypassed by synonyms', '❌ Misses new phrasing', '❌ No family clustering', '❌ No evolution tracking']],
              ['EchoTrace AI', ['✅ Semantic similarity', '✅ Detects same intent', '✅ 8-dim attack genome', '✅ Zero-day alerts']],
              ['Business Value', ['🎯 Fewer false negatives', '📊 Intelligence reports', '🔮 Predictive warnings', '🤝 Community corpus']],
            ].map(([title, items]) => (
              <div key={title as string} className={title === 'EchoTrace AI' ? 'rounded-xl bg-neon/5 border border-neon/20 p-4' : ''}>
                <div className="font-bold text-ink mb-3 text-sm">{title as string}</div>
                <ul className="space-y-1.5">
                  {(items as string[]).map((item, i) => (
                    <li key={i} className="text-xs text-ink-2">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
