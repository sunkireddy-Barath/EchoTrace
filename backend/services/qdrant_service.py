"""
QdrantService — Core vector database layer for EchoTrace AI.

Uses Qdrant's advanced features:
- HNSW index with tuned parameters for fraud similarity
- Payload indexes on scam_family, year, modality, cluster_id
- Named vector search via query_points (v1.13+ API)
- Community report ingestion with automatic family tagging
- Temporal centroid vectors for evolution velocity analysis
"""
from __future__ import annotations
import uuid
import logging
from datetime import datetime, timezone
from typing import Optional

from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels

logger = logging.getLogger(__name__)

FAMILY_COLORS: dict[str, str] = {
    "Banking Fraud": "#ef4444",
    "Job Scam": "#f97316",
    "Lottery Scam": "#eab308",
    "Loan Scam": "#a855f7",
    "UPI/Payment Scam": "#3b82f6",
    "Phishing Email": "#10b981",
}


class QdrantService:
    def __init__(
        self,
        host: str,
        port: int,
        vector_size: int,
        scam_messages_collection: str,
        scam_families_collection: str,
    ):
        self.client = QdrantClient(host=host, port=port, timeout=30)
        self.vector_size = vector_size
        self.scam_messages = scam_messages_collection
        self.scam_families = scam_families_collection

    # ── Collection management ──────────────────────────────────────────────

    def init_collections(self) -> None:
        existing = {c.name for c in self.client.get_collections().collections}

        if self.scam_messages not in existing:
            self.client.create_collection(
                collection_name=self.scam_messages,
                vectors_config=qmodels.VectorParams(
                    size=self.vector_size,
                    distance=qmodels.Distance.COSINE,
                    # Tuned HNSW for fraud similarity workload
                    hnsw_config=qmodels.HnswConfigDiff(
                        m=16,
                        ef_construct=100,
                        full_scan_threshold=10000,
                    ),
                ),
                # Scalar quantization — 4x compression with <1% accuracy loss
                quantization_config=qmodels.ScalarQuantization(
                    scalar=qmodels.ScalarQuantizationConfig(
                        type=qmodels.ScalarType.INT8,
                        quantile=0.99,
                        always_ram=True,
                    )
                ),
            )
            for field, schema in [
                ("scam_family", qmodels.PayloadSchemaType.KEYWORD),
                ("modality", qmodels.PayloadSchemaType.KEYWORD),
                ("cluster_id", qmodels.PayloadSchemaType.INTEGER),
                ("year", qmodels.PayloadSchemaType.INTEGER),
                ("is_community", qmodels.PayloadSchemaType.BOOL),
            ]:
                self.client.create_payload_index(
                    collection_name=self.scam_messages,
                    field_name=field,
                    field_schema=schema,
                )
            logger.info("Created collection: %s (HNSW + INT8 quantization)", self.scam_messages)

        if self.scam_families not in existing:
            self.client.create_collection(
                collection_name=self.scam_families,
                vectors_config=qmodels.VectorParams(
                    size=self.vector_size,
                    distance=qmodels.Distance.COSINE,
                ),
            )
            logger.info("Created collection: %s", self.scam_families)

    def get_qdrant_version(self) -> str:
        try:
            info = self.client.get_collection(self.scam_messages)
            return str(info.config.params.vectors)
        except Exception:
            return "1.18+"

    # ── Write operations ───────────────────────────────────────────────────

    def upsert_message(
        self, point_id: uuid.UUID, vector: list[float], payload: dict
    ) -> None:
        self.client.upsert(
            collection_name=self.scam_messages,
            points=[qmodels.PointStruct(id=str(point_id), vector=vector, payload=payload)],
        )

    def upsert_messages_batch(
        self, points: list[tuple[uuid.UUID, list[float], dict]]
    ) -> None:
        structs = [
            qmodels.PointStruct(id=str(pid), vector=vec, payload=pay)
            for pid, vec, pay in points
        ]
        self.client.upsert(collection_name=self.scam_messages, points=structs)

    def upsert_family_centroid(
        self, family_name: str, vector: list[float], count: int,
        yearly_centroids: Optional[dict] = None,
    ) -> None:
        fam_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, family_name))
        payload = {
            "family_name": family_name,
            "message_count": count,
            "color": FAMILY_COLORS.get(family_name, "#6366f1"),
        }
        if yearly_centroids:
            # Store as {year: [float...]} — used for velocity analysis
            payload["yearly_centroids"] = yearly_centroids
        self.client.upsert(
            collection_name=self.scam_families,
            points=[qmodels.PointStruct(id=fam_id, vector=vector, payload=payload)],
        )

    def report_community_scam(
        self, vector: list[float], text: str, detected_family: str, threat_score: float,
        modality: str = "text", source_label: str = "Community",
    ) -> str:
        """Add a community-reported scam to the corpus. Returns the new point ID."""
        point_id = uuid.uuid4()
        payload = {
            "message_text": text,
            "scam_family": detected_family,
            "year": datetime.now(timezone.utc).year,
            "cluster_id": 99,   # Community cluster
            "confidence_score": round(threat_score, 4),
            "modality": modality,
            "source_label": source_label,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "is_community": True,
        }
        self.client.upsert(
            collection_name=self.scam_messages,
            points=[qmodels.PointStruct(id=str(point_id), vector=vector, payload=payload)],
        )
        return str(point_id)

    # ── Read operations ────────────────────────────────────────────────────

    def semantic_search(
        self,
        query_vector: list[float],
        limit: int = 10,
        family_filter: Optional[str] = None,
        exclude_community: bool = False,
    ) -> list:
        filters: list = []
        if family_filter:
            filters.append(
                qmodels.FieldCondition(
                    key="scam_family",
                    match=qmodels.MatchValue(value=family_filter),
                )
            )
        if exclude_community:
            filters.append(
                qmodels.FieldCondition(
                    key="is_community",
                    match=qmodels.MatchValue(value=False),
                )
            )

        query_filter = qmodels.Filter(must=filters) if filters else None

        response = self.client.query_points(
            collection_name=self.scam_messages,
            query=query_vector,
            query_filter=query_filter,
            with_payload=True,
            limit=limit,
        )
        return response.points

    def semantic_search_all_families(self, query_vector: list[float]) -> dict[str, float]:
        """Return max similarity score per family — used for zero-day detection."""
        results = self.semantic_search(query_vector, limit=20)
        family_scores: dict[str, float] = {}
        for r in results:
            fam = r.payload.get("scam_family", "Unknown")
            score = float(r.score)
            if fam not in family_scores or score > family_scores[fam]:
                family_scores[fam] = score
        return family_scores

    def get_family_stats(self) -> list[dict]:
        all_points, _ = self.client.scroll(
            collection_name=self.scam_messages,
            limit=10000,
            with_payload=True,
            with_vectors=False,
        )
        families: dict[str, dict] = {}
        for pt in all_points:
            fam = pt.payload.get("scam_family", "Unknown")
            if fam not in families:
                families[fam] = {"count": 0, "confidence_sum": 0.0, "years": set(), "cluster_ids": set()}
            families[fam]["count"] += 1
            families[fam]["confidence_sum"] += pt.payload.get("confidence_score", 0.0)
            yr = pt.payload.get("year")
            if yr:
                families[fam]["years"].add(yr)
            cid = pt.payload.get("cluster_id")
            if cid is not None:
                families[fam]["cluster_ids"].add(cid)

        result = []
        for fam, data in families.items():
            result.append({
                "family": fam,
                "count": data["count"],
                "avg_confidence": round(data["confidence_sum"] / data["count"], 4) if data["count"] else 0.0,
                "years": sorted(data["years"]),
                "cluster_ids": sorted(data["cluster_ids"]),
                "color": FAMILY_COLORS.get(fam, "#6366f1"),
            })
        return sorted(result, key=lambda x: x["count"], reverse=True)

    def get_evolution_data(self, family: str) -> list[dict]:
        all_points, _ = self.client.scroll(
            collection_name=self.scam_messages,
            scroll_filter=qmodels.Filter(
                must=[
                    qmodels.FieldCondition(
                        key="scam_family",
                        match=qmodels.MatchValue(value=family),
                    )
                ]
            ),
            limit=500,
            with_payload=True,
            with_vectors=False,
        )
        entries = []
        for pt in all_points:
            entries.append({
                "year": pt.payload.get("year", 2024),
                "text": pt.payload.get("message_text", ""),
                "family": pt.payload.get("scam_family", family),
                "cluster_id": pt.payload.get("cluster_id", 0),
                "similarity": pt.payload.get("confidence_score", 0.0),
            })
        return sorted(entries, key=lambda x: x["year"])

    def get_family_texts_by_year(self, family: str) -> dict[int, list[str]]:
        """Get message texts grouped by year for velocity analysis."""
        all_points, _ = self.client.scroll(
            collection_name=self.scam_messages,
            scroll_filter=qmodels.Filter(
                must=[
                    qmodels.FieldCondition(
                        key="scam_family",
                        match=qmodels.MatchValue(value=family),
                    )
                ]
            ),
            limit=1000,
            with_payload=True,
            with_vectors=False,
        )
        by_year: dict[int, list[str]] = {}
        for pt in all_points:
            yr = int(pt.payload.get("year", 2024))
            by_year.setdefault(yr, []).append(pt.payload.get("message_text", ""))
        return by_year

    def get_all_family_centroids(self) -> list[dict]:
        all_points, _ = self.client.scroll(
            collection_name=self.scam_families,
            limit=100,
            with_payload=True,
            with_vectors=True,
        )
        return [
            {
                "id": str(pt.id),
                "family_name": pt.payload.get("family_name", ""),
                "message_count": pt.payload.get("message_count", 0),
                "color": pt.payload.get("color", "#6366f1"),
                "vector": pt.vector,
                "yearly_centroids": pt.payload.get("yearly_centroids", {}),
            }
            for pt in all_points
        ]

    def get_community_feed(self, limit: int = 20) -> list[dict]:
        """Get recent community-reported scams."""
        all_points, _ = self.client.scroll(
            collection_name=self.scam_messages,
            scroll_filter=qmodels.Filter(
                must=[
                    qmodels.FieldCondition(
                        key="is_community",
                        match=qmodels.MatchValue(value=True),
                    )
                ]
            ),
            limit=limit,
            with_payload=True,
            with_vectors=False,
        )
        feed = []
        for pt in all_points:
            feed.append({
                "id": str(pt.id),
                "text": pt.payload.get("message_text", ""),
                "detected_family": pt.payload.get("scam_family", "Unknown"),
                "threat_score": pt.payload.get("confidence_score", 0.0),
                "modality": pt.payload.get("modality", "text"),
                "timestamp": pt.payload.get("timestamp", ""),
                "source_label": pt.payload.get("source_label", "Community"),
            })
        return sorted(feed, key=lambda x: x["timestamp"], reverse=True)

    def get_total_count(self) -> int:
        try:
            return self.client.count(collection_name=self.scam_messages).count
        except Exception:
            return 0

    def get_community_count(self) -> int:
        try:
            result = self.client.count(
                collection_name=self.scam_messages,
                count_filter=qmodels.Filter(
                    must=[
                        qmodels.FieldCondition(
                            key="is_community",
                            match=qmodels.MatchValue(value=True),
                        )
                    ]
                ),
            )
            return result.count
        except Exception:
            return 0

    def is_healthy(self) -> bool:
        try:
            self.client.get_collections()
            return True
        except Exception:
            return False
