from __future__ import annotations
from typing import Optional


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
            self._model = SentenceTransformer("all-MiniLM-L6-v2")

    def encode(self, text: str) -> list[float]:
        self._load_model()
        embedding = self._model.encode(text, normalize_embeddings=True)
        return embedding.tolist()

    def encode_batch(self, texts: list[str]) -> list[list[float]]:
        self._load_model()
        embeddings = self._model.encode(texts, normalize_embeddings=True, batch_size=32)
        return embeddings.tolist()

    def is_loaded(self) -> bool:
        return self._model is not None
