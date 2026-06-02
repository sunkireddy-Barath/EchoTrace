from __future__ import annotations

import logging
from typing import Optional

from services.timing import timed

logger = logging.getLogger(__name__)


class EmbeddingService:
    _instance: Optional["EmbeddingService"] = None
    _model = None

    @classmethod
    def get_instance(cls) -> "EmbeddingService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _load_model(self) -> None:
        if self._model is None:
            from sentence_transformers import SentenceTransformer
            with timed("embedding.model_load"):
                self._model = SentenceTransformer("all-MiniLM-L6-v2")
            logger.info("SentenceTransformer loaded (singleton, reused per request)")

    def encode(self, text: str) -> list[float]:
        self._load_model()
        with timed("embedding.encode"):
            embedding = self._model.encode(text, normalize_embeddings=True)
        return embedding.tolist()

    def encode_batch(self, texts: list[str]) -> list[list[float]]:
        self._load_model()
        with timed("embedding.encode_batch"):
            embeddings = self._model.encode(texts, normalize_embeddings=True, batch_size=32)
        return embeddings.tolist()

    def is_loaded(self) -> bool:
        return self._model is not None
