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

import asyncio
import logging
import time
import uuid
from collections import Counter
from datetime import datetime
from typing import Optional, TYPE_CHECKING

import numpy as np
from fastapi import HTTPException, UploadFile

from models.schemas import (
    AnalysisResult,
    EvolutionEntry,
    SimilarMessage,
    ZeroDayAlert,
    PsychologicalRelative,
)
from services.cache_service import analysis_cache, analysis_cache_key
from services.timing import timed, ms_since

if TYPE_CHECKING:
    from services.embedding_service import EmbeddingService
    from services.qdrant_service import QdrantService
    from services.ocr_service import OCRService
    from services.audio_service import AudioService
    from services.graph_service import GraphService
    from services.genome_service import GenomeService

logger = logging.getLogger(__name__)

KNOWN_THRESHOLD = 0.75
EVOLVING_THRESHOLD = 0.58

PRIMARY_SEARCH_LIMIT = 30


def _classify_variant(similarity: float) -> tuple[str, str, bool]:
    if similarity >= KNOWN_THRESHOLD:
        return "KNOWN THREAT", "known", False
    if similarity >= EVOLVING_THRESHOLD:
        return "EVOLVING VARIANT", "evolving", False
    return "EMERGING VARIANT", "emerging", True


def _compute_threat_level(score: float, variant_stage: str) -> str:
    if variant_stage == "emerging":
        return "ZERO-DAY"
    if score >= 0.82:
        return "HIGH"
    if score >= 0.62:
        return "MEDIUM"
    return "LOW"


def _build_risk_indicators(result_data: dict) -> list[str]:
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
        indicators.append(
            f"📈 This fraud family has {evolution_count} known evolution variants — highly adaptive"
        )
    if not indicators:
        indicators.append("ℹ Low similarity to known fraud patterns — verify manually")
    return indicators[:5]


def _build_evolution_timeline(evo_results: list, detected_family: str) -> list[EvolutionEntry]:
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
    return [EvolutionEntry(**entry) for entry in sorted(by_year.values(), key=lambda x: x["year"])]


def _build_psychological_relatives(relative_points, query_genome, genome_svc) -> list[PsychologicalRelative]:
    psychological_relatives: list[PsychologicalRelative] = []
    v_query = np.array([d.score for d in query_genome.dimensions])

    for r in relative_points:
        rel_vector = r.vector
        if rel_vector is None:
            continue

        rel_genome = genome_svc.compute_genome(rel_vector)
        v_rel = np.array([d.score for d in rel_genome.dimensions])
        norm_q = np.linalg.norm(v_query)
        norm_r = np.linalg.norm(v_rel)
        dna_sim = float(np.dot(v_query, v_rel) / (norm_q * norm_r)) if norm_q > 0 and norm_r > 0 else 0.0

        psychological_relatives.append(
            PsychologicalRelative(
                id=str(r.id),
                text=r.payload.get("message_text", ""),
                family=r.payload.get("scam_family", "Unknown"),
                dna_similarity=round(dna_sim, 4),
                dominant_vector=rel_genome.dominant_vector,
                similarity=round(float(r.score), 4),
                year=int(r.payload.get("year", 2024)),
            )
        )

    psychological_relatives.sort(key=lambda x: x.dna_similarity, reverse=True)
    return psychological_relatives


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

    async def _extract_text(
        self, text: Optional[str], file: Optional[UploadFile]
    ) -> tuple[str, str]:
        if file is not None:
            file_bytes = await file.read()
            content_type = file.content_type or ""
            filename = file.filename or "upload"

            if content_type.startswith("image/"):
                with timed("pipeline.ocr"):
                    extracted = await asyncio.to_thread(self.ocr.extract_text, file_bytes)
                return extracted, "image"
            if content_type.startswith("audio/") or content_type.startswith("video/"):
                with timed("pipeline.whisper"):
                    extracted = await asyncio.to_thread(self.audio.transcribe, file_bytes, filename)
                return extracted, "audio"
            try:
                with timed("pipeline.ocr"):
                    extracted = await asyncio.to_thread(self.ocr.extract_text, file_bytes)
                return extracted, "image"
            except Exception:
                return file_bytes.decode("utf-8", errors="replace"), "text"

        if text and text.strip():
            return text.strip(), "text"

        raise HTTPException(status_code=400, detail="Provide text or upload a file.")

    async def analyze(
        self,
        text: Optional[str],
        file: Optional[UploadFile],
    ) -> AnalysisResult:
        t_total = time.perf_counter()

        with timed("pipeline.extract"):
            extracted_text, modality = await self._extract_text(text, file)

        cache_key = analysis_cache_key(extracted_text, modality)
        cached = analysis_cache.get(cache_key)
        if cached is not None:
            logger.info("analysis.cache_hit: %.1fms", ms_since(t_total))
            return cached

        with timed("pipeline.embedding"):
            query_vector = await asyncio.to_thread(self.embedding.encode, extracted_text)

        with timed("pipeline.qdrant_primary_search"):
            primary_results = await asyncio.to_thread(
                self.qdrant.semantic_search, query_vector, PRIMARY_SEARCH_LIMIT
            )

        results = primary_results[:10]
        family_max_scores = self.qdrant.family_scores_from_results(primary_results)
        global_max_similarity = max(family_max_scores.values(), default=0.0)
        threat_status, variant_stage, is_zero_day = _classify_variant(global_max_similarity)

        zero_day_detected = is_zero_day
        novelty_score_percentage = round((1.0 - global_max_similarity) * 100, 2)
        closest_fam = max(family_max_scores, key=family_max_scores.get) if family_max_scores else "None"

        _alert_messages = {
            "known": "Strong alignment with known fraud lineage.",
            "evolving": "Semantic mutation detected within an existing scam lineage.",
            "emerging": "Weak alignment to known scam families. Possible emerging threat pattern.",
        }
        alert_message = _alert_messages[variant_stage]

        assigned_proto = None
        incubation_count = 0
        incubation_summary = ""

        if variant_stage == "emerging":
            for r in results:
                fam = r.payload.get("scam_family", "")
                if fam.startswith("emerging_") and float(r.score) >= 0.40:
                    assigned_proto = fam
                    break

            if not assigned_proto:
                fam_stats = await asyncio.to_thread(self.qdrant.get_cached_family_stats)
                existing_nums = [
                    int(stat["family"].split("_")[1])
                    for stat in fam_stats
                    if stat.get("family", "").startswith("emerging_")
                    and stat["family"].split("_")[1].isdigit()
                ]
                next_num = max(existing_nums, default=0) + 1
                assigned_proto = f"emerging_{next_num:03d}"

            existing_cnt = await asyncio.to_thread(self.qdrant.count_by_family, assigned_proto)
            incubation_count = existing_cnt + 1
            incubation_summary = (
                "First seen today. No other occurrences of this pattern in the database yet. Monitoring for future mutations."
                if incubation_count == 1
                else f"Accumulating pattern. {incubation_count} similar reports matching proto-family {assigned_proto} have been captured in the system radar."
            )

            await asyncio.to_thread(
                self.qdrant.upsert_message,
                uuid.uuid4(),
                query_vector,
                {
                    "message_text": extracted_text,
                    "scam_family": assigned_proto,
                    "year": datetime.now().year,
                    "cluster_id": 999,
                    "confidence_score": round(global_max_similarity, 4),
                    "modality": modality,
                    "source_label": "System Radar",
                    "is_community": False,
                },
            )

            detected_family = assigned_proto
            threat_score = global_max_similarity
            cluster_id = 999

        elif variant_stage == "evolving":
            incubation_summary = (
                "Semantic mutation detected. This variant shares lineage with a known scam family but shows structural drift."
            )
            if results:
                top_families = [r.payload.get("scam_family", "Unknown") for r in results[:3]]
                detected_family = Counter(top_families).most_common(1)[0][0]
                threat_score = float(results[0].score)
                cluster_id = int(results[0].payload.get("cluster_id", 0))
            else:
                detected_family = "Unknown"
                threat_score = global_max_similarity
                cluster_id = 0

        else:
            incubation_summary = "This threat pattern is stable and matches known scam campaign definitions."
            if results:
                top_families = [r.payload.get("scam_family", "Unknown") for r in results[:3]]
                detected_family = Counter(top_families).most_common(1)[0][0]
                threat_score = float(results[0].score)
                cluster_id = int(results[0].payload.get("cluster_id", 0))
            else:
                detected_family = "Unknown"
                threat_score = global_max_similarity
                cluster_id = 0

        zero_day_alert = ZeroDayAlert(
            is_zero_day=is_zero_day,
            novelty_score=round(1.0 - global_max_similarity, 4),
            closest_family=closest_fam,
            closest_similarity=round(global_max_similarity, 4),
            alert_message=alert_message,
            variant_stage=variant_stage,
        )
        threat_level = _compute_threat_level(threat_score, variant_stage)

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

        filtered_evo = [
            r for r in primary_results if r.payload.get("scam_family") == detected_family
        ]
        if len(filtered_evo) >= 5:
            evo_results = filtered_evo
        else:
            with timed("pipeline.qdrant_evolution_search"):
                evo_results = await asyncio.to_thread(
                    self.qdrant.semantic_search,
                    query_vector,
                    30,
                    detected_family,
                )

        async def _fetch_graph():
            stats, centroids = await asyncio.gather(
                asyncio.to_thread(self.qdrant.get_cached_family_stats),
                asyncio.to_thread(self.qdrant.get_cached_family_centroids),
            )
            return await asyncio.to_thread(self.graph.build_graph, centroids, stats)

        async def _fetch_relatives():
            return await asyncio.to_thread(
                self.qdrant.semantic_search,
                query_vector,
                5,
                None,
                False,
                detected_family,
                True,
            )

        graph_data, relative_points, genome = await asyncio.gather(
            _fetch_graph(),
            _fetch_relatives(),
            asyncio.to_thread(self.genome.compute_genome, query_vector),
        )

        evolution_timeline = _build_evolution_timeline(evo_results, detected_family)

        with timed("pipeline.relatives_genome"):
            psychological_relatives = await asyncio.to_thread(
                _build_psychological_relatives, relative_points, genome, self.genome
            )

        risk_indicators = _build_risk_indicators({
            "detected_family": detected_family,
            "threat_score": threat_score,
            "genome_dominant": genome.dominant_vector,
            "is_zero_day": is_zero_day,
            "evolution_count": len(evolution_timeline),
        })

        sorted_dims = sorted(genome.dimensions, key=lambda d: d.score, reverse=True)
        dominant_lbl = sorted_dims[0].label.lower()
        secondary = [d for d in sorted_dims[1:] if d.score >= 0.5]
        tactics = (
            f"{dominant_lbl} and {secondary[0].label.lower()}"
            if secondary
            else f"{dominant_lbl} tactics"
        )
        rel_families = list(dict.fromkeys(
            [r.family for r in psychological_relatives if r.dna_similarity >= 0.6]
        ))
        insight_text = (
            f"This scam belongs to the {detected_family} family but shares psychological DNA with {tactics}."
        )
        if rel_families:
            if len(rel_families) == 1:
                insight_text += (
                    f" It shows strong strategic overlaps with campaigns in the {rel_families[0]} family."
                )
            else:
                insight_text += (
                    f" It shares tactical characteristics with campaigns in the "
                    f"{', '.join(rel_families[:-1])} and {rel_families[-1]} families."
                )
        else:
            insight_text += (
                " It utilizes highly targeted manipulation vectors to bypass typical intellectual defenses."
            )

        with timed("pipeline.response_serialize"):
            result = AnalysisResult(
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
                novelty_score=novelty_score_percentage,
                risk_indicators=risk_indicators,
                psychological_relatives=psychological_relatives,
                insight_text=insight_text,
                zero_day_detected=zero_day_detected,
                closest_family=closest_fam,
                threat_status=threat_status,
                variant_stage=variant_stage,
                incubation_count=incubation_count,
                incubation_summary=incubation_summary,
                proto_family=assigned_proto,
            )

        analysis_cache.set(cache_key, result)
        logger.info("analysis.pipeline_total: %.1fms", ms_since(t_total))
        return result
