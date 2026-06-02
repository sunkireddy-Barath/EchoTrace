'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Globe, Database, ChevronDown, ChevronUp, Radio } from 'lucide-react';

const ComposableMap = dynamic(
  () => import('react-simple-maps').then(m => m.ComposableMap),
  { ssr: false }
);
const Geographies = dynamic(
  () => import('react-simple-maps').then(m => m.Geographies),
  { ssr: false }
);
const Geography = dynamic(
  () => import('react-simple-maps').then(m => m.Geography),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-simple-maps').then(m => m.Marker),
  { ssr: false }
);
const Line = dynamic(
  () => import('react-simple-maps').then(m => m.Line),
  { ssr: false }
);

type Family = 'Banking Fraud' | 'Job Scam' | 'UPI/Payment' | 'Phishing' | 'Lottery' | 'Loan Scam' | 'All';

const FAMILY_COLORS: Record<string, string> = {
  'Banking Fraud': '#E24B4A',
  'Job Scam': '#EF9F27',
  'UPI/Payment': '#7F77DD',
  'Phishing': '#1D9E75',
  'Lottery': '#3B82F6',
  'Loan Scam': '#EC4899',
};

interface CountryData {
  name: string;
  flag: string;
  lat: number;
  lng: number;
  reports: number;
  dominant: Family;
  secondary: Family;
  topScam: string;
  vectors: number;
  confidence: number;
  yearMin: number;
  yearMax: number;
  isFlashing?: boolean;
  isNew?: boolean;
}

const INITIAL_COUNTRIES: CountryData[] = [
  { name: 'India', flag: '🇮🇳', lat: 20.5, lng: 78.9, reports: 1240, dominant: 'UPI/Payment', secondary: 'Banking Fraud', topScam: 'UPI mandate fraud — Rs 500 cashback on linking...', vectors: 1240, confidence: 0.91, yearMin: 2020, yearMax: 2025 },
  { name: 'Nigeria', flag: '🇳🇬', lat: 9.0, lng: 8.6, reports: 890, dominant: 'Lottery', secondary: 'Job Scam', topScam: 'You won $50,000 in the international lottery...', vectors: 890, confidence: 0.87, yearMin: 2019, yearMax: 2025 },
  { name: 'USA', flag: '🇺🇸', lat: 37.0, lng: -95.7, reports: 760, dominant: 'Phishing', secondary: 'Banking Fraud', topScam: 'Your Apple ID has been suspended — verify now...', vectors: 760, confidence: 0.89, yearMin: 2020, yearMax: 2025 },
  { name: 'UK', flag: '🇬🇧', lat: 55.3, lng: -3.4, reports: 430, dominant: 'Lottery', secondary: 'Phishing', topScam: 'HMRC tax refund of £1,200 — click to claim...', vectors: 430, confidence: 0.84, yearMin: 2020, yearMax: 2025 },
  { name: 'Pakistan', flag: '🇵🇰', lat: 30.3, lng: 69.3, reports: 380, dominant: 'Banking Fraud', secondary: 'Loan Scam', topScam: 'Your account KYC expires — update to avoid block...', vectors: 380, confidence: 0.86, yearMin: 2021, yearMax: 2025 },
  { name: 'Brazil', flag: '🇧🇷', lat: -14.2, lng: -51.9, reports: 290, dominant: 'Job Scam', secondary: 'Phishing', topScam: 'Work from home opportunity: R$10,000/month...', vectors: 290, confidence: 0.82, yearMin: 2021, yearMax: 2025 },
  { name: 'Kenya', flag: '🇰🇪', lat: 0.02, lng: 37.9, reports: 210, dominant: 'Loan Scam', secondary: 'Lottery', topScam: 'Instant M-Pesa loan KES 50,000 approved...', vectors: 210, confidence: 0.79, yearMin: 2022, yearMax: 2025 },
  { name: 'China', flag: '🇨🇳', lat: 35.8, lng: 104.1, reports: 180, dominant: 'Phishing', secondary: 'Job Scam', topScam: 'WeChat account security alert — verify now...', vectors: 180, confidence: 0.83, yearMin: 2021, yearMax: 2025 },
  { name: 'Indonesia', flag: '🇮🇩', lat: -0.7, lng: 109.0, reports: 140, dominant: 'UPI/Payment', secondary: 'Banking Fraud', topScam: 'GoPay reward Rp 500,000 — link account now...', vectors: 140, confidence: 0.81, yearMin: 2022, yearMax: 2025 },
  { name: 'South Africa', flag: '🇿🇦', lat: -30.5, lng: 22.9, reports: 110, dominant: 'Job Scam', secondary: 'Lottery', topScam: 'Earn R25,000/month working from home...', vectors: 110, confidence: 0.78, yearMin: 2022, yearMax: 2025 },
];

const SEMANTIC_LINKS = [
  { from: 'India', to: 'Nigeria', color: '#22d3ee' },
  { from: 'India', to: 'UK', color: '#7F77DD' },
  { from: 'India', to: 'Indonesia', color: '#10b981' },
  { from: 'Nigeria', to: 'USA', color: '#E24B4A' },
  { from: 'UK', to: 'Pakistan', color: '#3B82F6' },
  { from: 'Kenya', to: 'India', color: '#f59e0b' },
];

const LIVE_BURST_POOL: Omit<CountryData, 'isFlashing' | 'isNew'>[] = [
  { name: 'Philippines', flag: '🇵🇭', lat: 12.8, lng: 121.7, reports: 42, dominant: 'Job Scam', secondary: 'Phishing', topScam: 'Remote data entry — pay registration fee to unlock tasks...', vectors: 42, confidence: 0.72, yearMin: 2025, yearMax: 2025 },
  { name: 'Vietnam', flag: '🇻🇳', lat: 14.0, lng: 108.0, reports: 38, dominant: 'UPI/Payment', secondary: 'Banking Fraud', topScam: 'MoMo wallet verification — send OTP to claim reward...', vectors: 38, confidence: 0.74, yearMin: 2025, yearMax: 2025 },
];

const DRIFT_DATA = [
  { country: 'India', drift: 0.34 },
  { country: 'Nigeria', drift: 0.28 },
  { country: 'USA', drift: 0.19 },
  { country: 'UK', drift: 0.17 },
  { country: 'Pakistan', drift: 0.23 },
  { country: 'Brazil', drift: 0.15 },
  { country: 'Kenya', drift: 0.21 },
];

const TICKER_ITEMS = [
  'Qdrant detected new UPI fraud cluster in Mumbai · search(filter: country=India, family=UPI) → 47 new vectors',
  'Banking Fraud semantic drift +12% in Pakistan this month',
  'New phishing variant: 89% similar to UK banking scam family',
  'Zero-day proto-family #9 growing: 7/10 vectors — India origin',
  'Job Scam velocity: RAPID in Brazil · drift rate 0.15 this quarter',
];

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';
const MAP_HEIGHT = 580;

function circleRadius(reports: number): number {
  if (reports >= 1000) return 20;
  if (reports >= 500) return 15;
  if (reports >= 300) return 12;
  if (reports >= 100) return 9;
  return 7;
}

function curvedCoordinates(
  from: [number, number],
  to: [number, number],
  bend = 0.35,
): [number, number][] {
  const [lng1, lat1] = from;
  const [lng2, lat2] = to;
  const midLng = (lng1 + lng2) / 2;
  const midLat = (lat1 + lat2) / 2;
  const dx = lng2 - lng1;
  const dy = lat2 - lat1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const ctrlLng = midLng - dy * bend * 0.12;
  const ctrlLat = midLat + dx * bend * 0.12 + dist * bend * 0.06;
  const points: [number, number][] = [];
  for (let t = 0; t <= 1.001; t += 0.04) {
    const lng = (1 - t) * (1 - t) * lng1 + 2 * (1 - t) * t * ctrlLng + t * t * lng2;
    const lat = (1 - t) * (1 - t) * lat1 + 2 * (1 - t) * t * ctrlLat + t * t * lat2;
    points.push([lng, lat]);
  }
  return points;
}

function MapTooltip({ country }: { country: CountryData | null }) {
  if (!country) return null;
  const color = FAMILY_COLORS[country.dominant];
  return (
    <div className="rounded-xl border border-cyan-500/25 bg-[#0a0f1e]/92 backdrop-blur-xl p-4 text-xs min-w-[240px] shadow-[0_12px_40px_rgba(0,0,0,0.55),0_0_24px_rgba(34,211,238,0.08)]">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-2.5 mb-3">
        <div className="font-semibold text-white text-sm tracking-tight">
          {country.flag} {country.name}
        </div>
        <span className="text-[9px] font-mono uppercase tracking-widest text-cyan-400/90 border border-cyan-500/30 rounded px-1.5 py-0.5">
          Intel
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between gap-4">
          <span className="text-slate-500">Fraud family</span>
          <span className="font-medium text-right" style={{ color }}>{country.dominant}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-500">Report count</span>
          <span className="text-white font-mono font-semibold">{country.reports.toLocaleString()}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-500">Confidence</span>
          <span className="text-emerald-400 font-mono font-semibold">{Math.round(country.confidence * 100)}%</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-500">Year range</span>
          <span className="text-slate-200 font-mono">{country.yearMin}–{country.yearMax}</span>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-white/8">
        <div className="text-[10px] text-slate-500 font-mono mb-1">Qdrant payload</div>
        <div className="text-[10px] font-mono text-green-400/90">
          search(filter: country=&quot;{country.name}&quot;) → {country.vectors.toLocaleString()} vectors
        </div>
        <p className="text-[10px] text-slate-400 mt-2 leading-relaxed line-clamp-2">
          &ldquo;{country.topScam}&rdquo;
        </p>
      </div>
    </div>
  );
}

function MapStatusOverlay({ vectorCount, liveEvents }: { vectorCount: number; liveEvents: number }) {
  return (
    <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 pointer-events-none">
      <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-[#0a0f1e]/85 backdrop-blur-md px-3 py-1.5 shadow-[0_0_16px_rgba(52,211,153,0.12)]">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
        </span>
        <span className="text-[10px] font-mono font-semibold text-emerald-400 tracking-widest">LIVE</span>
        <Radio className="w-3 h-3 text-cyan-400/70 ml-1" />
      </div>
      <div className="rounded-md border border-white/8 bg-[#0a0f1e]/75 backdrop-blur px-3 py-2 space-y-0.5">
        <div className="text-[10px] font-mono text-slate-400">Qdrant Geo Intelligence</div>
        <div className="text-[10px] font-mono text-cyan-400/90">{vectorCount.toLocaleString()} vectors mapped</div>
        <div className="text-[9px] font-mono text-slate-600">{liveEvents} ingest events this session</div>
      </div>
    </div>
  );
}

function SemanticArcs({
  links,
  countryByName,
}: {
  links: typeof SEMANTIC_LINKS;
  countryByName: Map<string, CountryData>;
}) {
  return (
    <>
      {links.map((link, i) => {
        const a = countryByName.get(link.from);
        const b = countryByName.get(link.to);
        if (!a || !b) return null;
        const coords = curvedCoordinates([a.lng, a.lat], [b.lng, b.lat]);
        return (
          <Line
            key={`${link.from}-${link.to}`}
            coordinates={coords}
            stroke={link.color}
            strokeWidth={1.2}
            strokeOpacity={0.38}
            strokeDasharray="4 12"
            fill="transparent"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="0"
              to="-32"
              dur={`${2 + (i % 4) * 0.35}s`}
              repeatCount="indefinite"
            />
          </Line>
        );
      })}
    </>
  );
}

function LiveThreatNode({
  country,
  onEnter,
  onLeave,
}: {
  country: CountryData;
  onEnter: () => void;
  onLeave: () => void;
}) {
  const r = circleRadius(country.reports);
  const color = FAMILY_COLORS[country.dominant];
  const flash = country.isFlashing || country.isNew;
  const pulseDur = flash ? '1.2s' : '2.8s';

  return (
    <Marker
      coordinates={[country.lng, country.lat]}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {/* Outer halo */}
      <circle r={r + 22} fill={color} fillOpacity={0.04} stroke={color} strokeWidth={0} strokeOpacity={0}>
        <animate attributeName="r" values={`${r + 14};${r + 28};${r + 14}`} dur={pulseDur} repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.5;0.15;0.5" dur={pulseDur} repeatCount="indefinite" />
      </circle>
      {/* Pulse ring */}
      <circle r={r} fill={color} fillOpacity={0.1} stroke={color} strokeWidth={0}>
        <animate attributeName="r" values={`${r};${r + 16};${r}`} dur={pulseDur} repeatCount="indefinite" calcMode="ease-out" />
        <animate attributeName="opacity" values="0.45;0;0.45" dur={pulseDur} repeatCount="indefinite" calcMode="ease-out" />
      </circle>
      {/* Flash burst for new ingest */}
      {flash && (
        <circle r={r + 4} fill="none" stroke={color} strokeWidth={2} strokeOpacity={0.9}>
          <animate attributeName="r" values={`${r};${r + 20}`} dur="1.2s" repeatCount="indefinite" />
          <animate attributeName="stroke-opacity" values="0.9;0" dur="1.2s" repeatCount="indefinite" />
        </circle>
      )}
      {/* Core node */}
      <circle
        r={r}
        fill={color}
        fillOpacity={flash ? 0.95 : 0.78}
        stroke={flash ? '#fff' : color}
        strokeWidth={flash ? 2 : 1.5}
        strokeOpacity={flash ? 0.6 : 1}
        style={{
          cursor: 'pointer',
          filter: `drop-shadow(0 0 ${flash ? 12 : 8}px ${color}${flash ? 'cc' : '88'})`,
        }}
      />
      <circle r={r * 0.35} fill="#ffffff" fillOpacity={0.35} style={{ pointerEvents: 'none' }} />
      {(country.reports >= 100 || country.isNew) && (
        <text
          textAnchor="middle"
          y={-r - 5}
          style={{ fontSize: 7, fill: color, fontFamily: 'monospace', fontWeight: 'bold', pointerEvents: 'none' }}
        >
          {country.isNew ? 'NEW' : country.reports >= 1000 ? `${(country.reports / 1000).toFixed(1)}k` : country.reports}
        </text>
      )}
    </Marker>
  );
}

function SchemaPanel() {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0d1426] p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Database className="w-3.5 h-3.5 text-[#7F77DD]" />
        <span className="text-xs font-bold text-white">Vector Payload Schema</span>
      </div>
      <pre className="text-[10px] font-mono text-green-400/80 bg-black/30 rounded-lg p-3 leading-relaxed overflow-x-auto">{`{
  "id": "msg_042",
  "vector": [0.023, -0.041, ...],  // 384 dims
  "payload": {
    "scam_family": "UPI/Payment Scam",
    "year": 2024,
    "country": "India",
    "state": "Maharashtra",
    "modality": "text",
    "confidence_score": 0.91,
    "cluster_id": 3,
    "reported_count": 47,
    "language": "en"
  }
}`}</pre>
      <p className="text-[10px] text-slate-500 leading-relaxed">
        All geographic filtering on this map runs through Qdrant&apos;s payload index — zero external databases.
      </p>
    </div>
  );
}

function RankingsPanel({ filter, countries }: { filter: Family; countries: CountryData[] }) {
  const visible = filter === 'All' ? countries : countries.filter(c => c.dominant === filter);
  const maxReports = Math.max(...visible.map(c => c.reports), 1);
  const [showScroll, setShowScroll] = useState(false);

  return (
    <div className="rounded-xl border border-white/10 bg-[#0d1426] p-4 space-y-3 transition-all duration-200 hover:border-white/15 hover:shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
      <div className="flex items-center gap-2">
        <Globe className="w-3.5 h-3.5 text-blue-400" />
        <span className="text-xs font-bold text-white">Country Rankings</span>
      </div>
      <div className="space-y-2">
        {visible.map((c, i) => (
          <div key={c.name} className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-600 w-4">{i + 1}</span>
            <span className="text-sm">{c.flag}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-[10px] mb-0.5">
                <span className="text-slate-300 truncate flex items-center gap-1">
                  {c.name}
                  {c.isFlashing && <span className="text-emerald-400 font-mono text-[8px]">+LIVE</span>}
                </span>
                <span className="text-slate-500 font-mono ml-1">{c.reports.toLocaleString()}</span>
              </div>
              <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(c.reports / maxReports) * 100}%`,
                    background: FAMILY_COLORS[c.dominant],
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => setShowScroll(v => !v)}
        className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors w-full text-left"
      >
        {showScroll ? '▲ Hide Qdrant query' : '▼ Show Qdrant scroll() query'}
      </button>
      {showScroll && (
        <pre className="text-[10px] font-mono text-green-400/70 bg-black/30 rounded-lg p-3 whitespace-pre-wrap">{`client.scroll('scam_messages',
  scroll_filter=Filter(must=[
    FieldCondition(key='country',
      match=MatchValue(value='India'))
  ])
)`}</pre>
      )}
    </div>
  );
}

function QueryPanel({
  filter,
  setFilter,
  vectorTotal,
}: {
  filter: Family;
  setFilter: (f: Family) => void;
  vectorTotal: number;
}) {
  const families: Family[] = ['All', 'Banking Fraud', 'Job Scam', 'UPI/Payment', 'Phishing', 'Lottery', 'Loan Scam'];
  const count = filter === 'All'
    ? vectorTotal
    : INITIAL_COUNTRIES.filter(c => c.dominant === filter).reduce((s, c) => s + c.reports, 0);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1426] p-5 space-y-4 transition-all duration-200 hover:border-white/15">
      <div className="flex items-center gap-2">
        <Database className="w-4 h-4 text-[#7F77DD]" />
        <span className="font-bold text-sm text-white">Qdrant Payload Intelligence</span>
      </div>
      <div className="rounded-lg bg-black/30 p-3 font-mono text-[10px] text-green-400/80 space-y-0.5">
        <div>client.search(</div>
        <div>&nbsp;&nbsp;collection_name=<span className="text-amber-400">&quot;scam_messages&quot;</span>,</div>
        <div>&nbsp;&nbsp;query_vector=<span className="text-blue-400">{filter === 'All' ? 'banking_fraud_centroid' : `${filter.toLowerCase().replace(/\//g, '_')}_centroid`}</span>,</div>
        <div>&nbsp;&nbsp;query_filter=Filter(</div>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;must=[</div>
        {filter !== 'All' && <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FieldCondition(key=<span className="text-amber-400">&quot;scam_family&quot;</span>, match=<span className="text-green-300">MatchValue(value=&quot;{filter}&quot;)</span>)</div>}
        <div>&nbsp;&nbsp;&nbsp;&nbsp;]</div>
        <div>&nbsp;&nbsp;),</div>
        <div>&nbsp;&nbsp;limit=<span className="text-amber-400">50</span></div>
        <div>)</div>
        <div className="text-blue-400 mt-1">→ {count.toLocaleString()} vectors returned · avg_similarity: 0.84</div>
      </div>
      <div className="flex flex-wrap gap-2">
        {families.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-[10px] font-medium rounded-full border px-2.5 py-1 transition-all ${
              filter === f
                ? f === 'All'
                  ? 'border-white/40 bg-white/10 text-white'
                  : 'text-white border-transparent'
                : 'border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-400'
            }`}
            style={
              filter === f && f !== 'All'
                ? { background: `${FAMILY_COLORS[f]}22`, borderColor: `${FAMILY_COLORS[f]}60`, color: FAMILY_COLORS[f] }
                : {}
            }
          >
            {f}
          </button>
        ))}
      </div>
      {filter !== 'All' && (
        <div className="text-[10px] font-mono text-slate-500 rounded-lg border border-white/8 bg-white/2 px-3 py-2">
          Active filter: <span className="text-[#7F77DD]">FieldCondition(key=&apos;scam_family&apos;, match=MatchValue(value=&apos;{filter}&apos;))</span>
        </div>
      )}
      <p className="text-[10px] text-slate-600">
        Qdrant payload indexing: country, scam_family, year, modality, and confidence_score are all indexed as filterable fields.
      </p>
    </div>
  );
}

export default function ThreatMapPage() {
  const [filter, setFilter] = useState<Family>('All');
  const [countries, setCountries] = useState<CountryData[]>(INITIAL_COUNTRIES);
  const [hovered, setHovered] = useState<CountryData | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [showDrift, setShowDrift] = useState(true);
  const [liveEvents, setLiveEvents] = useState(0);
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const visibleCountries = useMemo(
    () => (filter === 'All' ? countries : countries.filter(c => c.dominant === filter)),
    [countries, filter],
  );

  const countryByName = useMemo(
    () => new Map(countries.map(c => [c.name, c])),
    [countries],
  );

  const vectorTotal = useMemo(
    () => countries.reduce((s, c) => s + c.reports, 0),
    [countries],
  );

  const tooltipRaf = useRef<number | null>(null);
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (tooltipRaf.current !== null) return;
    const { clientX, clientY } = e;
    tooltipRaf.current = requestAnimationFrame(() => {
      setTooltipPos({ x: clientX + 16, y: clientY - 10 });
      tooltipRaf.current = null;
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveEvents(n => n + 1);
      const roll = Math.random();

      if (roll < 0.25) {
        const burst = LIVE_BURST_POOL[Math.floor(Math.random() * LIVE_BURST_POOL.length)];
        setCountries(prev => {
          if (prev.some(c => c.name === burst.name)) {
            return prev.map(c =>
              c.name === burst.name
                ? {
                    ...c,
                    reports: c.reports + Math.floor(Math.random() * 8) + 2,
                    vectors: c.vectors + Math.floor(Math.random() * 8) + 2,
                    isFlashing: true,
                    isNew: false,
                  }
                : c,
            );
          }
          return [...prev, { ...burst, isFlashing: true, isNew: true }];
        });
      } else {
        setCountries(prev => {
          const eligible = prev.filter(c => !c.isNew || c.reports > 50);
          if (!eligible.length) return prev;
          const target = eligible[Math.floor(Math.random() * eligible.length)];
          const delta = Math.floor(Math.random() * 11) + 3;
          return prev.map(c =>
            c.name === target.name
              ? {
                  ...c,
                  reports: c.reports + delta,
                  vectors: c.vectors + delta,
                  isFlashing: true,
                  isNew: false,
                }
              : { ...c, isFlashing: false, isNew: false },
          );
        });
      }

      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
      flashTimeoutRef.current = setTimeout(() => {
        setCountries(prev =>
          prev.map(c => ({ ...c, isFlashing: false, isNew: false })),
        );
      }, 2800);
    }, 11000);

    return () => {
      clearInterval(interval);
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    };
  }, []);

  const tickerText = TICKER_ITEMS.join('  ·  ');

  return (
    <div className="min-h-screen" style={{ background: '#0a0f1e' }}>
      <div className="border-b border-white/8 bg-black/30 overflow-hidden py-1.5">
        <div className="flex">
          <div className="animate-ticker whitespace-nowrap text-[10px] font-mono text-slate-500 flex-shrink-0">
            {tickerText}&nbsp;&nbsp;&nbsp;&nbsp;{tickerText}
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-30 border-b border-white/8 bg-[#0a0f1e]/90 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs font-mono text-slate-400">Threat Map · Geographic payload filtering via Qdrant</span>
          </div>
          <span className="text-[10px] font-mono text-cyan-400/80 tabular-nums">
            scam_messages · {vectorTotal.toLocaleString()} vectors
          </span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-5">
        <QueryPanel filter={filter} setFilter={setFilter} vectorTotal={vectorTotal} />

        <div className="grid lg:grid-cols-4 gap-5">
          <div
            className="lg:col-span-3 rounded-2xl border border-white/10 bg-[#0d1426] overflow-hidden relative transition-all duration-200 hover:border-cyan-500/20 hover:shadow-[0_8px_32px_rgba(0,0,0,0.35),0_0_24px_rgba(34,211,238,0.06)]"
            onMouseMove={handleMouseMove}
          >
            <div className="px-5 py-2.5 border-b border-white/8 flex items-center justify-between">
              <div>
                <span className="font-semibold text-sm text-white tracking-tight">Global Scam Distribution</span>
                <p className="text-[10px] text-slate-500 mt-0.5 font-mono">Semantic proximity arcs · live Qdrant geo index</p>
              </div>
              <span className="text-[10px] font-mono text-slate-600 hidden sm:block">
                {visibleCountries.length} active nodes
              </span>
            </div>

            <div className="relative" style={{ height: MAP_HEIGHT, width: '100%' }}>
              <div className="threat-map-radar" aria-hidden />
              <MapStatusOverlay vectorCount={vectorTotal} liveEvents={liveEvents} />

              <ComposableMap
                projection="geoNaturalEarth1"
                style={{ width: '100%', height: '100%' }}
                projectionConfig={{ scale: 142, center: [20, 10] }}
              >
                <Geographies geography={GEO_URL}>
                  {({ geographies }: { geographies: object[] }) =>
                    geographies.map((geo: object) => (
                      <Geography
                        key={(geo as { rsmKey: string }).rsmKey}
                        geography={geo}
                        fill="#0a1220"
                        stroke="#1e2d4a"
                        strokeWidth={0.45}
                        style={{
                          default: { outline: 'none' },
                          hover: { outline: 'none', fill: '#111f38' },
                          pressed: { outline: 'none' },
                        }}
                      />
                    ))
                  }
                </Geographies>

                <SemanticArcs links={SEMANTIC_LINKS} countryByName={countryByName} />

                {visibleCountries.map(country => (
                  <LiveThreatNode
                    key={country.name}
                    country={country}
                    onEnter={() => setHovered(country)}
                    onLeave={() => setHovered(null)}
                  />
                ))}
              </ComposableMap>
            </div>

            <div className="px-5 py-2.5 border-t border-white/6 flex flex-wrap gap-3">
              {Object.entries(FAMILY_COLORS).map(([fam, col]) => (
                <div key={fam} className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-[0_0_6px_currentColor]" style={{ background: col, color: col }} />
                  {fam}
                </div>
              ))}
              <div className="flex items-center gap-1.5 text-[10px] text-slate-600 ml-auto">
                <span className="w-4 h-px bg-cyan-400/50" />
                semantic link
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <SchemaPanel />
            <RankingsPanel filter={filter} countries={countries} />
          </div>
        </div>

        {hovered && (
          <div
            className="fixed z-50 pointer-events-none"
            style={{ left: tooltipPos.x, top: tooltipPos.y }}
          >
            <MapTooltip country={hovered} />
          </div>
        )}

        <div className="rounded-2xl border border-white/10 bg-[#0d1426] overflow-hidden transition-all duration-200 hover:border-white/15">
          <button
            className="w-full flex items-center justify-between px-5 py-4"
            onClick={() => setShowDrift(v => !v)}
          >
            <div>
              <span className="font-bold text-sm text-white">Semantic Drift Velocity by Region</span>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Avg cosine distance between family vectors from year N and year N+1 — higher = faster mutation
              </p>
            </div>
            {showDrift ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {showDrift && (
            <div className="px-5 pb-5 border-t border-white/8 space-y-4">
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={DRIFT_DATA} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="country" tick={{ fontSize: 10, fill: '#5b7ba8' }} axisLine={{ stroke: '#1a2235' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: '#5b7ba8' }} axisLine={{ stroke: '#1a2235' }} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#0d1426', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }}
                      itemStyle={{ color: '#e8f0fe' }}
                      formatter={(v: number) => [`${v} drift/year`, 'Semantic Drift']}
                    />
                    <Bar dataKey="drift" radius={[4, 4, 0, 0]}>
                      {DRIFT_DATA.map((entry, i) => (
                        <Cell key={`cell-${i}`} fill={entry.drift > 0.28 ? '#E24B4A' : entry.drift > 0.18 ? '#EF9F27' : '#7F77DD'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Drift velocity = avg cosine distance between a family&apos;s vectors from year N and year N+1,
                computed via Qdrant payload-filtered searches per country per year.
              </p>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-blue-500/20 bg-blue-950/10 p-4 transition-all duration-200 hover:border-blue-500/30">
          <div className="flex items-start gap-3">
            <Database className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400 leading-relaxed">
              <span className="text-white font-semibold">Qdrant isn&apos;t just the search engine here — it&apos;s the entire data layer.</span>{' '}
              Country, region, modality, and confidence_score are stored as metadata payloads alongside each vector.
              Qdrant&apos;s payload indexing makes geographic filtering as fast as the semantic search itself.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
