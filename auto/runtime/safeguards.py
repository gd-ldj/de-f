"""Safeguard checks preserved from GSD for AUTO v2."""

from __future__ import annotations

from auto.runtime.drift import DRIFT_BLOCK, adjudicate_drift
from auto.runtime.preflight import derive_preflight_checks


def detect_epic_prefix(slug_or_task) -> str:
    """Extract epic prefix from task dict or slug string.

    Prefers explicit 'epic' field on task dict; falls back to slug
    prefix.  Does NOT use work_item_id — that would cascade-block
    every task in the same work item, which is too coarse.
    """
    if isinstance(slug_or_task, dict):
        explicit = str(slug_or_task.get("epic", "")).strip()
        if explicit:
            return explicit
        slug = str(slug_or_task.get("slug", ""))
    else:
        slug = str(slug_or_task)
    return slug.split("-")[0] if "-" in slug else slug


def is_epic_blocked(task: dict, failed_epics: set[str]) -> bool:
    depends_on = task.get("depends_on", []) or []
    if depends_on:
        return False
    return detect_epic_prefix(task) in failed_epics


def has_blocking_dependencies(task: dict, tasks_by_slug: dict[str, dict]) -> bool:
    is_fix = bool(task.get("is_fix_task"))
    for dependency in task.get("depends_on", []) or []:
        dep_state = str(tasks_by_slug.get(dependency, {}).get("state", "pending"))
        # Fix tasks are allowed to run even when their parent is blocked
        # (they exist specifically to fix the parent's failure).
        if is_fix and dep_state == "blocked":
            continue
        if dep_state not in {"integrated", "completed", "passed"}:
            return True
    return False


def check_sibling_task_state_drift(current_slug: str, changed_files: list[str]) -> list[str]:
    bad: list[str] = []
    prefix = ".auto/tasks/"
    suffix = "/STATUS.json"
    for path in changed_files:
        if path.startswith(prefix) and path.endswith(suffix):
            sibling = path[len(prefix) : -len(suffix)]
            if sibling != current_slug:
                bad.append(path)
    return sorted(bad)


def check_artifact_drift(current_slug: str, changed_files: list[str]) -> list[str]:
    allowed_prefix = f".auto/tasks/{current_slug}/"
    bad: list[str] = []
    for path in changed_files:
        if not path.startswith(".auto/"):
            continue
        if path == ".auto/queue/TASK-QUEUE.md":
            continue
        if path.startswith(allowed_prefix):
            continue
        bad.append(path)
    return sorted(bad)


def check_empty_dev_diff(changed_files: list[str], bookkeeping: set[str] | None = None) -> bool:
    bookkeeping_files = bookkeeping or set()
    meaningful = [path for path in changed_files if path not in bookkeeping_files]
    return len(meaningful) == 0


def evaluate_scope_drift(scope_files: list[str], changed_files: list[str], config: dict | None = None) -> list[dict]:
    out_of_scope = [path for path in changed_files if path not in set(scope_files)]
    return adjudicate_drift(out_of_scope, scope_files, config)


def has_drift_block(decisions: list[dict]) -> bool:
    return any(decision.get("action") == DRIFT_BLOCK for decision in decisions)


def classify_preflight_severity(rule: dict) -> str:
    explicit = str(rule.get("severity", "")).strip().lower()
    if explicit in {"hard", "warning"}:
        return explicit
    if int(rule.get("confirmed_count", 0) or 0) >= 3:
        return "hard"
    return "warning"


def build_preflight_plan(*, rules: list[dict], task: dict) -> list[dict]:
    checks: list[dict] = []
    for rule in rules:
        if str(rule.get("lifecycle_state", "active") or "active") != "active":
            continue
        derived = derive_preflight_checks(rules=[rule], task=task)
        severity = classify_preflight_severity(rule)
        for check in derived:
            check["severity"] = severity
            checks.append(check)
    return checks
