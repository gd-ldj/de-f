"""Task schema for AUTO v2 planning artifacts."""

from __future__ import annotations

from dataclasses import asdict, dataclass, field

from auto.schemas.queue import QueueEntry
from auto.schemas.states import TASK_PENDING, TaskState


@dataclass(frozen=True)
class TaskRecord:
    slug: str
    work_item_id: str
    title: str
    state: TaskState = TASK_PENDING
    depends_on: tuple[str, ...] = field(default_factory=tuple)
    notes: str = ""
    scope_files: tuple[str, ...] = field(default_factory=tuple)

    def to_dict(self) -> dict[str, object]:
        return asdict(self)

    def to_queue_entry(self) -> QueueEntry:
        return QueueEntry(
            task=self.slug,
            work_item=self.work_item_id,
            state=self.state,
            depends_on=self.depends_on,
            notes=self.notes or self.title,
        )
