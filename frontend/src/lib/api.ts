import axios from 'axios';
import type {
  AnalysisResult,
  DashboardStats,
  EvolutionEntry,
  EvolutionVelocity,
  FamilyStats,
  FeedItem,
  GraphData,
  HealthStatus,
} from './types';

const BASE = '';  // Next.js rewrites /api/* → http://localhost:8000/api/*

export const api = {
  async analyze(formData: FormData): Promise<AnalysisResult> {
    const res = await axios.post<AnalysisResult>(`${BASE}/api/analyze`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120_000,
    });
    return res.data;
  },

  async getFamilies(): Promise<FamilyStats[]> {
    const res = await axios.get<FamilyStats[]>(`${BASE}/api/families`);
    return res.data;
  },

  async getEvolution(family: string): Promise<EvolutionEntry[]> {
    const res = await axios.get<EvolutionEntry[]>(`${BASE}/api/evolution/${encodeURIComponent(family)}`);
    return res.data;
  },

  async getGraph(): Promise<GraphData> {
    const res = await axios.get<GraphData>(`${BASE}/api/graph`);
    return res.data;
  },

  async getStats(): Promise<DashboardStats> {
    const res = await axios.get<DashboardStats>(`${BASE}/api/stats`);
    return res.data;
  },

  async getHealth(): Promise<HealthStatus> {
    const res = await axios.get<HealthStatus>(`${BASE}/api/health`);
    return res.data;
  },

  async getFeed(limit = 20): Promise<FeedItem[]> {
    const res = await axios.get<FeedItem[]>(`${BASE}/api/feed?limit=${limit}`);
    return res.data;
  },

  async reportScam(formData: FormData): Promise<{ status: string; detected_family: string; threat_score: number }> {
    const res = await axios.post(`${BASE}/api/report`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120_000,
    });
    return res.data;
  },

  async getVelocity(family: string): Promise<EvolutionVelocity> {
    const res = await axios.get<EvolutionVelocity>(`${BASE}/api/velocity/${encodeURIComponent(family)}`);
    return res.data;
  },

  async getAllVelocities(): Promise<EvolutionVelocity[]> {
    const res = await axios.get<EvolutionVelocity[]>(`${BASE}/api/velocity`);
    return res.data;
  },
};
