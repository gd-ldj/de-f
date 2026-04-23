"""Budget tracking for AUTO v2 stage execution."""

from __future__ import annotations

import datetime as dt
import json
from dataclasses import dataclass, field
from pathlib import Path

from auto.schemas.workflow import load_workflow_config


class BudgetExceededError(RuntimeError):
    """Raised when a stage or task exceeds configured token limits."""


@dataclass
class BudgetTracker:
    limits: dict[str, int | str]
    usage: dict[str, int] = field(default_factory=dict)
    total_used: int = 0

    def record(self, stage: str, tokens: int) -> None:
        stage_key = f"{stage}_tokens"
        stage_limit = int(self.limits.get(stage_key, 0) or 0)
        total_limit = int(self.limits.get("per_task_total_tokens", 0) or 0)
        self.usage[stage] = self.usage.get(stage, 0) + tokens
        self.total_used += tokens
        if stage_limit and self.usage[stage] > stage_limit:
            raise BudgetExceededError(f"{stage} budget exceeded: {self.usage[stage]} > {stage_limit}")
        if total_limit and self.total_used > total_limit:
            raise BudgetExceededError(f"per-task total budget exceeded: {self.total_used} > {total_limit}")

    def write_usage(self, runtime_dir: str | Path, *, slug: str, stage: str, tokens: int) -> Path:
        runtime_path = Path(runtime_dir)
        runtime_path.mkdir(parents=True, exist_ok=True)
        usage_path = runtime_path / "usage.jsonl"
        payload = {
            "timestamp": dt.datetime.now(dt.UTC).isoformat(timespec="seconds"),
            "slug": slug,
            "stage": stage,
            "tokens": tokens,
            "total_used": self.total_used,
        }
        with usage_path.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(payload, ensure_ascii=False) + "\n")
        return usage_path

    @classmethod
    def from_workflow_file(cls, workflow_file: str | Path) -> "BudgetTracker":
        config = load_workflow_config(workflow_file)
        return cls(config.get("budget", {}))


def estimate_tokens(*parts: object) -> int:
    text = " ".join(str(part) for part in parts if part is not None)
    return max(1, len(text) // 4)
