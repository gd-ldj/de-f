"""Optional design artifact generation for AUTO v2."""

from __future__ import annotations

from pathlib import Path


UI_KEYWORDS = ("page", "modal", "dialog", "form", "button", "table", "banner", "card")


def maybe_write_design(item_dir: str | Path, requirement: str) -> Path | None:
    lowered = requirement.lower()
    if not any(keyword in lowered for keyword in UI_KEYWORDS):
        return None
    design_path = Path(item_dir) / "DESIGN.md"
    design_path.write_text(
        "\n".join(
            [
                "# Design",
                "",
                "## Interaction Notes",
                "- Keep the change within the existing DeTake Admin patterns.",
                "- Preserve `.auto/` as the only new artifact root.",
                "- QA Unit verification remains the default acceptance path.",
                "",
                "## Requirement Context",
                requirement.strip(),
                "",
            ]
        ),
        encoding="utf-8",
    )
    return design_path
