"""Shared helpers for AUTO v2 stage agent scripts."""

from __future__ import annotations

import json
import os
import shutil
import subprocess
from pathlib import Path


def load_payload() -> dict:
    """Load the stage payload from AUTO_STAGE_PAYLOAD_JSON env var."""
    raw = os.environ.get("AUTO_STAGE_PAYLOAD_JSON", "{}")
    try:
        payload = json.loads(raw)
    except json.JSONDecodeError:
        return {}
    return payload if isinstance(payload, dict) else {}


def command_exists(command: str) -> bool:
    """Check whether a CLI command is available on PATH."""
    candidate = Path(command)
    if candidate.is_absolute():
        return candidate.exists()
    return shutil.which(command) is not None


def run_forward_command(
    command: str,
    *,
    timeout: int = 900,
    error_key: str = "summary",
) -> dict:
    """Execute an external forward command and parse its JSON stdout.

    Args:
        command: Shell command to execute.
        timeout: Subprocess timeout in seconds.
        error_key: Key name for error description in the result dict
                   (e.g. "summary" for review, "reasoning" for verify).
    """
    result = subprocess.run(
        command,
        shell=True,
        capture_output=True,
        text=True,
        timeout=timeout,
    )
    if result.returncode != 0:
        return {
            "status": "error",
            "verdict": "warn",
            error_key: "forward command failed",
            "stderr": (result.stderr or "").strip()[:500],
        }
    try:
        parsed = json.loads((result.stdout or "").strip() or "{}")
    except json.JSONDecodeError:
        return {
            "status": "error",
            "verdict": "warn",
            error_key: "forward command returned non-json output",
        }
    if not isinstance(parsed, dict):
        return {
            "status": "error",
            "verdict": "warn",
            error_key: "forward command returned invalid payload",
        }
    parsed.setdefault("status", "ok")
    parsed.setdefault("verdict", "pass")
    return parsed


def maybe_dump_prompt(prompt: str) -> None:
    """Write the prompt to AUTO_STAGE_PROMPT_DUMP path if set."""
    path = os.environ.get("AUTO_STAGE_PROMPT_DUMP", "").strip()
    if not path:
        return
    try:
        Path(path).write_text(prompt, encoding="utf-8")
    except OSError:
        return


def get_codex_bin() -> str:
    """Resolve the codex binary name from env."""
    return os.environ.get("AUTO_CODEX_BIN", "codex").strip() or "codex"


def get_project_root() -> Path:
    """Resolve the project root from env."""
    return Path(os.environ.get("AUTO_PROJECT_ROOT", ".")).resolve()
