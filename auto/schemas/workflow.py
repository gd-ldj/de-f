"""Workflow config loader for AUTO v2."""

from __future__ import annotations

from copy import deepcopy
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_STAGE_COMMAND = f"python3 {REPO_ROOT / 'scripts' / 'auto-stage-agent.py'}"
DEFAULT_CODEX_REVIEW_COMMAND = (
    f"AUTO_CODEX_REVIEW_MODE=auto python3 {REPO_ROOT / 'scripts' / 'auto-codex-review.py'}"
)
DEFAULT_CODEX_VERIFY_COMMAND = (
    f"AUTO_CODEX_VERIFY_MODE=auto python3 {REPO_ROOT / 'scripts' / 'auto-codex-verify.py'}"
)
DEFAULT_QA_VERIFY_COMMAND = (
    f"AUTO_QA_VERIFY_MODE=auto python3 {REPO_ROOT / 'scripts' / 'auto-qa-verify.py'}"
)

DEFAULT_WORKFLOW_CONFIG: dict[str, Any] = {
    "version": 1,
    "runtime": {
        "state": "idle",
        "max_parallel": 1,
        "drain_on_start": True,
        "background_start": False,
        "keep_alive": False,
        "poll_interval_seconds": 15,
        "lease_stale_after_seconds": 900,
        "auto_restart": True,
        "max_restart_attempts": 3,
        "restart_delay_seconds": 5,
    },
    "agents": {
        "spec_review": "command",
        "task_dev": "command",
        "task_review": "command",
        "task_verify": "command",
        "qa_verify": "command",
    },
    "agent_commands": {
        "spec_review": DEFAULT_STAGE_COMMAND,
        "task_dev": DEFAULT_STAGE_COMMAND,
        "task_review": DEFAULT_CODEX_REVIEW_COMMAND,
        "task_verify": DEFAULT_CODEX_VERIFY_COMMAND,
        "qa_verify": DEFAULT_QA_VERIFY_COMMAND,
    },
    "agent_timeouts": {
        "spec_review": 300,
        "task_dev": 900,
        "task_review": 300,
        "task_verify": 600,
        "qa_verify": 600,
    },
    "agent_retry": {
        "attempts": 2,
        "strategy": "fixed",
        "base_delay": 1,
        "max_delay": 5,
        "jitter": False,
    },
    "review": {
        "reviewer": "configurable",
    },
    "verify": {
        "mode": "qa_unit_default",
        "task_level_enabled": False,
        "fail_on_missing_verify_json": False,
        "max_total_fix_attempts": 6,
    },
    "budget": {
        "spec_review_tokens": 120000,
        "task_dev_tokens": 400000,
        "task_review_tokens": 120000,
        "qa_verify_tokens": 200000,
        "per_task_total_tokens": 700000,
        "on_budget_exceeded": "pause_task",
    },
    "safeguards": {
        "expand_threshold": 5,
        "forbidden": [],
    },
    "dev_server": {
        "port": 3000,
        "health_path": "/",
        "start_command": "",
    },
    "worktree": {
        "reuse_existing": True,
        "cleanup_policy": "preserve_metadata",
    },
    "watchdog": {
        "repeated_block_threshold": 3,
        "stale_progress_seconds": 900,
    },
    "alerts": {
        "webhook_url": "",
        "telegram_enabled": False,
        "telegram_bot_token_env": "TG_BOT_TOKEN",
        "telegram_chat_id_env": "TG_CHAT_ID",
        "events": ["repeated_block", "stalled_progress", "runtime_crash", "queue_drained"],
    },
    "gates": {
        "tsc": False,
        "tsc_command": "npx tsc --noEmit",
        "build": False,
        "build_command": "pnpm build",
        "e2e": False,
        "e2e_mode": "auto",
        "e2e_trigger_keywords": ["page", "modal", "dialog", "button", "banner", "form", "table", "drawer", "popover"],
        "e2e_trigger_scope_prefixes": ["app/", "components/"],
        "e2e_auto_command": "pnpm test:e2e",
        "e2e_command": "pnpm test:e2e",
    },
}


def load_workflow_config(path: str | Path) -> dict[str, Any]:
    payload = deepcopy(DEFAULT_WORKFLOW_CONFIG)
    workflow_path = Path(path)
    if not workflow_path.exists():
        return payload
    raw = workflow_path.read_text(encoding="utf-8")
    parsed = _parse_simple_yaml(raw)
    return _deep_merge(payload, parsed)


def dump_workflow_config(config: dict[str, Any]) -> str:
    lines: list[str] = []
    _render_yaml(lines, config, 0)
    return "\n".join(lines) + "\n"


def _deep_merge(base: dict[str, Any], override: dict[str, Any]) -> dict[str, Any]:
    merged = deepcopy(base)
    for key, value in override.items():
        if isinstance(value, dict) and isinstance(merged.get(key), dict):
            merged[key] = _deep_merge(merged[key], value)
        else:
            merged[key] = value
    return merged


def _parse_simple_yaml(text: str) -> dict[str, Any]:
    """Parse the small YAML subset used by `.auto/WORKFLOW.yaml`.

    Supported forms:
    - `key: value`
    - nested mappings via indentation
    - inline lists like `key: [a, b]`
    - indented scalar lists under a key

    Unsupported forms intentionally remain unsupported in v1:
    - block scalars (`|` / `>`)
    - complex list items (dicts inside lists)
    - YAML anchors / aliases
    """

    root: dict[str, Any] = {}
    stack: list[tuple[int, dict[str, Any] | list[Any]]] = [(-1, root)]
    lines = text.splitlines()
    for index, raw_line in enumerate(lines):
        line = raw_line.rstrip()
        if not line or line.lstrip().startswith("#"):
            continue
        indent = len(line) - len(line.lstrip(" "))
        stripped = line.strip()
        while stack and indent <= stack[-1][0]:
            stack.pop()
        current = stack[-1][1]
        if stripped.startswith("- "):
            if isinstance(current, list):
                current.append(_cast_scalar(stripped[2:].strip()))
            continue
        if ":" not in stripped:
            continue
        key, value = stripped.split(":", 1)
        if not isinstance(current, dict):
            continue
        value = value.strip()
        if value == "":
            child: dict[str, Any] | list[Any] | str = ""
            next_line = _next_meaningful_line(lines, index + 1)
            if next_line is not None:
                next_indent, next_stripped = next_line
                if next_indent > indent:
                    child = [] if next_stripped.startswith("- ") else {}
            current[key] = child
            if isinstance(child, (dict, list)):
                stack.append((indent, child))
        else:
            current[key] = _cast_scalar(value)
    return root


def _next_meaningful_line(lines: list[str], start_index: int) -> tuple[int, str] | None:
    for raw_line in lines[start_index:]:
        line = raw_line.rstrip()
        if not line or line.lstrip().startswith("#"):
            continue
        indent = len(line) - len(line.lstrip(" "))
        return indent, line.strip()
    return None


def _cast_scalar(value: str) -> Any:
    lowered = value.lower()
    if lowered == "true":
        return True
    if lowered == "false":
        return False
    if lowered in {"null", "none"}:
        return None
    if value.startswith("[") and value.endswith("]"):
        inner = value[1:-1].strip()
        if not inner:
            return []
        return [_cast_scalar(part.strip().strip('"').strip("'")) for part in inner.split(",")]
    try:
        return int(value)
    except ValueError:
        pass
    try:
        return float(value)
    except ValueError:
        pass
    return value.strip('"').strip("'")


def _render_yaml(lines: list[str], data: dict[str, Any], indent: int) -> None:
    prefix = " " * indent
    for key, value in data.items():
        if isinstance(value, dict):
            lines.append(f"{prefix}{key}:")
            _render_yaml(lines, value, indent + 2)
        elif isinstance(value, list):
            rendered = ", ".join(str(item).lower() if isinstance(item, bool) else str(item) for item in value)
            lines.append(f"{prefix}{key}: [{rendered}]")
        elif isinstance(value, bool):
            lines.append(f"{prefix}{key}: {'true' if value else 'false'}")
        else:
            lines.append(f"{prefix}{key}: {value}")
