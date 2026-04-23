"""Scope drift helpers for AUTO v2."""

from __future__ import annotations

DRIFT_EXPAND = "expand_scope"
DRIFT_REVERT = "revert"
DRIFT_BLOCK = "block"


def adjudicate_drift(
    drift_files: list[str],
    scope_files: list[str],
    drift_config: dict | None = None,
) -> list[dict]:
    config = drift_config or {}
    forbidden = tuple(config.get("forbidden", []))
    threshold = int(config.get("expand_threshold", 5))
    decisions: list[dict] = []
    expand_count = 0
    scope_set = set(scope_files)
    for path in drift_files:
        if any(path.startswith(prefix) for prefix in forbidden):
            decisions.append({"path": path, "action": DRIFT_BLOCK, "reason": "forbidden_path"})
            continue
        if path in scope_set:
            decisions.append({"path": path, "action": DRIFT_EXPAND, "reason": "in_scope"})
            expand_count += 1
            continue
        decisions.append({"path": path, "action": DRIFT_REVERT, "reason": "unrelated_change"})
    if expand_count > threshold:
        for decision in decisions:
            if decision["action"] == DRIFT_EXPAND:
                decision["action"] = DRIFT_BLOCK
                decision["reason"] = "expand_threshold_exceeded"
    return decisions
