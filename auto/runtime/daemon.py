"""Background daemon entrypoint for AUTO v2."""

from __future__ import annotations

import argparse
import datetime as dt
import json
from pathlib import Path
import time
from typing import Any, Callable

from auto.runtime.bootstrap import bootstrap_auto_root, load_state, save_state
from auto.runtime.main import AutoRuntime
from auto.runtime.notify import notify_event, write_notification_receipt
from auto.runtime.status_server import start_status_server
from auto.schemas.workflow import load_workflow_config


def main() -> int:
    parser = argparse.ArgumentParser(description="AUTO v2 background runtime")
    parser.add_argument("--project-root", required=True)
    parser.add_argument("--resume-only", action="store_true")
    args = parser.parse_args()

    project_root = Path(args.project_root).resolve()
    paths = bootstrap_auto_root(project_root)
    workflow = load_workflow_config(paths.workflow_file)
    return run_daemon(
        project_root=project_root,
        resume_only=args.resume_only,
        workflow=workflow,
    )


def run_daemon(
    *,
    project_root: str | Path,
    resume_only: bool,
    workflow: dict[str, Any] | None = None,
    runtime_factory: Callable[[Path], Any] = AutoRuntime,
    sleep_fn: Callable[[float], None] = time.sleep,
) -> int:
    root = Path(project_root).resolve()
    paths = bootstrap_auto_root(root)
    workflow = workflow or load_workflow_config(paths.workflow_file)
    runtime_cfg = dict(workflow.get("runtime", {}) or {})
    keep_alive = bool(runtime_cfg.get("keep_alive", False))
    auto_restart = bool(runtime_cfg.get("auto_restart", False))
    max_restart_attempts = max(int(runtime_cfg.get("max_restart_attempts", 0) or 0), 0)
    restart_delay_seconds = _normalized_restart_delay_seconds(runtime_cfg, auto_restart=auto_restart)

    # Start lightweight HTTP status server for remote monitoring
    status_port = int(runtime_cfg.get("status_port", 9100) or 9100)
    status_server = start_status_server(paths.artifact_root, port=status_port)
    if status_server:
        _record_status_server_started(paths, status_port)

    attempt = 0
    while True:
        runtime = runtime_factory(root)
        try:
            runtime.start(
                resume_only=resume_only,
                keep_alive=keep_alive,
            )
            return 0
        except Exception as exc:  # pragma: no cover - exercised via tests
            attempt += 1
            _record_runtime_crash(paths, exc, attempt)
            event = {
                "event": "runtime_crash",
                "severity": "critical",
                "summary": f"AUTO runtime crashed: {exc}",
                "restart_attempt": attempt,
            }
            receipt = notify_event(workflow, event)
            write_notification_receipt(paths.runtime_dir, event=event, result=receipt)
            if not auto_restart or attempt > max_restart_attempts:
                state = load_state(paths)
                state["runtime_state"] = "paused"
                state["last_stop_at"] = _now()
                save_state(paths, state)
                return 1
            state = load_state(paths)
            state["runtime_state"] = "starting"
            state["last_start_at"] = _now()
            save_state(paths, state)
            sleep_fn(restart_delay_seconds)


def _record_status_server_started(paths, port: int) -> None:
    paths.runtime_dir.mkdir(parents=True, exist_ok=True)
    paths.runtime_dir.joinpath("status-server.json").write_text(
        json.dumps({"port": port, "started_at": _now()}, indent=2) + "\n",
        encoding="utf-8",
    )


def _record_runtime_crash(paths, exc: Exception, restart_attempt: int) -> None:
    paths.runtime_dir.joinpath("crash.json").write_text(
        json.dumps(
            {
                "error": str(exc),
                "restart_attempt": restart_attempt,
                "recorded_at": _now(),
            },
            indent=2,
            ensure_ascii=False,
        )
        + "\n",
        encoding="utf-8",
    )


def _now() -> str:
    return dt.datetime.now(dt.UTC).isoformat(timespec="seconds")


def _normalized_restart_delay_seconds(runtime_cfg: dict[str, Any], *, auto_restart: bool) -> int:
    raw_delay = max(int(runtime_cfg.get("restart_delay_seconds", 5) or 0), 0)
    if not auto_restart:
        return raw_delay
    return max(raw_delay, 2)


if __name__ == "__main__":
    raise SystemExit(main())
