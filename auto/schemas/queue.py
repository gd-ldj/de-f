"""Queue-facing schema objects for AUTO v2."""

from __future__ import annotations

from dataclasses import dataclass, field

from auto.schemas.states import TASK_PENDING, TaskState


@dataclass(frozen=True)
class QueueEntry:
    """A single executable task row in `.auto/queue/TASK-QUEUE.md`."""

    task: str
    work_item: str
    state: TaskState = TASK_PENDING
    depends_on: tuple[str, ...] = field(default_factory=tuple)
    notes: str = ""

    def depends_on_cell(self) -> str:
        return ", ".join(self.depends_on) if self.depends_on else "-"

    def notes_cell(self) -> str:
        return self.notes or "-"
