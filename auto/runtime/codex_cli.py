"""Helpers for invoking the local Codex CLI from AUTO wrappers."""

from __future__ import annotations

import os
import subprocess
from functools import lru_cache
from pathlib import Path


def force_heuristic() -> bool:
    """Return True when AUTO_FORCE_HEURISTIC env var is truthy."""
    return os.environ.get("AUTO_FORCE_HEURISTIC", "").strip().lower() in {"1", "true", "yes", "on"}


@lru_cache(maxsize=8)
def detect_exec_capabilities(codex_bin: str) -> dict[str, bool]:
    try:
        result = subprocess.run(
            [codex_bin, "exec", "--help"],
            capture_output=True,
            text=True,
            timeout=15,
        )
    except (OSError, subprocess.SubprocessError):
        return {
            "supports_full_auto": False,
            "supports_dangerous_bypass": False,
            "supports_legacy_approval_flag": False,
        }
    help_text = "\n".join(part for part in ((result.stdout or ""), (result.stderr or "")) if part)
    return {
        "supports_full_auto": "--full-auto" in help_text,
        "supports_dangerous_bypass": "--dangerously-bypass-approvals-and-sandbox" in help_text,
        "supports_legacy_approval_flag": "--ask-for-approval" in help_text,
    }


def build_exec_command(
    codex_bin: str,
    *,
    project_root: str | Path,
    schema_path: str | Path,
    output_path: str | Path,
    prompt: str,
) -> list[str]:
    capabilities = detect_exec_capabilities(codex_bin)
    command = [codex_bin, "exec", "--skip-git-repo-check"]
    if capabilities["supports_full_auto"]:
        command.append("--full-auto")
    else:
        command.extend(["--sandbox", "workspace-write"])
        if capabilities["supports_legacy_approval_flag"]:
            command.extend(["--ask-for-approval", "never"])
        elif capabilities["supports_dangerous_bypass"]:
            command.append("--dangerously-bypass-approvals-and-sandbox")
    command.extend(
        [
            "--output-schema",
            str(schema_path),
            "-o",
            str(output_path),
            "-C",
            str(project_root),
            prompt,
        ]
    )
    return command
