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
from services.analysis_service import AnalysisService
from data.seed_data import seed_qdrant

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
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

analysis_service = AnalysisService(
    embedding_svc=embedding_service,
    qdrant_svc=qdrant_service,
    ocr_svc=ocr_service,
    audio_svc=audio_service,
    graph_svc=graph_service,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("EchoTrace AI starting up...")
    qdrant_service.init_collections()
    seed_qdrant(qdrant_service, embedding_service)
    logger.info("EchoTrace AI ready. Total messages: %d", qdrant_service.get_total_count())
    yield
    logger.info("EchoTrace AI shutting down.")


app = FastAPI(
    title="EchoTrace AI",
    description="Semantic Fraud Evolution & Threat Intelligence Engine",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins + ["http://localhost:3000", "http://localhost:3001"],
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

app.include_router(analyze_router)
app.include_router(families_router)
app.include_router(evolution_router)
app.include_router(graph_router)
app.include_router(stats_router)


@app.get("/")
async def root():
    return {
        "name": "EchoTrace AI",
        "version": "1.0.0",
        "tagline": "Detect scam families before keywords catch them.",
        "docs": "/docs",
    }
