"""Lessons capture for AUTO v2."""

from __future__ import annotations

import datetime as dt
import json
from pathlib import Path


def append_lesson(runtime_dir: str | Path, lesson: dict) -> Path:
    runtime_path = Path(runtime_dir)
    runtime_path.mkdir(parents=True, exist_ok=True)
    lessons_path = runtime_path / "lessons.jsonl"
    now = dt.datetime.now(dt.UTC)
    payload = {
        "timestamp": now.isoformat(timespec="seconds"),
        "lesson_id": lesson.get("lesson_id") or f"lesson-{now.strftime('%Y%m%d-%H%M%S-%f')}",
        **lesson,
    }
    with lessons_path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(payload, ensure_ascii=False) + "\n")
    return lessons_path
