"""
Semantic Genome Engine — EchoTrace AI's novel feature.

Maps any scam text to an 8-dimension psychological manipulation profile.
Each dimension uses pre-computed probe embeddings for fast inference.

This reveals the "attack DNA" of a fraud — WHY it works psychologically,
not just WHAT family it belongs to. This doesn't exist anywhere else.
"""
from __future__ import annotations
import math
import logging
from typing import Optional, TYPE_CHECKING

import numpy as np

from models.schemas import GenomeData, GenomeDimension
from services.timing import timed

if TYPE_CHECKING:
    from services.embedding_service import EmbeddingService

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────────────────
# Probe sentences define the 8 manipulation dimensions.
# These are embedded once at startup; analysis is just a dot product.
# ─────────────────────────────────────────────────────────────────────────────

GENOME_PROBES: dict[str, dict] = {
    "urgency": {
        "label": "Urgency & Time Pressure",
        "color": "#ef4444",
        "description": "Artificial time limits to prevent rational thinking",
        "probes": [
            "Act immediately your account expires in 24 hours urgent action required",
            "This offer is available for next 10 minutes only limited time act now",
            "Final warning last chance expires today complete verification immediately",
        ],
    },
    "authority": {
        "label": "Authority Impersonation",
        "color": "#8b5cf6",
        "description": "Masquerading as official government or institutional entities",
        "probes": [
            "Official notice from Reserve Bank of India RBI government mandate compliance",
            "This is your bank's official fraud prevention team authorized communication",
            "UIDAI Aadhaar authority SEBI official mandatory verification required",
        ],
    },
    "fear": {
        "label": "Fear Induction",
        "color": "#dc2626",
        "description": "Threatening consequences such as account closure or legal action",
        "probes": [
            "Legal action will be taken account permanently blocked funds frozen arrest warrant",
            "Your account suspended criminal charges pending immediate action required or consequences",
            "Failure to comply results in permanent account termination and legal prosecution",
        ],
    },
    "greed": {
        "label": "Financial Bait",
        "color": "#f59e0b",
        "description": "Dangling money prizes or exceptional returns as lures",
        "probes": [
            "You have won prize money lottery congratulations claim your reward now",
            "Earn money easily work from home guaranteed high returns no experience needed",
            "Investment opportunity 200 percent returns guaranteed in 30 days",
        ],
    },
    "trust_abuse": {
        "label": "Trust Exploitation",
        "color": "#06b6d4",
        "description": "Weaponizing familiarity and care to lower defenses",
        "probes": [
            "We care about your security we are here to help you trusted partner",
            "Your safety is our priority customer care protecting your account for you",
            "As your loyal banking partner we want to ensure your account remains safe",
        ],
    },
    "credential_harvest": {
        "label": "Credential Harvesting",
        "color": "#f97316",
        "description": "Requests for passwords OTPs account numbers or identity documents",
        "probes": [
            "Share OTP password account number debit card details to verify identity",
            "Please provide Aadhaar PAN card bank PIN and mother's maiden name for KYC",
            "Enter your card number CVV expiry date and PIN to confirm your identity",
        ],
    },
    "payment_trap": {
        "label": "Payment Trap",
        "color": "#10b981",
        "description": "Requiring advance fees deposits or transfers to unlock rewards",
        "probes": [
            "Pay small registration fee processing charge refundable deposit to receive prize",
            "Transfer advance money to unlock loan approval and receive funds immediately",
            "Pay GST customs duty handling charge to claim your winning prize package",
        ],
    },
    "digital_pivot": {
        "label": "Digital Platform Abuse",
        "color": "#6366f1",
        "description": "Exploiting UPI crypto WhatsApp or digital platform trust",
        "probes": [
            "Send payment via UPI PhonePe Google Pay to receive cashback wallet credit",
            "Transfer Bitcoin Ethereum crypto wallet address to receive double the amount back",
            "Click WhatsApp Telegram link share screen using AnyDesk to process refund",
        ],
    },
}


class GenomeService:
    _probe_matrix: Optional[np.ndarray] = None   # shape (8, 384)
    _dim_keys: list[str] = []
    _initialized: bool = False

    def __init__(self, embedding_svc: "EmbeddingService"):
        self.embedding_svc = embedding_svc

    def initialize(self) -> None:
        """Pre-compute probe embeddings once at startup. Fast at analysis time."""
        if self._initialized:
            return
        logger.info("Initializing Semantic Genome probe embeddings...")
        probes_flat: list[str] = []
        probe_counts: list[int] = []
        self._dim_keys = list(GENOME_PROBES.keys())

        for key in self._dim_keys:
            probes = GENOME_PROBES[key]["probes"]
            probes_flat.extend(probes)
            probe_counts.append(len(probes))

        all_vecs = np.array(self.embedding_svc.encode_batch(probes_flat))  # (N, 384)

        # Compute mean probe vector per dimension (already normalized inputs)
        dim_vecs = []
        idx = 0
        for count in probe_counts:
            dim_vecs.append(np.mean(all_vecs[idx : idx + count], axis=0))
            idx += count

        self._probe_matrix = np.array(dim_vecs)  # (8, 384)
        self._initialized = True
        logger.info("Genome probes initialized: %d dimensions", len(self._dim_keys))

    def compute_genome(self, text_embedding: list[float]) -> GenomeData:
        if not self._initialized:
            self.initialize()

        with timed("genome.compute"):
            return self._compute_genome_core(text_embedding)

    def _compute_genome_core(self, text_embedding: list[float]) -> GenomeData:
        text_vec = np.array(text_embedding)  # (384,)
        # Dot product = cosine similarity for normalized vectors
        raw_scores = self._probe_matrix @ text_vec   # (8,)

        # Normalize to [0, 1] range
        min_s, max_s = raw_scores.min(), raw_scores.max()
        if max_s > min_s:
            normalized = (raw_scores - min_s) / (max_s - min_s)
        else:
            normalized = np.zeros_like(raw_scores)

        # Build dimension objects
        dimensions: list[GenomeDimension] = []
        for i, key in enumerate(self._dim_keys):
            meta = GENOME_PROBES[key]
            dimensions.append(
                GenomeDimension(
                    key=key,
                    label=meta["label"],
                    score=round(float(normalized[i]), 4),
                    description=meta["description"],
                    color=meta["color"],
                )
            )

        # Dominant vector = highest scoring dimension
        dominant_idx = int(np.argmax(normalized))
        dominant = self._dim_keys[dominant_idx]

        # Attack complexity = Shannon entropy over normalized distribution
        probs = normalized / (normalized.sum() + 1e-9)
        entropy = -float(np.sum(probs * np.log(probs + 1e-9))) / math.log(len(probs))
        attack_complexity = round(entropy, 4)

        return GenomeData(
            dimensions=dimensions,
            dominant_vector=dominant,
            attack_complexity=attack_complexity,
        )
