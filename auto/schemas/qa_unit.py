"""QA Unit schema for AUTO v2 acceptance planning."""

from __future__ import annotations

from dataclasses import asdict, dataclass, field

from auto.schemas.states import QA_UNIT_PENDING, QAUnitState


@dataclass(frozen=True)
class QAUnitRecord:
    qa_unit_id: str
    primary_work_item_id: str
    acceptance_boundary: str
    member_tasks: tuple[str, ...]
    acceptance_criteria: tuple[str, ...]
    verify_mode: str = "non_ui"
    target_path: str | None = None
    max_selector_retries: int = 2
    max_flow_retries: int = 1
    fail_on_missing_verify_json: bool = False
    owner: str = "auto-planner"
    state: QAUnitState = QA_UNIT_PENDING
    notes: tuple[str, ...] = field(default_factory=tuple)

    def to_dict(self) -> dict[str, object]:
        return asdict(self)
