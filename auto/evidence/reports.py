"""Daily report generation for AUTO v2."""

from __future__ import annotations

import datetime as dt
import json
from collections import Counter
from pathlib import Path
from typing import Any


def write_daily_report(report_dir: str | Path, payload: dict) -> Path:
    report_path = Path(report_dir)
    report_path.mkdir(parents=True, exist_ok=True)
    enriched = {
        "generated_at": dt.datetime.now(dt.UTC).isoformat(timespec="seconds"),
        **payload,
    }
    dated_path = report_path / f"{dt.date.today().isoformat()}.json"
    latest_path = report_path / "latest.json"
    dated_path.write_text(json.dumps(enriched, indent=2) + "\n", encoding="utf-8")
    latest_path.write_text(json.dumps(enriched, indent=2) + "\n", encoding="utf-8")
    return latest_path


def build_notification_summary(runtime_dir: str | Path) -> dict[str, Any]:
    path = Path(runtime_dir) / "notifications.jsonl"
    rows = _load_jsonl(path)
    by_event: Counter[str] = Counter()
    by_channel: Counter[str] = Counter()
    sent_count = 0
    skipped_count = 0
    failed_count = 0

    for row in rows:
        event = str(row.get("event", "") or "")
        if event:
            by_event[event] += 1
        delivery = row.get("delivery", {})
        if isinstance(delivery, dict):
            channel = str(delivery.get("channel", "") or "")
            status = str(delivery.get("status", "") or "")
            if channel:
                by_channel[channel] += 1
            if status == "sent":
                sent_count += 1
            elif status == "skipped":
                skipped_count += 1
            else:
                failed_count += 1

    latest = rows[-1] if rows else {}
    return {
        "total_count": len(rows),
        "sent_count": sent_count,
        "skipped_count": skipped_count,
        "failed_count": failed_count,
        "by_event": dict(by_event),
        "by_channel": dict(by_channel),
        "latest": latest if isinstance(latest, dict) else {},
    }


def _load_jsonl(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    rows: list[dict[str, Any]] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            payload = json.loads(line)
        except json.JSONDecodeError:
            continue
        if isinstance(payload, dict):
            rows.append(payload)
    return rows
