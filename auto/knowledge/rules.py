"""Candidate rule generation for AUTO v2 self-evolution.

Aggregates recurring incidents into candidate rules stored in
``.auto/knowledge/rules.jsonl``.  Rules are **never** auto-written into
``WORKFLOW.yaml`` — promotion is manual or via a future governance layer
in ``auto/runtime/safeguards.py``.
"""

from __future__ import annotations

import datetime as dt
import json
import re
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

from auto.evidence.incidents import load_incidents

_RULES_VERSION = 1
_MIN_RECURRENCE_FOR_RULE = 2
_RULE_ACTIVE = "active"
_RULE_SUPPRESSED = "suppressed"
_RULE_RETIRED = "retired"


def generate_candidate_rules(
    knowledge_dir: str | Path,
    *,
    min_recurrence: int = _MIN_RECURRENCE_FOR_RULE,
) -> list[dict[str, Any]]:
    """Return candidate rules derived from recurring incidents.

    Only categories that appear >= *min_recurrence* times produce a rule.
    """
    incidents = load_incidents(knowledge_dir)
    previous_rules = {
        str(rule.get("rule_id", "")).strip(): rule
        for rule in load_rules(knowledge_dir, include_inactive=True)
        if str(rule.get("rule_id", "")).strip()
    }
    now = dt.datetime.now(dt.UTC).isoformat(timespec="seconds")
    if not incidents and not previous_rules:
        return []

    # Group by recurrence_key (defaults to category).
    groups: defaultdict[str, list[dict[str, Any]]] = defaultdict(list)
    for inc in incidents:
        key = inc.get("root_cause_label") or inc.get("recurrence_key", inc.get("category", "unknown"))
        groups[key].append(inc)

    rules: list[dict[str, Any]] = []
    active_rule_ids: set[str] = set()
    for key, group in groups.items():
        if len(group) < min_recurrence:
            continue
        # Collect tags across all incidents in the group.
        all_tags: Counter[str] = Counter()
        stages: set[str] = set()
        source_ids: list[str] = []
        latest_ts = ""
        for inc in group:
            for tag in inc.get("tags", []):
                all_tags[tag] += 1
            stages.add(inc.get("stage", ""))
            inc_id = inc.get("id", "")
            if inc_id:
                source_ids.append(inc_id)
            ts = inc.get("timestamp", "")
            if ts > latest_ts:
                latest_ts = ts

        # Build a representative summary from the most recent incident.
        latest = max(group, key=lambda i: i.get("timestamp", ""))
        summary = latest.get("summary", "")
        rule_id = _rule_id_for_key(key)
        previous_rule = dict(previous_rules.get(rule_id, {}) or {})
        active_rule_ids.add(rule_id)

        rules.append({
            "version": _RULES_VERSION,
            "rule_id": rule_id,
            "category": key,
            "severity": "warning",
            "trigger": {
                "stages": sorted(stages - {""}),
                "task_kinds": _infer_rule_task_kinds(key, group),
                "scope_globs": _extract_scope_globs(group),
            },
            "lesson": summary[:400],
            "source_incidents": source_ids[:10],
            "confirmed_count": len(group),
            "top_tags": [tag for tag, _ in all_tags.most_common(5)],
            "last_seen": latest_ts,
            "created_at": previous_rule.get("created_at", now),
            "first_seen": previous_rule.get("first_seen", latest_ts or now),
            "lifecycle_state": _RULE_ACTIVE,
            "suppression_reason": None,
            "suppressed_at": None,
            "retired_at": None,
        })

    for rule_id, previous_rule in previous_rules.items():
        if rule_id in active_rule_ids:
            continue
        retired_rule = dict(previous_rule)
        retired_rule.setdefault("version", _RULES_VERSION)
        retired_rule.setdefault("created_at", now)
        retired_rule.setdefault("first_seen", retired_rule.get("last_seen", now))
        retired_rule.setdefault("confirmed_count", 0)
        retired_rule["lifecycle_state"] = _RULE_RETIRED
        retired_rule["retired_at"] = retired_rule.get("retired_at") or now
        rules.append(retired_rule)

    rules.sort(key=lambda r: int(r.get("confirmed_count", 0) or 0), reverse=True)
    return rules


def apply_preflight_audit(rules: list[dict[str, Any]], metrics: dict[str, Any]) -> list[dict[str, Any]]:
    """Tune candidate rule severity using accumulated preflight audit signals."""
    top_rules = dict(metrics.get("top_preflight_rules", {}) or {})
    tuned: list[dict[str, Any]] = []
    now = dt.datetime.now(dt.UTC).isoformat(timespec="seconds")
    for rule in rules:
        payload = dict(rule)
        lifecycle_state = str(payload.get("lifecycle_state", _RULE_ACTIVE) or _RULE_ACTIVE)
        if lifecycle_state == _RULE_RETIRED:
            payload["severity"] = "warning"
            tuned.append(payload)
            continue
        stats = _resolve_preflight_stats(top_rules, payload)
        severity = payload.get("severity", "warning")
        if stats:
            block_rate = float(stats.get("block_rate", 0.0) or 0.0)
            warning_rate = float(stats.get("warning_rate", 0.0) or 0.0)
            count = int(stats.get("count", 0) or 0)
            passed = int(stats.get("passed", 0) or 0)
            if count >= 3 and passed == count:
                lifecycle_state = _RULE_SUPPRESSED
                severity = "warning"
                payload["suppression_reason"] = "false_positive_preflight"
                payload["suppressed_at"] = payload.get("suppressed_at") or now
            elif block_rate >= 0.5:
                lifecycle_state = _RULE_ACTIVE
                severity = "hard"
                payload["suppression_reason"] = None
                payload["suppressed_at"] = None
            elif warning_rate >= 0.5:
                lifecycle_state = _RULE_ACTIVE
                severity = "warning"
                payload["suppression_reason"] = None
                payload["suppressed_at"] = None
        elif int(payload.get("confirmed_count", 0) or 0) >= 3:
            severity = "hard"
            lifecycle_state = _RULE_ACTIVE
        payload["severity"] = severity
        payload["lifecycle_state"] = lifecycle_state
        tuned.append(payload)
    return tuned


def write_rules(knowledge_dir: str | Path, rules: list[dict[str, Any]]) -> Path:
    """Persist rules to ``rules.jsonl``.  Overwrites the file each time."""
    kdir = Path(knowledge_dir)
    kdir.mkdir(parents=True, exist_ok=True)
    path = kdir / "rules.jsonl"
    with path.open("w", encoding="utf-8") as fh:
        for rule in rules:
            fh.write(json.dumps(rule, ensure_ascii=False) + "\n")
    return path


def load_rules(knowledge_dir: str | Path, *, include_inactive: bool = False) -> list[dict[str, Any]]:
    """Load rules from ``rules.jsonl``."""
    path = Path(knowledge_dir) / "rules.jsonl"
    if not path.exists():
        return []
    records: list[dict[str, Any]] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            records.append(json.loads(line))
        except json.JSONDecodeError:
            continue
    if include_inactive:
        return records
    return [
        record
        for record in records
        if str(record.get("lifecycle_state", _RULE_ACTIVE) or _RULE_ACTIVE) == _RULE_ACTIVE
    ]


def _infer_rule_task_kinds(key: str, group: list[dict[str, Any]]) -> list[str]:
    kinds: set[str] = set()
    for inc in group:
        slug = str(inc.get("task_slug", "")).lower()
        stage = str(inc.get("stage", "")).lower()
        category = str(inc.get("category", "")).lower()
        summary = str(inc.get("summary", "")).lower()
        tags = {str(tag).lower() for tag in inc.get("tags", [])}
        if "-fix-" in slug or stage.startswith("fix_loop"):
            kinds.update({"fix", "qa_related"})
        if stage == "qa_verify" or key == "qa_verify_environment" or category == "verify_blocked":
            kinds.add("qa_related")
        if "playwright" in tags or _has_browser_verify_signal(summary):
            kinds.add("browser_verify")
    if not kinds:
        kinds.add("default")
    return sorted(kinds)


def _extract_scope_globs(group: list[dict[str, Any]]) -> list[str]:
    globs: set[str] = set()
    for inc in group:
        evidence = inc.get("evidence", {}) or {}
        result_path = evidence.get("result_path", "")
        if not result_path:
            continue
        try:
            payload = json.loads(Path(result_path).read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            continue
        files = payload.get("files_modified", [])
        if not isinstance(files, list):
            continue
        for file_path in files:
            path = str(file_path).strip()
            if not path:
                continue
            globs.add(path)
            if "/" in path:
                parts = path.split("/")
                globs.add(parts[0] + "/**")
                if len(parts) > 2:
                    globs.add("/".join(parts[:-1]) + "/**")
            else:
                globs.add(path)
    return sorted(globs)[:5]


def _rule_id_for_key(key: str) -> str:
    normalized = re.sub(r"[^a-z0-9]+", "-", str(key).lower()).strip("-")
    return f"rule-{normalized or 'unknown'}"


def _has_browser_verify_signal(text: str) -> bool:
    signals = (
        "browser",
        "playwright",
        "dialog",
        "modal",
        "banner",
        "screenshot",
        "hover",
        "viewport",
    )
    lowered = str(text).lower()
    return any(signal in lowered for signal in signals)


def _resolve_preflight_stats(
    top_rules: dict[str, dict[str, Any]],
    rule: dict[str, Any],
) -> dict[str, Any]:
    rule_id = str(rule.get("rule_id", "")).strip()
    if not rule_id:
        return {}

    exact = dict(top_rules.get(rule_id, {}) or {})
    if exact:
        return exact

    compatible_keys = [key for key in top_rules if key == rule_id or key.startswith(f"{rule_id}-")]
    if not compatible_keys:
        return {}

    merged = {"count": 0, "failed": 0, "warning": 0, "passed": 0}
    for key in compatible_keys:
        stats = dict(top_rules.get(key, {}) or {})
        for field in merged:
            merged[field] += int(stats.get(field, 0) or 0)

    count = merged["count"] or 1
    merged["block_rate"] = round(merged["failed"] / count, 2)
    merged["warning_rate"] = round(merged["warning"] / count, 2)
    return merged
