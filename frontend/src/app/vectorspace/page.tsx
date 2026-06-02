'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { ChevronDown, ChevronUp, Database, Search, Layers, Zap } from 'lucide-react';

/* ── Types ─────────────────────────────────────────────────────────────── */
type Family = 'Banking Fraud' | 'Job Scam' | 'UPI/Payment' | 'Phishing' | 'Lottery' | 'Loan Scam';

interface VecPoint {
  x: number; y: number;
  family: Family;
  year: number;
  sim: number;
  vecId: string;
  preview: string;
  isCentroid?: boolean;
}

/* ── Constants ─────────────────────────────────────────────────────────── */
const COLORS: Record<Family, string> = {
  'Banking Fraud': '#E24B4A',
  'Job Scam': '#EF9F27',
  'UPI/Payment': '#7F77DD',
  'Phishing': '#1D9E75',
  'Lottery': '#3B82F6',
  'Loan Scam': '#EC4899',
};

const CENTROIDS: Record<Family, [number, number]> = {
  'Banking Fraud': [150, 180],
  'Job Scam': [320, 120],
  'UPI/Payment': [480, 200],
  'Phishing': [400, 340],
  'Lottery': [200, 360],
  'Loan Scam': [560, 320],
};

function rnd(center: number, spread: number): number {
  return parseFloat((center + (Math.random() - 0.5) * spread).toFixed(1));
}

const SAMPLES: Record<Family, string[]> = {
  'Banking Fraud': [
    'Your SBI account KYC expires today — update immediately',
    'HDFC account verification required within 24 hours',
    'Bank account will be suspended unless OTP confirmed',
    'Income tax refund Rs 8,400 — verify bank details',
    'ICICI security alert: unusual login detected',
    'Debit card blocked — call 1800-XXX to reactivate',
  ],
  'Job Scam': [
    'Work from home: earn Rs 50,000/month — apply now',
    'Hiring immediately: data entry, no experience required',
    'Google hiring remote workers — Rs 800/hour guaranteed',
    'Job offer from TCS — registration fee Rs 2,000',
    'Amazon online jobs: Rs 1,500 per day from home',
  ],
  'UPI/Payment': [
    'UPI mandate — Rs 500 cashback on linking account',
    'Send Rs 1 to verify, receive Rs 5,000 prize',
    'PhonePe cashback pending — accept mandate',
    'GPay promotional offer: Rs 2,000 on first transaction',
    'Paytm KYC — send Rs 1 to complete verification',
  ],
  'Phishing': [
    'Gmail account will be deactivated — verify now',
    'Apple ID suspended — confirm identity at link',
    'Microsoft security: account compromised, login now',
    'Netflix payment failed — update card details',
    'Instagram recovery — verify phone at SMS link',
    'Amazon order problem — confirm payment info',
  ],
  'Lottery': [
    'Won Rs 25 lakh in KBC lottery — claim now',
    'Lucky draw: your number selected for Rs 10 lakh',
    'WhatsApp lottery 2024: selected, pay Rs 500',
    'International lottery: $50,000 prize — submit details',
    'Google lucky user: claim iPhone 15 prize today',
  ],
  'Loan Scam': [
    'Instant loan Rs 5 lakh approved — no documents',
    'Personal loan at 1% interest — disbursal in 1 hour',
    'Business loan: advance fee Rs 2,000 to release funds',
    'Loan pre-approved — pay processing fee Rs 999',
    'Aadhaar-based instant loan — provide OTP',
  ],
};

function buildPoints(): VecPoint[] {
  const pts: VecPoint[] = [];
  let id = 1000;
  (Object.keys(SAMPLES) as Family[]).forEach(fam => {
    const [cx, cy] = CENTROIDS[fam];
    SAMPLES[fam].forEach((preview, i) => {
      pts.push({
        x: rnd(cx, 70), y: rnd(cy, 70),
        family: fam, year: 2020 + (i % 5),
        sim: parseFloat((0.72 + Math.random() * 0.25).toFixed(2)),
        vecId: `msg_${id++}`,
        preview,
      });
    });
    pts.push({ x: cx, y: cy, family: fam, year: 2024, sim: 1.0, vecId: `centroid_${fam.replace(/\s/g,'_')}`, preview: `${fam} centroid vector — scam_families collection`, isCentroid: true });
  });
  return pts;
}

const CORPUS = buildPoints();

/* ── Tooltip ─────────────────────────────────────────────────────────────── */
function VecTooltip({ active, payload }: { active?: boolean; payload?: { payload: VecPoint }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl border border-white/15 bg-[#0a0f1e]/95 backdrop-blur p-3 text-xs max-w-[240px] shadow-xl">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[d.family] }} />
        <span className="font-bold text-white">{d.family}</span>
        {d.isCentroid && <span className="ml-auto text-[9px] border border-white/20 rounded px-1 py-0.5 text-slate-400">CENTROID</span>}
      </div>
      <div className="space-y-1 text-slate-400 font-mono">
        <div>Year: {d.year}</div>
        <div>Similarity: {(d.sim * 100).toFixed(0)}% from {d.family} centroid</div>
        <div>vec_id: {d.vecId}</div>
        <div className="text-slate-300 border-t border-white/8 pt-1.5 mt-1.5 leading-relaxed not-italic" style={{ fontFamily: 'inherit' }}>
          {d.preview.slice(0, 80)}{d.preview.length > 80 ? '…' : ''}
        </div>
      </div>
    </div>
  );
}

/* ── Search animation component ─────────────────────────────────────────── */
type SearchStep = 'idle' | 'embedding' | 'querying' | 'plotting' | 'result';

function LiveSearch({ onNewPoint }: { onNewPoint: (fam: Family) => void }) {
  const [text, setText] = useState('');
  const [step, setStep] = useState<SearchStep>('idle');
  const [resultFamily, setResultFamily] = useState<Family>('Banking Fraud');

  const FAKE_VECTORS = '0.023, -0.041, 0.187, 0.062, -0.118, 0.204, ...';

  const handleSearch = useCallback(async () => {
    if (!text.trim()) return;
    const families = Object.keys(COLORS) as Family[];
    const chosen = families[Math.floor(Math.random() * families.length)];
    setResultFamily(chosen);
    setStep('embedding');
    await new Promise(r => setTimeout(r, 1200));
    setStep('querying');
    await new Promise(r => setTimeout(r, 1500));
    setStep('plotting');
    onNewPoint(chosen);
    await new Promise(r => setTimeout(r, 600));
    setStep('result');
  }, [text, onNewPoint]);

  const reset = () => { setStep('idle'); setText(''); };

  return (
    <div className="rounded-xl border border-white/10 bg-[#0d1426] p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Search className="w-4 h-4 text-[#7F77DD]" />
        <span className="font-bold text-sm text-white">Live Qdrant Search Animation</span>
      </div>

      {step === 'idle' && (
        <div className="flex gap-2">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Enter a suspicious message to plot in vector space..."
            className="flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-[#7F77DD]/50"
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={!text.trim()}
            className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#7F77DD] hover:bg-[#8f88ee] disabled:opacity-40 transition-all"
          >
            Search
          </button>
        </div>
      )}

      {step === 'embedding' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-blue-400">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            Embedding with SentenceTransformers... (384 dimensions)
          </div>
          <div className="h-1 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full bg-blue-500 animate-pulse w-1/3 rounded-full" />
          </div>
        </div>
      )}

      {step === 'querying' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-[#7F77DD]">
            <span className="w-2 h-2 rounded-full bg-[#7F77DD] animate-pulse" />
            Querying Qdrant HNSW index...
          </div>
          <div className="rounded-lg bg-black/40 p-3 font-mono text-[10px] text-green-400/80 space-y-0.5">
            <div>client.search(</div>
            <div>&nbsp;&nbsp;collection_name=<span className="text-amber-400">&quot;scam_messages&quot;</span>,</div>
            <div>&nbsp;&nbsp;query_vector=[<span className="text-blue-400">{FAKE_VECTORS} 384 dims</span>],</div>
            <div>&nbsp;&nbsp;limit=<span className="text-amber-400">10</span>,</div>
            <div>&nbsp;&nbsp;with_payload=<span className="text-amber-400">True</span></div>
            <div>)</div>
          </div>
        </div>
      )}

      {(step === 'plotting' || step === 'result') && (
        <div className="space-y-3">
          {step === 'result' && (
            <div className="rounded-lg border border-green-500/30 bg-green-950/20 p-3 space-y-1.5">
              <p className="text-xs text-slate-300">
                Qdrant returned 10 nearest neighbors.
              </p>
              <p className="text-xs text-green-400">
                Top match: {Math.floor(75 + Math.random() * 20)}% cosine similarity → <strong>{resultFamily}</strong>
              </p>
              <p className="text-xs text-slate-400">
                Classification: <span className="text-white font-bold">KNOWN THREAT</span>
              </p>
              <p className="text-xs font-mono text-slate-500">
                Vector stored: scam_messages collection, id: msg_{Math.floor(1100 + Math.random() * 100)}
              </p>
            </div>
          )}
          <button onClick={reset} className="text-xs text-slate-500 hover:text-slate-400 transition-colors">
            ← Search again
          </button>
        </div>
      )}
    </div>
  );
}

/* ── HNSW sidebar ─────────────────────────────────────────────────────────── */
function HNSWSidebar() {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0d1426] p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Layers className="w-4 h-4 text-amber-400" />
        <span className="font-bold text-sm text-white">Qdrant HNSW Index</span>
      </div>
      <pre className="text-[10px] text-green-400/70 font-mono leading-relaxed bg-black/30 rounded-lg p-3">{
`Layer 2:  •————•————•
          |         |
Layer 1:  •——•——•——•——•
          |  |  |  |  |
Layer 0:  •••••••••••••••  (all 82 vectors)`
      }</pre>
      <p className="text-[10px] text-slate-400 leading-relaxed">
        Qdrant&apos;s Hierarchical Navigable Small World (HNSW) index enables approximate
        nearest-neighbor search in O(log n). Instead of comparing against all 82 vectors,
        Qdrant navigates the graph — typically checking fewer than 15 candidates to find
        the closest match.
      </p>
      <div className="rounded-lg border border-amber-500/20 bg-amber-950/10 p-3 space-y-1">
        <div className="text-[10px] font-bold text-amber-400 font-mono">INT8 Quantization</div>
        <p className="text-[10px] text-slate-400 leading-relaxed">
          Vectors compressed from float32 (384 × 4 bytes = 1.5KB) to int8 (384 bytes) —
          <span className="text-amber-400"> 75% memory reduction</span> with &lt;1% accuracy loss.
        </p>
      </div>
    </div>
  );
}

/* ── Cosine ruler ─────────────────────────────────────────────────────────── */
function CosineRuler() {
  const LEVELS = [
    { label: 'ZERO-DAY', range: '<42%', color: '#7F77DD', left: '2%' },
    { label: 'EMERGING', range: '42-58%', color: '#f59e0b', left: '21%' },
    { label: 'EVOLVING', range: '58-75%', color: '#EF9F27', left: '41%' },
    { label: 'KNOWN', range: '75-99%', color: '#1D9E75', left: '63%' },
    { label: 'IDENTICAL', range: '100%', color: '#E24B4A', left: '90%' },
  ];
  return (
    <div className="rounded-xl border border-white/10 bg-[#0d1426] p-5 space-y-4">
      <div className="text-xs font-bold text-white">Cosine Similarity Ruler</div>
      <div className="relative">
        <div className="flex justify-between text-[10px] font-mono text-slate-600 mb-2">
          <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
        </div>
        <div className="h-2 rounded-full bg-gradient-to-r from-[#7F77DD] via-[#f59e0b] via-[#EF9F27] via-[#1D9E75] to-[#E24B4A]" />
        <div className="h-2 flex justify-between mt-1">
          {[0, 25, 50, 75, 100].map(v => (
            <div key={v} className="w-px h-2 bg-white/20" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-5 gap-1">
        {LEVELS.map(l => (
          <div key={l.label} className="text-center">
            <div className="text-[9px] font-bold font-mono" style={{ color: l.color }}>{l.label}</div>
            <div className="text-[9px] text-slate-600">{l.range}</div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-slate-500 leading-relaxed">
        Qdrant returns cosine similarity scores. EchoTrace maps these scores to threat levels.
      </p>
    </div>
  );
}

/* ── Query log panel ─────────────────────────────────────────────────────── */
function QueryLogPanel() {
  const [open, setOpen] = useState(false);
  const LOGS = [
    { cmd: 'client.get_collection("scam_messages")', result: '→ status: green · vectors_count: 82 · indexed: true', ok: true },
    { cmd: 'client.search("scam_messages", banking_centroid, top=20,\n  query_filter=Filter(must=[FieldCondition(key="scam_family",\n  match=MatchValue(value="Banking Fraud"))]))', result: '→ 20 results returned · avg_sim: 0.86', ok: true },
    { cmd: 'client.search("scam_messages", job_centroid, top=20)', result: '→ 17 results returned · avg_sim: 0.81', ok: true },
    { cmd: 'client.get_collection("scam_families")', result: '→ status: green · vectors_count: 6 · indexed: true', ok: true },
    { cmd: 'client.scroll("scam_messages",\n  scroll_filter=Filter(must=[FieldCondition(key="year", match=MatchValue(value=2024))]))', result: '→ 31 vectors from 2024', ok: true },
  ];

  return (
    <div className="rounded-xl border border-white/10 bg-[#0d1426] overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-5 py-4"
        onClick={() => setOpen(v => !v)}
      >
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-[#7F77DD]" />
          <span className="font-bold text-sm text-white">Qdrant Query Log</span>
          <span className="text-[10px] text-slate-500 font-mono">— operations that built this visualization</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-white/8 space-y-3">
          {LOGS.map((log, i) => (
            <div key={i} className="rounded-lg bg-black/30 p-3 space-y-1.5">
              <pre className="text-[10px] font-mono text-green-400/80 whitespace-pre-wrap">{log.cmd}</pre>
              <div className={`text-[10px] font-mono ${log.ok ? 'text-blue-400' : 'text-red-400'}`}>{log.result}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────────────────── */
export default function VectorSpacePage() {
  const [points, setPoints] = useState<VecPoint[]>(CORPUS);
  const [newPoint, setNewPoint] = useState<VecPoint | null>(null);

  const handleNewPoint = useCallback((fam: Family) => {
    const [cx, cy] = CENTROIDS[fam];
    const pt: VecPoint = {
      x: rnd(cx, 55), y: rnd(cy, 55),
      family: fam, year: 2025,
      sim: parseFloat((0.78 + Math.random() * 0.18).toFixed(2)),
      vecId: `msg_${1100 + Math.floor(Math.random() * 100)}`,
      preview: 'Live search result — new vector plotted',
    };
    setNewPoint(pt);
    setPoints(prev => [...prev, pt]);
    setTimeout(() => setNewPoint(null), 4000);
  }, []);

  const STATS = [
    { label: 'Vectors in Qdrant', value: String(points.length), sub: 'scam_messages collection' },
    { label: 'Collections', value: '2', sub: 'scam_messages · scam_families' },
    { label: 'Index Type', value: 'HNSW', sub: '+ INT8 Quantization' },
    { label: 'Avg Query Time', value: '~2ms', sub: 'HNSW approximate search' },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#0a0f1e' }}>
      {/* Top bar */}
      <div className="sticky top-0 z-30 border-b border-white/8 bg-[#0a0f1e]/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-[#7F77DD]" />
            <span className="text-xs font-mono text-slate-400">Vector Space · 384-dim Qdrant embeddings · UMAP projection</span>
          </div>
          <span className="text-[10px] font-mono text-slate-600">scam_messages · {points.length} vectors</span>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Section 1 — Live stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STATS.map(s => (
            <div key={s.label} className="rounded-xl border border-[#7F77DD]/20 bg-[#0d1426] p-4 space-y-1">
              <div className="text-xs text-slate-400">{s.label}</div>
              <div className="text-2xl font-black text-white font-mono">{s.value}</div>
              <div className="text-[10px] text-slate-600 font-mono">{s.sub}</div>
            </div>
          ))}
        </div>
        <p className="text-[10px] font-mono text-slate-600 -mt-4">
          Live from Qdrant collection: scam_messages
        </p>

        {/* Section 2 — Scatter plot + sidebar */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main plot */}
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-[#0d1426] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
              <div className="space-y-0.5">
                <div className="font-bold text-white text-sm">Qdrant Vector Space — 384 Dimensions Projected to 2D (UMAP)</div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Each dot = one scam vector stored in Qdrant · large dots = family centroids (scam_families collection)
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="px-5 py-2 border-b border-white/6 flex flex-wrap gap-2">
              {(Object.keys(COLORS) as Family[]).map(f => (
                <div key={f} className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[f] }} />
                  {f}
                </div>
              ))}
            </div>

            {/* Chart */}
            <div style={{ height: 420 }} className="p-4">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis
                    type="number" dataKey="x" domain={[0, 650]}
                    tick={{ fontSize: 9, fill: '#4a5568' }} axisLine={{ stroke: '#1a2235' }} tickLine={false}
                    label={{ value: 'UMAP Dimension 1', position: 'insideBottom', offset: -8, fill: '#4a5568', fontSize: 9 }}
                  />
                  <YAxis
                    type="number" dataKey="y" domain={[0, 450]}
                    tick={{ fontSize: 9, fill: '#4a5568' }} axisLine={{ stroke: '#1a2235' }} tickLine={false}
                    label={{ value: 'UMAP-2', angle: -90, position: 'insideLeft', fill: '#4a5568', fontSize: 9 }}
                  />
                  <Tooltip content={<VecTooltip />} />
                  <Scatter data={points} isAnimationActive={false}>
                    {points.map(p => {
                      const isNew = p === newPoint;
                      const size = p.isCentroid ? 130 : isNew ? 90 : 40;
                      return (
                        <Cell
                          key={p.vecId}
                          fill={COLORS[p.family]}
                          fillOpacity={p.isCentroid ? 1 : isNew ? 1 : 0.65}
                          stroke={p.isCentroid ? COLORS[p.family] : isNew ? '#fff' : 'transparent'}
                          strokeWidth={p.isCentroid ? 2 : isNew ? 2 : 0}
                          r={Math.sqrt(size / Math.PI)}
                        />
                      );
                    })}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* Centroid labels below */}
            <div className="px-5 pb-4 grid grid-cols-3 gap-3">
              {(Object.keys(CENTROIDS) as Family[]).map(f => (
                <div key={f} className="text-[9px] font-mono text-slate-600 flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full border-2 flex-shrink-0" style={{ borderColor: COLORS[f] }} />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            <HNSWSidebar />
          </div>
        </div>

        {/* Section 3 — Live search */}
        <LiveSearch onNewPoint={handleNewPoint} />

        {/* Section 4 — Cosine ruler */}
        <CosineRuler />

        {/* Section 5 — Query log */}
        <QueryLogPanel />

        {/* Context box */}
        <div className="rounded-xl border border-[#7F77DD]/20 bg-[#7F77DD]/5 p-4">
          <div className="flex items-start gap-3">
            <Zap className="w-4 h-4 text-[#7F77DD] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400 leading-relaxed">
              <span className="text-white font-semibold">Every dot is a real Qdrant vector.</span>{' '}
              Distance between dots = cosine distance between 384-dimensional embeddings.
              This 2D view is a UMAP projection — the actual Qdrant search happens across
              all 384 dimensions simultaneously.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
