from __future__ import annotations
import logging
from collections import Counter
from typing import Optional, TYPE_CHECKING

from fastapi import HTTPException, UploadFile

from models.schemas import (
    AnalysisResult,
    EvolutionEntry,
    SimilarMessage,
)

if TYPE_CHECKING:
    from services.embedding_service import EmbeddingService
    from services.qdrant_service import QdrantService
    from services.ocr_service import OCRService
    from services.audio_service import AudioService
    from services.graph_service import GraphService

logger = logging.getLogger(__name__)


def _compute_threat_level(score: float) -> str:
    if score >= 0.82:
        return "HIGH"
    if score >= 0.62:
        return "MEDIUM"
    return "LOW"


class AnalysisService:
    def __init__(
        self,
        embedding_svc: "EmbeddingService",
        qdrant_svc: "QdrantService",
        ocr_svc: "OCRService",
        audio_svc: "AudioService",
        graph_svc: "GraphService",
    ):
        self.embedding = embedding_svc
        self.qdrant = qdrant_svc
        self.ocr = ocr_svc
        self.audio = audio_svc
        self.graph = graph_svc

    async def analyze(
        self,
        text: Optional[str],
        file: Optional[UploadFile],
    ) -> AnalysisResult:
        # ── Step 1: Extract text from input ──────────────────────────────────
        if file is not None:
            file_bytes = await file.read()
            content_type = file.content_type or ""
            filename = file.filename or "upload"

            if content_type.startswith("image/"):
                extracted_text = self.ocr.extract_text(file_bytes)
                modality = "image"
            elif content_type.startswith("audio/") or content_type.startswith("video/"):
                extracted_text = self.audio.transcribe(file_bytes, filename)
                modality = "audio"
            else:
                # Fallback: try OCR on unknown binary
                try:
                    extracted_text = self.ocr.extract_text(file_bytes)
                    modality = "image"
                except Exception:
                    extracted_text = file_bytes.decode("utf-8", errors="replace")
                    modality = "text"
        elif text and text.strip():
            extracted_text = text.strip()
            modality = "text"
        else:
            raise HTTPException(status_code=400, detail="Provide text or upload a file.")

        # ── Step 2: Generate semantic embedding ───────────────────────────────
        query_vector = self.embedding.encode(extracted_text)

        # ── Step 3: Semantic nearest-neighbor search in Qdrant ────────────────
        results = self.qdrant.semantic_search(query_vector, limit=10)

        if not results:
            return AnalysisResult(
                threat_level="LOW",
                threat_score=0.0,
                detected_family="Unknown",
                cluster_id=0,
                modality=modality,
                extracted_text=extracted_text,
                similar_messages=[],
                evolution_timeline=[],
                graph_data=self.graph.build_graph(
                    self.qdrant.get_all_family_centroids(),
                    self.qdrant.get_family_stats(),
                ),
            )

        # ── Step 4: Determine detected family (majority vote, top-3) ──────────
        top_families = [r.payload.get("scam_family", "Unknown") for r in results[:3]]
        detected_family = Counter(top_families).most_common(1)[0][0]
        threat_score = float(results[0].score)
        cluster_id = int(results[0].payload.get("cluster_id", 0))

        threat_level = _compute_threat_level(threat_score)

        # ── Step 5: Build similar messages list ───────────────────────────────
        similar_messages = [
            SimilarMessage(
                id=str(r.id),
                text=r.payload.get("message_text", ""),
                family=r.payload.get("scam_family", "Unknown"),
                similarity=round(float(r.score), 4),
                year=int(r.payload.get("year", 2024)),
                modality=r.payload.get("modality", "text"),
            )
            for r in results
        ]

        # ── Step 6: Build evolution timeline via family-filtered search ────────
        evo_results = self.qdrant.semantic_search(
            query_vector, limit=30, family_filter=detected_family
        )
        # Deduplicate by year: keep highest-similarity entry per year
        by_year: dict[int, dict] = {}
        for r in evo_results:
            yr = int(r.payload.get("year", 2024))
            score = float(r.score)
            if yr not in by_year or score > by_year[yr]["similarity"]:
                by_year[yr] = {
                    "year": yr,
                    "text": r.payload.get("message_text", ""),
                    "family": r.payload.get("scam_family", detected_family),
                    "cluster_id": int(r.payload.get("cluster_id", 0)),
                    "similarity": round(score, 4),
                }
        evolution_timeline = [
            EvolutionEntry(**entry) for entry in sorted(by_year.values(), key=lambda x: x["year"])
        ]

        # ── Step 7: Build threat mutation graph ───────────────────────────────
        family_centroids = self.qdrant.get_all_family_centroids()
        family_stats = self.qdrant.get_family_stats()
        graph_data = self.graph.build_graph(family_centroids, family_stats)

        return AnalysisResult(
            threat_level=threat_level,
            threat_score=round(threat_score, 4),
            detected_family=detected_family,
            cluster_id=cluster_id,
            modality=modality,
            extracted_text=extracted_text,
            similar_messages=similar_messages,
            evolution_timeline=evolution_timeline,
            graph_data=graph_data,
        )
