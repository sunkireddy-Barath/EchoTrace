import logging
import time
from typing import Optional

from fastapi import APIRouter, File, Form, UploadFile

from models.schemas import AnalysisResult

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["analyze"])


@router.post("/analyze", response_model=AnalysisResult)
async def analyze(
    text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
):
    from main import analysis_service

    t0 = time.perf_counter()
    result = await analysis_service.analyze(text=text, file=file)
    logger.info("api.analyze wall_clock: %.1fms", (time.perf_counter() - t0) * 1000)
    return result
