"""Quality gates for AUTO v2 tasks."""

from __future__ import annotations

import json
import os
import re
import shlex
import subprocess
from pathlib import Path
from typing import Any

ENV_ASSIGNMENT_PATTERN = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*=.*$")
UNSUPPORTED_SHELL_TOKENS = {"&&", "||", "|", ";", "&", ">", ">>", "<", "2>", "1>", "2>>", "1>>"}


def run_quality_gates(
    *,
    project_root: str | Path,
    workflow: dict[str, Any],
    task: dict[str, Any],
    task_dir: str | Path,
    meta_root: str | Path | None = None,
) -> dict[str, Any]:
    """Run quality gates.

    Args:
        project_root: Directory where commands (tsc, build, e2e) execute.
            When using worktrees this should be the worktree root.
        meta_root: Directory containing ``.auto/`` runtime metadata.
            Defaults to *project_root* when not provided. When the task
            runs inside an isolated worktree that lacks ``.auto/``, pass
            the original project root here so QA-UNITS.json and other
            state files can be found.
    """
    effective_meta_root = Path(meta_root) if meta_root else Path(project_root)
    gates = dict(workflow.get("gates", {}) or {})
    results: list[dict[str, Any]] = []

    if gates.get("tsc"):
        results.append(
            _run_gate(
                name="tsc",
                category="gate_tsc",
                command=str(gates.get("tsc_command", "npx tsc --noEmit")).strip() or "npx tsc --noEmit",
                project_root=project_root,
            )
        )

    if gates.get("build"):
        results.append(
            _run_gate(
                name="build",
                category="verify_block",
                command=str(gates.get("build_command", "pnpm build")).strip() or "pnpm build",
                project_root=project_root,
            )
        )

    e2e_mode = str(gates.get("e2e_mode", "always")).strip().lower() or "always"
    if _should_run_e2e_gate(project_root=effective_meta_root, gates=gates, task=task):
        results.append(
            _run_gate(
                name="e2e",
                category="gate_e2e",
                command=_resolve_e2e_command(gates=gates, e2e_mode=e2e_mode),
                project_root=project_root,
            )
        )

    payload = {
        "status": "ok",
        "verdict": "pass",
        "results": results,
        "task_slug": task.get("slug", ""),
        "failed_gate": "",
    }
    for result in results:
        if result["status"] != "ok":
            payload["status"] = "error"
            payload["verdict"] = "block"
            payload["failed_gate"] = result["name"]
            payload["category"] = result["category"]
            payload["summary"] = f"{result['name']} gate failed"
            break
    else:
        payload["summary"] = "quality gates passed"

    task_path = Path(task_dir)
    task_path.mkdir(parents=True, exist_ok=True)
    task_path.joinpath("QUALITY-GATES.json").write_text(
        json.dumps(payload, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    return payload


def _should_run_e2e_gate(*, project_root: str | Path, gates: dict[str, Any], task: dict[str, Any]) -> bool:
    if not gates.get("e2e"):
        return False

    mode = str(gates.get("e2e_mode", "always")).strip().lower() or "always"
    if mode == "never":
        return False
    if mode == "always":
        return True
    if mode != "auto":
        return True

    scope_prefixes = tuple(
        str(item).strip()
        for item in gates.get("e2e_trigger_scope_prefixes", ["app/", "components/"])
        if str(item).strip()
    )
    if any(str(scope_file).strip().startswith(scope_prefixes) for scope_file in task.get("scope_files", []) if scope_prefixes):
        return True

    keywords = {
        str(item).strip().lower()
        for item in gates.get(
            "e2e_trigger_keywords",
            ["page", "modal", "dialog", "button", "banner", "form", "table", "drawer", "popover"],
        )
        if str(item).strip()
    }
    text = " ".join(
        str(task.get(field, "") or "").strip().lower()
        for field in ("title", "notes")
    )
    if any(keyword in text for keyword in keywords):
        return True

    qa_units = _load_work_item_qa_units(project_root=project_root, work_item_id=str(task.get("work_item_id", "") or ""))
    return any(str(unit.get("verify_mode", "")).strip().lower() == "browser" for unit in qa_units if isinstance(unit, dict))


def _resolve_e2e_command(*, gates: dict[str, Any], e2e_mode: str) -> str:
    default_command = "pnpm test:e2e"
    base_command = str(gates.get("e2e_command", default_command)).strip() or default_command
    if e2e_mode != "auto":
        return base_command
    auto_command = str(gates.get("e2e_auto_command", "")).strip()
    return auto_command or base_command


def _load_work_item_qa_units(*, project_root: str | Path, work_item_id: str) -> list[dict[str, Any]]:
    if not work_item_id:
        return []
    qa_units_path = Path(project_root) / ".auto" / "work-items" / work_item_id / "QA-UNITS.json"
    if not qa_units_path.exists():
        return []
    try:
        payload = json.loads(qa_units_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return []
    if not isinstance(payload, list):
        return []
    return [item for item in payload if isinstance(item, dict)]


def _run_gate(*, name: str, category: str, command: str, project_root: str | Path) -> dict[str, Any]:
    parsed = _parse_gate_command(command)
    if "error" in parsed:
        return {
            "name": name,
            "category": category,
            "command": command,
            "status": "error",
            "stdout": "",
            "stderr": str(parsed["error"]),
            "returncode": 1,
        }

    env = os.environ.copy()
    env.update(parsed["env"])
    result = subprocess.run(
        parsed["argv"],
        shell=False,
        cwd=str(Path(project_root)),
        capture_output=True,
        text=True,
        env=env,
    )
    return {
        "name": name,
        "category": category,
        "command": command,
        "status": "ok" if result.returncode == 0 else "error",
        "stdout": (result.stdout or "").strip()[-1000:],
        "stderr": (result.stderr or "").strip()[-1000:],
        "returncode": result.returncode,
    }


def _parse_gate_command(command: str) -> dict[str, Any]:
    try:
        tokens = shlex.split(command, posix=True)
    except ValueError as exc:
        return {"error": f"invalid gate command: {exc}"}
    if not tokens:
        return {"error": "invalid gate command: empty command"}
    for token in tokens:
        if token in UNSUPPORTED_SHELL_TOKENS:
            return {"error": f"unsupported shell control operator in gate command: {token}"}
    env_updates: dict[str, str] = {}
    argv: list[str] = []
    parsing_assignments = True
    for token in tokens:
        if parsing_assignments and ENV_ASSIGNMENT_PATTERN.match(token):
            key, value = token.split("=", 1)
            env_updates[key] = value
            continue
        parsing_assignments = False
        argv.append(token)
    if not argv:
        return {"error": "invalid gate command: missing executable"}
    return {"env": env_updates, "argv": argv}
