"""Notification delivery for AUTO v2 watchdog events."""

from __future__ import annotations

import datetime as dt
import json
import os
from pathlib import Path
from urllib import parse
from typing import Any
from urllib import request


def notify_event(workflow: dict[str, Any], event: dict[str, Any]) -> dict[str, Any]:
    webhook_url = str(workflow.get("alerts", {}).get("webhook_url", "") or "").strip()
    if webhook_url:
        payload = json.dumps(event, ensure_ascii=False).encode("utf-8")
        req = request.Request(
            webhook_url,
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with request.urlopen(req, timeout=10) as response:  # noqa: S310
                return {
                    "status": "sent",
                    "channel": "webhook",
                    "code": getattr(response, "status", 200),
                }
        except OSError as exc:
            return {
                "status": "failed",
                "channel": "webhook",
                "reason": str(exc)[:500],
            }

    alerts_cfg = dict(workflow.get("alerts", {}) or {})
    if _telegram_enabled(alerts_cfg):
        bot_token = _load_secret(str(alerts_cfg.get("telegram_bot_token_env", "TG_BOT_TOKEN") or "TG_BOT_TOKEN"))
        chat_id = _load_secret(str(alerts_cfg.get("telegram_chat_id_env", "TG_CHAT_ID") or "TG_CHAT_ID"))
        if bot_token and chat_id:
            req = request.Request(
                f"https://api.telegram.org/bot{bot_token}/sendMessage",
                data=parse.urlencode(
                    {
                        "chat_id": chat_id,
                        "parse_mode": "Markdown",
                        "text": _build_telegram_text(event),
                    }
                ).encode("utf-8"),
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                method="POST",
            )
            try:
                with request.urlopen(req, timeout=10) as response:  # noqa: S310
                    return {
                        "status": "sent",
                        "channel": "telegram",
                        "code": getattr(response, "status", 200),
                    }
            except OSError as exc:
                return {
                    "status": "failed",
                    "channel": "telegram",
                    "reason": str(exc)[:500],
                }

    return {"status": "skipped", "reason": "no_notification_channel"}


def write_notification_receipt(
    runtime_dir: str | Path,
    *,
    event: dict[str, Any],
    result: dict[str, Any],
) -> None:
    path = Path(runtime_dir) / "notifications.jsonl"
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "timestamp": _now(),
        "event": str(event.get("event", "") or ""),
        "severity": str(event.get("severity", "") or ""),
        "category": str(event.get("category", "") or ""),
        "summary": str(event.get("summary", "") or ""),
        "delivery": dict(result),
    }
    with path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(payload, ensure_ascii=False) + "\n")


def _telegram_enabled(alerts_cfg: dict[str, Any]) -> bool:
    value = alerts_cfg.get("telegram_enabled", False)
    if isinstance(value, bool):
        return value
    return str(value).strip().lower() in {"1", "true", "yes", "on"}


def _load_secret(env_name: str) -> str:
    value = str(os.environ.get(env_name, "") or "").strip()
    if len(value) >= 2 and value[0] == value[-1] and value[0] in {"'", '"'}:
        value = value[1:-1]
    return value.strip()


def _build_telegram_text(event: dict[str, Any]) -> str:
    event_name = str(event.get("event", "auto_event") or "auto_event")
    severity = str(event.get("severity", "info") or "info").upper()
    summary = str(event.get("summary", "") or "").strip()
    lines = [
        f"🚨 *AUTO Alert*",
        "",
        f"*Event:* `{_escape_markdown(event_name)}`",
        f"*Severity:* `{_escape_markdown(severity)}`",
    ]
    if summary:
        lines.append(f"*Summary:* {_escape_markdown(summary)}")
    category = str(event.get("category", "") or "").strip()
    if category:
        lines.append(f"*Category:* `{_escape_markdown(category)}`")
    queue_depth = event.get("queue_depth")
    if queue_depth is not None:
        lines.append(f"*Queue depth:* `{_escape_markdown(str(queue_depth))}`")
    return "\n".join(lines)


def _escape_markdown(text: str) -> str:
    escaped = text
    for char in ("\\", "`", "*", "_", "[", "]", "(", ")"):
        escaped = escaped.replace(char, f"\\{char}")
    return escaped


def _now() -> str:
    return dt.datetime.now(dt.UTC).isoformat(timespec="seconds")
