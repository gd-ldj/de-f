"""Work item schema for AUTO v2 intake artifacts."""

from __future__ import annotations

from dataclasses import asdict, dataclass, field


@dataclass(frozen=True)
class WorkItemRecord:
    item_id: str
    requirement: str
    spec_artifact: str
    task_slugs: tuple[str, ...] = field(default_factory=tuple)
    qa_unit_ids: tuple[str, ...] = field(default_factory=tuple)
    design_artifact: str | None = None

    def to_dict(self) -> dict[str, object]:
        return asdict(self)
