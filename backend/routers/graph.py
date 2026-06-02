from fastapi import APIRouter

from models.schemas import GraphData

router = APIRouter(prefix="/api", tags=["graph"])


@router.get("/graph", response_model=GraphData)
async def get_graph():
    from main import qdrant_service, graph_service
    centroids = qdrant_service.get_cached_family_centroids()
    stats = qdrant_service.get_cached_family_stats()
    return graph_service.build_graph(centroids, stats)
