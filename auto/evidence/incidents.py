"""Structured incident capture for AUTO v2 self-evolution.

Incidents are deterministic evidence records written at key runtime failure
events.  They feed the metrics aggregator and future rule promotion.
"""

from __future__ import annotations

import datetime as dt
import json
from pathlib import Path
from typing import Any

from auto.knowledge.root_cause import classify_root_cause
from auto.knowledge.taxonomy import normalize_failure_category

_INCIDENT_VERSION = 1
_COUNTER_FILE = "incident_counter.txt"


def append_incident(knowledge_dir: str | Path, incident: dict[str, Any]) -> Path:
    """Append *incident* as a JSONL line to ``incidents.jsonl``."""
    kdir = Path(knowledge_dir)
    kdir.mkdir(parents=True, exist_ok=True)
    path = kdir / "incidents.jsonl"
    with path.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(incident, ensure_ascii=False) + "\n")
    return path


def build_incident_from_artifacts(
    *,
    knowledge_dir: str | Path,
    work_item_id: str,
    task_slug: str,
    stage: str,
    category: str,
    summary: str = "",
    task_dir: Path | None = None,
    qa_unit_dir: Path | None = None,
    attempt_count: int = 0,
    tags: list[str] | None = None,
) -> dict[str, Any]:
    """Build a structured incident dict from available artifact paths.

    ``root_cause_summary`` and ``fix_summary`` are left empty — they can be
    filled by an optional LLM pass later (Phase 2+).
    """
    incident_id = _next_incident_id(knowledge_dir)
    category = normalize_failure_category(category)
    normalized_tags = list(tags or [])
    root_cause_label = classify_root_cause(
        category=category,
        stage=stage,
        summary=summary,
        tags=normalized_tags,
    )

    evidence: dict[str, str] = {}
    if task_dir:
        for name in ("RESULT.json", "REVIEW.json", "STATUS.json"):
            p = task_dir / name
            if p.exists():
                evidence[name.lower().replace(".json", "_path")] = str(p)

    return {
        "version": _INCIDENT_VERSION,
        "id": incident_id,
        "timestamp": dt.datetime.now(dt.UTC).isoformat(timespec="seconds"),
        "work_item_id": work_item_id,
        "task_slug": task_slug,
        "stage": stage,
        "category": category,
        "summary": summary[:400] if summary else "",
        "evidence": evidence,
        "root_cause_label": root_cause_label,
        "root_cause_summary": summary[:160] if root_cause_label != "unknown" and summary else "",
        "fix_summary": "",
        "attempt_count": attempt_count,
        "recurrence_key": category,
        "tags": normalized_tags,
        "promoted_rule_id": None,
    }


def load_incidents(knowledge_dir: str | Path) -> list[dict[str, Any]]:
    """Load all incidents from ``incidents.jsonl``."""
    path = Path(knowledge_dir) / "incidents.jsonl"
    if not path.exists():
        return []
    records: list[dict[str, Any]] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            records.append(json.loads(line))
        except json.JSONDecodeError:
            continue
    return records


# ── Private helpers ──────────────────────────────────────────────────────


def _next_incident_id(knowledge_dir: str | Path) -> str:
    kdir = Path(knowledge_dir)
    kdir.mkdir(parents=True, exist_ok=True)
    counter_path = kdir / _COUNTER_FILE
    counter = 0
    if counter_path.exists():
        try:
            counter = int(counter_path.read_text(encoding="utf-8").strip())
        except (ValueError, OSError):
            counter = 0
    counter += 1
    counter_path.write_text(str(counter) + "\n", encoding="utf-8")
    today = dt.date.today().isoformat()
    return f"inc-{today}-{counter:03d}"
