"""Spec review orchestration for AUTO v2."""

from __future__ import annotations

import datetime as dt
import os
from pathlib import Path
from typing import Any

from auto.evidence.scorecards import write_spec_scorecard
from auto.orchestrator.intake import persist_json
from auto.runtime.agent_runner import run_stage


def run_spec_review(
    item_dir: str | Path,
    requirement: str,
    spec_kind: str,
    workflow: dict,
    *,
    design_brief_path: "Path | None" = None,
) -> dict:
    """Run spec review through the configured stage agent and persist artifacts.

    Per the /auto:add skill Step 4.b, the reviewer MUST see both the original
    requirement AND the proposed spec content. Passing only the raw requirement
    means the reviewer cannot produce an adversarial judgment.

    This function also attaches provenance metadata (reviewer, stage_agent_mode,
    raw_output_path) so audit can distinguish real Codex verdicts from
    heuristic fallbacks or orchestrator-builtin (denied) paths.
    """
    item_dir = Path(item_dir)
    spec_content = _read_spec_artifact(item_dir, spec_kind)

    # Requirement payload = REQUIREMENT body + SPEC body, per skill Step 4.b.
    # If a design brief exists, append it so the reviewer sees the design target.
    combined_requirement = requirement
    if spec_content:
        combined_requirement = (
            requirement.rstrip() + "\n\n---\n\n# SPEC\n\n" + spec_content.rstrip()
        )
    brief_content = _read_design_brief(design_brief_path)
    if brief_content:
        combined_requirement = (
            combined_requirement.rstrip() + "\n\n---\n\n# DESIGN BRIEF\n\n" + brief_content.rstrip()
        )

    payload: dict[str, Any] = {
        "requirement": combined_requirement,
        "title": spec_kind,
        "spec_kind": spec_kind,
    }
    result = run_stage("spec_review", payload, workflow)

    # Persist the untouched stage agent output for audit BEFORE we augment it
    # with orchestrator provenance. That way .spec-review-raw.json reflects
    # exactly what the reviewer said.
    raw_path = item_dir / ".spec-review-raw.json"
    persist_json(raw_path, result)

    # Augment with provenance for SPEC-REVIEW.json only.
    enriched = dict(result)
    enriched.setdefault("reviewer", _derive_reviewer(result, workflow))
    enriched.setdefault("stage_agent_mode", _derive_stage_mode())
    enriched.setdefault("reviewed_at", dt.datetime.now(dt.timezone.utc).isoformat())
    enriched["raw_output_path"] = raw_path.name

    persist_json(item_dir / "SPEC-REVIEW.json", enriched)
    write_spec_scorecard(item_dir, enriched)
    return enriched


def _read_design_brief(design_brief_path: "Path | None") -> str:
    """Read the DESIGN-BRIEF.md content if it exists."""
    if design_brief_path is None:
        return ""
    path = Path(design_brief_path)
    if not path.exists():
        return ""
    try:
        return path.read_text(encoding="utf-8")
    except OSError:
        return ""


def _read_spec_artifact(item_dir: Path, spec_kind: str) -> str:
    """Read the SPEC artifact body (SPEC.md or SPEC-LITE.md)."""
    candidates = []
    if spec_kind == "spec":
        candidates.append(item_dir / "SPEC.md")
        candidates.append(item_dir / "SPEC-LITE.md")
    else:
        candidates.append(item_dir / "SPEC-LITE.md")
        candidates.append(item_dir / "SPEC.md")
    for path in candidates:
        if path.exists():
            try:
                return path.read_text(encoding="utf-8")
            except OSError:
                return ""
    return ""


def _derive_reviewer(result: dict, workflow: dict) -> str:
    """Derive the reviewer identity for audit purposes.

    Priority:
    1. If stage agent result already tagged itself (e.g. builtin path), use that.
    2. If result has fallback_reason, it was heuristic fallback from
       scripts/auto-stage-agent.py. Tag accordingly.
    3. Otherwise use the configured route name (e.g. "codex").
    """
    existing = result.get("reviewer")
    if existing:
        return str(existing)
    fallback_reason = result.get("fallback_reason")
    if fallback_reason:
        return f"heuristic-fallback:{fallback_reason}"
    route = workflow.get("agents", {}).get("spec_review", "builtin")
    if route == "builtin":
        return "orchestrator_builtin"
    return f"external:{route}"


def _derive_stage_mode() -> str:
    """Best-effort read of AUTO_STAGE_MODE from the orchestrator process env."""
    return os.environ.get("AUTO_STAGE_MODE", "auto").strip() or "auto"
