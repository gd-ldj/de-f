"""Task workspace helpers for AUTO v2 runtime."""

from __future__ import annotations

import datetime as dt
import json
import shutil
import subprocess
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class TaskWorkspace:
    task_slug: str
    root: Path
    metadata_file: Path
    mode: str


def worktree_root(project_root: str | Path) -> Path:
    return Path(project_root) / ".claude" / "worktrees" / "auto"


def prepare_task_workspace(project_root: str | Path, task_slug: str, *, reuse_existing: bool = True) -> TaskWorkspace:
    project_root = Path(project_root).resolve()
    root = worktree_root(project_root) / task_slug
    metadata_file = root / ".auto-worktree.json"
    mode = "directory"
    reuse_count = 0

    if root.exists() and not reuse_existing:
        shutil.rmtree(root, ignore_errors=True)

    if not root.exists():
        root.parent.mkdir(parents=True, exist_ok=True)
        if _can_create_git_worktree(project_root):
            mode = _try_create_git_worktree(project_root, root)
        if mode != "git-worktree":
            root.mkdir(parents=True, exist_ok=True)
    elif metadata_file.exists():
        try:
            existing = json.loads(metadata_file.read_text(encoding="utf-8"))
            mode = str(existing.get("mode", mode))
            reuse_count = int(existing.get("reuse_count", 0)) + 1
        except json.JSONDecodeError:
            mode = "directory"

    metadata = {
        "task_slug": task_slug,
        "project_root": str(project_root),
        "workspace_root": str(root),
        "mode": mode,
        "reuse_count": reuse_count,
        "updated_at": _now(),
    }
    metadata_file.write_text(json.dumps(metadata, indent=2) + "\n", encoding="utf-8")
    return TaskWorkspace(task_slug=task_slug, root=root, metadata_file=metadata_file, mode=mode)


def finalize_task_workspace(
    workspace: TaskWorkspace,
    *,
    status: str,
    changed_files: list[str] | None = None,
) -> None:
    metadata = _read_metadata(workspace)
    metadata["last_status"] = status
    metadata["changed_files"] = list(changed_files or [])
    metadata["updated_at"] = _now()
    workspace.metadata_file.write_text(json.dumps(metadata, indent=2) + "\n", encoding="utf-8")


def cleanup_task_workspace(workspace: TaskWorkspace, *, preserve_metadata: bool = True) -> None:
    if preserve_metadata:
        metadata = _read_metadata(workspace)
        metadata["cleaned_up_at"] = _now()
        workspace.metadata_file.write_text(json.dumps(metadata, indent=2) + "\n", encoding="utf-8")
        return
    if workspace.mode == "git-worktree":
        subprocess.run(
            ["git", "worktree", "remove", "--force", str(workspace.root)],
            capture_output=True,
            text=True,
            timeout=120,
        )
        if workspace.root.exists():
            shutil.rmtree(workspace.root, ignore_errors=True)
        return
    shutil.rmtree(workspace.root, ignore_errors=True)


def sync_workspace_changes(
    project_root: str | Path,
    workspace_root: str | Path,
    changed_files: list[str] | tuple[str, ...],
) -> None:
    project_root = Path(project_root).resolve()
    workspace_root = Path(workspace_root).resolve()
    for relative_path in changed_files:
        rel = Path(relative_path)
        source = (workspace_root / rel).resolve()
        target = (project_root / rel).resolve()
        if not _is_within_root(project_root, target):
            raise ValueError(f"refusing to sync path outside project root: {relative_path}")
        target.parent.mkdir(parents=True, exist_ok=True)
        if source.exists():
            shutil.copy2(source, target)
            continue
        if target.exists():
            if target.is_dir():
                shutil.rmtree(target)
            else:
                target.unlink()


def load_task_workspace(project_root: str | Path, task_slug: str) -> TaskWorkspace | None:
    project_root = Path(project_root).resolve()
    root = worktree_root(project_root) / task_slug
    metadata_file = root / ".auto-worktree.json"
    if not root.exists() and not metadata_file.exists():
        return None
    mode = "directory"
    if metadata_file.exists():
        try:
            payload = json.loads(metadata_file.read_text(encoding="utf-8"))
            mode = str(payload.get("mode", mode))
        except json.JSONDecodeError:
            mode = "directory"
    return TaskWorkspace(task_slug=task_slug, root=root, metadata_file=metadata_file, mode=mode)


def _can_create_git_worktree(project_root: Path) -> bool:
    try:
        result = subprocess.run(
            ["git", "-C", str(project_root), "rev-parse", "--is-inside-work-tree"],
            capture_output=True,
            text=True,
            timeout=10,
        )
    except (OSError, subprocess.SubprocessError):
        return False
    return result.returncode == 0 and result.stdout.strip() == "true"


def _try_create_git_worktree(project_root: Path, root: Path) -> str:
    try:
        result = subprocess.run(
            ["git", "-C", str(project_root), "worktree", "add", "--detach", str(root), "HEAD"],
            capture_output=True,
            text=True,
            timeout=120,
        )
    except (OSError, subprocess.SubprocessError):
        return "directory"
    return "git-worktree" if result.returncode == 0 else "directory"


def _read_metadata(workspace: TaskWorkspace) -> dict:
    if not workspace.metadata_file.exists():
        return {
            "task_slug": workspace.task_slug,
            "workspace_root": str(workspace.root),
            "mode": workspace.mode,
        }
    try:
        payload = json.loads(workspace.metadata_file.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        payload = {}
    if not isinstance(payload, dict):
        payload = {}
    payload.setdefault("task_slug", workspace.task_slug)
    payload.setdefault("workspace_root", str(workspace.root))
    payload.setdefault("mode", workspace.mode)
    return payload


def _is_within_root(root: Path, candidate: Path) -> bool:
    try:
        candidate.relative_to(root)
        return True
    except ValueError:
        return False


def _now() -> str:
    return dt.datetime.now(dt.UTC).isoformat(timespec="seconds")
