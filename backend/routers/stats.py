from fastapi import APIRouter

from models.schemas import DashboardStats, FamilyStats, HealthResponse

router = APIRouter(prefix="/api", tags=["stats"])


@router.get("/stats", response_model=DashboardStats)
async def get_stats():
    from main import qdrant_service
    total = qdrant_service.get_total_count()
    raw_stats = qdrant_service.get_family_stats()
    families = [FamilyStats(**s) for s in raw_stats]
    recent_threats = sum(1 for f in families if max(f.years, default=0) >= 2024)
    community_count = qdrant_service.get_community_count()
    return DashboardStats(
        total_messages=total,
        total_families=len(families),
        recent_threats=recent_threats,
        zero_day_count=community_count,
        top_families=families[:6],
    )


@router.post("/seed")
async def seed_endpoint():
    from main import qdrant_service, embedding_service
    from data.seed_data import seed_qdrant
    seed_qdrant(qdrant_service, embedding_service)
    return {"status": "seeded", "total": qdrant_service.get_total_count()}


@router.get("/health", response_model=HealthResponse)
async def health():
    from main import qdrant_service, embedding_service
    return HealthResponse(
        status="ok",
        qdrant_connected=qdrant_service.is_healthy(),
        model_loaded=embedding_service.is_loaded(),
        total_messages=qdrant_service.get_total_count(),
        qdrant_version="1.18+",
    )
