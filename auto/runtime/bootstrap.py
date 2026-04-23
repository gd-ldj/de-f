"""Bootstrap helpers for the AUTO v2 artifact root."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from auto.runtime.state_paths import AutoPaths, resolve_auto_paths
from auto.schemas.states import RUNTIME_IDLE
from auto.schemas.workflow import (
    DEFAULT_CODEX_REVIEW_COMMAND,
    DEFAULT_CODEX_VERIFY_COMMAND,
    DEFAULT_QA_VERIFY_COMMAND,
    DEFAULT_STAGE_COMMAND,
)

DEFAULT_WORKFLOW = """version: 1
runtime:
  state: idle
  max_parallel: 1
  drain_on_start: true
  background_start: false
  keep_alive: false
  poll_interval_seconds: 15
  lease_stale_after_seconds: 900
  auto_restart: true
  max_restart_attempts: 3
  restart_delay_seconds: 5
agents:
  spec_review: command
  task_dev: command
  task_review: command
  task_verify: command
  qa_verify: command
agent_commands:
  spec_review: {default_stage_command}
  task_dev: {default_stage_command}
  task_review: {default_codex_review_command}
  task_verify: {default_codex_verify_command}
  qa_verify: {default_qa_verify_command}
agent_timeouts:
  spec_review: 300
  task_dev: 900
  task_review: 300
  task_verify: 600
  qa_verify: 600
review:
  reviewer: configurable
verify:
  mode: qa_unit_default
  task_level_enabled: false
  fail_on_missing_verify_json: false
  max_total_fix_attempts: 6
budget:
  spec_review_tokens: 120000
  task_dev_tokens: 400000
  task_review_tokens: 120000
  qa_verify_tokens: 200000
  per_task_total_tokens: 700000
  on_budget_exceeded: pause_task
safeguards:
  expand_threshold: 5
  forbidden: []
dev_server:
  port: 3000
  health_path: /
  start_command:
worktree:
  reuse_existing: true
  cleanup_policy: preserve_metadata
watchdog:
  repeated_block_threshold: 3
  stale_progress_seconds: 900
alerts:
  webhook_url:
  telegram_enabled: false
  telegram_bot_token_env: TG_BOT_TOKEN
  telegram_chat_id_env: TG_CHAT_ID
  events: [repeated_block, stalled_progress, runtime_crash, queue_drained]
gates:
  tsc: false
  tsc_command: npx tsc --noEmit
  build: false
  build_command: pnpm build
  e2e: false
  e2e_mode: auto
  e2e_trigger_keywords: [page, modal, dialog, button, banner, form, table, drawer, popover]
  e2e_trigger_scope_prefixes: [app/, components/]
  e2e_auto_command: pnpm test:e2e
  e2e_command: pnpm test:e2e
""".format(
    default_stage_command=DEFAULT_STAGE_COMMAND,
    default_codex_review_command=DEFAULT_CODEX_REVIEW_COMMAND,
    default_codex_verify_command=DEFAULT_CODEX_VERIFY_COMMAND,
    default_qa_verify_command=DEFAULT_QA_VERIFY_COMMAND,
)

DEFAULT_STATE: dict[str, Any] = {
    "version": 1,
    "runtime_state": RUNTIME_IDLE,
    "current_run_id": None,
    "current_work_item_id": None,
    "active_task": None,
    "last_start_at": None,
    "last_stop_at": None,
    "heartbeat_at": None,
}

DEFAULT_QUEUE = """# AUTO Task Queue

> Queue entries are appended via `/auto:add`.

| Task | Work Item | State | Depends On | Notes |
| --- | --- | --- | --- | --- |
"""


def bootstrap_auto_root(project_root: str | Path) -> AutoPaths:
    """Create the minimum `.auto` layout if it does not exist yet."""

    paths = resolve_auto_paths(project_root)
    for directory in paths.required_directories():
        directory.mkdir(parents=True, exist_ok=True)

    _write_if_missing(paths.workflow_file, DEFAULT_WORKFLOW)
    _write_if_missing(paths.state_file, _json(DEFAULT_STATE))
    _write_if_missing(paths.queue_file, DEFAULT_QUEUE)

    return paths


def load_state(paths: AutoPaths) -> dict[str, Any]:
    return json.loads(paths.state_file.read_text(encoding="utf-8"))


def save_state(paths: AutoPaths, state: dict[str, Any]) -> None:
    paths.state_file.write_text(_json(state), encoding="utf-8")


def _write_if_missing(path: Path, content: str) -> None:
    if not path.exists():
        path.write_text(content, encoding="utf-8")


def _json(payload: dict[str, Any]) -> str:
    return json.dumps(payload, indent=2) + "\n"
