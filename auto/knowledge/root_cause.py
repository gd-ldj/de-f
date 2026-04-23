"""Deterministic root-cause labels for AUTO v2 incidents."""

from __future__ import annotations


def classify_root_cause(
    *,
    category: str,
    stage: str,
    summary: str,
    tags: list[str],
) -> str:
    """Return a stable root-cause label for structured incident grouping."""
    lowered_stage = stage.lower()
    lowered_summary = summary.lower()
    tag_set = {str(tag).lower() for tag in tags}

    if category == "verify_blocked" and {"qa", "playwright"} & tag_set:
        if "dev server" in lowered_summary or "unavailable" in lowered_summary or "health check" in lowered_summary:
            return "qa_verify_environment"
        if any(keyword in lowered_summary for keyword in ("network error", "connection refused", "connection reset")):
            return "qa_verify_environment"
        if any(keyword in lowered_summary for keyword in ("clerk", "sign-in", "signin", "login", "auth", "authentication")):
            return "qa_verify_authentication"
        if any(keyword in lowered_summary for keyword in ("selector", "locator", "element not found", "unable to find", "missing element")):
            return "qa_verify_selector_drift"
    if category == "review_blocked":
        if "style" in tag_set or any(keyword in lowered_summary for keyword in ("style", "lint", "format")):
            return "review_style_gate"
        if any(keyword in lowered_summary for keyword in ("spec", "acceptance criteria", "requirement", "requirements")):
            return "review_requirement_gap"
        if any(keyword in lowered_summary for keyword in ("test", "coverage", "assertion")):
            return "review_test_gap"
    if category == "scope_drift_blocked":
        return "scope_boundary_violation"
    if category == "artifact_drift":
        return "artifact_boundary_violation"
    if category == "sibling_drift":
        return "sibling_state_violation"
    if category == "requirement_scope_gap":
        if any(keyword in lowered_summary for keyword in ("role", "admin", "user role", "super_admin", "permission")):
            return "requirement_role_qualifier_missing"
        return "requirement_scope_ambiguity"
    if category == "empty_diff":
        return "no_meaningful_changes"
    if category == "dev_server_unhealthy" and lowered_stage == "qa_verify":
        return "qa_verify_environment"
    return category or "unknown"
