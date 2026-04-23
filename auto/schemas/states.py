"""Shared state literals for AUTO v2."""

from __future__ import annotations

from typing import Literal, TypeAlias

RUNTIME_IDLE = "idle"
RUNTIME_STARTING = "starting"
RUNTIME_RUNNING = "running"
RUNTIME_PAUSED = "paused"

TASK_PENDING = "pending"
TASK_RUNNING = "running"
TASK_INTEGRATED = "integrated"
TASK_BLOCKED = "blocked"
TASK_PAUSED = "paused"

QA_UNIT_PENDING = "pending"
QA_UNIT_FAILED = "failed"
QA_UNIT_PASSED = "passed"
QA_UNIT_BLOCKED = "blocked"

RuntimeState: TypeAlias = Literal["idle", "starting", "running", "paused"]
TaskState: TypeAlias = Literal["pending", "running", "integrated", "blocked", "paused"]
QAUnitState: TypeAlias = Literal["pending", "failed", "passed", "blocked"]

RUNTIME_STATES: frozenset[RuntimeState] = frozenset(
    {RUNTIME_IDLE, RUNTIME_STARTING, RUNTIME_RUNNING, RUNTIME_PAUSED}
)
TASK_STATES: frozenset[TaskState] = frozenset(
    {TASK_PENDING, TASK_RUNNING, TASK_INTEGRATED, TASK_BLOCKED, TASK_PAUSED}
)
QA_UNIT_STATES: frozenset[QAUnitState] = frozenset(
    {QA_UNIT_PENDING, QA_UNIT_FAILED, QA_UNIT_PASSED, QA_UNIT_BLOCKED}
)
