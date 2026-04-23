"""QA Unit planning for AUTO v2."""

from __future__ import annotations

import re
from pathlib import Path

from auto.orchestrator.intake import build_acceptance_criteria, persist_json
from auto.schemas.qa_unit import QAUnitRecord
from auto.schemas.task import TaskRecord


def build_qa_units(item_dir: str | Path, item_id: str, requirement: str, tasks: list[TaskRecord]) -> list[QAUnitRecord]:
    verify_mode = "browser" if any(keyword in requirement.lower() for keyword in ("page", "modal", "dialog", "button", "banner")) else "non_ui"
    target_path = _infer_target_path(requirement, tasks) if verify_mode == "browser" else None
    qa_unit = QAUnitRecord(
        qa_unit_id=f"{item_id}-qa-01",
        primary_work_item_id=item_id,
        acceptance_boundary=f"Validate {item_id} against spec acceptance criteria",
        member_tasks=tuple(task.slug for task in tasks),
        acceptance_criteria=tuple(build_acceptance_criteria(requirement)),
        verify_mode=verify_mode,
        target_path=target_path,
        fail_on_missing_verify_json=False,
        notes=tuple(marker for marker in ("[qa-fail-once]", "[qa-block]") if marker in requirement.lower()),
    )
    persist_json(Path(item_dir) / "QA-UNITS.json", [qa_unit.to_dict()])
    return [qa_unit]


def _infer_target_path(requirement: str, tasks: list[TaskRecord]) -> str | None:
    explicit = _extract_explicit_target_path(requirement)
    if explicit:
        return explicit
    for task in tasks:
        for scope_file in task.scope_files:
            derived = _derive_target_path_from_scope(scope_file)
            if derived:
                return derived
    return None


def _extract_explicit_target_path(text: str) -> str | None:
    matches = re.findall(
        r"(?<![A-Za-z0-9_.-])(/(?:[A-Za-z0-9._~!$&'()*+,;=:@%-]+(?:/[A-Za-z0-9._~!$&'()*+,;=:@%\-]+)*)?)",
        text,
    )
    if not matches:
        return None
    return matches[-1].rstrip(".,;:)]}") or None


def _derive_target_path_from_scope(scope_file: str) -> str | None:
    normalized = str(scope_file).strip().lstrip("./")
    if not normalized.startswith("app/"):
        return None
    page_pattern = ("/page.tsx", "/page.ts", "/page.jsx", "/page.js")
    if not normalized.endswith(page_pattern):
        return None
    route = normalized[4:]
    for suffix in page_pattern:
        if route.endswith(suffix):
            route = route[: -len(suffix)]
            break
    segments: list[str] = []
    for raw_segment in route.split("/"):
        segment = raw_segment.strip()
        if not segment or (segment.startswith("(") and segment.endswith(")")):
            continue
        if segment == "[locale]":
            segments.append("en")
            continue
        if re.fullmatch(r"\[\[\.\.\.[^/\]]+\]\]", segment):
            continue
        if re.fullmatch(r"\[\.\.\.[^/\]]+\]", segment):
            segments.append("sample")
            continue
        if re.fullmatch(r"\[[^/\]]+\]", segment):
            segments.append("sample")
            continue
        segments.append(segment)
    return "/" + "/".join(segments) if segments else "/"
