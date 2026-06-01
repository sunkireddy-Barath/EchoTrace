import urllib.parse
from fastapi import APIRouter

from models.schemas import EvolutionVelocity

router = APIRouter(prefix="/api", tags=["analytics"])


@router.get("/velocity/{family}", response_model=EvolutionVelocity)
async def get_velocity(family: str):
    """Get evolution velocity (semantic drift rate) for a fraud family."""
    from main import velocity_service
    decoded = urllib.parse.unquote(family)
    return velocity_service.compute_velocity(decoded)


@router.get("/velocity", response_model=list[EvolutionVelocity])
async def get_all_velocities():
    """Get evolution velocity for all fraud families."""
    from main import velocity_service, qdrant_service
    families = [s["family"] for s in qdrant_service.get_family_stats()]
    return [velocity_service.compute_velocity(f) for f in families]
