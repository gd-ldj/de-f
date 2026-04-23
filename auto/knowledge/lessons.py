"""Lessons matching for AUTO v2 — ported from GSD ``_build_lessons_context``.

Returns structured lesson records (not prompt strings) so callers can
control serialisation and payload size independently.
"""

from __future__ import annotations

import datetime as dt
import fnmatch
import json
from pathlib import Path
from typing import Any

from auto.knowledge.taxonomy import FAILURE_CATEGORIES

# ── Defaults ─────────────────────────────────────────────────────────────

MAX_LESSONS_DEV = 3
MAX_LESSONS_FIX = 3
MAX_LESSON_AGE_DAYS = 30
MAX_SUMMARY_CHARS = 180
MAX_PER_CATEGORY = 2

# ── Scoring weights (same hierarchy as GSD) ──────────────────────────────

_SCORE_SAME_EPIC = 3.0
_SCORE_SAME_CATEGORY_FIX = 2.5
_SCORE_SAME_CATEGORY_DEV = 1.5
_SCORE_SAME_WORK_ITEM = 2.0
_SCORE_SCOPE_OVERLAP = 1.0


def match_lessons(
    *,
    lessons_dir: Path,
    slug: str,
    scope_files: list[str],
    work_item_id: str = "",
    failure_category: str | None = None,
    max_results: int | None = None,
) -> list[dict[str, Any]]:
    """Return a ranked list of relevant lesson records.

    Parameters
    ----------
    lessons_dir:
        Directory containing ``lessons.jsonl`` (the legacy AUTO runtime dir).
    slug:
        Current task slug — excluded from results.
    scope_files:
        Planned scope files for the current task.
    work_item_id:
        Current work-item id for work-item–level matching.
    failure_category:
        If set, we're in a fix context; boosts same-category lessons.
    max_results:
        Hard cap on returned lessons. Defaults to ``MAX_LESSONS_FIX`` when
        *failure_category* is set, ``MAX_LESSONS_DEV`` otherwise.
    """
    is_fix = failure_category is not None
    limit = max_results or (MAX_LESSONS_FIX if is_fix else MAX_LESSONS_DEV)

    raw = _load_lessons(lessons_dir)
    if not raw:
        return []

    # Filter by age — support both "timestamp" (AUTO v2) and "ts" (legacy GSD).
    cutoff = (dt.datetime.now(dt.UTC) - dt.timedelta(days=MAX_LESSON_AGE_DAYS)).isoformat(timespec="seconds")
    raw = [r for r in raw if (r.get("timestamp") or r.get("ts", "")) >= cutoff]

    # Exclude self
    raw = [r for r in raw if r.get("slug") != slug]
    if not raw:
        return []

    epic = _detect_epic(slug)

    scored: list[tuple[float, dict[str, Any]]] = []
    for lesson in raw:
        score = _score_lesson(lesson, epic=epic, scope_files=scope_files, work_item_id=work_item_id, failure_category=failure_category, is_fix=is_fix)
        if score > 0:
            scored.append((score, lesson))

    if not scored:
        return []

    scored.sort(key=lambda pair: pair[0], reverse=True)

    # Enforce per-category cap
    results: list[dict[str, Any]] = []
    category_counts: dict[str, int] = {}
    for _score, lesson in scored:
        cat = lesson.get("category", "unknown")
        if category_counts.get(cat, 0) >= MAX_PER_CATEGORY:
            continue
        results.append(_normalize_lesson(lesson))
        category_counts[cat] = category_counts.get(cat, 0) + 1
        if len(results) >= limit:
            break

    return results


# ── Private helpers ──────────────────────────────────────────────────────


def _load_lessons(lessons_dir: Path) -> list[dict[str, Any]]:
    path = lessons_dir / "lessons.jsonl"
    if not path.exists():
        return []
    records: list[dict[str, Any]] = []
    try:
        for line in path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line:
                continue
            try:
                records.append(json.loads(line))
            except json.JSONDecodeError:
                continue
    except OSError:
        return []
    return records


def _detect_epic(slug: str) -> str:
    """Extract an epic prefix from a task slug (e.g. ``podcast`` from ``podcast-1``)."""
    parts = slug.split("-")
    if len(parts) >= 2:
        return parts[0]
    return ""


def _score_lesson(
    lesson: dict[str, Any],
    *,
    epic: str,
    scope_files: list[str],
    work_item_id: str,
    failure_category: str | None,
    is_fix: bool,
) -> float:
    score = 0.0

    # Same epic
    lesson_epic = _detect_epic(lesson.get("slug", ""))
    if epic and lesson_epic == epic:
        score += _SCORE_SAME_EPIC

    # Same failure category
    if failure_category and lesson.get("category") == failure_category:
        score += _SCORE_SAME_CATEGORY_FIX if is_fix else _SCORE_SAME_CATEGORY_DEV

    # Same work item
    if work_item_id and lesson.get("work_item_id") == work_item_id:
        score += _SCORE_SAME_WORK_ITEM

    # Scope overlap
    lesson_relevance = lesson.get("relevance", [])
    if not lesson_relevance:
        # Fallback: use slug-based scope hints from legacy lessons
        lesson_scope = lesson.get("scope_files", [])
        if isinstance(lesson_scope, list):
            lesson_relevance = lesson_scope
    for rel in lesson_relevance:
        if rel in FAILURE_CATEGORIES:
            continue
        for scope_file in scope_files:
            if fnmatch.fnmatch(scope_file, rel) or fnmatch.fnmatch(rel, scope_file):
                score += _SCORE_SCOPE_OVERLAP
                break

    return score


def _normalize_lesson(lesson: dict[str, Any]) -> dict[str, Any]:
    """Return a compact lesson record suitable for payload injection."""
    summary = str(lesson.get("lesson", lesson.get("summary", ""))).strip()
    if not summary:
        summary = f"{lesson.get('type', 'event')}: {lesson.get('slug', '?')}"
    if len(summary) > MAX_SUMMARY_CHARS:
        summary = summary[: MAX_SUMMARY_CHARS - 3] + "..."
    return {
        "lesson_id": lesson.get("lesson_id", ""),
        "slug": lesson.get("slug", ""),
        "category": lesson.get("category", "unknown"),
        "summary": summary,
        "timestamp": lesson.get("timestamp") or lesson.get("ts", ""),
    }


def _safe_read_json(path: Path) -> Any:
    if not path.exists():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return None
