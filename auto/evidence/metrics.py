"""Lightweight metrics aggregation for AUTO v2 self-evolution.

Reads ``incidents.jsonl`` and ``lessons.jsonl`` to compute actionable
statistics.  Output is written to ``.auto/knowledge/metrics.json``.
"""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path
from typing import Any


def compute_metrics(
    *,
    knowledge_dir: str | Path,
    runtime_dir: str | Path,
) -> dict[str, Any]:
    """Return a metrics dict covering fix-loop health and lessons efficacy."""
    knowledge_dir = Path(knowledge_dir)
    runtime_dir = Path(runtime_dir)

    incidents = _load_jsonl(knowledge_dir / "incidents.jsonl")
    lessons = _load_jsonl(runtime_dir / "lessons.jsonl")
    rules = _load_jsonl(knowledge_dir / "rules.jsonl")
    recurrence_by_category = _recurrence_by_category(incidents)
    recurrence_by_root_cause = _recurrence_by_root_cause(incidents)
    top_root_causes = dict(sorted(recurrence_by_root_cause.items(), key=lambda kv: kv[1], reverse=True)[:5])
    mean_attempts = _mean_attempts(incidents)
    matchable_lessons_count = _matchable_lessons_count(lessons)
    injected_lessons_count = _injected_lessons_count(lessons)
    lessons_with_outcomes_count = _lessons_with_outcomes_count(lessons)
    effective_lessons_count = _effective_lessons_count(lessons)
    lesson_effectiveness_rate = _lesson_effectiveness_rate(lessons)
    preflight_checks_run_count = _preflight_checks_run_count(lessons)
    preflight_failed_count = _preflight_status_count(lessons, "failed")
    preflight_warning_count = _preflight_status_count(lessons, "warning")
    top_preflight_rules = _top_preflight_rules(lessons)
    top_preflight_match_task_kinds = _top_preflight_match_task_kinds(lessons)
    top_preflight_match_scope_globs = _top_preflight_match_scope_globs(lessons)
    rules_summary = _rules_lifecycle_summary(rules)

    return {
        "fix_loop_success_rate": _fix_loop_success_rate(incidents),
        "recurrence_rate_by_category": recurrence_by_category,
        "recurrence_rate_by_root_cause": recurrence_by_root_cause,
        "top_root_causes": top_root_causes,
        "mean_attempts_to_resolution": mean_attempts,
        "matchable_lessons_count": matchable_lessons_count,
        "injected_lessons_count": injected_lessons_count,
        "lessons_with_outcomes_count": lessons_with_outcomes_count,
        "effective_lessons_count": effective_lessons_count,
        "lesson_effectiveness_rate": lesson_effectiveness_rate,
        "preflight_checks_run_count": preflight_checks_run_count,
        "preflight_failed_count": preflight_failed_count,
        "preflight_warning_count": preflight_warning_count,
        "top_preflight_rules": top_preflight_rules,
        "top_preflight_match_task_kinds": top_preflight_match_task_kinds,
        "top_preflight_match_scope_globs": top_preflight_match_scope_globs,
        "preflight": {
            "checks_run_count": preflight_checks_run_count,
            "failed_count": preflight_failed_count,
            "warning_count": preflight_warning_count,
            "top_rules": top_preflight_rules,
            "top_match_task_kinds": top_preflight_match_task_kinds,
            "top_match_scope_globs": top_preflight_match_scope_globs,
        },
        "rules": rules_summary,
        "incidents": {
            "total": len(incidents),
            "recurrence_by_category": recurrence_by_category,
            "recurrence_by_root_cause": recurrence_by_root_cause,
            "top_root_causes": top_root_causes,
            "mean_attempts_to_resolution": mean_attempts,
        },
        "lessons": {
            "total": len(lessons),
            "matchable_count": matchable_lessons_count,
            "injected_count": injected_lessons_count,
            "outcome_count": lessons_with_outcomes_count,
            "effective_count": effective_lessons_count,
            "effectiveness_rate": lesson_effectiveness_rate,
        },
        "total_incidents": len(incidents),
        "total_lessons": len(lessons),
    }


def write_metrics(knowledge_dir: str | Path, metrics: dict[str, Any]) -> Path:
    """Persist metrics to ``metrics.json``."""
    kdir = Path(knowledge_dir)
    kdir.mkdir(parents=True, exist_ok=True)
    path = kdir / "metrics.json"
    path.write_text(json.dumps(metrics, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return path


def build_metrics_summary(metrics: dict[str, Any]) -> dict[str, Any]:
    """Return a compact summary suitable for embedding in daily reports."""
    recurrence = metrics.get("recurrence_rate_by_category", {})
    top_categories = sorted(recurrence.items(), key=lambda kv: kv[1], reverse=True)[:5]
    root_causes = metrics.get("recurrence_rate_by_root_cause", {})
    top_root_causes = sorted(root_causes.items(), key=lambda kv: kv[1], reverse=True)[:5]
    return {
        "fix_loop_success_rate": metrics.get("fix_loop_success_rate", 0.0),
        "mean_attempts_to_resolution": metrics.get("mean_attempts_to_resolution", 0.0),
        "total_incidents": metrics.get("total_incidents", 0),
        "top_recurring_categories": dict(top_categories),
        "top_root_causes": dict(top_root_causes),
        "matchable_lessons_count": metrics.get("matchable_lessons_count", 0),
        "lesson_effectiveness_rate": metrics.get("lesson_effectiveness_rate", 0.0),
        "effective_lessons_count": metrics.get("effective_lessons_count", 0),
        "preflight_checks_run_count": metrics.get("preflight_checks_run_count", 0),
        "preflight_failed_count": metrics.get("preflight_failed_count", 0),
        "preflight_warning_count": metrics.get("preflight_warning_count", 0),
        "top_preflight_rules": metrics.get("top_preflight_rules", {}),
        "top_preflight_match_task_kinds": metrics.get("top_preflight_match_task_kinds", {}),
        "top_preflight_match_scope_globs": metrics.get("top_preflight_match_scope_globs", {}),
        "preflight": metrics.get("preflight", {}),
        "rules": metrics.get("rules", {}),
        "incidents": metrics.get("incidents", {}),
        "lessons": metrics.get("lessons", {}),
    }


# ── Private helpers ──────────────────────────────────────────────────────


def _load_jsonl(path: Path) -> list[dict[str, Any]]:
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


def _fix_loop_success_rate(incidents: list[dict[str, Any]]) -> float:
    """Fraction of fix-loop incidents that eventually resolved.

    An incident with category ``qa_fix_loop_exhausted`` or
    ``qa_fix_budget_exhausted`` is a failure; a ``fix_loop_resolved``
    type is a success.
    """
    fix_opened = sum(1 for i in incidents if i.get("stage") == "fix_loop_opened")
    fix_resolved = sum(1 for i in incidents if i.get("stage") == "fix_loop_resolved")
    fix_exhausted = sum(
        1 for i in incidents
        if i.get("category") in ("qa_fix_loop_exhausted", "qa_fix_budget_exhausted")
    )
    total = fix_resolved + fix_exhausted
    if total == 0:
        # Fall back to opened vs exhausted if no explicit resolved events yet
        total = fix_opened
        if total == 0:
            return 1.0
        return max(0.0, 1.0 - fix_exhausted / total)
    return fix_resolved / total


def _recurrence_by_category(incidents: list[dict[str, Any]]) -> dict[str, int]:
    counter: Counter[str] = Counter()
    for inc in incidents:
        cat = inc.get("category", "unknown")
        counter[cat] += 1
    return dict(counter)


def _mean_attempts(incidents: list[dict[str, Any]]) -> float:
    """Average attempt_count across incidents that have a non-zero count."""
    attempts = [int(i.get("attempt_count", 0)) for i in incidents if int(i.get("attempt_count", 0)) > 0]
    if not attempts:
        return 0.0
    return round(sum(attempts) / len(attempts), 2)


def _recurrence_by_root_cause(incidents: list[dict[str, Any]]) -> dict[str, int]:
    counter: Counter[str] = Counter()
    for inc in incidents:
        root_cause = inc.get("root_cause_label") or inc.get("category", "unknown")
        counter[str(root_cause or "unknown")] += 1
    return dict(counter)


def _matchable_lessons_count(lessons: list[dict[str, Any]]) -> int:
    """Count lesson records that are *matchable* — i.e. have enough
    structured content (category + lesson/summary text) for the lessons
    matcher to score and potentially inject them.

    This is a proxy for "how many lessons could contribute to future
    tasks", not "how many were actually injected".  True injection
    tracking requires a ``matched_to`` stamp (not yet implemented).
    """
    return sum(
        1 for lesson in lessons
        if lesson.get("category") and (lesson.get("lesson") or lesson.get("summary"))
    )


def _injected_lessons_count(lessons: list[dict[str, Any]]) -> int:
    return sum(1 for lesson in lessons if lesson.get("type") == "lesson_injected" and lesson.get("lesson_id"))


def _lessons_with_outcomes_count(lessons: list[dict[str, Any]]) -> int:
    return sum(1 for lesson in lessons if lesson.get("type") == "lesson_outcome" and lesson.get("lesson_id"))


def _effective_lessons_count(lessons: list[dict[str, Any]]) -> int:
    """Count outcomes that correlate with a successful post-injection task result.

    This is intentionally a correlation-based proxy, not causal proof.
    """
    lesson_categories = {
        lesson.get("lesson_id"): lesson.get("category", "")
        for lesson in lessons
        if lesson.get("lesson_id") and lesson.get("category")
    }
    effective = 0
    for lesson in lessons:
        if lesson.get("type") != "lesson_outcome":
            continue
        lesson_id = lesson.get("lesson_id")
        if not lesson_id:
            continue
        if lesson.get("outcome") != "passed":
            continue
        final_category = str(lesson.get("final_category", "") or "")
        lesson_category = str(lesson_categories.get(lesson_id, "") or "")
        if not lesson_category:
            continue
        if final_category != lesson_category:
            effective += 1
    return effective


def _lesson_effectiveness_rate(lessons: list[dict[str, Any]]) -> float:
    evaluable_outcomes = _evaluable_lesson_outcomes_count(lessons)
    if evaluable_outcomes == 0:
        return 0.0
    return round(_effective_lessons_count(lessons) / evaluable_outcomes, 2)


def _evaluable_lesson_outcomes_count(lessons: list[dict[str, Any]]) -> int:
    lesson_categories = {
        lesson.get("lesson_id"): lesson.get("category", "")
        for lesson in lessons
        if lesson.get("lesson_id") and lesson.get("category")
    }
    return sum(
        1
        for lesson in lessons
        if lesson.get("type") == "lesson_outcome"
        and lesson.get("lesson_id")
        and lesson_categories.get(lesson.get("lesson_id"))
    )


def _preflight_checks_run_count(lessons: list[dict[str, Any]]) -> int:
    return sum(1 for lesson in lessons if lesson.get("type") == "preflight_result")


def _preflight_status_count(lessons: list[dict[str, Any]], status: str) -> int:
    return sum(
        1
        for lesson in lessons
        if lesson.get("type") == "preflight_result" and lesson.get("status") == status
    )


def _top_preflight_rules(lessons: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    stats: dict[str, dict[str, Any]] = {}
    for lesson in lessons:
        if lesson.get("type") != "preflight_result":
            continue
        rule_id = str(lesson.get("rule_id", "")).strip()
        if not rule_id:
            continue
        bucket = stats.setdefault(rule_id, {"count": 0, "failed": 0, "warning": 0, "passed": 0})
        bucket["count"] += 1
        status = str(lesson.get("status", "")).strip().lower()
        if status in bucket:
            bucket[status] += 1
    for bucket in stats.values():
        count = bucket["count"] or 1
        bucket["block_rate"] = round(bucket["failed"] / count, 2)
        bucket["warning_rate"] = round(bucket["warning"] / count, 2)
    ordered = sorted(stats.items(), key=lambda item: item[1]["count"], reverse=True)[:5]
    return dict(ordered)


def _top_preflight_match_task_kinds(lessons: list[dict[str, Any]]) -> dict[str, int]:
    counter: Counter[str] = Counter()
    for lesson in lessons:
        if lesson.get("type") != "preflight_result":
            continue
        matched_on = lesson.get("matched_on", {}) or {}
        for kind in matched_on.get("task_kinds", []) or []:
            counter[str(kind)] += 1
    return dict(counter.most_common(5))


def _top_preflight_match_scope_globs(lessons: list[dict[str, Any]]) -> dict[str, int]:
    counter: Counter[str] = Counter()
    for lesson in lessons:
        if lesson.get("type") != "preflight_result":
            continue
        matched_on = lesson.get("matched_on", {}) or {}
        for scope_glob in matched_on.get("scope_globs", []) or []:
            counter[str(scope_glob)] += 1
    return dict(counter.most_common(5))


def _rules_lifecycle_summary(rules: list[dict[str, Any]]) -> dict[str, int]:
    counter: Counter[str] = Counter()
    for rule in rules:
        state = str(rule.get("lifecycle_state", "active") or "active")
        counter[state] += 1
    return {
        "total": len(rules),
        "active": counter.get("active", 0),
        "suppressed": counter.get("suppressed", 0),
        "retired": counter.get("retired", 0),
    }
