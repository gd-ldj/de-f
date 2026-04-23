"""Retry helpers for AUTO v2."""

from __future__ import annotations

import random
import time
from collections.abc import Callable
from typing import TypeVar

T = TypeVar("T")


def compute_backoff(attempt: int, config: dict | None = None) -> float:
    cfg = config or {}
    strategy = str(cfg.get("strategy", "exponential")).lower()
    base_delay = float(cfg.get("base_delay", 1.0))
    max_delay = float(cfg.get("max_delay", 30.0))
    jitter = bool(cfg.get("jitter", True))
    if strategy == "fixed":
        delay = base_delay
    else:
        delay = min(base_delay * (2 ** attempt), max_delay)
    if jitter:
        delay *= 0.5 + random.random() * 0.5
    return round(delay, 2)


def retry_call(fn: Callable[[], T], attempts: int = 3, config: dict | None = None) -> T:
    last_error: Exception | None = None
    for attempt in range(attempts):
        try:
            return fn()
        except Exception as exc:  # noqa: BLE001
            last_error = exc
            if attempt == attempts - 1:
                break
            time.sleep(compute_backoff(attempt, config))
    assert last_error is not None
    raise last_error
