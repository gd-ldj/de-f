"""Minimal git helpers for AUTO v2."""

from __future__ import annotations

import subprocess
from pathlib import Path


def git_run(project_root: str | Path, args: list[str], check: bool = False) -> subprocess.CompletedProcess:
    result = subprocess.run(
        ["git", *args],
        cwd=str(project_root),
        capture_output=True,
        text=True,
    )
    if check and result.returncode != 0:
        raise subprocess.CalledProcessError(
            result.returncode,
            ["git", *args],
            output=result.stdout,
            stderr=result.stderr,
        )
    return result


def changed_files_against_head(project_root: str | Path) -> list[str]:
    result = git_run(project_root, ["diff", "--name-only", "HEAD"])
    if result.returncode != 0:
        return []
    return [line.strip() for line in result.stdout.splitlines() if line.strip()]
