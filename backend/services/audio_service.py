from __future__ import annotations
import logging
import os
import tempfile
from pathlib import Path

logger = logging.getLogger(__name__)


class AudioService:
    _model = None

    def _load_model(self) -> None:
        if self._model is None:
            import whisper
            # "base" model: ~74MB, good accuracy for English fraud text
            self._model = whisper.load_model("base")
            logger.info("Whisper base model loaded")

    def transcribe(self, audio_bytes: bytes, filename: str) -> str:
        self._load_model()
        import whisper

        suffix = Path(filename).suffix or ".mp3"
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name

        try:
            result = whisper.transcribe(self._model, tmp_path, language="en")
            text = result.get("text", "").strip()
            return text if text else "[No speech detected in audio]"
        finally:
            os.unlink(tmp_path)
