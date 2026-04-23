"""Task-level verify wrapper for AUTO v2."""

from __future__ import annotations

import json
from pathlib import Path

from auto.runtime.agent_runner import run_stage
from auto.runtime.context_paths import build_task_context_hints, build_task_context_paths


def run_verify(
    task_dir: str | Path,
    task: dict,
    workflow: dict,
    *,
    project_root: str | Path | None = None,
) -> dict:
    task_dir_path = Path(task_dir).resolve()
    workspace_root = Path(project_root).resolve() if project_root is not None else Path.cwd().resolve()
    canonical_project_root = _resolve_project_root(task_dir_path, workspace_root)
    payload = {
        "title": task.get("title", ""),
        "notes": task.get("notes", ""),
        "slug": task.get("slug", ""),
        "workspace_root": str(workspace_root),
        "planned_files": list(task.get("scope_files", [])),
        "context_paths": _filter_verify_context_paths(
            build_task_context_paths(project_root=canonical_project_root, task=task, task_dir=task_dir_path)
        ),
        "context_hints": build_task_context_hints(slug=str(task.get("slug", ""))),
    }
    result = run_stage(
        "task_verify",
        payload,
        workflow,
        project_root=project_root,
        artifact_dir=task_dir,
    )
    task_dir_path.mkdir(parents=True, exist_ok=True)
    task_dir_path.joinpath("VERIFY.json").write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    return result


def _filter_verify_context_paths(paths: dict[str, str]) -> dict[str, str]:
    allowed = ("requirement", "spec", "qa_units", "verify_plan")
    return {key: value for key, value in paths.items() if key in allowed}


def _resolve_project_root(task_dir: Path, workspace_root: Path) -> Path:
    auto_root = task_dir.parent.parent if task_dir.parent.name == "tasks" and task_dir.parent.parent.name == ".auto" else None
    if auto_root is not None:
        return auto_root.parent.resolve()
    return workspace_root.resolve()
