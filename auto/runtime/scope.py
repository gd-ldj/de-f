"""Scope helpers for AUTO v2 tasks."""

from __future__ import annotations


def normalize_scope_files(scope_files: list[str] | tuple[str, ...]) -> list[str]:
    normalized: list[str] = []
    seen: set[str] = set()
    for raw in scope_files:
        path = str(raw).strip()
        if not path or path in seen:
            continue
        seen.add(path)
        normalized.append(path)
    return normalized
