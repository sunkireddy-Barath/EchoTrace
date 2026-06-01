from __future__ import annotations
from typing import Literal, Optional
from pydantic import BaseModel


# ─────────────────────────────────────────────────────────────────────────────
# Core enums
# ─────────────────────────────────────────────────────────────────────────────

class SimilarMessage(BaseModel):
    id: str
    text: str
    family: str
    similarity: float
    year: int
    modality: str
    source_label: str = "Unknown"


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


# ─────────────────────────────────────────────────────────────────────────────
# Novel: Semantic Genome — 8-dimension psychological manipulation profile
# Maps the "attack DNA" of a scam across manipulation vectors
# ─────────────────────────────────────────────────────────────────────────────

class GenomeDimension(BaseModel):
    key: str
    label: str
    score: float          # 0.0–1.0
    description: str
    color: str


class GenomeData(BaseModel):
    dimensions: list[GenomeDimension]
    dominant_vector: str   # Highest-scoring dimension
    attack_complexity: float  # Entropy across dimensions (0=simple, 1=complex)


# ─────────────────────────────────────────────────────────────────────────────
# Novel: Evolution Velocity — how fast this family is semantically drifting
# ─────────────────────────────────────────────────────────────────────────────

class YearlyDrift(BaseModel):
    year: int
    drift_from_previous: float   # cosine distance from prior year centroid
    cumulative_drift: float      # total drift from origin year


class EvolutionVelocity(BaseModel):
    family: str
    yearly_drift: list[YearlyDrift]
    avg_velocity: float       # Mean year-over-year drift
    acceleration: float       # Is it speeding up? (positive = faster mutation)
    risk_level: str           # STABLE / EVOLVING / RAPID


# ─────────────────────────────────────────────────────────────────────────────
# Novel: Zero-Day Scam Alert — completely unknown fraud pattern
# ─────────────────────────────────────────────────────────────────────────────

class ZeroDayAlert(BaseModel):
    is_zero_day: bool
    novelty_score: float        # 1 - max_similarity_to_any_family (higher = more novel)
    closest_family: str
    closest_similarity: float
    alert_message: str


# ─────────────────────────────────────────────────────────────────────────────
# Novel: Mutation Prediction — extrapolated next-year variant
# ─────────────────────────────────────────────────────────────────────────────

class MutationPrediction(BaseModel):
    family: str
    predicted_year: int
    predicted_text_sample: str    # Nearest Qdrant neighbor to extrapolated vector
    predicted_similarity: float
    confidence: float
    trend_direction: str          # "escalating_fear" | "authority_shift" | "digital_pivot"
    reasoning: str


# ─────────────────────────────────────────────────────────────────────────────
# Community Intel
# ─────────────────────────────────────────────────────────────────────────────

class CommunityReport(BaseModel):
    text: str
    source_label: Optional[str] = "Community"
    reporter_note: Optional[str] = None


class FeedItem(BaseModel):
    id: str
    text: str
    detected_family: str
    threat_score: float
    modality: str
    timestamp: str
    source_label: str


# ─────────────────────────────────────────────────────────────────────────────
# Core analysis result — extended with novel signals
# ─────────────────────────────────────────────────────────────────────────────

class AnalysisResult(BaseModel):
    # Core detection
    threat_level: Literal["HIGH", "MEDIUM", "LOW", "ZERO-DAY"]
    threat_score: float
    detected_family: str
    cluster_id: int
    modality: str
    extracted_text: str

    # Qdrant results
    similar_messages: list[SimilarMessage]
    evolution_timeline: list[EvolutionEntry]
    graph_data: GraphData

    # Novel signals
    genome: GenomeData
    zero_day: ZeroDayAlert
    novelty_score: float         # 0=known pattern, 1=never seen before
    risk_indicators: list[str]   # Plain-English risk flags


# ─────────────────────────────────────────────────────────────────────────────
# Dashboard + family stats
# ─────────────────────────────────────────────────────────────────────────────

class FamilyStats(BaseModel):
    family: str
    count: int
    avg_confidence: float
    years: list[int]
    cluster_ids: list[int]
    color: str = "#6366f1"


class DashboardStats(BaseModel):
    total_messages: int
    total_families: int
    recent_threats: int
    zero_day_count: int
    top_families: list[FamilyStats]


class HealthResponse(BaseModel):
    status: str
    qdrant_connected: bool
    model_loaded: bool
    total_messages: int
    qdrant_version: str = "unknown"
