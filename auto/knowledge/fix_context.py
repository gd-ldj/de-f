"""Fix-context artifact builder for AUTO v2.

Every fix task gets a persisted ``FIX-CONTEXT.json`` so the dev agent
knows *why* the previous attempt failed and what was already tried.
"""

from __future__ import annotations

import datetime as dt
import json
from pathlib import Path
from typing import Any

from auto.knowledge.taxonomy import normalize_failure_category

_MAX_SUMMARY_CHARS = 180
_MAX_BUGS_CHARS = 800


def build_fix_context(
    *,
    task_slug: str,
    parent_task_slug: str,
    work_item_id: str,
    qa_unit_id: str,
    attempt: int,
    failure_category: str,
    parent_task_dir: Path,
    qa_unit_dir: Path | None = None,
    parent_scope_files: list[str] | None = None,
) -> dict[str, Any]:
    """Build a structured fix-context dict from available artifacts.

    Gracefully handles missing files — a partial context is better than none.
    """
    category = normalize_failure_category(failure_category)

    result_path = parent_task_dir / "RESULT.json"
    review_path = parent_task_dir / "REVIEW.json"
    status_path = parent_task_dir / "STATUS.json"

    result_summary = _extract_result_summary(result_path)
    review_summary = _extract_review_summary(review_path)
    bugs_summary = ""
    if qa_unit_dir:
        bugs_summary = _extract_bugs_summary(qa_unit_dir)

    failure_summary = _compose_failure_summary(category, result_summary, review_summary, bugs_summary)

    return {
        "version": 1,
        "task_slug": task_slug,
        "parent_task_slug": parent_task_slug,
        "work_item_id": work_item_id,
        "qa_unit_id": qa_unit_id,
        "attempt": attempt,
        "failure_category": category,
        "failure_summary": failure_summary,
        "parent_result_path": str(result_path) if result_path.exists() else "",
        "parent_review_path": str(review_path) if review_path.exists() else "",
        "parent_status_path": str(status_path) if status_path.exists() else "",
        "bugs_summary": bugs_summary,
        "changed_files": _read_changed_files(result_path),
        "planned_files": list(parent_scope_files or []),
        "created_at": dt.datetime.now(dt.UTC).isoformat(timespec="seconds"),
    }


def write_fix_context(task_dir: Path, payload: dict[str, Any]) -> Path:
    """Persist ``FIX-CONTEXT.json`` into *task_dir*."""
    task_dir.mkdir(parents=True, exist_ok=True)
    path = task_dir / "FIX-CONTEXT.json"
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return path


def load_fix_context(task_dir: Path) -> dict[str, Any] | None:
    """Load ``FIX-CONTEXT.json`` from *task_dir*, or ``None`` if absent."""
    path = task_dir / "FIX-CONTEXT.json"
    if not path.exists():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return None


def summarize_fix_context(payload: dict[str, Any]) -> str:
    """Return a concise one-line summary suitable for payload injection.

    Guaranteed to be at most ``_MAX_SUMMARY_CHARS`` characters.
    """
    summary = str(payload.get("failure_summary", "")).strip()
    if not summary:
        cat = payload.get("failure_category", "unknown")
        attempt = payload.get("attempt", "?")
        summary = f"Fix attempt {attempt} for {cat}"
    if len(summary) > _MAX_SUMMARY_CHARS:
        summary = summary[: _MAX_SUMMARY_CHARS - 3] + "..."
    return summary


# ── Private helpers ──────────────────────────────────────────────────────


def _safe_read_json(path: Path) -> Any:
    if not path.exists():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return None


def _extract_result_summary(result_path: Path) -> str:
    data = _safe_read_json(result_path)
    if not data:
        return ""
    parts: list[str] = []
    verdict = data.get("verdict", "")
    if verdict:
        parts.append(f"verdict={verdict}")
    fallback = data.get("fallback_reason", "")
    if fallback:
        parts.append(f"fallback={fallback}")
    summary = data.get("summary", "")
    if summary:
        parts.append(str(summary)[:100])
    return "; ".join(parts)[:_MAX_SUMMARY_CHARS]


def _extract_review_summary(review_path: Path) -> str:
    data = _safe_read_json(review_path)
    if not data:
        return ""
    verdict = data.get("verdict", "")
    issues = data.get("issues", [])
    issue_text = ", ".join(str(i)[:60] for i in issues[:3]) if issues else ""
    parts = [p for p in [f"review={verdict}", issue_text] if p]
    return "; ".join(parts)[:_MAX_SUMMARY_CHARS]


def _extract_bugs_summary(qa_unit_dir: Path) -> str:
    for name in ("BUGS.json", "QA-SCORECARD.json"):
        path = qa_unit_dir / name
        data = _safe_read_json(path)
        if not data:
            continue
        if isinstance(data, list):
            texts = [str(bug.get("summary", bug.get("description", "")))[:80] for bug in data[:3] if isinstance(bug, dict)]
            return "; ".join(texts)[:_MAX_BUGS_CHARS]
        if isinstance(data, dict):
            summary = data.get("summary", "")
            if summary:
                return str(summary)[:_MAX_BUGS_CHARS]
    return ""


def _read_changed_files(result_path: Path) -> list[str]:
    data = _safe_read_json(result_path)
    if not data:
        return []
    files = data.get("files_modified", [])
    if isinstance(files, list):
        return [str(f) for f in files]
    return []


def _compose_failure_summary(category: str, result: str, review: str, bugs: str) -> str:
    parts = [f"[{category}]"]
    if bugs:
        parts.append(bugs)
    elif review:
        parts.append(review)
    elif result:
        parts.append(result)
    text = " ".join(parts)
    if len(text) > _MAX_SUMMARY_CHARS:
        text = text[: _MAX_SUMMARY_CHARS - 3] + "..."
    return text
