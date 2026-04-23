"""Work item intake helpers for AUTO v2."""

from __future__ import annotations

import datetime as dt
import json
import re
from pathlib import Path

from auto.runtime.bootstrap import bootstrap_auto_root
from auto.runtime.state_paths import AutoPaths


def create_work_item_id(paths: AutoPaths) -> str:
    date_prefix = dt.date.today().isoformat()
    existing = sorted(path.name for path in paths.work_items_dir.iterdir() if path.is_dir())
    numbers = []
    for item in existing:
        if item.startswith(f"auto-{date_prefix}-"):
            suffix = item.rsplit("-", 1)[-1]
            if suffix.isdigit():
                numbers.append(int(suffix))
    next_number = max(numbers, default=0) + 1
    return f"auto-{date_prefix}-{next_number:03d}"


def prepare_work_item(project_root: str | Path, requirement: str) -> tuple[AutoPaths, str, Path]:
    paths = bootstrap_auto_root(project_root)
    item_id = create_work_item_id(paths)
    item_dir = paths.work_items_dir / item_id
    item_dir.mkdir(parents=True, exist_ok=False)
    item_dir.joinpath("REQUIREMENT.md").write_text(requirement.strip() + "\n", encoding="utf-8")
    return paths, item_id, item_dir


def should_use_full_spec(requirement: str, force_full_spec: bool = False, force_spec_lite: bool = False) -> bool:
    if force_full_spec:
        return True
    if force_spec_lite:
        return False
    keywords = ("workflow", "integration", "api", "dashboard", "cross-system", "multi-step")
    lowered = requirement.lower()
    return any(keyword in lowered for keyword in keywords)


def build_spec_artifact(item_dir: Path, requirement: str, use_full_spec: bool) -> tuple[str, Path]:
    spec_name = "SPEC.md" if use_full_spec else "SPEC-LITE.md"
    spec_path = item_dir / spec_name
    body = _build_spec_body(requirement, use_full_spec)
    spec_path.write_text(body, encoding="utf-8")
    return ("spec" if use_full_spec else "spec_lite"), spec_path


def _build_spec_body(requirement: str, use_full_spec: bool) -> str:
    title = _title_from_requirement(requirement)
    lines = [f"# {title}", "", "## Requirement", requirement.strip(), "", "## Acceptance Criteria"]
    for criterion in build_acceptance_criteria(requirement):
        lines.append(f"- {criterion}")
    if use_full_spec:
        lines.extend([
            "",
            "## Design Notes",
            "- Preserve AUTO v2 stage-configurable review and verify routing.",
            "- Keep all new artifacts under `.auto/`.",
        ])
    return "\n".join(lines) + "\n"


def build_acceptance_criteria(requirement: str) -> list[str]:
    cleaned = requirement.replace("[spec-block]", "").replace("[qa-fail-once]", "").replace("[empty-diff]", "").strip()
    parts = [part.strip(" .") for part in _split_acceptance_parts(cleaned) if part.strip()]
    if not parts:
        return [cleaned or "Requirement implemented as described"]
    return [part[0].upper() + part[1:] if part else part for part in parts[:3]]


def _split_acceptance_parts(text: str) -> list[str]:
    verb_pattern = (
        r"add|create|remove|update|fix|verify|include|show|hide|rename|move|change|"
        r"support|allow|display|enable|disable|record|generate|write"
    )
    parts: list[str] = []
    for chunk in re.split(r";", text, flags=re.IGNORECASE):
        pieces = re.split(rf"\band\s+(?=(?:{verb_pattern})\b)", chunk, flags=re.IGNORECASE)
        parts.extend(piece for piece in pieces if piece.strip())
    return parts


def persist_json(path: Path, payload: object) -> None:
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def _title_from_requirement(requirement: str) -> str:
    cleaned = re.sub(r"\[[^\]]+\]", "", requirement).strip()
    if not cleaned:
        return "AUTO Work Item"
    title = cleaned.split(".")[0].strip()
    return title[:80]
