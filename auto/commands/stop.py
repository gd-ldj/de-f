"""Implementation for `/auto:stop`."""

from __future__ import annotations

import datetime as dt
import json
from pathlib import Path
from typing import Any

from auto.orchestrator.state_machine import can_stop
from auto.runtime.bootstrap import bootstrap_auto_root, load_state, save_state


def stop_runtime(project_root: str | Path) -> dict[str, Any]:
    paths = bootstrap_auto_root(project_root)
    state = load_state(paths)
    current_state = str(state.get("runtime_state", "idle"))
    if not can_stop(current_state):
        return {
            "status": "error",
            "summary": f"cannot stop from {current_state}",
            "previous_state": current_state,
            "new_state": current_state,
        }
    if current_state in {"idle", "paused"}:
        return {
            "status": "ok",
            "summary": "already stopped",
            "previous_state": current_state,
            "new_state": current_state,
        }
    state["runtime_state"] = "paused"
    state["last_stop_at"] = dt.datetime.now(dt.UTC).isoformat(timespec="seconds")
    save_state(paths, state)
    paths.runtime_dir.mkdir(parents=True, exist_ok=True)
    with paths.runtime_dir.joinpath("executor.log").open("a", encoding="utf-8") as handle:
        handle.write(f"{state['last_stop_at']} paused active_task={state.get('active_task') or '-'}\n")
    paths.heartbeat_dir.mkdir(parents=True, exist_ok=True)
    paths.heartbeat_dir.joinpath("latest.json").write_text(
        json.dumps(
            {
                "timestamp": state["last_stop_at"],
                "event": "paused",
                "runtime_state": "paused",
                "active_task": state.get("active_task"),
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    return {
        "status": "ok",
        "summary": "runtime paused",
        "previous_state": current_state,
        "new_state": "paused",
    }
