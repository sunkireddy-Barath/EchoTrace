import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from services.embedding_service import EmbeddingService
from services.qdrant_service import QdrantService
from services.ocr_service import OCRService
from services.audio_service import AudioService
from services.graph_service import GraphService
from services.genome_service import GenomeService
from services.analysis_service import AnalysisService
from services.velocity_service import VelocityService
from data.seed_data import seed_qdrant

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

settings = get_settings()

# ── Service singletons ────────────────────────────────────────────────────────
embedding_service = EmbeddingService.get_instance()

qdrant_service = QdrantService(
    host=settings.qdrant_host,
    port=settings.qdrant_port,
    vector_size=settings.vector_size,
    scam_messages_collection=settings.scam_messages_collection,
    scam_families_collection=settings.scam_families_collection,
)

ocr_service = OCRService()
audio_service = AudioService()
graph_service = GraphService()
genome_service = GenomeService(embedding_svc=embedding_service)
velocity_service = VelocityService(embedding_svc=embedding_service, qdrant_svc=qdrant_service)

analysis_service = AnalysisService(
    embedding_svc=embedding_service,
    qdrant_svc=qdrant_service,
    ocr_svc=ocr_service,
    audio_svc=audio_service,
    graph_svc=graph_service,
    genome_svc=genome_service,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("EchoTrace AI v2.0 starting up...")
    qdrant_service.init_collections()
    seed_qdrant(qdrant_service, embedding_service)
    # Pre-compute genome probe embeddings to avoid first-request latency
    genome_service.initialize()
    count = qdrant_service.get_total_count()
    logger.info("Ready — %d scam vectors in Qdrant, Genome probes loaded.", count)
    yield
    logger.info("EchoTrace AI shutting down.")


app = FastAPI(
    title="EchoTrace AI",
    description="Semantic Fraud Evolution & Threat Intelligence Engine — v2.0",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins + [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
from routers.analyze import router as analyze_router
from routers.families import router as families_router
from routers.evolution import router as evolution_router
from routers.graph import router as graph_router
from routers.stats import router as stats_router
from routers.community import router as community_router
from routers.analytics import router as analytics_router

app.include_router(analyze_router)
app.include_router(families_router)
app.include_router(evolution_router)
app.include_router(graph_router)
app.include_router(stats_router)
app.include_router(community_router)
app.include_router(analytics_router)


@app.get("/")
async def root():
    return {
        "name": "EchoTrace AI",
        "version": "2.0.0",
        "tagline": "Detect scam families before keywords catch them.",
        "novel_features": [
            "Semantic Genome — 8-dimension psychological manipulation profiling",
            "Zero-Day Scam Detection — emerging fraud alerts",
            "Evolution Velocity — semantic drift rate analysis",
            "Community Intel Feed — crowd-sourced threat corpus",
        ],
        "docs": "/docs",
    }
