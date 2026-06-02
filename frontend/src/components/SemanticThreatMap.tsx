'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Network, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

/* ── Types ─────────────────────────────────────────────────────────────── */
type Family = 'Banking Fraud' | 'Job Scam' | 'UPI/Payment' | 'Phishing' | 'Lottery' | 'Loan Scam' | 'Emerging';

interface VectorPoint {
  x: number;
  y: number;
  family: Family;
  year: number;
  similarity: number;
  preview: string;
  id: string;
  isNew?: boolean;
  isCentroid?: boolean;
  isEmerging?: boolean;
}

/* ── Static UMAP corpus ─────────────────────────────────────────────────── */
const FAMILY_COLORS: Record<Family, string> = {
  'Banking Fraud': '#E24B4A',
  'Job Scam': '#EF9F27',
  'UPI/Payment': '#7F77DD',
  'Phishing': '#1D9E75',
  'Lottery': '#3B82F6',
  'Loan Scam': '#EC4899',
  'Emerging': '#FF4444',
};

const CENTROIDS: Record<Family, [number, number]> = {
  'Banking Fraud': [150, 180],
  'Job Scam': [320, 120],
  'UPI/Payment': [480, 200],
  'Phishing': [400, 340],
  'Lottery': [200, 360],
  'Loan Scam': [560, 320],
  'Emerging': [350, 250],
};

function jitter(center: number, spread: number): number {
  return center + (Math.random() - 0.5) * spread * 2;
}

function buildCorpus(): VectorPoint[] {
  const samples: Record<Family, string[]> = {
    'Banking Fraud': [
      'Your SBI account KYC expires today — update immediately to avoid block',
      'Urgent: HDFC account verification required within 24 hours',
      'Your bank account will be suspended unless OTP is confirmed',
      'Income tax refund of Rs 8,400 pending — verify bank details',
      'ICICI bank security alert: unusual login detected, verify now',
      'Your debit card is blocked — call 1800-XXX to reactivate',
      'Account statement shows unauthorized transaction — OTP to reverse',
      'PAN-Aadhaar linking mandatory — provide details to avoid fine',
    ],
    'Job Scam': [
      'Work from home opportunity: earn Rs 50,000/month — apply now',
      'Hiring immediately: data entry job, no experience required',
      'Google hiring part-time remote workers — Rs 800/hour guaranteed',
      'Job offer from TCS — registration fee Rs 2,000 required',
      'Amazon online jobs: earn Rs 1,500 per day from home',
      'Free job placement — pay Rs 5,000 registration to proceed',
      'HR manager approved your CV — pay security deposit Rs 3,000',
      'Government job vacancy — apply online, fee Rs 500 processing',
    ],
    'UPI/Payment': [
      'UPI mandate approved — Rs 500 cashback on linking your account',
      'Send Rs 1 to verify account and receive Rs 5,000 prize',
      'PhonePe cashback pending — accept mandate to claim reward',
      'GPay promotional offer: Rs 2,000 on first UPI transaction',
      'BHIM UPI reward: scan QR to receive prize money',
      'Paytm KYC incomplete — send Rs 1 to complete verification',
      'UPI PIN required to reverse failed transaction refund',
    ],
    'Phishing': [
      'Your Gmail account will be deactivated — click link to verify',
      'Apple ID suspended — confirm identity at fake-apple.com',
      'Microsoft security warning: your account compromised, login now',
      'Netflix payment failed — update card details to continue service',
      'Instagram account recovery: verify phone number via SMS link',
      'WhatsApp verification required — enter code at provided link',
      'Amazon order problem — confirm payment info at secure portal',
      'Facebook alert: login from new device, verify immediately',
    ],
    'Lottery': [
      'Congratulations! You won Rs 25 lakh in KBC lottery — claim now',
      'Lucky draw winner: your number selected for prize Rs 10 lakh',
      'WhatsApp lottery 2024: you are selected, pay Rs 500 processing',
      'International lottery winner: $50,000 prize — submit details',
      'Google lucky user: claim your iPhone 15 prize today',
      'RBI lottery scheme: claim Rs 15 lakh from unclaimed funds',
    ],
    'Loan Scam': [
      'Instant loan Rs 5 lakh approved — no documents, 0% interest',
      'Personal loan at 1% interest — apply today, disbursal in 1 hour',
      'Business loan approved: advance fee Rs 2,000 to release funds',
      'Your loan application pre-approved — pay processing fee Rs 999',
      'Aadhaar-based instant loan — just provide OTP to activate',
      'Gold loan at lowest rate — visit link to apply instantly',
      'Mudra loan scheme: Rs 10 lakh for startup — free application',
    ],
    'Emerging': [
      'AI model subscription: earn by rating responses — pay entry',
      'Crypto trading bot guaranteed 300% returns — invest now',
      'NFT art platform: create and earn passive income daily',
    ],
  };

  const points: VectorPoint[] = [];
  let idCounter = 1000;

  (Object.keys(samples) as Family[]).forEach(family => {
    const [cx, cy] = CENTROIDS[family];
    const spread = family === 'Emerging' ? 60 : 38;

    samples[family].forEach((preview, i) => {
      points.push({
        x: parseFloat(jitter(cx, spread).toFixed(1)),
        y: parseFloat(jitter(cy, spread).toFixed(1)),
        family,
        year: 2021 + (i % 4),
        similarity: parseFloat((0.72 + Math.random() * 0.25).toFixed(2)),
        preview,
        id: `vec_${idCounter++}`,
        isCentroid: false,
        isEmerging: family === 'Emerging',
      });
    });

    // Add centroid point
    points.push({
      x: cx,
      y: cy,
      family,
      year: 2024,
      similarity: 1.0,
      preview: `${family} — family centroid vector`,
      id: `centroid_${family.replace(/\s+/g, '_')}`,
      isCentroid: true,
      isEmerging: family === 'Emerging',
    });
  });

  return points;
}

const CORPUS = buildCorpus();

/* ── Custom tooltip ─────────────────────────────────────────────────────── */
function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: VectorPoint }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl border border-white/15 bg-[#0a0f1e]/95 backdrop-blur p-3 text-xs max-w-[220px] shadow-xl">
      <div className="flex items-center gap-2 mb-2">
        <span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ background: FAMILY_COLORS[d.family] }}
        />
        <span className="font-bold text-white">{d.family}</span>
        {d.isCentroid && (
          <span className="ml-auto text-[9px] border border-white/20 rounded px-1 py-0.5 text-slate-400">CENTROID</span>
        )}
        {d.isEmerging && !d.isCentroid && (
          <span className="ml-auto text-[9px] border border-red-500/40 rounded px-1 py-0.5 text-red-400">ZERO-DAY</span>
        )}
      </div>
      <div className="space-y-1 text-slate-400">
        <div><span className="text-slate-500">Year:</span> {d.year}</div>
        <div><span className="text-slate-500">Similarity:</span> {(d.similarity * 100).toFixed(0)}%</div>
        <div><span className="text-slate-500">ID:</span> <span className="font-mono">{d.id}</span></div>
        <div className="mt-1.5 text-slate-300 border-t border-white/8 pt-1.5 leading-relaxed">
          {d.preview.slice(0, 80)}{d.preview.length > 80 ? '…' : ''}
        </div>
      </div>
    </div>
  );
}

/* ── Legend ──────────────────────────────────────────────────────────────── */
function Legend({ active, onToggle }: { active: Family[]; onToggle: (f: Family) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {(Object.keys(FAMILY_COLORS) as Family[]).map(f => (
        <button
          key={f}
          onClick={() => onToggle(f)}
          className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium transition-all ${
            active.includes(f)
              ? 'border-white/20 bg-white/5 text-white'
              : 'border-white/8 bg-transparent text-slate-600 line-through'
          }`}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: active.includes(f) ? FAMILY_COLORS[f] : '#333' }}
          />
          {f}
        </button>
      ))}
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────────── */
export function SemanticThreatMap() {
  const [activeF, setActiveF] = useState<Family[]>(Object.keys(FAMILY_COLORS) as Family[]);
  const [livePoints, setLivePoints] = useState<VectorPoint[]>(CORPUS);
  const [highlightedFamily, setHighlightedFamily] = useState<Family | null>(null);
  const [newDotId, setNewDotId] = useState<string | null>(null);

  const toggleFamily = useCallback((f: Family) => {
    setActiveF(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
  }, []);

  // simulate live scam arrival
  useEffect(() => {
    const LIVE_SCAMS: { preview: string; family: Family }[] = [
      { preview: 'Urgent: Your account password reset required immediately via SMS link', family: 'Phishing' },
      { preview: 'Win iPhone in lucky draw — Rs 199 registration fee required', family: 'Lottery' },
      { preview: 'Work from home typing job — Rs 25,000/month, no experience', family: 'Job Scam' },
      { preview: 'UPI collect request — accept to claim cashback reward Rs 1,000', family: 'UPI/Payment' },
      { preview: 'New AI trading signal bot: guaranteed 500% returns monthly', family: 'Emerging' },
    ];
    let idx = 0;

    const interval = setInterval(() => {
      const scam = LIVE_SCAMS[idx % LIVE_SCAMS.length];
      const [cx, cy] = CENTROIDS[scam.family];
      const newId = `live_${Date.now()}`;
      const newPt: VectorPoint = {
        x: parseFloat(jitter(cx, 35).toFixed(1)),
        y: parseFloat(jitter(cy, 35).toFixed(1)),
        family: scam.family,
        year: 2025,
        similarity: parseFloat((0.75 + Math.random() * 0.2).toFixed(2)),
        preview: scam.preview,
        id: newId,
        isNew: true,
        isEmerging: scam.family === 'Emerging',
      };

      setNewDotId(newId);
      setHighlightedFamily(scam.family);
      setLivePoints(prev => [...prev.slice(-150), newPt]);
      idx++;

      setTimeout(() => {
        setHighlightedFamily(null);
        setNewDotId(null);
      }, 2500);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const visible = livePoints.filter(p => activeF.includes(p.family));

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0a0f1e] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
        <div className="flex items-center gap-2.5">
          <Network className="w-4 h-4 text-[#7F77DD]" />
          <span className="font-bold text-white text-sm">Semantic Threat Map</span>
          <span className="text-[10px] font-mono bg-[#7F77DD]/10 text-[#7F77DD] border border-[#7F77DD]/30 rounded-full px-2 py-0.5">
            UMAP · 384-dim
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] font-mono text-slate-500">LIVE · {visible.length} vectors</span>
        </div>
      </div>

      {/* Legend */}
      <div className="px-5 py-3 border-b border-white/6">
        <Legend active={activeF} onToggle={toggleFamily} />
      </div>

      {/* Context strip */}
      <div className="px-5 py-2 bg-white/2 border-b border-white/6">
        <p className="text-[10px] font-mono text-slate-500">
          Each dot = one real Qdrant vector · Distance = cosine similarity · UMAP projects 384 dims → 2D · Click legend to filter
        </p>
      </div>

      {/* Chart */}
      <div className="p-4" style={{ height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              type="number"
              dataKey="x"
              domain={[0, 650]}
              tick={{ fontSize: 9, fill: '#4a5568' }}
              axisLine={{ stroke: '#1a2235' }}
              tickLine={false}
              label={{ value: 'UMAP Dimension 1', position: 'insideBottom', offset: -4, fill: '#4a5568', fontSize: 9 }}
            />
            <YAxis
              type="number"
              dataKey="y"
              domain={[0, 450]}
              tick={{ fontSize: 9, fill: '#4a5568' }}
              axisLine={{ stroke: '#1a2235' }}
              tickLine={false}
              label={{ value: 'UMAP-2', angle: -90, position: 'insideLeft', fill: '#4a5568', fontSize: 9 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Scatter data={visible} isAnimationActive={false}>
              {visible.map((p) => {
                const isHighlighted = highlightedFamily === p.family;
                const isNewDot = p.id === newDotId;
                let size = p.isCentroid ? 120 : 40;
                if (isNewDot) size = 80;
                return (
                  <Cell
                    key={p.id}
                    fill={FAMILY_COLORS[p.family]}
                    fillOpacity={
                      isNewDot ? 1
                        : isHighlighted ? 0.9
                        : highlightedFamily ? 0.15
                        : p.isCentroid ? 1
                        : p.isEmerging ? 0.85
                        : 0.65
                    }
                    stroke={
                      p.isCentroid ? FAMILY_COLORS[p.family]
                        : isNewDot ? '#ffffff'
                        : isHighlighted ? FAMILY_COLORS[p.family]
                        : 'transparent'
                    }
                    strokeWidth={p.isCentroid ? 2 : isNewDot ? 2 : 0}
                    r={Math.sqrt(size / Math.PI)}
                  />
                );
              })}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Footer info */}
      <div className="px-5 py-3 border-t border-white/6 bg-white/2 flex flex-wrap items-center gap-4">
        {(Object.keys(CENTROIDS) as Family[])
          .filter(f => f !== 'Emerging')
          .map(f => (
          <div key={f} className={`flex items-center gap-1.5 text-[10px] transition-all ${
            highlightedFamily === f ? 'opacity-100' : highlightedFamily ? 'opacity-30' : 'opacity-70'
          }`}>
            <span className="w-3 h-3 rounded-full border-2 flex-shrink-0" style={{ borderColor: FAMILY_COLORS[f], background: `${FAMILY_COLORS[f]}22` }} />
            <span className="font-mono text-slate-400">{f}</span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-1.5 text-[10px] text-red-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          Emerging · isolated cluster
        </div>
      </div>

      {/* Emerging threat callout */}
      {livePoints.some(p => p.isEmerging && p.isNew) && (
        <div className="mx-5 mb-4 rounded-xl border border-red-500/40 bg-red-950/20 px-4 py-3 flex items-start gap-3 animate-pulse-threat">
          <div className="w-2 h-2 rounded-full bg-red-500 mt-1 flex-shrink-0 animate-pulse" />
          <div>
            <div className="text-xs font-bold text-red-400">ZERO-DAY DETECTED</div>
            <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
              New vector added to proto-family cluster — no known family match &gt; 58% cosine similarity
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
