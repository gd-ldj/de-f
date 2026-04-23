"""Hook execution helpers for AUTO v2."""

from __future__ import annotations

import os
import subprocess
from pathlib import Path


def run_hook(command: str, label: str, cwd: str | Path, env_extra: dict | None = None) -> dict:
    if not command.strip():
        return {"status": "skipped", "label": label}
    env = os.environ.copy()
    if env_extra:
        env.update({key: str(value) for key, value in env_extra.items()})
    try:
        result = subprocess.run(
            command,
            shell=True,
            cwd=str(cwd),
            capture_output=True,
            text=True,
            timeout=60,
            env=env,
        )
    except subprocess.TimeoutExpired:
        return {"status": "timeout", "label": label}
    return {
        "status": "ok" if result.returncode == 0 else "error",
        "label": label,
        "returncode": result.returncode,
        "stdout": result.stdout,
        "stderr": result.stderr,
    }
