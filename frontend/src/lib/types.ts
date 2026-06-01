export type ThreatLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type Modality = 'text' | 'image' | 'audio';

export interface SimilarMessage {
  id: string;
  text: string;
  family: string;
  similarity: number;
  year: number;
  modality: Modality;
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
}

export interface FamilyStats {
  family: string;
  count: number;
  avg_confidence: number;
  years: number[];
  cluster_ids: number[];
}

export interface DashboardStats {
  total_messages: number;
  total_families: number;
  recent_threats: number;
  top_families: FamilyStats[];
}

export interface HealthStatus {
  status: string;
  qdrant_connected: boolean;
  model_loaded: boolean;
  total_messages: number;
}
