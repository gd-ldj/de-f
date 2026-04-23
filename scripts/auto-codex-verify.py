#!/usr/bin/env python3
"""AUTO v2 task verify wrapper with optional Codex forwarding."""

from __future__ import annotations

import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from auto.runtime.codex_cli import build_exec_command, force_heuristic
from auto.runtime.stage_common import (
    command_exists,
    get_codex_bin,
    get_project_root,
    load_payload,
    maybe_dump_prompt,
    run_forward_command,
)


def main() -> int:
    payload = load_payload()
    mode = os.environ.get("AUTO_CODEX_VERIFY_MODE", "auto").strip().lower()
    if os.environ.get("AUTO_VERIFY_FORWARD_COMMAND", "").strip():
        result = run_forward_command(
            os.environ["AUTO_VERIFY_FORWARD_COMMAND"],
            error_key="reasoning",
        )
        result.setdefault("criteria_checks", [])
        result.setdefault("evidence", [])
    elif mode == "codex":
        result = _run_codex_verify(payload, strict=True)
    elif mode == "auto":
        result = _run_auto_verify(payload)
    else:
        result = _heuristic_verify(payload)
    sys.stdout.write(json.dumps(result, ensure_ascii=False) + "\n")
    return 0


def _run_codex_verify(payload: dict, *, strict: bool = False) -> dict:
    project_root = get_project_root()
    prompt = _build_codex_prompt(payload)
    maybe_dump_prompt(prompt)
    codex_bin = get_codex_bin()
    fail_verdict = "block" if strict else "warn"
    criteria_check_schema = {
        "type": "object",
        "additionalProperties": False,
        "properties": {
            "criterion": {"type": "string"},
            "passed": {"type": "boolean"},
            "notes": {"type": "string"},
        },
        "required": ["criterion", "passed", "notes"],
    }
    schema = {
        "type": "object",
        "additionalProperties": False,
        "properties": {
            "status": {"type": "string"},
            "verdict": {"type": "string"},
            "reasoning": {"type": "string"},
            "criteria_checks": {"type": "array", "items": criteria_check_schema},
            "evidence": {"type": "array", "items": {"type": "string"}},
            "context_files_read": {"type": "array", "items": {"type": "string"}},
            "context_evidence": {"type": "array", "items": {"type": "string"}},
        },
        "required": ["status", "verdict", "reasoning", "criteria_checks", "evidence", "context_files_read", "context_evidence"],
    }
    with tempfile.TemporaryDirectory() as temp_dir:
        schema_path = Path(temp_dir) / "schema.json"
        output_path = Path(temp_dir) / "verify.json"
        schema_path.write_text(json.dumps(schema), encoding="utf-8")
        try:
            result = subprocess.run(
                build_exec_command(
                    codex_bin,
                    project_root=project_root,
                    schema_path=schema_path,
                    output_path=output_path,
                    prompt=prompt,
                ),
                capture_output=True,
                text=True,
                timeout=900,
            )
        except OSError as exc:
            return {
                "status": "error",
                "verdict": fail_verdict,
                "reasoning": "codex verify command failed; falling back to warning",
                "criteria_checks": [],
                "evidence": [],
                "stderr": str(exc)[:500],
                "fallback_reason": "codex_os_error",
            }
        if result.returncode != 0 or not output_path.exists():
            return {
                "status": "error",
                "verdict": fail_verdict,
                "reasoning": "codex verify command failed; falling back to warning",
                "criteria_checks": [],
                "evidence": [],
                "fallback_reason": "codex_nonzero_exit",
            }
        try:
            parsed = json.loads(output_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return {
                "status": "error",
                "verdict": fail_verdict,
                "reasoning": "codex verify output was not valid json",
                "criteria_checks": [],
                "evidence": [],
                "fallback_reason": "codex_invalid_json",
            }
    if not isinstance(parsed, dict):
        return {
            "status": "error",
            "verdict": fail_verdict,
            "reasoning": "codex verify output had invalid shape",
            "criteria_checks": [],
            "evidence": [],
            "fallback_reason": "codex_invalid_shape",
        }
    parsed.setdefault("status", "ok")
    parsed.setdefault("verdict", "pass")
    parsed.setdefault("criteria_checks", [])
    parsed.setdefault("evidence", [])
    return parsed


def _run_auto_verify(payload: dict) -> dict:
    if force_heuristic():
        fallback = _heuristic_verify(payload)
        fallback["reasoning"] = "verify completed via forced heuristic fallback"
        fallback["fallback_reason"] = "forced_heuristic"
        return fallback
    codex_bin = get_codex_bin()
    if not command_exists(codex_bin):
        fallback = _heuristic_verify(payload)
        fallback["reasoning"] = "verify completed via codex wrapper heuristic fallback"
        fallback["fallback_reason"] = "codex_unavailable"
        return fallback
    result = _run_codex_verify(payload)
    if result.get("status") == "error":
        fallback = _heuristic_verify(payload)
        fallback["reasoning"] = "verify completed via codex wrapper heuristic fallback"
        fallback["fallback_reason"] = "codex_failed"
        return fallback
    return result


def _heuristic_verify(payload: dict) -> dict:
    text = " ".join(str(payload.get(key, "")) for key in ("title", "notes")).lower()
    verdict = "block" if "[verify-block]" in text else "pass"
    return {
        "status": "ok" if verdict == "pass" else "error",
        "verdict": verdict,
        "reasoning": "verify completed via codex wrapper heuristic",
        "criteria_checks": [],
        "evidence": [],
    }


def _build_codex_prompt(payload: dict) -> str:
    lines = [
        "Verify whether the task satisfies its acceptance criteria and return only structured JSON.",
        f"Task slug: {payload.get('slug', '')}",
        f"Task title: {payload.get('title', '')}",
        f"Task notes: {payload.get('notes', '')}",
        f"Workspace root: {payload.get('workspace_root', '')}",
        f"Planned files: {payload.get('planned_files', [])}",
    ]

    context_paths = payload.get("context_paths", {})
    if isinstance(context_paths, dict) and context_paths:
        lines.append("Read before verifying:")
        spec = str(context_paths.get("spec", "")).strip()
        qa_units = str(context_paths.get("qa_units", "")).strip()
        verify_plan = str(context_paths.get("verify_plan", "")).strip()
        context_hints = payload.get("context_hints", {}) if isinstance(payload.get("context_hints", {}), dict) else {}
        qa_filter = context_hints.get("qa_units_filter", {}) if isinstance(context_hints.get("qa_units_filter", {}), dict) else {}
        member_task_slug = str(qa_filter.get("member_task_slug", "")).strip()

        if spec:
            lines.append(f"1. Spec: {spec}")
        if qa_units:
            suffix = f" (only criteria relevant to member task slug: {member_task_slug})" if member_task_slug else ""
            lines.append(f"2. QA units: {qa_units}{suffix}")
        if verify_plan:
            lines.append(f"3. Verify plan: {verify_plan}")
        lines.extend(
            [
                "Use the repository and runtime artifacts as ground truth.",
                "When practical, include context_files_read or context_evidence to show which files informed the verification.",
            ]
        )
        return "\n".join(lines)

    return "\n".join(lines)


if __name__ == "__main__":
    raise SystemExit(main())
