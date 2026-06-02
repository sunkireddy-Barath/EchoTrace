"""In-process TTL caches for analysis results and Qdrant metadata."""
from __future__ import annotations

import hashlib
import threading
import time
from typing import Any, Generic, Optional, TypeVar

T = TypeVar("T")

# TTLs (seconds)
METADATA_TTL = 120.0
ANALYSIS_TTL = 300.0


class TTLCache(Generic[T]):
    def __init__(self, ttl_seconds: float, name: str = "cache"):
        self.ttl = ttl_seconds
        self.name = name
        self._store: dict[str, tuple[float, T]] = {}
        self._lock = threading.Lock()

    def get(self, key: str) -> Optional[T]:
        with self._lock:
            entry = self._store.get(key)
            if entry is None:
                return None
            ts, value = entry
            if time.monotonic() - ts > self.ttl:
                del self._store[key]
                return None
            return value

    def set(self, key: str, value: T) -> None:
        with self._lock:
            self._store[key] = (time.monotonic(), value)

    def invalidate(self, prefix: Optional[str] = None) -> None:
        with self._lock:
            if prefix is None:
                self._store.clear()
                return
            keys = [k for k in self._store if k.startswith(prefix)]
            for k in keys:
                del self._store[k]


metadata_cache: TTLCache[Any] = TTLCache(METADATA_TTL, "metadata")
analysis_cache: TTLCache[Any] = TTLCache(ANALYSIS_TTL, "analysis")


def analysis_cache_key(text: str, modality: str) -> str:
    normalized = " ".join(text.strip().lower().split())[:512]
    raw = f"{modality}:{normalized}".encode("utf-8", errors="replace")
    return hashlib.sha256(raw).hexdigest()


def invalidate_metadata_caches() -> None:
    for key in ("family_stats", "family_centroids", "graph_result", "total_count", "community_count"):
        metadata_cache.invalidate(key)
