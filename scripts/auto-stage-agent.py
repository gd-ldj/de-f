#!/usr/bin/env python3
"""Default external stage agent wrapper for AUTO v2.

Reads stage context from environment variables and prints a JSON result.
The script supports two modes:
1. Heuristic fallback mode (default), which mirrors the lightweight builtin behavior
2. Pass-through mode when `AUTO_STAGE_FORWARD_COMMAND` is set, in which case it
   executes that command and forwards its JSON stdout
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
import tempfile
import time
from pathlib import Path
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from auto.runtime.codex_cli import build_exec_command, force_heuristic
from auto.runtime.stage_common import (
    command_exists,
    get_codex_bin,
    get_project_root,
    load_payload,
    maybe_dump_prompt,
)


def main() -> int:
    stage = os.environ.get("AUTO_STAGE", "").strip()
    payload = load_payload()
    forward_command = os.environ.get("AUTO_STAGE_FORWARD_COMMAND", "").strip()
    mode = os.environ.get("AUTO_STAGE_MODE", "auto").strip().lower()
    _maybe_dump_stage_prompt(stage, payload)

    if forward_command:
        result = _run_forward_command(forward_command)
    elif mode == "codex" and stage in {"spec_review", "task_dev"}:
        result = _run_codex_stage_strict(stage, payload)
    elif mode == "auto" and stage in {"spec_review", "task_dev"}:
        result = _run_auto_stage(stage, payload)
    else:
        result = _heuristic_result(stage, payload)
        # Tag heuristic results so the orchestrator Step 4.e can distinguish
        # them from real reviewer verdicts. Without this, a heuristic "pass"
        # would enter the canonical branch and be treated as a formal approval.
        result.setdefault("fallback_reason", "heuristic_mode")

    sys.stdout.write(json.dumps(result, ensure_ascii=False) + "\n")
    return 0


def _run_codex_stage_strict(stage: str, payload: dict) -> dict:
    """Pure-codex mode: no fallback to heuristic.

    If codex exec crashes/fails, we MUST NOT silent-downgrade to a heuristic
    verdict because the caller explicitly asked for Codex judgment. Tag the
    failure with `fallback_reason` so the orchestrator can distinguish a
    real codex verdict from a toolchain error, and set verdict='block' to
    prevent the /auto:add silent-ship pathway from proceeding.
    """
    codex_bin = get_codex_bin()
    if not command_exists(codex_bin):
        return {
            "status": "error",
            "verdict": "block",
            "summary": f"codex binary '{codex_bin}' not found; AUTO_STAGE_MODE=codex cannot proceed",
            "fallback_reason": "codex_unavailable_in_codex_mode",
            "issues": [{
                "severity": "high",
                "description": "Codex CLI not installed or not on PATH; cannot produce a spec review verdict.",
            }] if stage == "spec_review" else [],
            "total_score": 0 if stage == "spec_review" else None,
            "files_modified": [],
            "blockers": [f"codex binary '{codex_bin}' unavailable"],
        }
    if force_heuristic():
        # The user explicitly opted into codex but the runtime is in a forced-
        # heuristic guard (e.g. AUTO_FORCE_HEURISTIC=1). Surface that as a
        # hard error rather than silently downgrading.
        return {
            "status": "error",
            "verdict": "block",
            "summary": "AUTO_STAGE_MODE=codex but AUTO_FORCE_HEURISTIC is set; refusing to silent-downgrade",
            "fallback_reason": "codex_forced_off_in_codex_mode",
            "issues": [{
                "severity": "high",
                "description": "AUTO_FORCE_HEURISTIC conflicts with AUTO_STAGE_MODE=codex.",
            }] if stage == "spec_review" else [],
            "total_score": 0 if stage == "spec_review" else None,
            "files_modified": [],
            "blockers": ["AUTO_FORCE_HEURISTIC set while AUTO_STAGE_MODE=codex"],
        }
    result = _run_codex_stage(stage, payload)
    # If codex exec failed (status=error) in strict mode, tag it so the
    # orchestrator can distinguish toolchain failure from a real block verdict.
    if result.get("status") == "error":
        result.setdefault("fallback_reason", "codex_failed_in_codex_mode")
        # Promote verdict to block so /auto:add cannot silent-ship on a
        # status=error but verdict=warn return shape.
        if result.get("verdict") not in {"block"}:
            result["verdict"] = "block"
    return result


def _run_forward_command(command: str) -> dict:
    result = subprocess.run(
        command,
        shell=True,
        capture_output=True,
        text=True,
        timeout=900,
        env=os.environ.copy(),
    )
    # Protocol failures (non-zero exit, non-JSON output, non-object JSON) are
    # NOT revisable spec defects. Return verdict=block so /auto:add hard-stops
    # instead of entering the revise loop on a toolchain error.
    if result.returncode != 0:
        return {
            "status": "error",
            "verdict": "block",
            "reason": "forward command failed",
            "stderr": (result.stderr or "").strip()[:500],
            "fallback_reason": "forward_command_exec_failed",
        }
    stdout = (result.stdout or "").strip()
    try:
        parsed = json.loads(stdout) if stdout else {}
    except json.JSONDecodeError:
        return {
            "status": "error",
            "verdict": "block",
            "reason": "forward command returned non-json output",
            "stdout": stdout[:500],
            "fallback_reason": "forward_command_protocol_error",
        }
    if not isinstance(parsed, dict):
        return {
            "status": "error",
            "verdict": "block",
            "reason": "forward command returned non-object json",
            "fallback_reason": "forward_command_protocol_error",
        }
    # Validate BEFORE setdefault so missing required fields are caught.
    # setdefault would mask a missing "verdict" as "pass".
    stage = os.environ.get("AUTO_STAGE", "").strip()
    validated = _validate_stage_result(stage, parsed)
    if validated is not parsed:
        return validated  # validation produced an error result
    parsed.setdefault("status", "ok")
    parsed.setdefault("verdict", "pass")
    return parsed


def _heuristic_result(stage: str, payload: dict) -> dict:
    text = " ".join(
        str(payload.get(key, ""))
        for key in ("requirement", "title", "notes", "acceptance_boundary")
    ).lower()
    if stage == "spec_review":
        verdict = "block" if "[spec-block]" in text else "pass"
        return {
            "status": "ok" if verdict == "pass" else "error",
            "verdict": verdict,
            "summary": "spec review completed via default wrapper",
            "issues": [] if verdict == "pass" else [{"severity": "high", "description": "spec marker requested block"}],
            "total_score": 92 if verdict == "pass" else 40,
        }
    if stage == "task_dev":
        changed_files = [] if "[empty-diff]" in text else list(payload.get("planned_files", []))
        return {
            "status": "ok",
            "verdict": "pass",
            "summary": "task execution simulated via default wrapper",
            "files_modified": changed_files,
            "notes": payload.get("notes", ""),
            "blockers": [],
        }
    if stage == "task_review":
        verdict = "block" if "[review-block]" in text else "pass"
        return {
            "status": "ok" if verdict == "pass" else "error",
            "verdict": verdict,
            "summary": "task review completed via default wrapper",
            "issues": [] if verdict == "pass" else [{"severity": "high", "description": "review marker requested block"}],
            "scope_drift": "[scope-drift]" in text,
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
        attempts = int(payload.get("attempt_count", 0) or 0)
        if "[qa-fail-once]" in text and attempts == 0:
            return {
                "status": "error",
                "verdict": "block",
                "summary": "qa verify requested one fix loop via default wrapper",
                "bugs": [{"title": "Simulated QA failure", "severity": "high", "confidence": 0.9}],
            }
        if "[qa-block]" in text:
            return {
                "status": "error",
                "verdict": "block",
                "summary": "qa verify blocked via default wrapper",
                "bugs": [{"title": "Simulated QA block", "severity": "high", "confidence": 0.9}],
            }
        return {
            "status": "ok",
            "verdict": "pass",
            "summary": "qa verify completed via default wrapper",
            "bugs": [],
        }
    return {
        "status": "error",
        "verdict": "warn",
        "reason": f"unsupported stage {stage}",
    }


def _run_auto_stage(stage: str, payload: dict) -> dict:
    if force_heuristic():
        fallback = _heuristic_result(stage, payload)
        fallback["summary"] = f"{fallback.get('summary', stage)} via forced heuristic fallback"
        fallback["fallback_reason"] = "forced_heuristic"
        return fallback
    codex_bin = get_codex_bin()
    if not command_exists(codex_bin):
        return _auto_fallback(stage, payload, reason="codex_unavailable")
    result = _run_codex_stage(stage, payload)
    if result.get("status") == "error":
        return _auto_fallback(stage, payload, reason="codex_failed")
    return result


def _run_codex_stage(stage: str, payload: dict) -> dict:
    project_root = get_project_root()
    codex_bin = get_codex_bin()
    prompt = _build_codex_prompt(stage, payload)
    schema = _schema_for_stage(stage)
    with tempfile.TemporaryDirectory() as temp_dir:
        schema_path = Path(temp_dir) / "schema.json"
        output_path = Path(temp_dir) / f"{stage}.json"
        schema_path.write_text(json.dumps(schema), encoding="utf-8")
        timeout_seconds = max(int(os.environ.get("AUTO_CODEX_STAGE_TIMEOUT_SECONDS", "1200") or 1200), 1)
        command = build_exec_command(
            codex_bin,
            project_root=project_root,
            schema_path=schema_path,
            output_path=output_path,
            prompt=prompt,
        )
        try:
            result = _run_codex_command(
                command,
                project_root=project_root,
                output_path=output_path,
                payload=payload,
                stage=stage,
                timeout_seconds=timeout_seconds,
            )
        except OSError as exc:
            return {
                "status": "error",
                "verdict": "warn",
                "summary": f"codex {stage} command failed",
                "stderr": str(exc)[:500],
            }
        except CodexTimeoutWithDiff as exc:
            return {
                "status": "ok",
                "verdict": "pass",
                "summary": f"codex {stage} timed out after applying planned diff",
                "files_modified": exc.changed_files,
                "blockers": [],
                "fallback_reason": "codex_timeout_with_diff",
            }
        if result.returncode != 0 or not output_path.exists():
            error_result: dict[str, Any] = {
                "status": "error",
                "verdict": "warn",
                "summary": f"codex {stage} command failed",
                "stderr": (result.stderr or "").strip()[:500],
            }
            # Ensure spec_review errors include required schema fields
            if stage == "spec_review":
                error_result["issues"] = [{
                    "severity": "high",
                    "description": f"Codex CLI exited with code {result.returncode} or produced no output.",
                }]
                error_result["total_score"] = 0
            elif stage == "task_dev":
                error_result["files_modified"] = []
                error_result["blockers"] = [f"codex command failed with code {result.returncode}"]
            return error_result
        try:
            parsed = json.loads(output_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            decode_error: dict[str, Any] = {
                "status": "error",
                "verdict": "warn",
                "summary": f"codex {stage} output was not valid json",
            }
            if stage == "spec_review":
                decode_error["issues"] = [{"severity": "high", "description": "Codex output was not valid JSON."}]
                decode_error["total_score"] = 0
            elif stage == "task_dev":
                decode_error["files_modified"] = []
                decode_error["blockers"] = ["codex output was not valid json"]
            return decode_error
    if not isinstance(parsed, dict):
        shape_error: dict[str, Any] = {
            "status": "error",
            "verdict": "warn",
            "summary": f"codex {stage} output had invalid shape",
        }
        if stage == "spec_review":
            shape_error["issues"] = [{"severity": "high", "description": "Codex output had invalid shape."}]
            shape_error["total_score"] = 0
        elif stage == "task_dev":
            shape_error["files_modified"] = []
            shape_error["blockers"] = ["codex output had invalid shape"]
        return shape_error
    # Validate BEFORE setdefault so missing required fields are caught.
    validated = _validate_stage_result(stage, parsed)
    if validated is not parsed:
        return validated  # validation produced an error result
    parsed.setdefault("status", "ok")
    parsed.setdefault("verdict", "pass")
    return parsed


class CodexTimeoutWithDiff(RuntimeError):
    def __init__(self, changed_files: list[str]):
        super().__init__("codex timed out after applying planned diff")
        self.changed_files = changed_files


def _run_codex_command(
    command: list[str],
    *,
    project_root: Path,
    output_path: Path,
    payload: dict,
    stage: str,
    timeout_seconds: int,
) -> subprocess.CompletedProcess[str]:
    process = subprocess.Popen(
        command,
        cwd=str(project_root),
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    start = time.monotonic()
    while True:
        if process.poll() is not None:
            stdout, stderr = process.communicate()
            return subprocess.CompletedProcess(command, process.returncode, stdout, stderr)
        if output_path.exists():
            stdout, stderr = process.communicate(timeout=5)
            return subprocess.CompletedProcess(command, process.returncode, stdout, stderr)
        if time.monotonic() - start >= timeout_seconds:
            changed_files = _planned_changed_files(project_root, payload)
            _terminate_process(process)
            if stage == "task_dev" and changed_files:
                raise CodexTimeoutWithDiff(changed_files)
            raise subprocess.TimeoutExpired(cmd=command, timeout=timeout_seconds)
        time.sleep(1)


def _planned_changed_files(project_root: Path, payload: dict) -> list[str]:
    planned_files = [str(path).strip() for path in payload.get("planned_files", []) if str(path).strip()]
    if not planned_files:
        return []
    result = subprocess.run(
        ["git", "diff", "--name-only", "--", *planned_files],
        cwd=str(project_root),
        capture_output=True,
        text=True,
        timeout=15,
    )
    if result.returncode != 0:
        return []
    changed = [line.strip() for line in (result.stdout or "").splitlines() if line.strip()]
    planned_set = {path.strip() for path in planned_files}
    return [path for path in changed if path in planned_set]


def _terminate_process(process: subprocess.Popen[str]) -> None:
    if process.poll() is not None:
        return
    process.terminate()
    try:
        process.wait(timeout=5)
    except subprocess.TimeoutExpired:
        process.kill()
        process.wait(timeout=5)


def _maybe_dump_stage_prompt(stage: str, payload: dict) -> None:
    try:
        prompt = _build_codex_prompt(stage, payload)
    except Exception:
        return
    maybe_dump_prompt(prompt)


def _schema_for_stage(stage: str) -> dict:
    # OpenAI/Codex response_format (as of codex 0.114+) requires:
    #   - additionalProperties: false on every object
    #   - every declared property listed in "required"
    #   - every "array" schema to declare its "items"
    # Violations produce errors like:
    #   "additionalProperties is required to be supplied and to be false"
    #   "array schema missing items"
    issue_item_schema = {
        "type": "object",
        "additionalProperties": False,
        "properties": {
            "severity": {"type": "string"},
            "description": {"type": "string"},
        },
        "required": ["severity", "description"],
    }
    if stage == "spec_review":
        return {
            "type": "object",
            "additionalProperties": False,
            "properties": {
                "status": {"type": "string"},
                "verdict": {"type": "string"},
                "summary": {"type": "string"},
                "issues": {"type": "array", "items": issue_item_schema},
                "total_score": {"type": "number"},
            },
            "required": ["status", "verdict", "summary", "issues", "total_score"],
        }
    return {
        "type": "object",
        "additionalProperties": False,
        "properties": {
            "status": {"type": "string"},
            "verdict": {"type": "string"},
            "summary": {"type": "string"},
            "files_modified": {"type": "array", "items": {"type": "string"}},
            "blockers": {"type": "array", "items": {"type": "string"}},
        },
        "required": ["status", "verdict", "summary", "files_modified", "blockers"],
    }


def _build_codex_prompt(stage: str, payload: dict) -> str:
    if stage == "spec_review":
        return "\n".join(
            [
                "Review the proposed requirement/spec and return only structured JSON.",
                f"Requirement: {payload.get('requirement', '')}",
                "Assess whether the requirement is clear enough to proceed.",
            ]
        )
    if stage == "task_dev":
        return _build_task_dev_prompt(payload)
    return "\n".join(
        [
            "Implement the requested task in the current workspace and return only structured JSON.",
            "Work only within the planned scope unless you must report scope drift.",
            f"Task slug: {payload.get('slug', '')}",
            f"Task title: {payload.get('title', '')}",
            f"Task notes: {payload.get('notes', '')}",
            f"Workspace root: {payload.get('workspace_root', '')}",
            f"Planned files: {payload.get('planned_files', [])}",
            f"Requirement summary: {payload.get('requirement_summary', '')}",
            f"Spec summary: {payload.get('spec_summary', '')}",
            f"Task context summary: {payload.get('task_context_summary', '')}",
            f"QA summary: {payload.get('qa_summary', '')}",
            "Return the files you modified in files_modified.",
        ]
    )


def _build_task_dev_prompt(payload: dict) -> str:
    lines = [
        "Implement the requested task in the current workspace and return only structured JSON.",
        "Work only within the planned scope unless you must report scope drift.",
        f"Task slug: {payload.get('slug', '')}",
        f"Task title: {payload.get('title', '')}",
        f"Task notes: {payload.get('notes', '')}",
        f"Workspace root: {payload.get('workspace_root', '')}",
        f"Planned files: {payload.get('planned_files', [])}",
    ]

    context_paths = payload.get("context_paths", {})
    if isinstance(context_paths, dict) and context_paths:
        lines.append("Before coding, read these files in order:")
        requirement = str(context_paths.get("requirement", "")).strip()
        spec = str(context_paths.get("spec", "")).strip()
        task_graph = str(context_paths.get("tasks", "")).strip()
        qa_units = str(context_paths.get("qa_units", "")).strip()
        fix_context = str(context_paths.get("fix_context", "")).strip()
        review = str(context_paths.get("review", "")).strip()
        context_hints = payload.get("context_hints", {}) if isinstance(payload.get("context_hints", {}), dict) else {}
        tasks_filter = context_hints.get("tasks_filter", {}) if isinstance(context_hints.get("tasks_filter", {}), dict) else {}
        qa_filter = context_hints.get("qa_units_filter", {}) if isinstance(context_hints.get("qa_units_filter", {}), dict) else {}
        current_slug = str(tasks_filter.get("current_slug", "")).strip()
        member_task_slug = str(qa_filter.get("member_task_slug", "")).strip()

        if requirement:
            lines.append(f"1. Requirement: {requirement}")
        if spec:
            lines.append(f"2. Spec: {spec}")
        if task_graph:
            suffix = f" (focus on current slug: {current_slug} and direct dependencies)" if current_slug else ""
            lines.append(f"3. Task graph: {task_graph}{suffix}")
        if qa_units:
            suffix = f" (only criteria relevant to member task slug: {member_task_slug})" if member_task_slug else ""
            lines.append(f"4. QA units: {qa_units}{suffix}")
        if fix_context:
            lines.append(f"5. Fix context: {fix_context}")
        if review:
            lines.append(f"6. Previous review: {review}")

        hard_rules = payload.get("hard_rules", [])
        if isinstance(hard_rules, list) and hard_rules:
            lines.append("Rules:")
            for rule in hard_rules:
                rule_text = str(rule).strip()
                if rule_text:
                    lines.append(f"- {rule_text}")
        lines.append("Return JSON with keys: status, verdict, summary, files_modified, blockers.")
        lines.append("Return modified files in files_modified.")
        return "\n".join(lines)

    lines.extend(
        [
            f"Requirement summary: {payload.get('requirement_summary', '')}",
            f"Spec summary: {payload.get('spec_summary', '')}",
            f"Task context summary: {payload.get('task_context_summary', '')}",
            f"QA summary: {payload.get('qa_summary', '')}",
            "Return JSON with keys: status, verdict, summary, files_modified, blockers.",
            "Return the files you modified in files_modified.",
        ]
    )
    return "\n".join(lines)


def _validate_stage_result(stage: str, parsed: dict) -> dict:
    """Validate that parsed stage result has required fields.

    For spec_review, the schema requires: status, verdict, summary, issues,
    total_score. If any are missing, treat as a protocol error so that an
    empty {} or partial JSON cannot be silently promoted to pass.
    """
    if stage == "spec_review":
        required = {"status", "verdict", "summary", "issues", "total_score"}
        missing = required - set(parsed.keys())
        if missing:
            return {
                "status": "error",
                "verdict": "block",
                "summary": f"spec_review result missing required fields: {sorted(missing)}",
                "issues": [{
                    "severity": "high",
                    "description": f"Missing fields: {sorted(missing)}. Result cannot be trusted.",
                }],
                "total_score": 0,
                "fallback_reason": "forward_command_protocol_error",
            }
    if stage == "task_dev":
        required = {"status", "verdict", "summary", "files_modified", "blockers"}
        missing = required - set(parsed.keys())
        if missing:
            return {
                "status": "error",
                "verdict": "block",
                "summary": f"task_dev result missing required fields: {sorted(missing)}",
                "files_modified": [],
                "blockers": [f"missing fields: {sorted(missing)}"],
            }
    return parsed


def _auto_fallback(stage: str, payload: dict, *, reason: str) -> dict:
    fallback = _heuristic_result(stage, payload)
    fallback["summary"] = f"{fallback.get('summary', stage)} via stage wrapper fallback"
    fallback["fallback_reason"] = reason
    # When Codex execution fails in auto mode, report no concrete edits so runtime
    # safeguards can block instead of integrating a simulated change.
    if stage == "task_dev":
        fallback["files_modified"] = []
    return fallback


if __name__ == "__main__":
    raise SystemExit(main())
