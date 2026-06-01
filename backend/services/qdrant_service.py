from __future__ import annotations
import uuid
import logging
from typing import Optional

from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels

logger = logging.getLogger(__name__)


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

    def init_collections(self) -> None:
        existing = {c.name for c in self.client.get_collections().collections}

        if self.scam_messages not in existing:
            self.client.create_collection(
                collection_name=self.scam_messages,
                vectors_config=qmodels.VectorParams(
                    size=self.vector_size,
                    distance=qmodels.Distance.COSINE,
                ),
            )
            # Payload indexes for efficient filtering
            for field, schema in [
                ("scam_family", qmodels.PayloadSchemaType.KEYWORD),
                ("modality", qmodels.PayloadSchemaType.KEYWORD),
                ("cluster_id", qmodels.PayloadSchemaType.INTEGER),
                ("year", qmodels.PayloadSchemaType.INTEGER),
            ]:
                self.client.create_payload_index(
                    collection_name=self.scam_messages,
                    field_name=field,
                    field_schema=schema,
                )
            logger.info("Created collection: %s", self.scam_messages)

        if self.scam_families not in existing:
            self.client.create_collection(
                collection_name=self.scam_families,
                vectors_config=qmodels.VectorParams(
                    size=self.vector_size,
                    distance=qmodels.Distance.COSINE,
                ),
            )
            logger.info("Created collection: %s", self.scam_families)

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

    def semantic_search(
        self,
        query_vector: list[float],
        limit: int = 10,
        family_filter: Optional[str] = None,
    ) -> list:
        query_filter = None
        if family_filter:
            query_filter = qmodels.Filter(
                must=[
                    qmodels.FieldCondition(
                        key="scam_family",
                        match=qmodels.MatchValue(value=family_filter),
                    )
                ]
            )
        return self.client.search(
            collection_name=self.scam_messages,
            query_vector=query_vector,
            query_filter=query_filter,
            with_payload=True,
            limit=limit,
        )

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

    def upsert_family_centroid(
        self, family_name: str, vector: list[float], count: int
    ) -> None:
        fam_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, family_name))
        self.client.upsert(
            collection_name=self.scam_families,
            points=[
                qmodels.PointStruct(
                    id=fam_id,
                    vector=vector,
                    payload={"family_name": family_name, "message_count": count},
                )
            ],
        )

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
                "vector": pt.vector,
            }
            for pt in all_points
        ]

    def get_total_count(self) -> int:
        try:
            return self.client.count(collection_name=self.scam_messages).count
        except Exception:
            return 0

    def is_healthy(self) -> bool:
        try:
            self.client.get_collections()
            return True
        except Exception:
            return False
