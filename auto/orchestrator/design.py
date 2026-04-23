"""Design artifact generation for AUTO v2."""

from __future__ import annotations

import re
from pathlib import Path


# Keywords that indicate a UI / interactive requirement
UI_KEYWORDS = (
    "page", "modal", "dialog", "form", "button", "table", "banner", "card",
    "drawer", "popover", "overlay", "section", "layout", "sidebar", "navbar",
    "header", "footer", "list", "grid", "filter", "search", "input", "tab",
)


def should_generate_design_brief(requirement: str) -> bool:
    """Return True if the requirement describes a UI / interactive task.

    Uses word-boundary matching to avoid false positives like
    "database" matching "tab" or "newsletter" matching "list".
    """
    lowered = requirement.lower()
    return bool(_UI_PATTERN.search(lowered))


# Pre-compiled word-boundary pattern for UI keyword detection.
_UI_PATTERN = re.compile(
    r"\b(?:" + "|".join(re.escape(kw) for kw in UI_KEYWORDS) + r")\b"
)


def write_design_brief(item_dir: str | Path, requirement: str) -> Path | None:
    """Generate a structured DESIGN-BRIEF.md for UI/interactive requirements.

    Returns the path to the generated file, or None if the requirement
    is not UI-related.
    """
    if not should_generate_design_brief(requirement):
        return None

    surface = _infer_surface(requirement)
    brief_path = Path(item_dir) / "DESIGN-BRIEF.md"
    brief_path.write_text(
        _render_design_brief(requirement, surface),
        encoding="utf-8",
    )
    return brief_path


def _infer_surface(requirement: str) -> str:
    lowered = requirement.lower()
    if "modal" in lowered or "dialog" in lowered:
        return "modal / dialog"
    if "drawer" in lowered:
        return "drawer"
    if "form" in lowered:
        return "form"
    if "banner" in lowered:
        return "banner"
    if "sidebar" in lowered:
        return "sidebar"
    if "page" in lowered or "layout" in lowered:
        return "page"
    return "section / component"


def _render_design_brief(requirement: str, surface: str) -> str:
    lines = [
        "# Design Brief",
        "",
        "> Auto-generated design brief — review and amend before development.",
        "> This is a design target, not a pixel-perfect spec.",
        "",
        "## Surface",
        "",
        f"- Type: {surface}",
        "",
        "## User Goal",
        "",
        "- (Derived from requirement — describe what the user wants to accomplish on this surface)",
        "",
        "## Layout / Sections",
        "",
        "- (List the main areas and their information hierarchy)",
        "- (Describe the structural regions: header, content, sidebar, footer, etc.)",
        "",
        "## Components",
        "",
        "- (List the core UI components needed)",
        "- (Note which can reuse existing primitives from docs/UI_PRIMITIVES.md)",
        "",
        "## States",
        "",
        "- **loading**: skeleton or spinner visible, interactive controls disabled",
        "- **empty**: empty state message shown when no data is available",
        "- **error**: error message shown when the request fails",
        "- **success**: confirmation or updated content visible after action completes",
        "- **disabled**: controls that should be inactive under specific conditions",
        "- **active / hover / focus**: interactive state changes (highlight, outline, etc.)",
        "",
        "## Interactions",
        "",
        "- (List the primary user interactions: click, input, filter, toggle, etc.)",
        "- (Describe the expected result of each interaction)",
        "",
        "## Responsive Rules",
        "",
        "- **mobile (< 768px)**: (layout changes, stacking, hidden elements)",
        "- **tablet (768px–1024px)**: (intermediate layout adjustments)",
        "- **desktop (> 1024px)**: (full layout, max-width behavior)",
        "",
        "## Visual Constraints",
        "",
        "- Reference: `docs/UI_PRIMITIVES.md` — use existing color tokens, typography, spacing, and component patterns",
        "- (List any task-specific visual constraints: color, spacing, font, etc.)",
        "",
        "## Out of Scope",
        "",
        "- (List anything explicitly NOT included in this task to prevent scope drift)",
        "",
        "---",
        "",
        "## Requirement Context",
        "",
        requirement.strip(),
        "",
    ]
    return "\n".join(lines)


# Backward-compatible alias — existing callers that import maybe_write_design
# will transparently get DESIGN-BRIEF.md instead of the old DESIGN.md.
def maybe_write_design(item_dir: str | Path, requirement: str) -> Path | None:
    """Legacy alias for write_design_brief."""
    return write_design_brief(item_dir, requirement)
