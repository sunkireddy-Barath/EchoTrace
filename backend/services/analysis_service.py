"""
AnalysisService — Complete EchoTrace AI pipeline.

Integrates:
1. Multimodal text extraction (OCR / Whisper / direct)
2. Semantic embedding via SentenceTransformers
3. Qdrant nearest-neighbor search (primary detection)
4. Fraud family identification
5. Semantic Genome profiling (novel — 8-dimension attack DNA)
6. Zero-Day detection (novel — emerging fraud alerts)
7. Evolution timeline via Qdrant temporal search
8. Threat mutation graph
"""
from __future__ import annotations
import logging
from collections import Counter
from typing import Optional, TYPE_CHECKING

from fastapi import HTTPException, UploadFile

from models.schemas import (
    AnalysisResult,
    EvolutionEntry,
    SimilarMessage,
    ZeroDayAlert,
)

if TYPE_CHECKING:
    from services.embedding_service import EmbeddingService
    from services.qdrant_service import QdrantService
    from services.ocr_service import OCRService
    from services.audio_service import AudioService
    from services.graph_service import GraphService
    from services.genome_service import GenomeService

logger = logging.getLogger(__name__)

ZERO_DAY_THRESHOLD = 0.52   # Below this = potential new fraud family


def _compute_threat_level(score: float, is_zero_day: bool) -> str:
    if is_zero_day:
        return "ZERO-DAY"
    if score >= 0.82:
        return "HIGH"
    if score >= 0.62:
        return "MEDIUM"
    return "LOW"


def _build_risk_indicators(result_data: dict) -> list[str]:
    """Plain-English risk flags for non-technical users."""
    indicators = []
    family = result_data.get("detected_family", "")
    score = result_data.get("threat_score", 0.0)
    genome = result_data.get("genome_dominant", "")
    zero_day = result_data.get("is_zero_day", False)
    evolution_count = result_data.get("evolution_count", 0)

    if zero_day:
        indicators.append("⚠ Unknown pattern — possible new scam variant not in database")
    if score >= 0.82:
        indicators.append(f"🔴 High semantic match to known {family} fraud pattern")
    if genome == "credential_harvest":
        indicators.append("🔑 Requesting sensitive credentials (OTP/PIN/password)")
    if genome == "urgency":
        indicators.append("⏰ Artificial time pressure to prevent rational decision-making")
    if genome == "payment_trap":
        indicators.append("💸 Demands advance payment or fees — classic fraud advance-fee pattern")
    if genome == "authority":
        indicators.append("🏛 Impersonating official entities (bank/government/police)")
    if genome == "fear":
        indicators.append("😨 Using fear of legal/financial consequences as manipulation")
    if evolution_count >= 4:
        indicators.append(f"📈 This fraud family has {evolution_count} known evolution variants — highly adaptive")
    if not indicators:
        indicators.append("ℹ Low similarity to known fraud patterns — verify manually")
    return indicators[:5]


class AnalysisService:
    def __init__(
        self,
        embedding_svc: "EmbeddingService",
        qdrant_svc: "QdrantService",
        ocr_svc: "OCRService",
        audio_svc: "AudioService",
        graph_svc: "GraphService",
        genome_svc: "GenomeService",
    ):
        self.embedding = embedding_svc
        self.qdrant = qdrant_svc
        self.ocr = ocr_svc
        self.audio = audio_svc
        self.graph = graph_svc
        self.genome = genome_svc

    async def analyze(
        self,
        text: Optional[str],
        file: Optional[UploadFile],
    ) -> AnalysisResult:

        # ── Step 1: Extract text ──────────────────────────────────────────
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

        # ── Step 2: Embed ─────────────────────────────────────────────────
        query_vector = self.embedding.encode(extracted_text)

        # ── Step 3: Qdrant semantic search — core detection ───────────────
        results = self.qdrant.semantic_search(query_vector, limit=10)

        # ── Step 4: Zero-day detection via cross-family scoring ───────────
        family_max_scores = self.qdrant.semantic_search_all_families(query_vector)
        global_max_similarity = max(family_max_scores.values(), default=0.0)
        is_zero_day = global_max_similarity < ZERO_DAY_THRESHOLD

        zero_day_alert = ZeroDayAlert(
            is_zero_day=is_zero_day,
            novelty_score=round(1.0 - global_max_similarity, 4),
            closest_family=max(family_max_scores, key=family_max_scores.get) if family_max_scores else "None",
            closest_similarity=round(global_max_similarity, 4),
            alert_message=(
                "⚠ EMERGING THREAT: This content does not match any known fraud family with sufficient confidence. "
                "It may represent a new, previously undocumented scam variant."
                if is_zero_day else
                "Pattern matched to known fraud family database."
            ),
        )

        # ── Step 5: Detected family (majority vote, top-3) ────────────────
        if results:
            top_families = [r.payload.get("scam_family", "Unknown") for r in results[:3]]
            detected_family = Counter(top_families).most_common(1)[0][0]
            threat_score = float(results[0].score)
            cluster_id = int(results[0].payload.get("cluster_id", 0))
        else:
            detected_family = "Unknown"
            threat_score = 0.0
            cluster_id = 0

        threat_level = _compute_threat_level(threat_score, is_zero_day)

        # ── Step 6: Similar messages ──────────────────────────────────────
        similar_messages = [
            SimilarMessage(
                id=str(r.id),
                text=r.payload.get("message_text", ""),
                family=r.payload.get("scam_family", "Unknown"),
                similarity=round(float(r.score), 4),
                year=int(r.payload.get("year", 2024)),
                modality=r.payload.get("modality", "text"),
                source_label=r.payload.get("source_label", "Unknown"),
            )
            for r in results
        ]

        # ── Step 7: Evolution timeline (family-filtered Qdrant search) ────
        evo_results = self.qdrant.semantic_search(
            query_vector, limit=30, family_filter=detected_family
        )
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

        # ── Step 8: Threat mutation graph ─────────────────────────────────
        family_centroids = self.qdrant.get_all_family_centroids()
        family_stats = self.qdrant.get_family_stats()
        graph_data = self.graph.build_graph(family_centroids, family_stats)

        # ── Step 9: Semantic Genome (novel — psychological attack profile) ─
        genome = self.genome.compute_genome(query_vector)

        # ── Step 10: Risk indicators ──────────────────────────────────────
        risk_indicators = _build_risk_indicators({
            "detected_family": detected_family,
            "threat_score": threat_score,
            "genome_dominant": genome.dominant_vector,
            "is_zero_day": is_zero_day,
            "evolution_count": len(evolution_timeline),
        })

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
            genome=genome,
            zero_day=zero_day_alert,
            novelty_score=round(1.0 - global_max_similarity, 4),
            risk_indicators=risk_indicators,
        )
