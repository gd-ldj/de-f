"""Dev server health helpers for AUTO v2."""

from __future__ import annotations

import subprocess
import time
import urllib.error
import urllib.request
from pathlib import Path

CORRUPTION_MARKERS = (
    "Cannot find module",
    "vendor-chunks",
    "Module not found",
    "Unhandled Runtime Error",
)
_DETACHED_PROCESSES: list[subprocess.Popen[str]] = []


def probe_dev_server_health(port: int = 3000, path: str = "/") -> tuple[str, str]:
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
    url = f"http://127.0.0.1:{port}{path}"
    request = urllib.request.Request(url, headers={"User-Agent": "auto-v2-health"})
    try:
        with opener.open(request, timeout=3) as response:
            body = response.read(8192).decode("utf-8", errors="ignore")
            for marker in CORRUPTION_MARKERS:
                if marker in body:
                    return "corrupted", marker
            if response.status >= 500:
                return "corrupted", f"HTTP {response.status}"
            return "ok", ""
    except urllib.error.HTTPError as exc:
        try:
            body = exc.read(8192).decode("utf-8", errors="ignore")
        except Exception:  # noqa: BLE001
            body = ""
        finally:
            exc.close()
        for marker in CORRUPTION_MARKERS:
            if marker in body:
                return "corrupted", marker
        if exc.code >= 500:
            return "corrupted", f"HTTP {exc.code}"
        return "ok", ""
    except Exception as exc:  # noqa: BLE001
        return "unreachable", str(exc)


def ensure_dev_server(project_root: str | Path, config: dict | None = None) -> bool:
    cfg = config or {}
    port = int(cfg.get("port", 3000))
    health_path = str(cfg.get("health_path", "/"))
    status, _ = probe_dev_server_health(port=port, path=health_path)
    if status == "ok":
        return True
    start_command = str(cfg.get("start_command", "")).strip()
    if not start_command:
        return False
    process = subprocess.Popen(
        start_command,
        shell=True,
        cwd=str(project_root),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        start_new_session=True,
    )
    _DETACHED_PROCESSES.append(process)
    deadline = time.time() + 30
    while time.time() < deadline:
        status, _ = probe_dev_server_health(port=port, path=health_path)
        if status == "ok":
            return True
        time.sleep(1)
    return False
