"""Lightweight HTTP status server for remote AUTO runtime monitoring."""

from __future__ import annotations

import datetime as dt
import json
import re
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from typing import Any


class StatusHandler(BaseHTTPRequestHandler):
    """Serves JSON status at GET / and GET /health."""

    auto_root: Path  # Set by factory

    def do_GET(self) -> None:  # noqa: N802
        if self.path in ("/", "/status"):
            self._respond_json(self._build_status())
        elif self.path == "/health":
            self._respond_json({"ok": True, "timestamp": _now()})
        elif self.path == "/queue":
            self._respond_json(self._build_queue_detail())
        elif self.path == "/failures":
            self._respond_json(self._build_recent_failures())
        else:
            self.send_response(404)
            self.end_headers()

    def _respond_json(self, payload: dict[str, Any] | list[Any]) -> None:
        body = json.dumps(payload, indent=2, ensure_ascii=False).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _build_status(self) -> dict[str, Any]:
        root = self.auto_root
        state = _load_json(root / "STATE.json") or {}
        heartbeat = _load_json(root / "runtime" / "heartbeat" / "latest.json") or {}
        queue_stats = _parse_queue_stats(root / "queue" / "TASK-QUEUE.md")
        failures = _load_jsonl_tail(root / "runtime" / "failures.jsonl", n=3)

        return {
            "runtime_state": state.get("runtime_state", "unknown"),
            "active_task": state.get("active_task"),
            "last_progress_at": state.get("last_progress_at"),
            "heartbeat_at": state.get("heartbeat_at"),
            "heartbeat_event": heartbeat.get("event"),
            "started_at": state.get("last_start_at"),
            "queue": queue_stats,
            "recent_failures": failures,
            "checked_at": _now(),
        }

    def _build_queue_detail(self) -> dict[str, Any]:
        root = self.auto_root
        queue_path = root / "queue" / "TASK-QUEUE.md"
        entries = _parse_queue_entries(queue_path)
        return {"total": len(entries), "entries": entries}

    def _build_recent_failures(self) -> dict[str, Any]:
        root = self.auto_root
        failures = _load_jsonl_tail(root / "runtime" / "failures.jsonl", n=20)
        return {"count": len(failures), "failures": failures}

    def log_message(self, format: str, *args: Any) -> None:  # noqa: A002
        # Suppress default stderr logging to keep daemon output clean
        pass


def start_status_server(auto_root: Path, port: int = 9100) -> HTTPServer | None:
    """Start the status HTTP server in a daemon thread. Returns the server instance."""

    # Create a handler class bound to this specific auto_root
    handler_class = type(
        "BoundStatusHandler",
        (StatusHandler,),
        {"auto_root": auto_root},
    )

    try:
        server = HTTPServer(("0.0.0.0", port), handler_class)
    except OSError:
        # Port in use — skip silently, not critical
        return None

    thread = threading.Thread(target=server.serve_forever, daemon=True, name="auto-status-server")
    thread.start()
    return server


# --- Helpers ---


def _load_json(path: Path) -> dict[str, Any] | None:
    if not path.exists():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return None


def _load_jsonl_tail(path: Path, n: int = 5) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    try:
        lines = path.read_text(encoding="utf-8").strip().splitlines()
    except OSError:
        return []
    rows: list[dict[str, Any]] = []
    for line in lines[-n:]:
        try:
            obj = json.loads(line)
            if isinstance(obj, dict):
                rows.append(obj)
        except json.JSONDecodeError:
            continue
    return rows


def _parse_queue_stats(queue_path: Path) -> dict[str, int]:
    stats: dict[str, int] = {"pending": 0, "running": 0, "blocked": 0, "integrated": 0, "total": 0}
    if not queue_path.exists():
        return stats
    try:
        text = queue_path.read_text(encoding="utf-8")
    except OSError:
        return stats
    for line in text.splitlines():
        if not line.startswith("|") or "---" in line:
            continue
        cells = [c.strip() for c in line.split("|")]
        if len(cells) < 4:
            continue
        state_cell = cells[3].lower() if len(cells) > 3 else ""
        if state_cell in stats:
            stats[state_cell] += 1
        stats["total"] += 1
    # Subtract header row counted as total
    if stats["total"] > 0:
        stats["total"] -= 1  # header row
    return stats


def _parse_queue_entries(queue_path: Path) -> list[dict[str, str]]:
    if not queue_path.exists():
        return []
    try:
        text = queue_path.read_text(encoding="utf-8")
    except OSError:
        return []
    entries: list[dict[str, str]] = []
    header_seen = False
    for line in text.splitlines():
        if not line.startswith("|"):
            continue
        if "---" in line:
            header_seen = True
            continue
        if not header_seen:
            continue
        cells = [c.strip() for c in line.split("|")]
        if len(cells) >= 6:
            entries.append({
                "task": cells[1],
                "work_item": cells[2],
                "state": cells[3],
                "depends_on": cells[4],
                "notes": cells[5] if len(cells) > 5 else "",
            })
    return entries


def _now() -> str:
    return dt.datetime.now(dt.UTC).isoformat(timespec="seconds")
