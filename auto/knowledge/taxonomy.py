"""Canonical failure taxonomy for AUTO v2 self-evolution."""

from __future__ import annotations

from typing import Final

# Canonical failure categories — the single source of truth.
# Every failure recorded in incidents, lessons, or metrics MUST use one of these.
FAILURE_CATEGORIES: Final[frozenset[str]] = frozenset({
    "infra_timeout",
    "dev_server_unhealthy",
    "empty_diff",
    "artifact_drift",
    "sibling_drift",
    "scope_drift_blocked",
    "review_blocked",
    "verify_blocked",
    "gate_tsc",
    "gate_lint",
    "gate_e2e",
    "qa_fix_loop_exhausted",
    "qa_fix_budget_exhausted",
    "budget_exceeded",
    "requirement_scope_gap",
    "unknown",
})

# Deterministic mapping from raw block_reason strings to canonical categories.
_BLOCK_REASON_MAP: Final[dict[str, str]] = {
    "empty_diff": "empty_diff",
    "artifact_drift": "artifact_drift",
    "sibling_drift": "sibling_drift",
    "scope_drift": "scope_drift_blocked",
    "scope_drift_blocked": "scope_drift_blocked",
    "review_block": "review_blocked",
    "review_blocked": "review_blocked",
    "verify_block": "verify_blocked",
    "verify_blocked": "verify_blocked",
    "budget_exceeded": "budget_exceeded",
    "qa_fix_loop_exhausted": "qa_fix_loop_exhausted",
    "qa_fix_budget_exhausted": "qa_fix_budget_exhausted",
    "dependency_blocked": "unknown",
    "epic_cascade_blocked": "unknown",
}


def classify_block_reason(block_reason: str) -> str:
    """Map a raw block_reason string to a canonical failure category.

    Returns ``"unknown"`` for any unrecognized input.
    """
    if not block_reason:
        return "unknown"
    canonical = _BLOCK_REASON_MAP.get(block_reason)
    if canonical:
        return canonical
    # Second pass: check if it already IS a canonical category.
    if block_reason in FAILURE_CATEGORIES:
        return block_reason
    return "unknown"


def normalize_failure_category(raw: str) -> str:
    """Ensure *raw* is a valid canonical category, falling back to ``"unknown"``."""
    if raw in FAILURE_CATEGORIES:
        return raw
    return classify_block_reason(raw)
