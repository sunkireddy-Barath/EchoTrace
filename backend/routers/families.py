from fastapi import APIRouter

from models.schemas import FamilyStats

router = APIRouter(prefix="/api", tags=["families"])


@router.get("/families", response_model=list[FamilyStats])
async def get_families():
    from main import qdrant_service
    stats = qdrant_service.get_cached_family_stats()
    return [FamilyStats(**s) for s in stats]
