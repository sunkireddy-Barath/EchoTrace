'use client';

import { useEffect, useRef, useState, useCallback, memo, useMemo } from 'react';
import { ChevronDown, ChevronUp, AlertOctagon, Database, Zap } from 'lucide-react';

/* ── Color constants ─────────────────────────────────────────────────────── */
const ACCENT = '#7F77DD';
const RED = '#E24B4A';
const BG = '#0a0f1e';

/* ── Mock data ─────────────────────────────────────────────────────────── */
const ZERO_DAY_ALERTS = [
  {
    id: 'zd_047',
    novelty: 91,
    badge: 'ZERO-DAY',
    message: 'New AI model subscription: earn by rating responses — pay entry fee of Rs 2,000 to unlock premium tasks and guaranteed income of Rs 50,000/month',
    firstSeen: '2 hours ago',
    incubation: 4,
    scores: { 'Banking Fraud': 31, 'Job Scam': 38, 'UPI/Payment': 22, 'Phishing': 27, 'Lottery': 19, 'Loan Scam': 24 },
  },
  {
    id: 'zd_048',
    novelty: 85,
    badge: 'ZERO-DAY',
    message: 'Crypto trading signal bot offering guaranteed 300% monthly ROI — pay Rs 5,000 activation to join private Telegram group with daily signals',
    firstSeen: '5 hours ago',
    incubation: 3,
    scores: { 'Banking Fraud': 28, 'Job Scam': 41, 'UPI/Payment': 35, 'Phishing': 22, 'Lottery': 45, 'Loan Scam': 30 },
  },
  {
    id: 'zd_046',
    novelty: 78,
    badge: 'EMERGING',
    message: 'NFT art platform claiming passive income — upload original work, pay Rs 1,500 listing fee, earn royalties on each view from global buyers',
    firstSeen: '11 hours ago',
    incubation: 6,
    scores: { 'Banking Fraud': 24, 'Job Scam': 39, 'UPI/Payment': 29, 'Phishing': 31, 'Lottery': 38, 'Loan Scam': 22 },
  },
  {
    id: 'zd_044',
    novelty: 67,
    badge: 'EMERGING',
    message: 'Deep fake video creation tool — pay Rs 3,000 license, resell to companies for Rs 50,000 each, work from home opportunity nationwide',
    firstSeen: '18 hours ago',
    incubation: 8,
    scores: { 'Banking Fraud': 29, 'Job Scam': 48, 'UPI/Payment': 26, 'Phishing': 33, 'Lottery': 29, 'Loan Scam': 36 },
  },
];

const PROTO_FAMILIES = [
  {
    id: '#3',
    count: 2,
    firstDate: '2025-05-28',
    vectors: 'AI subscription fraud — 2 vectors within 0.15 cosine distance',
    dominant: 'Artificial scarcity + digital pivot',
  },
  {
    id: '#7',
    count: 6,
    firstDate: '2025-05-21',
    vectors: 'Crypto/trading bot scam — 6 vectors within 0.12 cosine distance',
    dominant: 'Greed exploitation + urgency pressure',
  },
  {
    id: '#9',
    count: 9,
    firstDate: '2025-05-14',
    vectors: 'Gig-economy fraud — 9 vectors within 0.10 cosine distance',
    dominant: 'Trust abuse + credential harvesting',
  },
];

/* ── Qdrant log lines ───────────────────────────────────────────────────── */
const LOG_TEMPLATES = [
  (ts: string) => `[${ts}] search(scam_families, vec, top=6)\n         → max_similarity: 0.41 (Loan Scam)\n         → THRESHOLD: 0.58 → ZERO-DAY TRIGGERED`,
  (ts: string) => `[${ts}] upsert(zero_day_corpus, id=zd_047)\n         → payload: {novelty: 0.91, cluster: #7}`,
  (ts: string) => `[${ts}] search(zero_day_corpus, vec, top=5)\n         → 3 neighbors found (cluster growing)`,
  (ts: string) => `[${ts}] scroll(zero_day_corpus, cluster_id=#7)\n         → 4 vectors in proto-family #7`,
  (ts: string) => `[${ts}] search(scam_families, vec, top=6)\n         → max_similarity: 0.53 (Job Scam)\n         → THRESHOLD: 0.58 → ZERO-DAY TRIGGERED`,
  (ts: string) => `[${ts}] upsert(zero_day_corpus, id=zd_048)\n         → payload: {novelty: 0.85, cluster: #3}`,
  (ts: string) => `[${ts}] search(zero_day_corpus, vec, top=5)\n         → 2 neighbors found (cluster: #3)`,
  (ts: string) => `[${ts}] get_collection(zero_day_corpus)\n         → vectors_count: 23 · indexed: true`,
  (ts: string) => `[${ts}] search(scam_families, vec, top=6)\n         → max_similarity: 0.47 (Phishing)\n         → THRESHOLD: 0.58 → ZERO-DAY TRIGGERED`,
  (ts: string) => `[${ts}] scroll(zero_day_corpus, cluster_id=#9)\n         → 9 vectors in proto-family #9\n         → NEAR GRADUATION (threshold: 10)`,
];

function nowTs() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
}

/* ── Radar sweep animation ────────────────────────────────────────────────── */
const RadarHeader = memo(function RadarHeader() {
  return (
    <div className="relative flex items-center justify-center py-8 overflow-hidden">
      {/* Radar circles */}
      {[1, 2, 3].map(i => (
        <div
          key={i}
          className="absolute rounded-full border border-[#E24B4A]/20"
          style={{ width: i * 120, height: i * 120 }}
        />
      ))}
      {/* Sweep cone */}
      <div
        className="absolute w-[180px] h-[180px] rounded-full overflow-hidden animate-radar-sweep"
        style={{ transformOrigin: 'center' }}
      >
        <div
          className="absolute w-1/2 h-1/2 bottom-0 right-0 origin-bottom-left"
          style={{
            background: `conic-gradient(from -5deg, transparent 0deg, rgba(226,75,74,0.25) 40deg, transparent 40deg)`,
            width: '100%',
            height: '100%',
          }}
        />
      </div>
      {/* Center dot */}
      <div className="relative z-10 flex flex-col items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-[#E24B4A] shadow-[0_0_12px_rgba(226,75,74,0.8)]" />
        <span className="text-xs font-mono text-[#E24B4A] font-bold tracking-widest uppercase">Zero-Day Radar</span>
      </div>
    </div>
  );
});

/* ── Terminal log panel ──────────────────────────────────────────────────── */
/* TerminalLog uses imperative DOM updates — zero React re-renders per tick */
const TerminalLog = memo(function TerminalLog() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const idxRef = useRef(0);

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;

    function addLine(text: string, highlight: boolean) {
      const div = document.createElement('div');
      div.className = `whitespace-pre ${highlight ? 'text-green-400' : 'text-green-600/60'}`;
      div.textContent = text;
      if (highlight) {
        Array.from(body!.children).forEach(c =>
          ((c as HTMLElement).className = 'whitespace-pre text-green-600/60')
        );
      }
      body!.appendChild(div);
      while (body!.children.length > 30) body!.removeChild(body!.firstChild!);
      const sc = scrollRef.current;
      if (sc && sc.scrollHeight - sc.scrollTop - sc.clientHeight <= 60) {
        sc.scrollTop = sc.scrollHeight;
      }
    }

    Array.from({ length: 4 }, (_, i) => LOG_TEMPLATES[i](nowTs())).forEach((l, i) =>
      addLine(l, i === 3)
    );

    const interval = setInterval(() => {
      addLine(LOG_TEMPLATES[idxRef.current % LOG_TEMPLATES.length](nowTs()), true);
      idxRef.current++;
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-xl border border-white/10 bg-[#050b14] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/8 bg-white/2">
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-[#7F77DD]" />
          <span className="text-xs font-bold font-mono text-white">QDRANT OPERATIONS LOG</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] font-mono text-green-400">LIVE</span>
        </div>
      </div>
      <div ref={scrollRef} className="p-4 overflow-y-auto" style={{ maxHeight: '13rem' }}>
        <div ref={bodyRef} className="font-mono text-[11px] leading-relaxed space-y-3" />
      </div>
    </div>
  );
});

/* ── Novelty visualizer ─────────────────────────────────────────────────── */
const NoveltyVisualizer = memo(function NoveltyVisualizer({ alert }: { alert: typeof ZERO_DAY_ALERTS[0] }) {
  const maxScore = Math.max(...Object.values(alert.scores));
  const novelty = 100 - maxScore;
  return (
    <div className="rounded-xl border border-white/10 bg-[#0d1426] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-white font-mono">Novelty Score Visualizer</span>
        <span className="text-[10px] font-mono text-slate-500">Vector ID: {alert.id}</span>
      </div>
      <div className="space-y-2">
        {(Object.entries(alert.scores) as [string, number][]).map(([family, score]) => {
          const isMax = score === maxScore;
          return (
            <div key={family} className="space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className={isMax ? 'text-amber-400 font-bold' : 'text-slate-400'}>{family}</span>
                <span className={isMax ? 'text-amber-400 font-bold' : 'text-slate-500'}>
                  {score}% similarity{isMax ? ' ← highest' : ''}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${score}%`,
                    background: isMax ? '#f59e0b' : ACCENT,
                    opacity: isMax ? 1 : 0.5,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="rounded-lg border border-white/8 bg-white/3 px-4 py-3 flex items-center justify-between">
        <div className="text-xs text-slate-400">
          Max similarity: <span className="text-amber-400 font-bold">{maxScore}%</span>
        </div>
        <div className="text-xs text-slate-400">
          Novelty Score: <span className="text-[#E24B4A] font-bold">{novelty}%</span>
        </div>
        <div className="text-xs font-bold text-[#E24B4A] border border-[#E24B4A]/40 rounded px-2 py-0.5">
          ZERO-DAY ✓
        </div>
      </div>
      <p className="text-[10px] text-slate-500 leading-relaxed">
        Qdrant searched all 6 family centroid vectors in the scam_families collection.
        None exceeded the 58% threshold.
      </p>
    </div>
  );
});

/* ── Alert card ─────────────────────────────────────────────────────────── */
const AlertCard = memo(function AlertCard({
  alert, selected, onClick,
}: { alert: typeof ZERO_DAY_ALERTS[0]; selected: boolean; onClick: () => void }) {
  const isZeroDay = alert.badge === 'ZERO-DAY';
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border p-4 space-y-3 transition-all ${
        selected
          ? 'border-[#E24B4A]/60 bg-[#E24B4A]/8'
          : isZeroDay
          ? 'border-[#E24B4A]/25 bg-[#0d1426] hover:border-[#E24B4A]/50'
          : 'border-amber-500/25 bg-[#0d1426] hover:border-amber-500/50'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={`text-[10px] font-bold border rounded-full px-2.5 py-0.5 ${
            isZeroDay
              ? 'text-[#E24B4A] border-[#E24B4A]/40 bg-[#E24B4A]/10'
              : 'text-amber-400 border-amber-500/40 bg-amber-500/10'
          }`}
        >
          {alert.badge}
        </span>
        <span className="text-2xl font-black" style={{ color: isZeroDay ? RED : '#f59e0b' }}>
          {alert.novelty}%
        </span>
      </div>
      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed font-mono">{alert.message}</p>
      <div className="space-y-1 text-[10px] text-slate-500 font-mono">
        <div>First seen: {alert.firstSeen}</div>
        <div>Qdrant collection: <span className="text-slate-400">zero_day_corpus</span> · Vector ID: <span className="text-slate-400">{alert.id}</span></div>
        <div>Incubation: <span className="text-amber-400">{alert.incubation}/10</span> neighbors via Qdrant proximity search</div>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${alert.incubation * 10}%`, background: isZeroDay ? RED : '#f59e0b' }}
        />
      </div>
    </button>
  );
});

/* ── Proto-family tracker ────────────────────────────────────────────────── */
const ProtoFamilyCard = memo(function ProtoFamilyCard({ pf }: { pf: typeof PROTO_FAMILIES[0] }) {
  const pct = (pf.count / 10) * 100;
  const nearGrad = pf.count >= 8;
  return (
    <div className={`rounded-xl border p-4 space-y-3 ${nearGrad ? 'border-amber-500/40 bg-amber-950/20' : 'border-white/10 bg-[#0d1426]'}`}>
      <div className="flex items-center justify-between">
        <span className="font-bold text-white text-sm">Proto-Family {pf.id}</span>
        {nearGrad && (
          <span className="text-[10px] text-amber-400 border border-amber-500/30 rounded-full px-2 py-0.5 font-mono animate-pulse">
            NEAR GRADUATION
          </span>
        )}
      </div>
      <p className="text-[10px] text-slate-400 font-mono leading-relaxed">
        Qdrant proximity cluster — {pf.vectors}
      </p>
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-slate-500">
          <span>{pf.count}/10 vectors</span>
          <span>graduation threshold: 10</span>
        </div>
        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${pct}%`,
              background: nearGrad ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : ACCENT,
            }}
          />
        </div>
      </div>
      <div className="text-[10px] text-slate-500 space-y-0.5">
        <div>First detected: <span className="text-slate-400">{pf.firstDate}</span></div>
        <div>Dominant pattern: <span className="text-slate-400">{pf.dominant}</span></div>
      </div>
      <p className="text-[9px] text-slate-600 leading-relaxed border-t border-white/5 pt-2">
        Qdrant scroll() retrieves all vectors with matching cluster_id payload →
        centroid recomputed → similarity checked against existing named families
      </p>
    </div>
  );
});

/* ── Architecture panel ─────────────────────────────────────────────────── */
const ArchitecturePanel = memo(function ArchitecturePanel() {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-white/10 bg-[#0d1426] overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left"
        onClick={() => setOpen(v => !v)}
      >
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#7F77DD]" />
          <span className="font-bold text-white text-sm">How Qdrant Powers Zero-Day Detection</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-white/8">
          <div className="font-mono text-[11px] text-green-400/80 leading-loose bg-black/30 rounded-lg p-4">
            <div className="text-slate-400">Input Vector</div>
            <div className="text-slate-600">    ↓</div>
            <div className="text-green-400">Qdrant search(scam_families collection)</div>
            <div className="text-slate-500">{'[HNSW index, cosine, top-6]'}</div>
            <div className="text-slate-600">    ↓</div>
            <div className="text-amber-400">max_similarity &lt; 0.58?</div>
            <div className="text-slate-500">    ├── NO  → Known/Evolving threat (normal pipeline)</div>
            <div className="text-green-400">    └── YES → Qdrant upsert(zero_day_corpus)</div>
            <div className="text-slate-600">                  ↓</div>
            <div className="text-[#7F77DD]">          Qdrant search(zero_day_corpus)</div>
            <div className="text-slate-500">          [find existing proto-family neighbors]</div>
            <div className="text-slate-600">                  ↓</div>
            <div className="text-amber-400">          cluster_size &gt;= 10?</div>
            <div className="text-slate-500">              ├── NO  → Continue incubating</div>
            <div className="text-green-400">              └── YES → Graduate: new named family</div>
            <div className="text-slate-500">                        Qdrant upsert(scam_families, centroid)</div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Two Qdrant collections work together:{' '}
            <span className="text-[#7F77DD] font-mono">scam_families</span> (6 centroid vectors, named families)
            and{' '}
            <span className="text-[#7F77DD] font-mono">zero_day_corpus</span> (growing collection of unclassified threats).
            The entire zero-day lifecycle — detection, incubation, graduation — is powered exclusively by Qdrant vector operations.
          </p>
        </div>
      )}
    </div>
  );
});

/* ── Page ──────────────────────────────────────────────────────────────── */
export default function RadarPage() {
  const [selectedAlert, setSelectedAlert] = useState(ZERO_DAY_ALERTS[0]);

  const handleSelect = useCallback((a: typeof ZERO_DAY_ALERTS[0]) => {
    setSelectedAlert(a);
  }, []);

  return (
    <div className="min-h-screen bg-grid-pattern" style={{ background: `${BG}` }}>
      {/* Top bar */}
      <div className="sticky top-0 z-30 border-b border-white/8 bg-[#0a0f1e]/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-mono text-slate-400">Zero-Day Radar · 4 active alerts · 3 proto-families incubating</span>
          </div>
          <span className="text-[10px] font-mono text-slate-600">Qdrant collections: scam_families · zero_day_corpus</span>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Radar header */}
        <div className="rounded-2xl border border-[#E24B4A]/20 bg-[#0d1426] overflow-hidden">
          <RadarHeader />
          <div className="px-6 pb-5 text-center space-y-2">
            <h1 className="text-2xl font-black text-white">Zero-Day Threat Detection</h1>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Novel scams with no known family match — detected, incubated, and graduated via
              Qdrant vector operations exclusively.
            </p>
          </div>
        </div>

        {/* Section 1 — Qdrant ops log */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest font-mono text-slate-500">Live Qdrant Query Monitor</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>
          <TerminalLog />
        </div>

        {/* Section 2 — Novelty + Section 3 — Alerts (side by side) */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Novelty Visualizer */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest font-mono text-slate-500">Novelty Score Visualizer</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>
            <NoveltyVisualizer alert={selectedAlert} />
          </div>

          {/* Alert feed */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-3 h-3 text-[#E24B4A]" />
              <span className="text-[10px] uppercase tracking-widest font-mono text-slate-500">Active Zero-Day Alerts</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>
            <div className="space-y-3">
              {ZERO_DAY_ALERTS.map(alert => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  selected={selectedAlert.id === alert.id}
                  onClick={() => handleSelect(alert)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Section 4 — Proto-family incubation */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest font-mono text-slate-500">Proto-Family Incubation Tracker</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {PROTO_FAMILIES.map(pf => <ProtoFamilyCard key={pf.id} pf={pf} />)}
          </div>
        </div>

        {/* Section 5 — Architecture */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest font-mono text-slate-500">Qdrant Architecture</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>
          <ArchitecturePanel />
        </div>
      </main>
    </div>
  );
}
