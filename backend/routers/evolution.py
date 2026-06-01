import urllib.parse

from fastapi import APIRouter

from models.schemas import EvolutionEntry

router = APIRouter(prefix="/api", tags=["evolution"])


@router.get("/evolution/{family:path}", response_model=list[EvolutionEntry])
async def get_evolution(family: str):
    from main import qdrant_service
    decoded = urllib.parse.unquote(family)
    entries = qdrant_service.get_evolution_data(decoded)
    return [EvolutionEntry(**e) for e in entries]
