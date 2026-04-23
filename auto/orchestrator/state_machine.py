"""Global runtime state transitions for AUTO v2."""

from __future__ import annotations

from auto.schemas.states import RUNTIME_IDLE, RUNTIME_PAUSED, RUNTIME_RUNNING, RUNTIME_STARTING, RUNTIME_STATES, RuntimeState

ALLOWED_STATES = RUNTIME_STATES


def can_start(state: str | RuntimeState) -> bool:
    return state in {RUNTIME_IDLE, RUNTIME_PAUSED}


def can_stop(state: str | RuntimeState) -> bool:
    return state in {RUNTIME_IDLE, RUNTIME_STARTING, RUNTIME_RUNNING, RUNTIME_PAUSED}
