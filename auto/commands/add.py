"""Implementation for `/auto:add`."""

from __future__ import annotations

from pathlib import Path
from typing import Any

from auto.orchestrator.design import maybe_write_design
from auto.orchestrator.intake import build_spec_artifact, prepare_work_item
from auto.orchestrator.qa_units import build_qa_units
from auto.orchestrator.spec_review import run_spec_review
from auto.orchestrator.task_split import build_tasks
from auto.runtime.queue import append_queue_entries
from auto.schemas.budget import BudgetExceededError, BudgetTracker, estimate_tokens
from auto.schemas.workflow import load_workflow_config


def add_work_item(
    project_root: str | Path,
    requirement: str,
    *,
    priority: str | None = None,
    owner: str | None = None,
    notes: str | None = None,
    force_full_spec: bool = False,
    force_spec_lite: bool = False,
) -> dict[str, Any]:
    requirement = requirement.strip()
    if not requirement:
        return {
            "status": "error",
            "failure_stage": "input",
            "failure_reason": "requirement is empty",
            "partial_artifacts": False,
            "next_step": "provide a non-empty requirement",
        }

    from auto.orchestrator.intake import should_use_full_spec

    paths, item_id, item_dir = prepare_work_item(project_root, requirement)
    workflow = load_workflow_config(paths.workflow_file)
    budget = BudgetTracker(workflow.get("budget", {}))
    use_full_spec = should_use_full_spec(requirement, force_full_spec, force_spec_lite)
    spec_kind, spec_path = build_spec_artifact(item_dir, requirement, use_full_spec)
    try:
        spec_tokens = estimate_tokens(requirement, spec_kind)
        budget.record("spec_review", spec_tokens)
        budget.write_usage(paths.runtime_dir, slug=item_id, stage="spec_review", tokens=spec_tokens)
    except BudgetExceededError as exc:
        return {
            "status": "error",
            "failure_stage": "budget",
            "failure_reason": str(exc),
            "partial_artifacts": True,
            "work_item_id": item_id,
            "next_step": "raise the intake budget or simplify the requirement",
        }
    review_payload = run_spec_review(item_dir, requirement, spec_kind, workflow)
    verdict = review_payload.get("verdict", "error")
    # Only pass/warn verdicts are allowed to produce TASKS/QA-UNITS/TASK-QUEUE.
    # Any other verdict (block, needs_revision, block_revise, or an unknown value)
    # must hard-stop here. The Step 4.f revise loop and block handling are
    # skill-level (orchestrator) concerns — the in-process runtime must NOT
    # silent-ship a non-pass spec by treating unknown verdicts as a default pass.
    if verdict not in {"pass", "warn"}:
        reason = "spec review blocked the requirement" if verdict == "block" else (
            f"spec review returned non-pass verdict '{verdict}'; TASKS / QA-UNITS / TASK-QUEUE "
            "were not produced. Run the Step 4.f revise loop (skill contract) or amend the "
            "requirement before retrying."
        )
        return {
            "status": "error",
            "failure_stage": "spec_review",
            "failure_reason": reason,
            "spec_review_verdict": verdict,
            "partial_artifacts": True,
            "work_item_id": item_id,
            "next_step": "revise the spec per reviewer issues, or amend the requirement, then rerun /auto:add",
        }

    design_path = maybe_write_design(item_dir, requirement)
    tasks = build_tasks(item_dir, item_id, requirement, paths.queue_file)
    qa_units = build_qa_units(item_dir, item_id, requirement, tasks)
    queue_entries = append_queue_entries(paths.queue_file, [task.to_queue_entry() for task in tasks])
    artifacts = [
        str(item_dir / "REQUIREMENT.md"),
        str(spec_path),
        str(item_dir / "SPEC-REVIEW.json"),
        str(item_dir / "TASKS.json"),
        str(item_dir / "QA-UNITS.json"),
    ]
    if design_path is not None:
        artifacts.append(str(design_path))
    return {
        "status": "ok",
        "summary": f"Created {item_id} with {len(tasks)} tasks and {len(qa_units)} QA units.",
        "work_item_id": item_id,
        "spec_type": spec_kind,
        "spec_review_verdict": review_payload.get("verdict", "error"),
        "design_created": design_path is not None,
        "task_count": len(tasks),
        "qa_unit_count": len(qa_units),
        "queue_count": len(queue_entries),
        "artifacts": artifacts,
        "priority": priority,
        "owner": owner,
        "notes": notes,
    }
