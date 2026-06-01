'use client';

import React, { forwardRef } from 'react';
import type { AnalysisResult } from '@/lib/types';

interface Props {
  result: AnalysisResult;
  timestamp: string;
  threatId: string;
  id?: string;
}

// ── Design tokens (inline — html2canvas reads computed styles) ────────────────
const C = {
  bg:        '#0a0e1a',
  surface:   '#111827',
  surface2:  '#1a2235',
  border:    '#1f2d45',
  neon:      '#00ff9d',
  neonDim:   'rgba(0,255,157,0.12)',
  ink:       '#e2e8f0',
  ink2:      '#94a3b8',
  ink3:      '#4a5568',
  high:      '#ef4444',
  amber:     '#f59e0b',
  emerald:   '#10b981',
  rose:      '#f43f5e',
  blue:      '#3b82f6',
} as const;

const STAGE_COLOR: Record<string, string> = {
  known:    C.emerald,
  evolving: C.amber,
  emerging: C.rose,
};

const STAGE_LABEL: Record<string, string> = {
  known:    'KNOWN THREAT',
  evolving: 'EVOLVING VARIANT',
  emerging: 'EMERGING VARIANT',
};

const THREAT_COLOR: Record<string, string> = {
  HIGH:       C.high,
  MEDIUM:     C.amber,
  LOW:        C.emerald,
  'ZERO-DAY': C.rose,
};

// Helper to render a genome dimension bar row
function DimBar({ label, score, color }: { label: string; score: number; color: string }) {
  const pct = Math.round(score * 100);
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontSize: 10, color: C.ink2, fontFamily: 'monospace', textTransform: 'capitalize' }}>
          {label.replace(/_/g, ' ')}
        </span>
        <span style={{ fontSize: 10, color, fontFamily: 'monospace', fontWeight: 700 }}>{pct}%</span>
      </div>
      <div style={{ height: 5, background: C.border, borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'none' }} />
      </div>
    </div>
  );
}

// Section header
function SecHeader({ title, accent = C.neon }: { title: string; accent?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      <div style={{ width: 3, height: 16, background: accent, borderRadius: 2, flexShrink: 0 }} />
      <span style={{ fontSize: 9, fontFamily: 'monospace', color: accent, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700 }}>
        {title}
      </span>
    </div>
  );
}

// Divider
function Divider() {
  return <div style={{ height: 1, background: C.border, margin: '18px 0' }} />;
}

// The main template — rendered off-screen, captured by html2canvas
export const ThreatBriefTemplate = forwardRef<HTMLDivElement, Props>(
  function ThreatBriefTemplate({ result, timestamp, threatId, id }, ref) {
    const stage = result.variant_stage ?? (result.zero_day?.is_zero_day ? 'emerging' : 'known');
    const stageColor   = STAGE_COLOR[stage] ?? C.neon;
    const threatColor  = THREAT_COLOR[result.threat_level] ?? C.ink;
    const topSimilar   = result.similar_messages.slice(0, 3);
    const dominantDim  = result.genome?.dominant_vector ?? '—';
    const dimensions   = result.genome?.dimensions ?? [];

    return (
      <div
        ref={ref}
        id={id}
        style={{
          display: 'block',
          width: 794,          // ~A4 width at 96 dpi
          background: C.bg,
          fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
          color: C.ink,
          padding: '40px 48px',
          boxSizing: 'border-box',
        }}
      >
        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: C.neonDim, border: `1px solid ${C.neon}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, color: C.neon, fontWeight: 900,
              }}>⚡</div>
              <span style={{ fontSize: 18, fontWeight: 900, color: C.ink, letterSpacing: -0.5 }}>
                EchoTrace
              </span>
              <span style={{ fontSize: 10, color: C.neon, fontFamily: 'monospace', background: C.neonDim, padding: '2px 8px', borderRadius: 4, border: `1px solid ${C.neon}40` }}>
                THREAT BRIEF
              </span>
            </div>
            <div style={{ fontSize: 11, color: C.ink2, fontFamily: 'monospace' }}>
              Threat Intelligence Report · AI-Powered Scam Analysis
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 9, color: C.ink3, fontFamily: 'monospace', marginBottom: 3 }}>THREAT ID</div>
            <div style={{ fontSize: 11, color: C.neon, fontFamily: 'monospace', fontWeight: 700 }}>{threatId}</div>
            <div style={{ fontSize: 9, color: C.ink3, fontFamily: 'monospace', marginTop: 4 }}>{timestamp}</div>
          </div>
        </div>

        {/* Neon separator */}
        <div style={{ height: 1, background: `linear-gradient(to right, ${C.neon}, transparent)`, marginBottom: 28 }} />

        {/* ── SECTION 1: THREAT SUMMARY ────────────────────────────────────── */}
        <SecHeader title="Section 1 — Threat Summary" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
          {/* Threat Level */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px', borderTop: `2px solid ${threatColor}` }}>
            <div style={{ fontSize: 8, color: C.ink3, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Threat Level</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: threatColor, fontFamily: 'monospace' }}>{result.threat_level}</div>
          </div>
          {/* Fraud Family */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px', borderTop: `2px solid ${C.neon}` }}>
            <div style={{ fontSize: 8, color: C.ink3, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Fraud Family</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, wordBreak: 'break-word' }}>{result.detected_family}</div>
          </div>
          {/* Confidence */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px', borderTop: `2px solid ${C.blue}` }}>
            <div style={{ fontSize: 8, color: C.ink3, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Confidence</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: C.blue, fontFamily: 'monospace' }}>
              {Math.round(result.threat_score * 100)}%
            </div>
          </div>
          {/* Variant Stage */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px', borderTop: `2px solid ${stageColor}` }}>
            <div style={{ fontSize: 8, color: C.ink3, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Variant Stage</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: stageColor, fontFamily: 'monospace' }}>{STAGE_LABEL[stage]}</div>
          </div>
        </div>

        {/* Zero-Day alert message */}
        {result.zero_day?.alert_message && (
          <div style={{
            background: `${stageColor}0d`, border: `1px solid ${stageColor}40`,
            borderRadius: 8, padding: '10px 14px', marginBottom: 20,
            display: 'flex', alignItems: 'flex-start', gap: 10,
          }}>
            <span style={{ fontSize: 13, color: stageColor, flexShrink: 0 }}>⚡</span>
            <p style={{ fontSize: 11, color: C.ink2, lineHeight: 1.6, margin: 0 }}>{result.zero_day.alert_message}</p>
          </div>
        )}

        <Divider />

        {/* ── SECTION 2: PSYCHOLOGICAL ATTACK PROFILE ──────────────────────── */}
        <SecHeader title="Section 2 — Psychological Attack Profile (Fraud DNA)" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 8 }}>
          <div>
            {dimensions.slice(0, 4).map((d) => (
              <DimBar key={d.key} label={d.label} score={d.score} color={d.color || C.neon} />
            ))}
          </div>
          <div>
            {dimensions.slice(4).map((d) => (
              <DimBar key={d.key} label={d.label} score={d.score} color={d.color || C.neon} />
            ))}
          </div>
        </div>
        <div style={{
          background: C.surface2, border: `1px solid ${C.neon}30`,
          borderRadius: 8, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6,
        }}>
          <span style={{ fontSize: 9, color: C.ink3, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: 1 }}>Dominant Vector</span>
          <span style={{ fontSize: 12, color: C.neon, fontFamily: 'monospace', fontWeight: 700, textTransform: 'capitalize' }}>
            {dominantDim.replace(/_/g, ' ')}
          </span>
          {result.genome?.attack_complexity !== undefined && (
            <>
              <span style={{ color: C.border, fontSize: 10 }}>·</span>
              <span style={{ fontSize: 9, color: C.ink3, fontFamily: 'monospace' }}>
                Attack Complexity: <span style={{ color: C.ink2, fontWeight: 600 }}>{Math.round(result.genome.attack_complexity * 100)}%</span>
              </span>
            </>
          )}
        </div>

        <Divider />

        {/* ── SECTION 3: FRAUD LINEAGE ─────────────────────────────────────── */}
        <SecHeader title="Section 3 — Fraud Lineage (Evolution Timeline)" />
        {result.evolution_timeline && result.evolution_timeline.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0, marginBottom: 6 }}>
            {result.evolution_timeline.map((entry, i) => (
              <div key={entry.year} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                <div style={{
                  background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 8, padding: '8px 12px', minWidth: 80,
                  borderLeft: `2px solid ${C.neon}`,
                }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: C.neon, fontFamily: 'monospace' }}>{entry.year}</div>
                  <div style={{ fontSize: 9, color: C.ink2, marginTop: 2, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {entry.text?.slice(0, 30) || entry.family}
                  </div>
                  <div style={{ fontSize: 8, color: C.ink3, fontFamily: 'monospace', marginTop: 1 }}>
                    {Math.round(entry.similarity * 100)}% sim
                  </div>
                </div>
                {i < result.evolution_timeline.length - 1 && (
                  <div style={{ fontSize: 14, color: C.ink3, padding: '0 6px' }}>→</div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 11, color: C.ink3, fontStyle: 'italic', marginBottom: 6 }}>
            No evolution data available for this family.
          </div>
        )}

        <Divider />

        {/* ── SECTION 4: NEAREST SEMANTIC RELATIVES ────────────────────────── */}
        <SecHeader title="Section 4 — Nearest Semantic Relatives (Qdrant)" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 6 }}>
          {topSimilar.length > 0 ? topSimilar.map((msg, i) => (
            <div key={msg.id} style={{
              background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px',
              display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 12, alignItems: 'center',
            }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: C.ink3, fontFamily: 'monospace' }}>#{i + 1}</span>
              <div>
                <div style={{ fontSize: 9, color: C.neon, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>{msg.family}</div>
                <div style={{ fontSize: 10, color: C.ink2, lineHeight: 1.5 }}>
                  "{msg.text?.slice(0, 90)}{msg.text?.length > 90 ? '…' : ''}"
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: C.neon, fontFamily: 'monospace' }}>
                  {Math.round(msg.similarity * 100)}%
                </div>
                <div style={{ fontSize: 8, color: C.ink3, fontFamily: 'monospace' }}>similarity</div>
              </div>
            </div>
          )) : (
            <div style={{ fontSize: 11, color: C.ink3, fontStyle: 'italic' }}>No semantic relatives found.</div>
          )}
        </div>

        <Divider />

        {/* ── SECTION 5: PSYCHOLOGICAL BRIEFING ────────────────────────────── */}
        <SecHeader title="Section 5 — Psychological Intelligence Briefing" />
        <div style={{
          background: C.neonDim, border: `1px solid ${C.neon}30`,
          borderRadius: 10, padding: '14px 18px', marginBottom: 6,
          display: 'flex', gap: 12, alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: 18, color: C.neon, flexShrink: 0 }}>🧠</span>
          <p style={{ fontSize: 12, color: C.ink2, lineHeight: 1.8, margin: 0, fontStyle: 'italic' }}>
            {result.insight_text ?? 'No psychological briefing available.'}
          </p>
        </div>

        {/* ── FOOTER ──────────────────────────────────────────────────────── */}
        <div style={{ marginTop: 28, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: 8, color: C.ink3, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 5 }}>
                Powered By
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                {['Qdrant Vector Search', '384-dim Embeddings', 'HNSW Retrieval'].map((t) => (
                  <span key={t} style={{
                    fontSize: 8, color: C.ink3, fontFamily: 'monospace',
                    background: C.surface2, border: `1px solid ${C.border}`,
                    padding: '2px 8px', borderRadius: 4,
                  }}>{t}</span>
                ))}
              </div>
              <div style={{ fontSize: 9, color: C.ink3, marginTop: 6, fontStyle: 'italic' }}>
                Threat intelligence generated using semantic vector neighborhoods in Qdrant.
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 8, color: C.neon, fontFamily: 'monospace', fontWeight: 700 }}>EchoTrace AI v2.0</div>
              <div style={{ fontSize: 7, color: C.ink3, fontFamily: 'monospace', marginTop: 2 }}>
                CONFIDENTIAL — THREAT INTELLIGENCE REPORT
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ThreatBriefTemplate.displayName = 'ThreatBriefTemplate';
