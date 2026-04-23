"""Evidence scorecard writers for AUTO v2."""

from __future__ import annotations

import json
from pathlib import Path


def write_spec_scorecard(work_item_dir: str | Path, review_payload: dict) -> dict:
    verdict = review_payload.get("verdict", "warn")
    total_score = int(review_payload.get("total_score", 85 if verdict == "pass" else 40))
    payload = {
        "score_status": "enabled",
        "total_score": total_score,
        "source": "spec_review",
        "triggered_actions": ["block_task_split"] if verdict == "block" else [],
    }
    Path(work_item_dir, "SCORECARD.json").write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    return payload


def write_task_scorecard(task_dir: str | Path, review_payload: dict) -> dict:
    verdict = review_payload.get("verdict", "warn")
    total_score = {"pass": 92, "warn": 80, "block": 60}.get(verdict, 75)
    payload = {
        "score_status": "enabled",
        "total_score": total_score,
        "source": "task_review",
        "triggered_actions": ["block_integration_ready"] if verdict == "block" else [],
    }
    Path(task_dir, "TASK-SCORECARD.json").write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    return payload


def write_qa_scorecard(qa_dir: str | Path, verify_payload: dict, bugs_payload: dict) -> dict:
    verdict = verify_payload.get("verdict", "warn")
    bug_count = len(bugs_payload.get("bugs", []))
    total_score = max(0, {"pass": 94, "warn": 80, "block": 55}.get(verdict, 75) - bug_count * 10)
    payload = {
        "score_status": "enabled",
        "total_score": total_score,
        "source": "qa_unit_verify",
        "triggered_actions": ["force_fix_loop"] if verdict == "block" else [],
    }
    Path(qa_dir, "SCORECARD.json").write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    return payload


def write_bug_score(qa_dir: str | Path, bugs_payload: dict) -> dict:
    bugs = bugs_payload.get("bugs", [])
    severity_counts = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    for bug in bugs:
        severity = str(bug.get("severity", "")).lower()
        if severity in severity_counts:
            severity_counts[severity] += 1
    payload = {
        "bug_count": len(bugs),
        "severity_counts": severity_counts,
    }
    Path(qa_dir, "BUG-SCORE.json").write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    return payload


def write_review_effectiveness(qa_dir: str | Path, *, qa_unit_id: str, work_item_id: str, bugs_payload: dict) -> dict:
    escaped_bug_count = len(bugs_payload.get("bugs", []))
    if escaped_bug_count == 0:
        effectiveness_rating = "strong"
        notes = "Task review prevented escaped bugs for this QA unit."
    elif escaped_bug_count <= 2:
        effectiveness_rating = "moderate"
        notes = "Task review caught part of the risk, but some QA findings still escaped."
    else:
        effectiveness_rating = "weak"
        notes = "Task review missed multiple QA findings; tighten prompts or gate criteria."
    payload = {
        "qa_unit_id": qa_unit_id,
        "work_item_id": work_item_id,
        "escaped_bug_count": escaped_bug_count,
        "effectiveness_rating": effectiveness_rating,
        "review_precision_notes": notes,
    }
    Path(qa_dir, "REVIEW-EFFECTIVENESS.json").write_text(
        json.dumps(payload, indent=2) + "\n",
        encoding="utf-8",
    )
    return payload
