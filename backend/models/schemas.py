from typing import Literal
from pydantic import BaseModel


class SimilarMessage(BaseModel):
    id: str
    text: str
    family: str
    similarity: float
    year: int
    modality: str


class EvolutionEntry(BaseModel):
    year: int
    text: str
    family: str
    cluster_id: int
    similarity: float


class GraphNode(BaseModel):
    id: str
    label: str
    size: int
    family: str
    color: str


class GraphEdge(BaseModel):
    source: str
    target: str
    weight: float


class GraphData(BaseModel):
    nodes: list[GraphNode]
    edges: list[GraphEdge]


class AnalysisResult(BaseModel):
    threat_level: Literal["HIGH", "MEDIUM", "LOW"]
    threat_score: float
    detected_family: str
    cluster_id: int
    modality: str
    extracted_text: str
    similar_messages: list[SimilarMessage]
    evolution_timeline: list[EvolutionEntry]
    graph_data: GraphData


class FamilyStats(BaseModel):
    family: str
    count: int
    avg_confidence: float
    years: list[int]
    cluster_ids: list[int]


class DashboardStats(BaseModel):
    total_messages: int
    total_families: int
    recent_threats: int
    top_families: list[FamilyStats]


class HealthResponse(BaseModel):
    status: str
    qdrant_connected: bool
    model_loaded: bool
    total_messages: int
