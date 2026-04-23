"""Coordinator entrypoint for AUTO v2."""

from __future__ import annotations

from pathlib import Path

from auto.runtime.main import AutoRuntime


def run_coordinator(project_root: str | Path, resume_only: bool = False) -> dict:
    runtime = AutoRuntime(project_root)
    return runtime.start(resume_only=resume_only)
