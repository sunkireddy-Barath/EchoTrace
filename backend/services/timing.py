"""Lightweight stage timing for EchoTrace pipeline profiling."""
from __future__ import annotations

import logging
import time
from contextlib import contextmanager

logger = logging.getLogger("echotrace.timing")


@contextmanager
def timed(stage: str):
    """Log wall-clock duration in milliseconds for a pipeline stage."""
    t0 = time.perf_counter()
    try:
        yield
    finally:
        ms = (time.perf_counter() - t0) * 1000.0
        logger.info("%s: %.1fms", stage, ms)


def ms_since(t0: float) -> float:
    return (time.perf_counter() - t0) * 1000.0
