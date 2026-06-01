from fastapi import APIRouter, Form, File, UploadFile
from typing import Optional

from models.schemas import FeedItem, CommunityReport

router = APIRouter(prefix="/api", tags=["community"])


@router.post("/report", response_model=dict)
async def report_scam(
    text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    source_label: Optional[str] = Form("Community"),
    reporter_note: Optional[str] = Form(None),
):
    """Submit a new scam to the community intelligence corpus."""
    from main import analysis_service, qdrant_service, embedding_service

    # Run full analysis on the submission
    result = await analysis_service.analyze(text=text, file=file)

    # Add to Qdrant community corpus
    vector = embedding_service.encode(result.extracted_text)
    point_id = qdrant_service.report_community_scam(
        vector=vector,
        text=result.extracted_text,
        detected_family=result.detected_family,
        threat_score=result.threat_score,
        modality=result.modality,
        source_label=source_label or "Community",
    )

    return {
        "status": "contributed",
        "point_id": point_id,
        "detected_family": result.detected_family,
        "threat_score": result.threat_score,
        "message": "Thank you! Your report has been added to the community threat intelligence corpus.",
    }


@router.get("/feed", response_model=list[FeedItem])
async def get_feed(limit: int = 20):
    """Get recent community-submitted threat reports."""
    from main import qdrant_service
    items = qdrant_service.get_community_feed(limit=min(limit, 50))
    return [FeedItem(**item) for item in items]
