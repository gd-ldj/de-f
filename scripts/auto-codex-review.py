#!/usr/bin/env python3
"""AUTO v2 review wrapper with optional Codex forwarding."""

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
    mode = os.environ.get("AUTO_CODEX_REVIEW_MODE", "auto").strip().lower()
    result: dict
    if os.environ.get("AUTO_REVIEW_FORWARD_COMMAND", "").strip():
        result = run_forward_command(os.environ["AUTO_REVIEW_FORWARD_COMMAND"])
    elif mode == "codex":
        result = _run_codex_review(payload, strict=True)
    elif mode == "auto":
        result = _run_auto_review(payload)
    else:
        result = _heuristic_review(payload)
    sys.stdout.write(json.dumps(result, ensure_ascii=False) + "\n")
    return 0


def _run_codex_review(payload: dict, *, strict: bool = False) -> dict:
    project_root = get_project_root()
    prompt = _build_codex_prompt(payload)
    maybe_dump_prompt(prompt)
    codex_bin = get_codex_bin()
    fail_verdict = "block" if strict else "warn"
    issue_item_schema = {
        "type": "object",
        "additionalProperties": False,
        "properties": {
            "severity": {"type": "string"},
            "description": {"type": "string"},
        },
        "required": ["severity", "description"],
    }
    schema = {
        "type": "object",
        "additionalProperties": False,
        "properties": {
            "status": {"type": "string"},
            "verdict": {"type": "string"},
            "summary": {"type": "string"},
            "issues": {"type": "array", "items": issue_item_schema},
            "scope_drift": {"type": "boolean"},
            "context_files_read": {"type": "array", "items": {"type": "string"}},
            "context_evidence": {"type": "array", "items": {"type": "string"}},
        },
        "required": ["status", "verdict", "summary", "issues", "scope_drift", "context_files_read", "context_evidence"],
    }

    with tempfile.TemporaryDirectory() as temp_dir:
        schema_path = Path(temp_dir) / "schema.json"
        output_path = Path(temp_dir) / "review.json"
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
                "summary": "codex review command failed; falling back to warning",
                "stderr": str(exc)[:500],
                "fallback_reason": "codex_os_error",
            }
        if result.returncode != 0 or not output_path.exists():
            return {
                "status": "error",
                "verdict": fail_verdict,
                "summary": "codex review command failed; falling back to warning",
                "stderr": (result.stderr or "").strip()[:500],
                "fallback_reason": "codex_nonzero_exit",
            }
        try:
            parsed = json.loads(output_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return {
                "status": "error",
                "verdict": fail_verdict,
                "summary": "codex review output was not valid json",
                "fallback_reason": "codex_invalid_json",
            }
    if not isinstance(parsed, dict):
        return {
            "status": "error",
            "verdict": fail_verdict,
            "summary": "codex review output had invalid shape",
            "fallback_reason": "codex_invalid_shape",
        }
    parsed.setdefault("status", "ok")
    parsed.setdefault("verdict", "pass")
    return parsed


def _run_auto_review(payload: dict) -> dict:
    if force_heuristic():
        fallback = _heuristic_review(payload)
        fallback["summary"] = "review completed via forced heuristic fallback"
        fallback["fallback_reason"] = "forced_heuristic"
        return fallback
    codex_bin = get_codex_bin()
    if not command_exists(codex_bin):
        fallback = _heuristic_review(payload)
        fallback["summary"] = "review completed via codex wrapper heuristic fallback"
        fallback["fallback_reason"] = "codex_unavailable"
        return fallback
    result = _run_codex_review(payload)
    if result.get("status") == "error":
        fallback = _heuristic_review(payload)
        fallback["summary"] = "review completed via codex wrapper heuristic fallback"
        fallback["fallback_reason"] = "codex_failed"
        fallback["codex_error"] = result.get("summary", "")
        return fallback
    return result


def _heuristic_review(payload: dict) -> dict:
    text = " ".join(str(payload.get(key, "")) for key in ("title", "notes", "acceptance_boundary")).lower()
    verdict = "block" if "[review-block]" in text else "pass"
    return {
        "status": "ok" if verdict == "pass" else "error",
        "verdict": verdict,
        "summary": "review completed via codex wrapper heuristic",
        "issues": [] if verdict == "pass" else [{"severity": "high", "description": "review marker requested block"}],
        "scope_drift": "[scope-drift]" in text,
    }


def _build_codex_prompt(payload: dict) -> str:
    lines = [
        "Review the current task changes and return only structured JSON.",
        f"Task slug: {payload.get('slug', '')}",
        f"Task title: {payload.get('title', '')}",
        f"Task notes: {payload.get('notes', '')}",
        f"Workspace root: {payload.get('workspace_root', '')}",
        f"Planned files: {payload.get('planned_files', [])}",
    ]

    context_paths = payload.get("context_paths", {})
    if isinstance(context_paths, dict) and context_paths:
        lines.append("Read before reviewing:")
        spec = str(context_paths.get("spec", "")).strip()
        qa_units = str(context_paths.get("qa_units", "")).strip()
        result = str(context_paths.get("result", "")).strip()
        status = str(context_paths.get("status", "")).strip()
        review = str(context_paths.get("review", "")).strip()
        context_hints = payload.get("context_hints", {}) if isinstance(payload.get("context_hints", {}), dict) else {}
        qa_filter = context_hints.get("qa_units_filter", {}) if isinstance(context_hints.get("qa_units_filter", {}), dict) else {}
        member_task_slug = str(qa_filter.get("member_task_slug", "")).strip()

        if spec:
            lines.append(f"1. Spec: {spec}")
        if qa_units:
            suffix = f" (only criteria relevant to member task slug: {member_task_slug})" if member_task_slug else ""
            lines.append(f"2. QA units: {qa_units}{suffix}")
        if result:
            lines.append(f"3. Result artifact: {result}")
        if status:
            lines.append(f"4. Status artifact: {status}")
        if review:
            lines.append(f"5. Previous review artifact: {review}")
        lines.extend(
            [
                "Then inspect the actual changed files / git diff in the current workspace.",
                "Assess whether the implementation should pass, warn, or block.",
                "Flag scope drift if files outside planned_files changed.",
                "When practical, include context_files_read or context_evidence to show which files informed the review.",
            ]
        )
        return "\n".join(lines)

    lines.append("Assess whether the implementation should pass, warn, or block.")
    return "\n".join(lines)


if __name__ == "__main__":
    raise SystemExit(main())
