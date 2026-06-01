from __future__ import annotations
import re
import logging

import numpy as np
from scipy.spatial.distance import cosine as cosine_distance

from models.schemas import GraphData, GraphEdge, GraphNode

logger = logging.getLogger(__name__)

FAMILY_COLORS: dict[str, str] = {
    "Banking Fraud": "#ef4444",
    "Job Scam": "#f97316",
    "Lottery Scam": "#eab308",
    "Loan Scam": "#a855f7",
    "UPI/Payment Scam": "#3b82f6",
    "Phishing Email": "#10b981",
}
DEFAULT_COLOR = "#6366f1"


def _slugify(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


class GraphService:
    def build_graph(
        self,
        family_centroids: list[dict],
        family_stats: list[dict],
        similarity_threshold: float = 0.45,
    ) -> GraphData:
        if not family_centroids:
            return GraphData(nodes=[], edges=[])

        stats_map = {s["family"]: s["count"] for s in family_stats}

        nodes: list[GraphNode] = []
        for centroid in family_centroids:
            fname = centroid["family_name"]
            nodes.append(
                GraphNode(
                    id=_slugify(fname),
                    label=fname,
                    size=stats_map.get(fname, 1),
                    family=fname,
                    color=FAMILY_COLORS.get(fname, DEFAULT_COLOR),
                )
            )

        edges: list[GraphEdge] = []
        for i in range(len(family_centroids)):
            for j in range(i + 1, len(family_centroids)):
                v1 = np.array(family_centroids[i]["vector"])
                v2 = np.array(family_centroids[j]["vector"])
                # cosine_distance returns 0=identical, 2=opposite; sim = 1 - dist
                sim = float(1.0 - cosine_distance(v1, v2))
                if sim >= similarity_threshold:
                    edges.append(
                        GraphEdge(
                            source=_slugify(family_centroids[i]["family_name"]),
                            target=_slugify(family_centroids[j]["family_name"]),
                            weight=round(sim, 4),
                        )
                    )

        return GraphData(nodes=nodes, edges=edges)
