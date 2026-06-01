import axios from 'axios';
import type {
  AnalysisResult,
  DashboardStats,
  EvolutionEntry,
  FamilyStats,
  GraphData,
  HealthStatus,
} from './types';

// In development, Next.js rewrites /api/* → http://localhost:8000/api/*
// Set NEXT_PUBLIC_API_URL to override (e.g. in production)
const BASE = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}` : '';

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
    const encoded = encodeURIComponent(family);
    const res = await axios.get<EvolutionEntry[]>(`${BASE}/api/evolution/${encoded}`);
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
};
