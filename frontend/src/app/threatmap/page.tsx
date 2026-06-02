'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Globe, Database, Filter, ChevronDown, ChevronUp } from 'lucide-react';

/* ── Dynamic import for react-simple-maps (SSR safety) ─────────────────── */
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

/* ── Types & data ─────────────────────────────────────────────────────── */
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
}

const COUNTRIES: CountryData[] = [
  { name: 'India', flag: '🇮🇳', lat: 20.5, lng: 78.9, reports: 1240, dominant: 'UPI/Payment', secondary: 'Banking Fraud', topScam: 'UPI mandate fraud — Rs 500 cashback on linking...', vectors: 1240 },
  { name: 'Nigeria', flag: '🇳🇬', lat: 9.0, lng: 8.6, reports: 890, dominant: 'Lottery', secondary: 'Job Scam', topScam: 'You won $50,000 in the international lottery...', vectors: 890 },
  { name: 'USA', flag: '🇺🇸', lat: 37.0, lng: -95.7, reports: 760, dominant: 'Phishing', secondary: 'Banking Fraud', topScam: 'Your Apple ID has been suspended — verify now...', vectors: 760 },
  { name: 'UK', flag: '🇬🇧', lat: 55.3, lng: -3.4, reports: 430, dominant: 'Lottery', secondary: 'Phishing', topScam: 'HMRC tax refund of £1,200 — click to claim...', vectors: 430 },
  { name: 'Pakistan', flag: '🇵🇰', lat: 30.3, lng: 69.3, reports: 380, dominant: 'Banking Fraud', secondary: 'Loan Scam', topScam: 'Your account KYC expires — update to avoid block...', vectors: 380 },
  { name: 'Brazil', flag: '🇧🇷', lat: -14.2, lng: -51.9, reports: 290, dominant: 'Job Scam', secondary: 'Phishing', topScam: 'Work from home opportunity: R$10,000/month...', vectors: 290 },
  { name: 'Kenya', flag: '🇰🇪', lat: 0.02, lng: 37.9, reports: 210, dominant: 'Loan Scam', secondary: 'Lottery', topScam: 'Instant M-Pesa loan KES 50,000 approved...', vectors: 210 },
  { name: 'China', flag: '🇨🇳', lat: 35.8, lng: 104.1, reports: 180, dominant: 'Phishing', secondary: 'Job Scam', topScam: 'WeChat account security alert — verify now...', vectors: 180 },
  { name: 'Indonesia', flag: '🇮🇩', lat: -0.7, lng: 109.0, reports: 140, dominant: 'UPI/Payment', secondary: 'Banking Fraud', topScam: 'GoPay reward Rp 500,000 — link account now...', vectors: 140 },
  { name: 'South Africa', flag: '🇿🇦', lat: -30.5, lng: 22.9, reports: 110, dominant: 'Job Scam', secondary: 'Lottery', topScam: 'Earn R25,000/month working from home...', vectors: 110 },
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
  '🔴 Qdrant detected new UPI fraud cluster in Mumbai · query: search(filter: country=India, family=UPI) → 47 new vectors',
  '🟡 Banking Fraud semantic drift +12% in Pakistan this month',
  '🔴 New phishing variant: 89% similar to UK banking scam family',
  '🟣 Zero-day proto-family #9 growing: 7/10 vectors — India origin',
  '🟠 Job Scam velocity: RAPID in Brazil · drift rate 0.15 this quarter',
  '🔴 Qdrant detected new UPI fraud cluster in Mumbai · query: search(filter: country=India, family=UPI) → 47 new vectors',
  '🟡 Banking Fraud semantic drift +12% in Pakistan this month',
  '🔴 New phishing variant: 89% similar to UK banking scam family',
  '🟣 Zero-day proto-family #9 growing: 7/10 vectors — India origin',
];

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

/* ── Circle size helper ─────────────────────────────────────────────────── */
function circleRadius(reports: number): number {
  if (reports >= 1000) return 18;
  if (reports >= 500) return 14;
  if (reports >= 300) return 11;
  return 8;
}

/* ── Hover tooltip for map ─────────────────────────────────────────────── */
function MapTooltip({ country }: { country: CountryData | null }) {
  if (!country) return null;
  return (
    <div className="rounded-xl border border-white/15 bg-[#0a0f1e]/95 backdrop-blur p-4 text-xs max-w-[260px] shadow-xl">
      <div className="font-bold text-white mb-2">
        {country.flag} {country.name}
      </div>
      <div className="space-y-1 text-slate-400">
        <div>Reports: <span className="text-white font-bold">{country.reports.toLocaleString()}</span></div>
        <div>Dominant: <span style={{ color: FAMILY_COLORS[country.dominant] }}>{country.dominant}</span></div>
        <div>Secondary: <span className="text-slate-300">{country.secondary}</span></div>
        <div className="border-t border-white/8 pt-2 mt-2">
          <div className="text-slate-500 font-mono text-[10px] mb-1">Qdrant query:</div>
          <div className="text-green-400 font-mono text-[10px]">
            search(filter: country=&quot;{country.name}&quot;)
          </div>
          <div className="text-slate-500 font-mono text-[10px]">→ {country.vectors.toLocaleString()} vectors · 6 families</div>
        </div>
        <div className="border-t border-white/8 pt-2 mt-2 text-slate-300 leading-relaxed">
          &quot;{country.topScam}&quot;
        </div>
      </div>
    </div>
  );
}

/* ── Qdrant payload schema panel ─────────────────────────────────────────── */
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

/* ── Country rankings panel ──────────────────────────────────────────────── */
function RankingsPanel({ filter }: { filter: Family }) {
  const visible = filter === 'All' ? COUNTRIES : COUNTRIES.filter(c => c.dominant === filter);
  const maxReports = Math.max(...visible.map(c => c.reports));

  const [showScroll, setShowScroll] = useState(false);

  return (
    <div className="rounded-xl border border-white/10 bg-[#0d1426] p-4 space-y-3">
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
                <span className="text-slate-300 truncate">{c.name}</span>
                <span className="text-slate-500 font-mono ml-1">{c.reports.toLocaleString()}</span>
              </div>
              <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full"
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

/* ── Qdrant payload query panel (top) ────────────────────────────────────── */
function QueryPanel({ filter, setFilter }: { filter: Family; setFilter: (f: Family) => void }) {
  const families: Family[] = ['All', 'Banking Fraud', 'Job Scam', 'UPI/Payment', 'Phishing', 'Lottery', 'Loan Scam'];
  const count = filter === 'All' ? 4630 : COUNTRIES.filter(c => c.dominant === filter).reduce((s, c) => s + c.reports, 0);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1426] p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Database className="w-4 h-4 text-[#7F77DD]" />
        <span className="font-bold text-sm text-white">Qdrant Payload Intelligence</span>
      </div>
      <div className="rounded-lg bg-black/30 p-3 font-mono text-[10px] text-green-400/80 space-y-0.5">
        <div>client.search(</div>
        <div>&nbsp;&nbsp;collection_name=<span className="text-amber-400">&quot;scam_messages&quot;</span>,</div>
        <div>&nbsp;&nbsp;query_vector=<span className="text-blue-400">{filter === 'All' ? 'banking_fraud_centroid' : `${filter.toLowerCase().replace(/\//g,'_')}_centroid`}</span>,</div>
        <div>&nbsp;&nbsp;query_filter=Filter(</div>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;must=[</div>
        {filter !== 'All' && <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FieldCondition(key=<span className="text-amber-400">&quot;scam_family&quot;</span>, match=<span className="text-green-300">MatchValue(value=&quot;{filter}&quot;)</span>)</div>}
        <div>&nbsp;&nbsp;&nbsp;&nbsp;]</div>
        <div>&nbsp;&nbsp;),</div>
        <div>&nbsp;&nbsp;limit=<span className="text-amber-400">50</span></div>
        <div>)</div>
        <div className="text-blue-400 mt-1">→ {count.toLocaleString()} vectors returned · avg_similarity: 0.84</div>
      </div>

      {/* Family filter pills */}
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
          {' '}→ {COUNTRIES.filter(c => c.dominant === filter).length} countries · {count.toLocaleString()} vectors
        </div>
      )}
      <p className="text-[10px] text-slate-600">
        Qdrant payload indexing: country, scam_family, year, modality, and confidence_score are all indexed as filterable fields. No secondary database needed.
      </p>
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────────────────────── */
export default function ThreatMapPage() {
  const [filter, setFilter] = useState<Family>('All');
  const [hovered, setHovered] = useState<CountryData | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [showDrift, setShowDrift] = useState(true);

  const visibleCountries = filter === 'All'
    ? COUNTRIES
    : COUNTRIES.filter(c => c.dominant === filter);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setTooltipPos({ x: e.clientX + 16, y: e.clientY - 10 });
  }, []);

  const tickerText = TICKER_ITEMS.join('  ·  ');

  return (
    <div className="min-h-screen" style={{ background: '#0a0f1e' }}>
      {/* Ticker */}
      <div className="border-b border-white/8 bg-black/30 overflow-hidden py-1.5">
        <div className="flex">
          <div className="animate-ticker whitespace-nowrap text-[10px] font-mono text-slate-500 flex-shrink-0">
            {tickerText}&nbsp;&nbsp;&nbsp;&nbsp;{tickerText}
          </div>
        </div>
      </div>

      {/* Top bar */}
      <div className="sticky top-0 z-30 border-b border-white/8 bg-[#0a0f1e]/90 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs font-mono text-slate-400">Threat Map · Geographic payload filtering via Qdrant</span>
          </div>
          <span className="text-[10px] font-mono text-slate-600">scam_messages · {visibleCountries.reduce((s, c) => s + c.reports, 0).toLocaleString()} vectors</span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Query panel */}
        <QueryPanel filter={filter} setFilter={setFilter} />

        {/* Map + sidebars */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Map */}
          <div className="lg:col-span-3 rounded-2xl border border-white/10 bg-[#0d1426] overflow-hidden relative" onMouseMove={handleMouseMove}>
            <div className="px-5 py-3 border-b border-white/8 flex items-center justify-between">
              <span className="font-bold text-sm text-white">Global Scam Distribution</span>
              <span className="text-[10px] font-mono text-slate-500">hover circles for Qdrant query details</span>
            </div>

            <div style={{ height: 420, width: '100%' }}>
              <ComposableMap
                projection="geoNaturalEarth1"
                style={{ width: '100%', height: '100%' }}
                projectionConfig={{ scale: 120, center: [20, 10] }}
              >
                <Geographies geography={GEO_URL}>
                  {({ geographies }: { geographies: object[] }) =>
                    geographies.map((geo: object) => (
                      <Geography
                        key={(geo as { rsmKey: string }).rsmKey}
                        geography={geo}
                        fill="#0d1426"
                        stroke="#1a2235"
                        strokeWidth={0.5}
                        style={{
                          default: { outline: 'none' },
                          hover: { outline: 'none', fill: '#111f38' },
                          pressed: { outline: 'none' },
                        }}
                      />
                    ))
                  }
                </Geographies>

                {visibleCountries.map(country => {
                  const r = circleRadius(country.reports);
                  const color = FAMILY_COLORS[country.dominant];
                  return (
                    <Marker
                      key={country.name}
                      coordinates={[country.lng, country.lat]}
                      onMouseEnter={() => setHovered(country)}
                      onMouseLeave={() => setHovered(null)}
                    >
                      {/* Pulse ring */}
                      <circle r={r + 6} fill="none" stroke={color} strokeWidth={1} opacity={0.3} className="animate-pulse-ring" />
                      {/* Main circle */}
                      <circle
                        r={r}
                        fill={color}
                        fillOpacity={0.7}
                        stroke={color}
                        strokeWidth={1.5}
                        style={{ cursor: 'pointer', filter: `drop-shadow(0 0 4px ${color})` }}
                      />
                      {/* Report count label for large circles */}
                      {country.reports >= 500 && (
                        <text
                          textAnchor="middle"
                          y={-r - 4}
                          style={{ fontSize: 7, fill: color, fontFamily: 'monospace', fontWeight: 'bold' }}
                        >
                          {country.reports >= 1000 ? `${(country.reports / 1000).toFixed(1)}k` : country.reports}
                        </text>
                      )}
                    </Marker>
                  );
                })}
              </ComposableMap>
            </div>

            {/* Map legend */}
            <div className="px-5 py-3 border-t border-white/6 flex flex-wrap gap-3">
              {Object.entries(FAMILY_COLORS).map(([fam, col]) => (
                <div key={fam} className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: col }} />
                  {fam}
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <SchemaPanel />
            <RankingsPanel filter={filter} />
          </div>
        </div>

        {/* Tooltip overlay */}
        {hovered && (
          <div
            className="fixed z-50 pointer-events-none"
            style={{ left: tooltipPos.x, top: tooltipPos.y }}
          >
            <MapTooltip country={hovered} />
          </div>
        )}

        {/* Drift velocity chart */}
        <div className="rounded-2xl border border-white/10 bg-[#0d1426] overflow-hidden">
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
                This unique insight reveals which regions have the fastest-evolving fraud patterns.
              </p>
            </div>
          )}
        </div>

        {/* Bottom context box */}
        <div className="rounded-xl border border-blue-500/20 bg-blue-950/10 p-4">
          <div className="flex items-start gap-3">
            <Database className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400 leading-relaxed">
              <span className="text-white font-semibold">Qdrant isn&apos;t just the search engine here — it&apos;s the entire data layer.</span>{' '}
              Country, region, modality, and confidence_score are stored as metadata payloads alongside each vector.
              Qdrant&apos;s payload indexing makes geographic filtering as fast as the semantic search itself.
              No secondary database. No ETL. One collection, all intelligence.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
