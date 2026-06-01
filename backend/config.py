from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    qdrant_host: str = "localhost"
    qdrant_port: int = 6333

    backend_host: str = "0.0.0.0"
    backend_port: int = 8000
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:3001"]

    embedding_model: str = "all-MiniLM-L6-v2"
    vector_size: int = 384

    scam_messages_collection: str = "scam_messages"
    scam_families_collection: str = "scam_families"

    similarity_threshold: float = 0.45
    top_k_neighbors: int = 10

    threat_high_threshold: float = 0.82
    threat_medium_threshold: float = 0.62


@lru_cache()
def get_settings() -> Settings:
    return Settings()
