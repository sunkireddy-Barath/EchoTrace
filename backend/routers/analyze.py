from typing import Optional

from fastapi import APIRouter, File, Form, UploadFile

from models.schemas import AnalysisResult

router = APIRouter(prefix="/api", tags=["analyze"])


@router.post("/analyze", response_model=AnalysisResult)
async def analyze(
    text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
):
    from main import analysis_service
    return await analysis_service.analyze(text=text, file=file)
