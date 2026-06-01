export type ThreatLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'ZERO-DAY';
export type Modality = 'text' | 'image' | 'audio';

export interface SimilarMessage {
  id: string;
  text: string;
  family: string;
  similarity: number;
  year: number;
  modality: Modality;
  source_label: string;
}

export interface EvolutionEntry {
  year: number;
  text: string;
  family: string;
  cluster_id: number;
  similarity: number;
}

export interface GraphNode {
  id: string;
  label: string;
  size: number;
  family: string;
  color: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  weight: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// ── Novel: Semantic Genome ─────────────────────────────────────────────────
export interface GenomeDimension {
  key: string;
  label: string;
  score: number;
  description: string;
  color: string;
}

export interface GenomeData {
  dimensions: GenomeDimension[];
  dominant_vector: string;
  attack_complexity: number;
}

// ── Novel: Zero-Day Detection ─────────────────────────────────────────────
export interface ZeroDayAlert {
  is_zero_day: boolean;
  novelty_score: number;
  closest_family: string;
  closest_similarity: number;
  alert_message: string;
}

// ── Novel: Evolution Velocity ─────────────────────────────────────────────
export interface YearlyDrift {
  year: number;
  drift_from_previous: number;
  cumulative_drift: number;
}

export interface EvolutionVelocity {
  family: string;
  yearly_drift: YearlyDrift[];
  avg_velocity: number;
  acceleration: number;
  risk_level: 'STABLE' | 'EVOLVING' | 'RAPID';
}

// ── Full analysis result ──────────────────────────────────────────────────
export interface AnalysisResult {
  threat_level: ThreatLevel;
  threat_score: number;
  detected_family: string;
  cluster_id: number;
  modality: Modality;
  extracted_text: string;
  similar_messages: SimilarMessage[];
  evolution_timeline: EvolutionEntry[];
  graph_data: GraphData;
  genome: GenomeData;
  zero_day: ZeroDayAlert;
  novelty_score: number;
  risk_indicators: string[];
}

// ── Dashboard ─────────────────────────────────────────────────────────────
export interface FamilyStats {
  family: string;
  count: number;
  avg_confidence: number;
  years: number[];
  cluster_ids: number[];
  color: string;
}

export interface DashboardStats {
  total_messages: number;
  total_families: number;
  recent_threats: number;
  zero_day_count: number;
  top_families: FamilyStats[];
}

// ── Community ─────────────────────────────────────────────────────────────
export interface FeedItem {
  id: string;
  text: string;
  detected_family: string;
  threat_score: number;
  modality: Modality;
  timestamp: string;
  source_label: string;
}

export interface HealthStatus {
  status: string;
  qdrant_connected: boolean;
  model_loaded: boolean;
  total_messages: number;
  qdrant_version: string;
}
