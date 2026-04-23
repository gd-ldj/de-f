"""Implementation for `/auto:start`."""

from __future__ import annotations

import datetime as dt
import os
from pathlib import Path
import subprocess
import sys
from typing import Any

from auto.orchestrator.main import run_coordinator
from auto.orchestrator.state_machine import can_start
from auto.runtime.bootstrap import bootstrap_auto_root, load_state
from auto.runtime.bootstrap import save_state
from auto.schemas.workflow import load_workflow_config


def start_runtime(
    project_root: str | Path,
    *,
    resume_only: bool = False,
    detached: bool | None = None,
) -> dict[str, Any]:
    root = Path(project_root).resolve()
    paths = bootstrap_auto_root(root)
    state = load_state(paths)
    workflow = load_workflow_config(paths.workflow_file)
    current_state = str(state.get("runtime_state", "idle"))
    existing_pid = _read_existing_pid(paths.runtime_dir / "executor.pid")
    if current_state == "running" and not existing_pid:
        return {
            "command": "/auto:start",
            "status": "ok",
            "summary": "already running",
            "runtime_state": "running",
            "processed_tasks": [],
            "fix_loops": 0,
        }
    if current_state in {"starting", "running"} and existing_pid and _pid_is_live(existing_pid):
        return {
            "command": "/auto:start",
            "status": "ok",
            "summary": "already running",
            "runtime_state": "running",
            "processed_tasks": [],
            "fix_loops": 0,
            "background_pid": existing_pid,
        }
    if current_state in {"starting", "running"} and existing_pid and not _pid_is_live(existing_pid):
        state["runtime_state"] = "paused"
        save_state(paths, state)
        current_state = "paused"
    if not can_start(current_state):
        return {
            "command": "/auto:start",
            "status": "error",
            "summary": f"cannot start from {current_state}",
            "runtime_state": current_state,
            "processed_tasks": [],
            "fix_loops": 0,
        }
    if detached is None:
        detached = bool(workflow.get("runtime", {}).get("background_start", False))
    if detached:
        state.update(
            {
                "runtime_state": "starting",
                "last_start_at": _now(),
                "heartbeat_at": _now(),
            }
        )
        save_state(paths, state)
        command = [
            sys.executable,
            "-m",
            "auto.runtime.daemon",
            "--project-root",
            str(root),
        ]
        if resume_only:
            command.append("--resume-only")
        paths.runtime_dir.mkdir(parents=True, exist_ok=True)
        stdout_log = (paths.runtime_dir / "daemon-stdout.log").open("a", encoding="utf-8")
        stderr_log = (paths.runtime_dir / "daemon-stderr.log").open("a", encoding="utf-8")
        try:
            process = subprocess.Popen(  # noqa: S603
                command,
                cwd=str(root),
                stdout=stdout_log,
                stderr=stderr_log,
                start_new_session=True,
            )
        finally:
            stdout_log.close()
            stderr_log.close()
        return {
            "command": "/auto:start",
            "status": "ok",
            "summary": "runtime started in background",
            "runtime_state": "starting",
            "processed_tasks": [],
            "fix_loops": 0,
            "background_pid": process.pid,
        }
    result = run_coordinator(project_root, resume_only=resume_only)
    return {
        "command": "/auto:start",
        **result,
    }


def _now() -> str:
    return dt.datetime.now(dt.UTC).isoformat(timespec="seconds")


def _read_existing_pid(path: Path) -> int | None:
    if not path.exists():
        return None
    try:
        return int(path.read_text(encoding="utf-8").strip())
    except (OSError, ValueError):
        return None


def _pid_is_live(pid: int) -> bool:
    try:
        os.kill(pid, 0)
    except ProcessLookupError:
        return False
    except PermissionError:
        return True
    return True
