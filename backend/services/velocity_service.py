"""
Velocity Service — measures how fast a scam family is semantically evolving.

Novel metric: "Scam Evolution Velocity" quantifies linguistic drift between
consecutive years. High velocity = rapidly adapting fraud, harder to block.

Algorithm:
1. Get all messages for a family, grouped by year
2. Compute year centroid by averaging embeddings
3. Measure cosine distance between consecutive year centroids
4. Velocity = mean year-over-year semantic drift
5. Acceleration = whether drift is increasing or decreasing
"""
from __future__ import annotations
import logging
from typing import TYPE_CHECKING

import numpy as np
from scipy.spatial.distance import cosine as cosine_distance

from models.schemas import EvolutionVelocity, YearlyDrift

if TYPE_CHECKING:
    from services.embedding_service import EmbeddingService
    from services.qdrant_service import QdrantService

logger = logging.getLogger(__name__)


def _velocity_risk_level(avg_velocity: float) -> str:
    if avg_velocity >= 0.25:
        return "RAPID"
    if avg_velocity >= 0.12:
        return "EVOLVING"
    return "STABLE"


class VelocityService:
    def __init__(
        self,
        embedding_svc: "EmbeddingService",
        qdrant_svc: "QdrantService",
    ):
        self.embedding = embedding_svc
        self.qdrant = qdrant_svc

    def compute_velocity(self, family: str) -> EvolutionVelocity:
        texts_by_year = self.qdrant.get_family_texts_by_year(family)

        if len(texts_by_year) < 2:
            return EvolutionVelocity(
                family=family,
                yearly_drift=[],
                avg_velocity=0.0,
                acceleration=0.0,
                risk_level="STABLE",
            )

        # Compute year centroids
        years = sorted(texts_by_year.keys())
        year_centroids: dict[int, np.ndarray] = {}
        for yr in years:
            texts = texts_by_year[yr]
            vecs = np.array(self.embedding.encode_batch(texts))
            year_centroids[yr] = np.mean(vecs, axis=0)

        # Compute year-over-year drift
        drifts: list[float] = []
        origin_centroid = year_centroids[years[0]]
        cumulative = 0.0

        yearly_drift: list[YearlyDrift] = [
            YearlyDrift(year=years[0], drift_from_previous=0.0, cumulative_drift=0.0)
        ]

        for i in range(1, len(years)):
            prev_c = year_centroids[years[i - 1]]
            curr_c = year_centroids[years[i]]
            drift = float(cosine_distance(prev_c, curr_c))
            cumulative += drift
            drifts.append(drift)
            cumulative_from_origin = float(cosine_distance(origin_centroid, curr_c))
            yearly_drift.append(
                YearlyDrift(
                    year=years[i],
                    drift_from_previous=round(drift, 4),
                    cumulative_drift=round(cumulative_from_origin, 4),
                )
            )

        avg_velocity = float(np.mean(drifts)) if drifts else 0.0

        # Acceleration = slope of drifts over time (positive = speeding up)
        if len(drifts) >= 2:
            x = np.arange(len(drifts), dtype=float)
            acceleration = float(np.polyfit(x, drifts, 1)[0])
        else:
            acceleration = 0.0

        return EvolutionVelocity(
            family=family,
            yearly_drift=yearly_drift,
            avg_velocity=round(avg_velocity, 4),
            acceleration=round(acceleration, 4),
            risk_level=_velocity_risk_level(avg_velocity),
        )
