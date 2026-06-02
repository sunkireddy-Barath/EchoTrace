'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import {
  ArrowRight, Zap, Shield, AlertOctagon, Activity,
  Globe, ChevronDown, Database, Search, Dna, Eye,
  XCircle, Ban, ShieldOff, ShieldCheck, ScanSearch, BrainCircuit, Radar,
  TrendingUp, BarChart3, Target, AlertTriangle,
  type LucideIcon,
} from 'lucide-react';

/* ── Neural network canvas background ───────────────────────────────────── */
function NeuralBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const nodes: { x: number; y: number; vx: number; vy: number; r: number }[] = [];
    const NODE_COUNT = 60;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      nodes.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(59,130,246,${0.12 * (1 - dist / 140)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      nodes.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(96,165,250,0.5)';
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  );
}

/* ── Fade-in section wrapper ─────────────────────────────────────────────── */
function FadeSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Step flow item ──────────────────────────────────────────────────────── */
function FlowStep({ label, desc, index }: { label: string; desc: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.12, duration: 0.5 }}
      viewport={{ once: true }}
      className="flex items-start gap-4"
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-xs font-bold font-mono text-blue-400">
        {index + 1}
      </div>
      <div>
        <div className="font-semibold text-white text-sm">{label}</div>
        <div className="text-sm text-slate-400 mt-0.5">{desc}</div>
      </div>
    </motion.div>
  );
}

/* ── Capability card ─────────────────────────────────────────────────────── */
function CapCard({
  icon, title, desc, accent,
}: { icon: React.ReactNode; title: string; desc: string; accent: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm p-6 space-y-3 cursor-default"
      style={{ boxShadow: '0 4px 30px rgba(0,0,0,0.4)' }}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}>
        {icon}
      </div>
      <h3 className="font-bold text-white">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
    </motion.div>
  );
}

/* ── Preview mock card ───────────────────────────────────────────────────── */
function MockDashCard() {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1526]/90 backdrop-blur p-6 font-mono text-xs space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2 h-2 rounded-full bg-red-500" />
        <span className="w-2 h-2 rounded-full bg-yellow-500" />
        <span className="w-2 h-2 rounded-full bg-green-500" />
        <span className="ml-2 text-slate-500 text-[10px]">EchoTrace — Threat Analysis</span>
      </div>
      <div className="text-slate-400">Input: <span className="text-blue-300">&quot;Your KYC expires today...&quot;</span></div>
      <div className="flex items-center gap-2">
        <span className="text-slate-500">Embedding</span>
        <span className="text-slate-600">→</span>
        <span className="text-purple-400">384-dim vector</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-slate-500">Qdrant HNSW</span>
        <span className="text-slate-600">→</span>
        <span className="text-amber-400">top-10 neighbors</span>
      </div>
      <div className="h-px bg-white/5" />
      <div className="flex items-center justify-between">
        <span className="text-red-400 font-bold">BANKING FRAUD</span>
        <span className="bg-red-500/20 text-red-400 border border-red-500/30 rounded px-2 py-0.5">91%</span>
      </div>
      <div className="text-[10px] text-slate-500">Genome: Urgency 0.94 · Authority 0.88 · Fear 0.76</div>
    </div>
  );
}

/* ── Comparison bullet (Section A) ─────────────────────────────────────── */
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
    keyword: 'text-red-400/85 drop-shadow-[0_0_6px_rgba(248,113,113,0.25)]',
    echotrace: 'text-cyan-400/90 drop-shadow-[0_0_6px_rgba(34,211,238,0.25)]',
    business: 'text-amber-400/85 drop-shadow-[0_0_6px_rgba(251,191,36,0.2)]',
  }[variant];

  return (
    <li className="flex items-start gap-2.5">
      <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${iconColor}`} strokeWidth={1.75} />
      <span className="text-xs text-slate-400 leading-snug">{text}</span>
    </li>
  );
}

/* ── Main landing component ──────────────────────────────────────────────── */
export default function LandingPage() {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, -120]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const unsub = scrollY.on('change', v => setScrolled(v > 40));
    return unsub;
  }, [scrollY]);

  const FLOW_STEPS = [
    { label: 'Input Ingestion', desc: 'Text, screenshot OCR, or voice transcription via Whisper' },
    { label: 'Vector Embedding', desc: 'SentenceTransformers all-MiniLM-L6-v2 → 384-dim float32' },
    { label: 'Qdrant HNSW Search', desc: 'Cosine similarity across scam corpus · INT8 quantized · ~2ms' },
    { label: 'Fraud DNA Profiling', desc: '8-dimension semantic genome: urgency, authority, fear, greed…' },
    { label: 'Zero-Day Detection', desc: 'If max similarity < 0.58 → EMERGING THREAT flagged & incubated' },
  ];

  const CAPS = [
    {
      icon: <Dna className="w-5 h-5 text-purple-400" />,
      title: 'Fraud DNA',
      desc: '8-dimension psychological attack genome. See WHY a scam works, not just what family it belongs to.',
      accent: 'bg-purple-500/10',
    },
    {
      icon: <Activity className="w-5 h-5 text-amber-400" />,
      title: 'Evolution Timeline',
      desc: 'Track how fast each fraud family semantically mutates year-over-year. High velocity = adapting scam.',
      accent: 'bg-amber-500/10',
    },
    {
      icon: <AlertOctagon className="w-5 h-5 text-red-400" />,
      title: 'Zero-Day Radar',
      desc: 'Proto-family incubation engine. New scam clusters grow until they graduate to named families.',
      accent: 'bg-red-500/10',
    },
    {
      icon: <Eye className="w-5 h-5 text-teal-400" />,
      title: 'Semantic Threat Map',
      desc: 'UMAP projection of every Qdrant vector. Watch semantic clusters evolve in real time.',
      accent: 'bg-teal-500/10',
    },
    {
      icon: <Globe className="w-5 h-5 text-blue-400" />,
      title: 'Community Intelligence',
      desc: 'Crowd-sourced corpus. Every reported scam adds a vector to the Qdrant collection for others.',
      accent: 'bg-blue-500/10',
    },
    {
      icon: <Database className="w-5 h-5 text-green-400" />,
      title: 'Qdrant-Native',
      desc: 'No secondary database. Vectors + metadata payloads power detection, geography, and family clustering.',
      accent: 'bg-green-500/10',
    },
  ];

  const COMPARISON_COLUMNS = [
    {
      title: 'Keyword System',
      headerIcon: ShieldOff,
      headerIconBg: 'bg-red-500/10 border-red-500/25',
      headerIconColor: 'text-red-400/90',
      variant: 'keyword' as const,
      bg: 'bg-red-950/20 border-red-900/40',
      hover: 'hover:border-red-500/35 hover:shadow-[0_4px_24px_rgba(239,68,68,0.08)]',
      items: [
        { icon: XCircle, text: '"Free KYC update" blocked' },
        { icon: Ban, text: '"Account verification needed" passes undetected' },
        { icon: ShieldOff, text: 'Same scam, new wording — evades rules' },
        { icon: XCircle, text: 'No mutation or lineage tracking' },
      ],
    },
    {
      title: 'EchoTrace Semantic',
      headerIcon: ShieldCheck,
      headerIconBg: 'bg-cyan-500/10 border-cyan-500/25',
      headerIconColor: 'text-emerald-400/90',
      variant: 'echotrace' as const,
      bg: 'bg-blue-950/30 border-blue-800/40',
      hover: 'hover:border-cyan-500/35 hover:shadow-[0_4px_24px_rgba(34,211,238,0.1)]',
      items: [
        { icon: ScanSearch, text: 'Detects semantic intent, not surface text' },
        { icon: ShieldCheck, text: 'Same fraud, any phrasing — caught' },
        { icon: BrainCircuit, text: '8-dimension psychological attack genome' },
        { icon: Radar, text: 'Zero-day mutations flagged and incubated' },
      ],
    },
    {
      title: 'Business Impact',
      headerIcon: BarChart3,
      headerIconBg: 'bg-amber-500/10 border-amber-500/25',
      headerIconColor: 'text-blue-400/90',
      variant: 'business' as const,
      bg: 'bg-slate-900/40 border-slate-700/30',
      hover: 'hover:border-blue-500/30 hover:shadow-[0_4px_24px_rgba(59,130,246,0.08)]',
      items: [
        { icon: Target, text: 'Near-zero false negatives on intent match' },
        { icon: TrendingUp, text: 'Predictive threat intelligence reports' },
        { icon: Activity, text: 'Evolution velocity alerts per family' },
        { icon: AlertTriangle, text: 'Community-grown, continuously indexed corpus' },
      ],
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#030712] text-white overflow-x-hidden">
      {/* ── Sticky nav ─────────────────────────────────────────────────── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-[#030712]/90 backdrop-blur border-b border-white/8 py-3' : 'py-5'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-sm tracking-wide font-mono">EchoTrace AI</span>
            <span className="text-[10px] bg-blue-500/15 text-blue-400 border border-blue-500/30 rounded-full px-2 py-0.5 font-mono">v2.0</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="#technology" className="text-sm text-slate-400 hover:text-white transition-colors hidden sm:block">
              Technology
            </a>
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-semibold transition-all"
            >
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20">
        <NeuralBackground />

        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-600/6 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-600/8 blur-[100px] pointer-events-none" />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 text-center max-w-4xl mx-auto px-6 space-y-8"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/8 px-4 py-1.5 text-xs text-blue-400 font-mono"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Qdrant-Powered Semantic Intelligence · 82 vectors indexed
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05]"
          >
            Detect Fraud
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Before Keywords Can
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto"
          >
            Qdrant-powered semantic fraud intelligence. EchoTrace maps the{' '}
            <span className="text-blue-400 font-semibold">DNA of scams</span> in 384-dimensional
            vector space — detecting families, tracing mutation velocity, and catching{' '}
            <span className="text-purple-400 font-semibold">zero-day threats</span> before they spread.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2.5 h-[3.25rem]px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm hover:from-blue-500 hover:to-indigo-500 transition-all shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_50px_rgba(59,130,246,0.5)]"
            >
              <Zap className="w-4 h-4" />
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#technology"
              className="inline-flex items-center justify-center gap-2 h-[3.25rem]px-6 py-3.5 rounded-xl border border-white/15 bg-white/4 backdrop-blur text-slate-300 text-sm hover:border-white/30 hover:text-white transition-all"
            >
              View Technology
            </a>
          </motion.div>

          {/* stat pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-3 pt-2"
          >
            {[
              ['82', 'Scam Vectors'],
              ['384', 'Dimensions'],
              ['~2ms', 'Query Time'],
              ['6', 'Fraud Families'],
            ].map(([n, l]) => (
              <div key={l} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/4 px-3 py-1 text-xs">
                <span className="text-white font-bold font-mono">{n}</span>
                <span className="text-slate-500">{l}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <ChevronDown className="w-5 h-5 text-slate-600 animate-bounce" />
        </motion.div>
      </section>

      {/* ── Section A: Problem ──────────────────────────────────────────── */}
      <section className="py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-950/5 to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6">
          <FadeSection>
            <div className="text-center mb-14 space-y-2">
              <div className="text-xs text-red-400/80 uppercase tracking-widest font-mono">The Problem</div>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">Scams Evolve. Keywords Don&apos;t.</h2>
              <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
                Fraudsters rephrase. Keyword blocklists break. New scam families emerge
                weekly — invisible to static rules.
              </p>
            </div>
          </FadeSection>

          <div className="grid sm:grid-cols-3 gap-5">
            {COMPARISON_COLUMNS.map((col, i) => {
              const HeaderIcon = col.headerIcon;
              return (
                <FadeSection key={col.title}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    viewport={{ once: true }}
                    className={`rounded-2xl border p-6 space-y-4 transition-all duration-200 hover:-translate-y-0.5 ${col.bg} ${col.hover}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${col.headerIconBg}`}>
                        <HeaderIcon className={`w-[18px] h-[18px] ${col.headerIconColor}`} strokeWidth={1.75} />
                      </div>
                      <div className="font-semibold text-white text-sm tracking-tight">{col.title}</div>
                    </div>
                    <ul className="space-y-2.5">
                      {col.items.map((item) => (
                        <ComparisonBullet
                          key={item.text}
                          icon={item.icon}
                          text={item.text}
                          variant={col.variant}
                        />
                      ))}
                    </ul>
                  </motion.div>
                </FadeSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Section B: How it works ─────────────────────────────────────── */}
      <section id="technology" className="py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/5 to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6">
          <FadeSection className="text-center mb-14 space-y-3">
            <div className="text-xs text-blue-400/80 uppercase tracking-widest font-mono">How It Works</div>
            <h2 className="text-3xl sm:text-4xl font-black">Semantic Pipeline</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Every analysis follows a deterministic vector-native pipeline. No LLM hallucinations.
              Qdrant cosine similarity all the way down.
            </p>
          </FadeSection>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              {FLOW_STEPS.map((s, i) => <FlowStep key={s.label} {...s} index={i} />)}
            </div>
            <FadeSection>
              <MockDashCard />
            </FadeSection>
          </div>
        </div>
      </section>

      {/* ── Section C: Capabilities ─────────────────────────────────────── */}
      <section className="py-28">
        <div className="max-w-5xl mx-auto px-6">
          <FadeSection className="text-center mb-14 space-y-3">
            <div className="text-xs text-purple-400/80 uppercase tracking-widest font-mono">Novel Capabilities</div>
            <h2 className="text-3xl sm:text-4xl font-black">Built Different</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Six capabilities that no keyword filter or generic LLM wrapper can replicate.
            </p>
          </FadeSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CAPS.map((cap, i) => (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <CapCard {...cap} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section D: Live Preview ─────────────────────────────────────── */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/10 to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6">
          <FadeSection className="text-center mb-14 space-y-3">
            <div className="text-xs text-indigo-400/80 uppercase tracking-widest font-mono">Live Intelligence</div>
            <h2 className="text-3xl sm:text-4xl font-black">See It In Action</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Real semantic analysis. Real Qdrant vectors. Real-time threat classification.
            </p>
          </FadeSection>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                label: 'Threat Analysis',
                badge: 'BANKING FRAUD',
                badgeColor: 'text-red-400 bg-red-500/10 border-red-500/30',
                desc: '"Your SBI account will be blocked in 24 hours unless you update KYC immediately..."',
                score: '91%',
                route: '/analyze',
              },
              {
                label: 'Semantic Map',
                badge: 'VECTOR SPACE',
                badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
                desc: 'UMAP projection of all 82 Qdrant vectors. Watch clustering in real-time.',
                score: '82 pts',
                route: '/vectorspace',
              },
              {
                label: 'Zero-Day Radar',
                badge: 'ZERO-DAY',
                badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
                desc: 'Proto-family incubation: 6/10 vectors. Emerging threat cluster growing.',
                score: '78% novel',
                route: '/radar',
              },
            ].map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ y: -6 }}
              >
                <Link
                  href={card.route}
                  className="block rounded-2xl border border-white/8 bg-white/3 backdrop-blur p-6 space-y-4 hover:border-white/20 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-mono uppercase tracking-wider">{card.label}</span>
                    <span className={`text-[10px] font-bold border rounded-full px-2 py-0.5 ${card.badgeColor}`}>
                      {card.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono leading-relaxed">{card.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold">{card.score}</span>
                    <span className="text-xs text-blue-400 group-hover:text-blue-300 flex items-center gap-1 transition-colors">
                      Open <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────────── */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-950/15 pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center space-y-8">
          <FadeSection className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/8 px-4 py-1.5 text-xs text-blue-400 font-mono">
              <Shield className="w-3 h-3" />
              Open Source · Qdrant Native · Community Powered
            </div>
            <h2 className="text-4xl sm:text-5xl font-black leading-tight">
              Join the Fight Against
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Evolving Fraud
              </span>
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Every scam you submit strengthens the community corpus.
              Every Qdrant query makes the next detection smarter.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2.5 h-14 px-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-base hover:from-blue-500 hover:to-indigo-500 transition-all shadow-[0_0_40px_rgba(59,130,246,0.35)] hover:shadow-[0_0_60px_rgba(59,130,246,0.55)]"
              >
                <Zap className="w-5 h-5" />
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/analyze"
                className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-xl border border-white/15 bg-white/4 text-slate-300 font-semibold text-base hover:border-white/30 hover:text-white transition-all"
              >
                <Search className="w-4 h-4" />
                Analyze a Scam
              </Link>
            </div>
          </FadeSection>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/8 py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Zap className="w-3 h-3" />
            <span className="font-mono">EchoTrace AI v2.0</span>
            <span>·</span>
            <span>Powered by Qdrant + SentenceTransformers</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="font-mono">Qdrant Online · 82 vectors</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
