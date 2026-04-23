"""Task split helpers for AUTO v2."""

from __future__ import annotations

import re
from pathlib import Path

from auto.orchestrator.intake import build_acceptance_criteria, persist_json
from auto.runtime.queue import read_queue
from auto.runtime.scope import normalize_scope_files
from auto.schemas.task import TaskRecord


MARKERS = ("[review-block]", "[qa-fail-once]", "[empty-diff]", "[scope-drift]", "[sibling-drift]")


def build_tasks(item_dir: str | Path, item_id: str, requirement: str, queue_file: str | Path) -> list[TaskRecord]:
    criteria = build_acceptance_criteria(requirement)
    existing = {entry.task for entry in read_queue(queue_file)}
    base = _slugify(requirement)[:40] or item_id
    tasks: list[TaskRecord] = []
    for index, criterion in enumerate(criteria, start=1):
        slug_base = f"{base}-{index:02d}" if len(criteria) > 1 else base
        slug = _ensure_unique_slug(slug_base, existing)
        existing.add(slug)
        notes = " ".join(marker for marker in MARKERS if marker.lower() in requirement.lower())
        scope_files = _scope_files_for_task(criterion, slug)
        task = TaskRecord(
            slug=slug,
            work_item_id=item_id,
            title=criterion,
            depends_on=_dependency_slugs(tasks, scope_files),
            notes=notes.strip(),
            scope_files=scope_files,
        )
        tasks.append(task)
    persist_json(Path(item_dir) / "TASKS.json", [task.to_dict() for task in tasks])
    return tasks


def _ensure_unique_slug(base: str, existing: set[str]) -> str:
    if base not in existing:
        return base
    for index in range(2, 100):
        candidate = f"{base}-{index}"
        if candidate not in existing:
            return candidate
    raise ValueError(f"task slug collision cannot be resolved for {base}")


def _slugify(value: str) -> str:
    cleaned = re.sub(r"\[[^\]]+\]", "", value).lower()
    cleaned = re.sub(r"[^a-z0-9]+", "-", cleaned)
    return cleaned.strip("-")


def _scope_files_for_task(criterion: str, slug: str) -> tuple[str, ...]:
    marker_value = _extract_scope_marker(criterion)
    if marker_value:
        return tuple(normalize_scope_files(tuple(part.strip() for part in marker_value.split(","))))
    return (f"auto/generated/{slug}.md",)


def _dependency_slugs(existing_tasks: list[TaskRecord], scope_files: tuple[str, ...]) -> tuple[str, ...]:
    scope_set = set(normalize_scope_files(scope_files))
    if not scope_set:
        return ()
    overlapping = [
        task.slug
        for task in existing_tasks
        if scope_set.intersection(normalize_scope_files(task.scope_files))
    ]
    return tuple(overlapping)


def _extract_scope_marker(text: str) -> str | None:
    token = "[scope:"
    start = text.lower().find(token)
    if start == -1:
        return None
    content_start = start + len(token)
    depth = 0
    chars: list[str] = []
    for char in text[content_start:]:
        if char == "[":
            depth += 1
            chars.append(char)
            continue
        if char == "]":
            if depth == 0:
                value = "".join(chars).strip()
                return value or None
            depth -= 1
            chars.append(char)
            continue
        chars.append(char)
    return None
