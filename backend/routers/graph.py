from fastapi import APIRouter
from fastapi.responses import JSONResponse

from models.schemas import GraphData
from services.cache_service import metadata_cache

router = APIRouter(prefix="/api", tags=["graph"])


@router.get("/graph", response_model=GraphData)
async def get_graph():
    from main import qdrant_service, graph_service

    cache_key = "graph_result"
    cached = metadata_cache.get(cache_key)
    if cached is not None:
        return JSONResponse(content=cached, headers={"X-Cache": "HIT"})

    centroids = qdrant_service.get_cached_family_centroids()
    stats = qdrant_service.get_cached_family_stats()
    graph = graph_service.build_graph(centroids, stats)
    graph_dict = graph.model_dump()
    metadata_cache.set(cache_key, graph_dict)
    return JSONResponse(content=graph_dict, headers={"X-Cache": "MISS"})
