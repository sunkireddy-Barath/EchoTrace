import {
  Zap, ArrowRight, Shield, Dna, AlertOctagon, Activity,
  XCircle, Ban, ShieldOff, ShieldCheck, ScanSearch, BrainCircuit, Radar,
  TrendingUp, BarChart3, Target, AlertTriangle,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { StatsBar } from '@/components/StatsBar';

const COMPARISON_COLUMNS: {
  title: string;
  headerIcon: LucideIcon;
  headerIconBg: string;
  headerIconColor: string;
  variant: 'keyword' | 'echotrace' | 'business';
  cardClass: string;
  hover: string;
  items: { icon: LucideIcon; text: string }[];
}[] = [
  {
    title: 'Keyword Filter',
    headerIcon: ShieldOff,
    headerIconBg: 'bg-red-500/10 border-red-500/25',
    headerIconColor: 'text-red-400/90',
    variant: 'keyword',
    cardClass: 'rounded-xl border border-border bg-surface-3/40 p-4',
    hover: 'hover:border-red-500/30 hover:shadow-[0_4px_20px_rgba(239,68,68,0.06)]',
    items: [
      { icon: XCircle, text: 'Bypassed by synonym substitution' },
      { icon: Ban, text: 'Misses rephrased scam variants' },
      { icon: ShieldOff, text: 'No fraud family clustering' },
      { icon: XCircle, text: 'No evolution or lineage tracking' },
    ],
  },
  {
    title: 'EchoTrace AI',
    headerIcon: ShieldCheck,
    headerIconBg: 'bg-cyan-500/10 border-cyan-500/25',
    headerIconColor: 'text-emerald-400/90',
    variant: 'echotrace',
    cardClass: 'rounded-xl bg-neon/5 border border-neon/20 p-4',
    hover: 'hover:border-cyan-500/35 hover:shadow-[0_4px_20px_rgba(34,211,238,0.08)]',
    items: [
      { icon: ScanSearch, text: '384-dim semantic similarity detection' },
      { icon: ShieldCheck, text: 'Same intent detected across phrasing' },
      { icon: BrainCircuit, text: '8-dimension psychological attack genome' },
      { icon: Radar, text: 'Zero-day and emerging threat alerts' },
    ],
  },
  {
    title: 'Business Value',
    headerIcon: BarChart3,
    headerIconBg: 'bg-amber-500/10 border-amber-500/25',
    headerIconColor: 'text-blue-400/90',
    variant: 'business',
    cardClass: 'rounded-xl border border-border bg-surface-3/40 p-4',
    hover: 'hover:border-blue-500/30 hover:shadow-[0_4px_20px_rgba(59,130,246,0.06)]',
    items: [
      { icon: Target, text: 'Fewer false negatives on intent match' },
      { icon: TrendingUp, text: 'Exportable intelligence briefings' },
      { icon: Activity, text: 'Predictive evolution velocity warnings' },
      { icon: AlertTriangle, text: 'Community-indexed threat corpus' },
    ],
  },
];

function ComparisonBullet({
  icon: Icon,
  text,
  variant,
}: {
  icon: LucideIcon;
  text: string;
  variant: 'keyword' | 'echotrace' | 'business';
}) {
  const iconColor = {
    keyword: 'text-red-400/85',
    echotrace: 'text-cyan-400/90',
    business: 'text-amber-400/85',
  }[variant];

  return (
    <li className="flex items-start gap-2.5">
      <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${iconColor}`} strokeWidth={1.75} />
      <span className="text-xs text-ink-2 leading-snug">{text}</span>
    </li>
  );
}

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
        <section className="rounded-2xl border border-border bg-surface-2 p-8 transition-all duration-200 hover:border-border-2 hover:shadow-[0_4px_28px_rgba(0,0,0,0.25)]">
          <div className="text-xs text-ink-3 uppercase tracking-widest font-mono mb-1">Competitive Advantage</div>
          <h2 className="text-lg font-semibold text-ink tracking-tight mb-5">Why EchoTrace Beats Keyword Systems</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {COMPARISON_COLUMNS.map((col) => {
              const HeaderIcon = col.headerIcon;
              return (
                <div
                  key={col.title}
                  className={`space-y-3 transition-all duration-200 hover:-translate-y-0.5 ${col.cardClass} ${col.hover}`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${col.headerIconBg}`}>
                      <HeaderIcon className={`w-4 h-4 ${col.headerIconColor}`} strokeWidth={1.75} />
                    </div>
                    <div className="font-semibold text-ink text-sm tracking-tight">{col.title}</div>
                  </div>
                  <ul className="space-y-2">
                    {col.items.map((item) => (
                      <ComparisonBullet
                        key={item.text}
                        icon={item.icon}
                        text={item.text}
                        variant={col.variant}
                      />
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
