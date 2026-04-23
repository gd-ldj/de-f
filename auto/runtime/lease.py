"""Lease tracking for AUTO v2 runtime tasks."""

from __future__ import annotations

import datetime as dt
import fcntl
import json
from pathlib import Path


def load_leases(runtime_dir: str | Path) -> dict:
    lease_path = Path(runtime_dir) / "leases.json"
    if not lease_path.exists():
        return {"active": [], "history": []}
    return json.loads(lease_path.read_text(encoding="utf-8"))


def _with_lease_lock(runtime_dir: str | Path, fn):
    """Execute fn while holding an exclusive lock on leases.lock."""
    lock_path = Path(runtime_dir) / "leases.lock"
    lock_path.parent.mkdir(parents=True, exist_ok=True)
    with lock_path.open("w") as lock_fd:
        fcntl.flock(lock_fd, fcntl.LOCK_EX)
        try:
            return fn()
        finally:
            fcntl.flock(lock_fd, fcntl.LOCK_UN)


def acquire_lease(runtime_dir: str | Path, slug: str) -> dict:
    def _inner():
        payload = load_leases(runtime_dir)
        lease = {
            "slug": slug,
            "state": "active",
            "acquired_at": _now(),
            "heartbeat_at": _now(),
        }
        payload["active"] = [item for item in payload.get("active", []) if item.get("slug") != slug]
        payload["active"].append(lease)
        payload.setdefault("history", []).append({**lease, "event": "acquire"})
        _save_leases(runtime_dir, payload)
        return lease
    return _with_lease_lock(runtime_dir, _inner)


def release_lease(runtime_dir: str | Path, slug: str, state: str) -> None:
    def _inner():
        payload = load_leases(runtime_dir)
        payload["active"] = [item for item in payload.get("active", []) if item.get("slug") != slug]
        payload.setdefault("history", []).append(
            {
                "slug": slug,
                "state": state,
                "released_at": _now(),
                "event": "release",
            }
        )
        _save_leases(runtime_dir, payload)
    _with_lease_lock(runtime_dir, _inner)


def reclaim_stale_leases(runtime_dir: str | Path, *, stale_after_seconds: int) -> list[str]:
    if stale_after_seconds <= 0:
        return []

    def _inner():
        payload = load_leases(runtime_dir)
        active = payload.get("active", [])
        now = dt.datetime.now(dt.UTC)
        reclaimed: list[str] = []
        kept: list[dict] = []
        for lease in active:
            ts = _parse_time(str(lease.get("heartbeat_at") or lease.get("acquired_at") or ""))
            if ts is None or int((now - ts).total_seconds()) < stale_after_seconds:
                kept.append(lease)
                continue
            reclaimed.append(str(lease.get("slug", "")))
            payload.setdefault("history", []).append(
                {
                    "slug": lease.get("slug", ""),
                    "state": "reclaimed",
                    "released_at": _now(),
                    "event": "reclaim",
                }
            )
        payload["active"] = kept
        _save_leases(runtime_dir, payload)
        return reclaimed
    return _with_lease_lock(runtime_dir, _inner)


def _save_leases(runtime_dir: str | Path, payload: dict) -> None:
    runtime_path = Path(runtime_dir)
    runtime_path.mkdir(parents=True, exist_ok=True)
    runtime_path.joinpath("leases.json").write_text(
        json.dumps(payload, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )


def _now() -> str:
    return dt.datetime.now(dt.UTC).isoformat(timespec="seconds")


def _parse_time(value: str) -> dt.datetime | None:
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
