"""Helpers for building stable path-first task context payloads."""

from __future__ import annotations

from pathlib import Path


def build_task_context_paths(
    *,
    project_root: str | Path,
    task: dict,
    task_dir: str | Path | None = None,
) -> dict[str, str]:
    root = Path(project_root).resolve()
    slug = str(task.get("slug", "")).strip()
    work_item_id = str(task.get("work_item_id", "")).strip()

    paths: dict[str, str] = {}

    if work_item_id:
        item_dir = root / ".auto" / "work-items" / work_item_id
        _add_if_exists(paths, "requirement", item_dir / "REQUIREMENT.md")
        spec_path = _resolve_spec_path(item_dir)
        if spec_path is not None:
            _add_if_exists(paths, "spec", spec_path)
        _add_if_exists(paths, "tasks", item_dir / "TASKS.json")
        _add_if_exists(paths, "qa_units", item_dir / "QA-UNITS.json")

    if slug:
        resolved_task_dir = Path(task_dir).resolve() if task_dir is not None else root / ".auto" / "tasks" / slug
        _add_if_exists(paths, "fix_context", resolved_task_dir / "FIX-CONTEXT.json")
        _add_if_exists(paths, "review", resolved_task_dir / "REVIEW.json")
        _add_if_exists(paths, "result", resolved_task_dir / "RESULT.json")
        _add_if_exists(paths, "status", resolved_task_dir / "STATUS.json")
        _add_if_exists(paths, "verify_plan", resolved_task_dir / "VERIFY-PLAN.json")

    return paths


def build_task_context_hints(*, slug: str) -> dict[str, dict[str, str]]:
    clean_slug = str(slug).strip()
    return {
        "tasks_filter": {"current_slug": clean_slug},
        "qa_units_filter": {"member_task_slug": clean_slug},
    }


def build_task_hard_rules() -> list[str]:
    return [
        "Only modify files listed in planned_files unless reporting scope drift",
        "Read required context files before coding",
        "Return modified files in files_modified",
    ]


def _resolve_spec_path(item_dir: Path) -> Path | None:
    for name in ("SPEC.md", "SPEC-LITE.md"):
        path = item_dir / name
        if path.exists():
            return path
    return None


def _add_if_exists(result: dict[str, str], key: str, path: Path) -> None:
    if path.exists():
        result[key] = str(path.resolve())
