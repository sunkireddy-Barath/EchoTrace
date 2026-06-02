from __future__ import annotations
import logging
from io import BytesIO

from services.timing import timed

logger = logging.getLogger(__name__)


class OCRService:
    _reader = None

    def _load_reader(self) -> None:
        if self._reader is None:
            import easyocr
            # gpu=False is mandatory — this system has CPU-only torch
            self._reader = easyocr.Reader(["en"], gpu=False, verbose=False)
            logger.info("EasyOCR reader loaded")

    def extract_text(self, image_bytes: bytes) -> str:
        self._load_reader()
        from PIL import Image
        import numpy as np

        with timed("ocr.extract"):
            image = Image.open(BytesIO(image_bytes)).convert("RGB")
            img_array = np.array(image)
            results = self._reader.readtext(img_array, detail=0)
        extracted = " ".join(results).strip()
        if not extracted:
            extracted = "[No text detected in image]"
        return extracted
