"""Path helpers for AUTO v2 artifacts."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class AutoPaths:
    """Resolve stable filesystem locations under the `.auto` artifact root."""

    artifact_root: Path

    @property
    def workflow_file(self) -> Path:
        return self.artifact_root / "WORKFLOW.yaml"

    @property
    def state_file(self) -> Path:
        return self.artifact_root / "STATE.json"

    @property
    def queue_dir(self) -> Path:
        return self.artifact_root / "queue"

    @property
    def queue_file(self) -> Path:
        return self.queue_dir / "TASK-QUEUE.md"

    @property
    def work_items_dir(self) -> Path:
        return self.artifact_root / "work-items"

    @property
    def tasks_dir(self) -> Path:
        return self.artifact_root / "tasks"

    @property
    def qa_units_dir(self) -> Path:
        return self.artifact_root / "qa-units"

    @property
    def reports_dir(self) -> Path:
        return self.artifact_root / "reports"

    @property
    def daily_reports_dir(self) -> Path:
        return self.reports_dir / "daily"

    @property
    def runtime_dir(self) -> Path:
        return self.artifact_root / "runtime"

    @property
    def heartbeat_dir(self) -> Path:
        return self.runtime_dir / "heartbeat"

    @property
    def knowledge_dir(self) -> Path:
        return self.artifact_root / "knowledge"

    def required_directories(self) -> tuple[Path, ...]:
        return (
            self.artifact_root,
            self.queue_dir,
            self.work_items_dir,
            self.tasks_dir,
            self.qa_units_dir,
            self.daily_reports_dir,
            self.runtime_dir,
            self.heartbeat_dir,
            self.knowledge_dir,
        )


def resolve_auto_paths(project_root: str | Path) -> AutoPaths:
    root = Path(project_root).resolve()
    return AutoPaths(artifact_root=root / ".auto")
