"""Stage agent routing for AUTO v2."""

from __future__ import annotations

import json
import os
import subprocess
from pathlib import Path
from typing import Any

from auto.runtime.retry import retry_call


def run_stage(
    stage: str,
    payload: dict[str, Any],
    workflow: dict[str, Any],
    *,
    project_root: str | Path | None = None,
    artifact_dir: str | Path | None = None,
) -> dict[str, Any]:
    route = workflow.get("agents", {}).get(stage, "builtin")
    if route in {"command", "shell"}:
        return _run_command(stage, payload, workflow, project_root=project_root, artifact_dir=artifact_dir)
    if route != "builtin":
        command = workflow.get("agent_commands", {}).get(stage)
        if command:
            return _run_command(stage, payload, workflow, project_root=project_root, artifact_dir=artifact_dir)
        # Unknown route + no command. For spec_review this is a policy violation:
        # orchestrator self-review (builtin fallback) is forbidden per /auto:add skill.
        if stage == "spec_review" and not _allow_builtin_spec_review():
            return {
                "status": "error",
                "verdict": "block",
                "reason": (
                    f"spec_review routed to '{route}' but no agent_commands.spec_review configured; "
                    "orchestrator builtin fallback is forbidden for spec review. "
                    "Configure agents.spec_review with a real reviewer command, or set "
                    "AUTO_ALLOW_BUILTIN_SPEC_REVIEW=1 for development/testing."
                ),
                "reviewer": "orchestrator_builtin_denied",
            }
        return {
            "route": route,
            "status": "warn",
            "verdict": "warn",
            "reason": f"unsupported route {route}; builtin fallback used",
        }
    # route == "builtin". For spec_review, gate unless explicitly allowed for tests.
    if stage == "spec_review" and not _allow_builtin_spec_review():
        return {
            "status": "error",
            "verdict": "block",
            "reason": (
                "spec_review configured with route='builtin'; orchestrator self-review is forbidden. "
                "Set agents.spec_review to an external route (e.g. 'codex') with agent_commands.spec_review, "
                "or set AUTO_ALLOW_BUILTIN_SPEC_REVIEW=1 for development/testing."
            ),
            "reviewer": "orchestrator_builtin_denied",
        }
    result = _run_builtin(stage, payload)
    if stage == "spec_review":
        # Tag provenance so persisted SPEC-REVIEW.json makes it obvious this was
        # an opt-in builtin run, not a real reviewer verdict.
        result.setdefault("reviewer", "orchestrator_builtin")
    return result


def _allow_builtin_spec_review() -> bool:
    """Gate for the orchestrator-self-review path.

    Builtin spec_review is an orchestrator self-review path and is forbidden in
    production per the /auto:add skill. Tests opt in via env var.
    """
    flag = os.environ.get("AUTO_ALLOW_BUILTIN_SPEC_REVIEW", "").strip().lower()
    return flag in {"1", "true", "yes", "on"}


def _run_command(
    stage: str,
    payload: dict[str, Any],
    workflow: dict[str, Any],
    *,
    project_root: str | Path | None,
    artifact_dir: str | Path | None,
) -> dict[str, Any]:
    command = str(workflow.get("agent_commands", {}).get(stage, "")).strip()
    if not command:
        # Same policy as run_stage: spec_review must never silently fall back to
        # the orchestrator self-review path.
        if stage == "spec_review" and not _allow_builtin_spec_review():
            return {
                "status": "error",
                "verdict": "block",
                "reason": (
                    "spec_review route='command' but agent_commands.spec_review is empty; "
                    "orchestrator builtin fallback is forbidden for spec review."
                ),
                "reviewer": "orchestrator_builtin_denied",
            }
        builtin = _run_builtin(stage, payload)
        if stage == "spec_review":
            builtin.setdefault("reviewer", "orchestrator_builtin")
        return {
            "status": "warn",
            "verdict": "warn",
            "reason": f"missing external command for stage {stage}; builtin fallback used",
            **builtin,
        }
    cwd = Path(project_root or Path.cwd())
    env = os.environ.copy()
    env["AUTO_STAGE"] = stage
    env["AUTO_STAGE_PAYLOAD_JSON"] = json.dumps(payload, ensure_ascii=False)
    env["AUTO_PROJECT_ROOT"] = str(cwd)
    env["AUTO_ARTIFACT_DIR"] = str(Path(artifact_dir or cwd))
    timeout = int(workflow.get("agent_timeouts", {}).get(stage, 600))
    retry_config = dict(workflow.get("agent_retry", {}) or {})
    retry_attempts = max(int(retry_config.get("attempts", 2) or 1), 1)

    def invoke_command() -> subprocess.CompletedProcess[str]:
        try:
            return subprocess.run(
                command,
                shell=True,
                cwd=str(cwd),
                capture_output=True,
                text=True,
                timeout=timeout,
                env=env,
            )
        except (subprocess.TimeoutExpired, OSError) as exc:
            raise StageCommandRetryableError(str(exc)) from exc

    # For spec_review, transport/protocol failures must be verdict=block
    # (not warn) because add.py allows warn to proceed to task generation.
    fail_verdict = "block" if stage == "spec_review" else "warn"

    try:
        result = retry_call(invoke_command, attempts=retry_attempts, config=retry_config)
    except StageCommandRetryableError:
        return {
            "status": "error",
            "verdict": fail_verdict,
            "reason": f"external command failed before producing output for stage {stage}",
        }
    stdout = (result.stdout or "").strip()
    if result.returncode != 0:
        return {
            "status": "error",
            "verdict": fail_verdict,
            "reason": f"external command failed for stage {stage}",
            "stderr": (result.stderr or "").strip(),
        }
    try:
        parsed = json.loads(stdout) if stdout else {}
    except json.JSONDecodeError:
        return {
            "status": "error",
            "verdict": fail_verdict,
            "reason": f"external command returned non-json output for stage {stage}",
            "stdout": stdout[:500],
        }
    if not isinstance(parsed, dict):
        return {
            "status": "error",
            "verdict": fail_verdict,
            "reason": f"external command returned non-object json for stage {stage}",
        }
    # Validate required fields BEFORE setdefault so missing keys are caught.
    validated = _validate_stage_fields(stage, parsed)
    if validated is not None:
        return validated
    parsed.setdefault("status", "ok")
    parsed.setdefault("verdict", "pass")
    return parsed


def _validate_stage_fields(stage: str, parsed: dict[str, Any]) -> dict[str, Any] | None:
    """Check required fields for a stage result BEFORE setdefault.

    Returns an error dict if validation fails, None if the result is valid.
    This prevents an empty {} or partial JSON from being silently promoted
    to pass via setdefault.
    """
    required_map: dict[str, set[str]] = {
        "spec_review": {"status", "verdict", "summary", "issues", "total_score"},
        "task_dev": {"status", "verdict", "summary", "files_modified", "blockers"},
    }
    required = required_map.get(stage)
    if required is None:
        return None  # no validation for other stages
    missing = required - set(parsed.keys())
    if not missing:
        return None  # all fields present
    error_result: dict[str, Any] = {
        "status": "error",
        "verdict": "block",
        "reason": f"{stage} result missing required fields: {sorted(missing)}",
    }
    # Include the required fields in the error itself so downstream
    # consumers (spec_review.py) don't fail a second validation pass.
    if stage == "spec_review":
        error_result.setdefault("issues", [{
            "severity": "high",
            "description": f"Missing fields: {sorted(missing)}. Result cannot be trusted.",
        }])
        error_result.setdefault("total_score", 0)
    elif stage == "task_dev":
        error_result.setdefault("files_modified", [])
        error_result.setdefault("blockers", [f"missing fields: {sorted(missing)}"])
    return error_result


class StageCommandRetryableError(RuntimeError):
    """Transient command execution failure that is safe to retry."""


def _run_builtin(stage: str, payload: dict[str, Any]) -> dict[str, Any]:
    text = " ".join(str(payload.get(key, "")) for key in ("requirement", "title", "notes", "acceptance_boundary"))
    lowered = text.lower()
    if stage == "spec_review":
        verdict = "block" if "[spec-block]" in lowered else "pass"
        return {
            "status": "ok" if verdict != "block" else "error",
            "verdict": verdict,
            "summary": "spec review completed",
            "issues": [] if verdict == "pass" else [{"severity": "high", "description": "spec marker requested block"}],
            "total_score": 92 if verdict == "pass" else 40,
        }
    if stage == "task_dev":
        changed_files = [] if "[empty-diff]" in lowered else list(payload.get("planned_files", []))
        return {
            "status": "ok",
            "verdict": "pass",
            "summary": "task execution simulated",
            "files_modified": changed_files,
            "notes": payload.get("notes", ""),
            "blockers": [],
        }
    if stage == "task_review":
        verdict = "block" if "[review-block]" in lowered else "pass"
        return {
            "status": "ok" if verdict == "pass" else "error",
            "verdict": verdict,
            "summary": "task review completed",
            "issues": [] if verdict == "pass" else [{"severity": "high", "description": "review marker requested block"}],
            "scope_drift": "[scope-drift]" in lowered,
        }
    if stage == "task_verify":
        return {
            "status": "ok",
            "verdict": "pass",
            "reasoning": "task-level verify is optional in version 1",
            "criteria_checks": [],
            "evidence": [],
        }
    if stage == "qa_verify":
        attempts = int(payload.get("attempt_count", 0))
        if "[qa-fail-once]" in lowered and attempts == 0:
            return {
                "status": "error",
                "verdict": "block",
                "summary": "qa verify requested one fix loop",
                "bugs": [{"title": "Simulated QA failure", "severity": "high", "confidence": 0.9}],
            }
        if "[qa-block]" in lowered:
            return {
                "status": "error",
                "verdict": "block",
                "summary": "qa verify blocked",
                "bugs": [{"title": "Simulated QA block", "severity": "high", "confidence": 0.9}],
            }
        return {
            "status": "ok",
            "verdict": "pass",
            "summary": "qa verify completed",
            "bugs": [],
        }
    return {"status": "error", "verdict": "block", "summary": f"unsupported stage {stage}"}
