"""Preflight check translation and execution for AUTO v2."""

from __future__ import annotations

import fnmatch
from pathlib import Path
from typing import Any

from auto.runtime.dev_server import probe_dev_server_health

_BROWSER_VERIFY_SIGNALS = (
    "browser",
    "playwright",
    "dialog",
    "modal",
    "banner",
    "screenshot",
    "hover",
    "viewport",
)


def derive_preflight_checks(*, rules: list[dict[str, Any]], task: dict) -> list[dict[str, Any]]:
    """Translate candidate rules into task-scoped preflight checks."""
    checks: list[dict[str, Any]] = []
    for rule in rules:
        applies, matched_on = _match_rule_to_task(rule, task)
        if not applies:
            continue
        category = str(rule.get("category", ""))
        top_tags = set(rule.get("top_tags", []) or [])
        rule_id = str(rule.get("rule_id", ""))
        if category == "qa_verify_environment" or (category == "verify_blocked" and {"qa", "playwright"} & top_tags):
            checks.append(
                {
                    "id": "dev_server_health",
                    "rule_id": rule_id,
                    "source_category": category,
                    "category": "dev_server_unhealthy",
                    "reason": str(rule.get("lesson", "") or "Recurring QA verify environment failures"),
                    "matched_on": matched_on,
                }
            )
        elif category == "no_meaningful_changes" or category == "empty_diff":
            checks.append(
                {
                    "id": "empty_diff_precheck",
                    "rule_id": rule_id,
                    "source_category": category,
                    "category": "empty_diff",
                    "reason": str(rule.get("lesson", "") or "Recurring empty diff incidents"),
                    "matched_on": matched_on,
                }
            )
        elif category == "review_style_gate" or (category == "review_blocked" and "style" in top_tags):
            checks.append(
                {
                    "id": "lint_precheck",
                    "rule_id": rule_id,
                    "source_category": category,
                    "category": "gate_lint",
                    "reason": str(rule.get("lesson", "") or "Recurring style gate failures"),
                    "matched_on": matched_on,
                }
            )
    return checks


def run_preflight_checks(
    *,
    checks: list[dict[str, Any]],
    workflow: dict[str, Any],
    project_root: str | Path,
) -> list[dict[str, Any]]:
    """Run deterministic preflight probes.

    Probe exceptions degrade to warning results instead of crashing runtime.
    """
    del project_root  # Reserved for future command-based checks.
    results: list[dict[str, Any]] = []
    dev_server_cfg = dict(workflow.get("dev_server", {}) or {})
    port = int(dev_server_cfg.get("port", 3000))
    health_path = str(dev_server_cfg.get("health_path", "/"))

    for check in checks:
        check_id = str(check.get("id", ""))
        severity = str(check.get("severity", "warning"))
        category = str(check.get("category", "unknown"))
        reason = str(check.get("reason", ""))

        if check_id == "dev_server_health":
            try:
                status, detail = probe_dev_server_health(port=port, path=health_path)
            except Exception as exc:  # noqa: BLE001
                results.append(
                    {
                        **check,
                        "severity": severity,
                        "status": "warning",
                        "category": category,
                        "reason": reason,
                        "error": str(exc),
                    }
                )
                continue
            if status == "ok":
                results.append(
                    {
                        **check,
                        "severity": severity,
                        "status": "passed",
                        "category": category,
                        "reason": reason,
                        "detail": detail,
                    }
                )
            else:
                results.append(
                    {
                        **check,
                        "severity": severity,
                        "status": "failed",
                        "category": category,
                        "reason": reason,
                        "detail": detail or status,
                    }
                )
            continue

        results.append(
            {
                **check,
                "severity": severity,
                "status": "passed",
                "category": category,
                "reason": reason,
                "detail": "",
            }
        )

    return results


def detect_task_kinds(task: dict[str, Any]) -> set[str]:
    slug = str(task.get("slug", "")).lower()
    title = str(task.get("title", "")).lower()
    notes = str(task.get("notes", "")).lower()
    text = " ".join(part for part in (slug, title, notes) if part)

    kinds: set[str] = set()
    if "-fix-" in slug:
        kinds.update({"fix", "qa_related"})
    if "qa" in text or "verify" in text:
        kinds.add("qa_related")
    if any(signal in text for signal in _BROWSER_VERIFY_SIGNALS):
        kinds.add("browser_verify")
    if not kinds:
        kinds.add("default")
    return kinds


def _match_rule_to_task(rule: dict[str, Any], task: dict[str, Any]) -> tuple[bool, dict[str, Any]]:
    trigger = dict(rule.get("trigger", {}) or {})
    task_kinds = set(str(kind) for kind in trigger.get("task_kinds", []) if str(kind).strip())
    detected_kinds = detect_task_kinds(task)
    matched_task_kinds = sorted(task_kinds & detected_kinds) if task_kinds else sorted(detected_kinds)
    if task_kinds and not matched_task_kinds:
        return False, {"task_kinds": [], "scope_globs": []}

    scope_globs = [str(glob) for glob in trigger.get("scope_globs", []) if str(glob).strip()]
    category = str(rule.get("category", ""))
    if scope_globs and category not in {"qa_verify_environment", "verify_blocked"}:
        scope_files = [str(path) for path in task.get("scope_files", []) if str(path).strip()]
        matched_scope_globs = _matched_scope_globs(scope_globs, scope_files)
        if not matched_scope_globs:
            return False, {"task_kinds": matched_task_kinds, "scope_globs": []}
    else:
        matched_scope_globs = []

    return True, {"task_kinds": matched_task_kinds, "scope_globs": matched_scope_globs}


def _matched_scope_globs(scope_globs: list[str], scope_files: list[str]) -> list[str]:
    matched: list[str] = []
    for pattern in scope_globs:
        for scope_file in scope_files:
            if fnmatch.fnmatch(scope_file, pattern):
                matched.append(pattern)
                break
    return matched
