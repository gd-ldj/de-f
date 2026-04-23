"""Watchdog checks for long-running AUTO runtimes."""

from __future__ import annotations

import datetime as dt
import json
from pathlib import Path
from typing import Any


def detect_watchdog_events(
    *,
    runtime_dir: str | Path,
    state: dict[str, Any],
    workflow: dict[str, Any],
) -> list[dict[str, Any]]:
    runtime_path = Path(runtime_dir)
    watchdog_cfg = dict(workflow.get("watchdog", {}) or {})
    threshold = max(int(watchdog_cfg.get("repeated_block_threshold", 3) or 3), 1)
    stale_progress_seconds = max(int(watchdog_cfg.get("stale_progress_seconds", 900) or 0), 0)
    events: list[dict[str, Any]] = []

    failures = _load_failures(runtime_path / "failures.jsonl")
    repeated = _detect_repeated_block(failures, threshold)
    if repeated:
        events.append(repeated)

    heartbeat = _load_json(runtime_path / "heartbeat" / "latest.json")
    stalled = _detect_stalled_progress(state, stale_progress_seconds, heartbeat)
    if stalled:
        events.append(stalled)

    return events


def append_watchdog_event(runtime_dir: str | Path, event: dict[str, Any]) -> None:
    path = Path(runtime_dir) / "watchdog.jsonl"
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(event, ensure_ascii=False) + "\n")


def _detect_repeated_block(failures: list[dict[str, Any]], threshold: int) -> dict[str, Any] | None:
    if len(failures) < threshold:
        return None
    latest = failures[-1]
    category = str(latest.get("category", "") or "")
    if not category:
        return None
    tail = failures[-threshold:]
    if any(str(item.get("category", "") or "") != category for item in tail):
        return None
    return {
        "event": "repeated_block",
        "severity": "high",
        "summary": f"Repeated block detected for category '{category}'",
        "category": category,
        "count": threshold,
        "signature": f"repeated_block:{category}:{threshold}",
        "timestamp": _now(),
    }


def _detect_stalled_progress(
    state: dict[str, Any],
    stale_progress_seconds: int,
    heartbeat: dict[str, Any] | None,
) -> dict[str, Any] | None:
    if stale_progress_seconds <= 0:
        return None
    if str(state.get("runtime_state", "") or "") != "running":
        return None
    heartbeat_event = str((heartbeat or {}).get("event", "") or "")
    if heartbeat_event == "idle_wait":
        return None
    active_task = (heartbeat or {}).get("active_task")
    if active_task is None:
        active_task = state.get("active_task")
    if not _has_active_task(active_task):
        return None
    last_progress_at = _parse_iso(str(state.get("last_progress_at", "") or ""))
    if last_progress_at is None:
        return None
    age_seconds = int((dt.datetime.now(dt.UTC) - last_progress_at).total_seconds())
    if age_seconds < stale_progress_seconds:
        return None
    return {
        "event": "stalled_progress",
        "severity": "high",
        "summary": f"Runtime made no progress for {age_seconds} seconds",
        "age_seconds": age_seconds,
        "signature": f"stalled_progress:{age_seconds // max(stale_progress_seconds, 1)}",
        "timestamp": _now(),
    }


def _load_failures(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    rows: list[dict[str, Any]] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        try:
            payload = json.loads(line)
        except json.JSONDecodeError:
            continue
        if isinstance(payload, dict):
            rows.append(payload)
    return rows


def _load_json(path: Path) -> dict[str, Any] | None:
    if not path.exists():
        return None
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return None
    if isinstance(payload, dict):
        return payload
    return None


def _has_active_task(value: Any) -> bool:
    if value is None:
        return False
    if isinstance(value, str):
        return bool(value.strip())
    return True


def _parse_iso(value: str) -> dt.datetime | None:
    if not value:
        return None
    normalized = value.replace("Z", "+00:00")
    try:
        parsed = dt.datetime.fromisoformat(normalized)
    except ValueError:
        return None
    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=dt.UTC)
    return parsed.astimezone(dt.UTC)


def _now() -> str:
    return dt.datetime.now(dt.UTC).isoformat(timespec="seconds")
