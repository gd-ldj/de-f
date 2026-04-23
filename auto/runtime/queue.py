"""Read and write the Markdown task queue used by AUTO v2."""

from __future__ import annotations

from pathlib import Path

from auto.schemas.queue import QueueEntry

QUEUE_HEADER = """# AUTO Task Queue

> Queue entries are appended via `/auto:add`.

| Task | Work Item | State | Depends On | Notes |
| --- | --- | --- | --- | --- |
"""


class QueueCollisionError(ValueError):
    """Raised when a new queue entry conflicts with an existing task slug."""


def read_queue(queue_file: str | Path) -> list[QueueEntry]:
    path = Path(queue_file)
    if not path.exists():
        return []

    entries: list[QueueEntry] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        raw = line.strip()
        if not raw.startswith("|"):
            continue
        if raw.startswith("| ---"):
            continue

        cells = [cell.strip() for cell in raw.strip("|").split("|")]
        if len(cells) != 5 or cells[0] == "Task":
            continue

        depends_on = tuple(
            part.strip() for part in cells[3].split(",") if part.strip() and part.strip() != "-"
        )
        notes = "" if cells[4] == "-" else cells[4]
        entries.append(
            QueueEntry(
                task=cells[0],
                work_item=cells[1],
                state=cells[2],
                depends_on=depends_on,
                notes=notes,
            )
        )
    return entries


def write_queue(queue_file: str | Path, entries: list[QueueEntry]) -> None:
    path = Path(queue_file)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(render_queue(entries), encoding="utf-8")


def append_queue_entries(queue_file: str | Path, new_entries: list[QueueEntry]) -> list[QueueEntry]:
    existing_entries = read_queue(queue_file)
    existing_tasks = {entry.task for entry in existing_entries}

    for entry in new_entries:
        if entry.task in existing_tasks:
            raise QueueCollisionError(f"Task slug already exists in queue: {entry.task}")
        existing_tasks.add(entry.task)

    combined = [*existing_entries, *new_entries]
    write_queue(queue_file, combined)
    return combined


def render_queue(entries: list[QueueEntry]) -> str:
    lines = [QUEUE_HEADER.rstrip(), ""]
    for entry in entries:
        lines.append(
            "| {task} | {work_item} | {state} | {depends_on} | {notes} |".format(
                task=entry.task,
                work_item=entry.work_item,
                state=entry.state,
                depends_on=entry.depends_on_cell(),
                notes=entry.notes_cell(),
            )
        )
    lines.append("")
    return "\n".join(lines)
