"""Task worker for AUTO v2 runtime."""

from __future__ import annotations

import datetime as dt
import json
from pathlib import Path
import subprocess

from auto.evidence.lessons import append_lesson
from auto.evidence.scorecards import write_task_scorecard
from auto.knowledge.fix_context import load_fix_context, summarize_fix_context
from auto.knowledge.lessons import match_lessons
from auto.knowledge.rules import load_rules
from auto.runtime.agent_runner import run_stage
from auto.runtime.context_paths import build_task_context_hints, build_task_context_paths, build_task_hard_rules
from auto.runtime.gates import run_quality_gates
from auto.runtime.preflight import run_preflight_checks
from auto.runtime.review import run_review
from auto.runtime.safeguards import (
    build_preflight_plan,
    check_artifact_drift,
    check_empty_dev_diff,
    check_sibling_task_state_drift,
    evaluate_scope_drift,
    has_drift_block,
)
from auto.runtime.verify import run_verify
from auto.runtime.worktree import finalize_task_workspace, prepare_task_workspace, sync_workspace_changes
from auto.schemas.budget import BudgetExceededError, BudgetTracker, estimate_tokens


class TaskWorker:
    def __init__(self, project_root: str | Path, paths, workflow: dict):
        self.project_root = Path(project_root)
        self.paths = paths
        self.workflow = workflow

    def execute(self, task: dict) -> dict:
        task_dir = self.paths.tasks_dir / task["slug"]
        task_dir.mkdir(parents=True, exist_ok=True)
        reuse_existing = bool(self.workflow.get("worktree", {}).get("reuse_existing", True))
        workspace = prepare_task_workspace(self.project_root, task["slug"], reuse_existing=reuse_existing)
        self._write_plan(task_dir, task)
        self._write_status(
            task_dir,
            {
                "state": "running",
                "slug": task["slug"],
                "started_at": _now(),
                "workspace_root": str(workspace.root),
                "workspace_mode": workspace.mode,
            },
        )
        budget = BudgetTracker(self.workflow.get("budget", {}))
        rules = load_rules(self.paths.knowledge_dir)
        preflight_checks = build_preflight_plan(rules=rules, task=task)
        preflight_results = run_preflight_checks(
            checks=preflight_checks,
            workflow=self.workflow,
            project_root=workspace.root,
        )
        self._record_preflight_results(task, preflight_results)
        if preflight_results:
            task_dir.joinpath("PREFLIGHT.json").write_text(
                json.dumps({"checks": preflight_results}, indent=2) + "\n",
                encoding="utf-8",
            )
        hard_failure = next(
            (
                check
                for check in preflight_results
                if check.get("severity") == "hard" and check.get("status") == "failed"
            ),
            None,
        )
        if hard_failure:
            block_reason = str(hard_failure.get("category", "unknown") or "unknown")
            self._write_status(
                task_dir,
                {
                    "state": "blocked",
                    "slug": task["slug"],
                    "block_reason": block_reason,
                    "updated_at": _now(),
                },
            )
            Path(task_dir, "GATE-RESULT.md").write_text(f"blocked: {block_reason}\n", encoding="utf-8")
            finalize_task_workspace(workspace, status=f"blocked:{block_reason}", changed_files=[])
            append_lesson(self.paths.runtime_dir, {"type": "task_blocked", "slug": task["slug"], "reason": block_reason})
            return {"slug": task["slug"], "state": "blocked", "block_reason": block_reason}

        # Snapshot content hashes of pre-existing dirty files so reused
        # worktrees don't pollute this task's changed-file detection.
        # We record hashes (not just names) because the dev agent may
        # legitimately modify a file that was already dirty.
        baseline_hashes = _snapshot_dirty_hashes(workspace.root)

        dev_payload = build_task_dev_payload(
            project_root=self.project_root,
            task=task,
            workspace_root=workspace.root,
            preflight_checks=preflight_checks,
        )
        dev_result = run_stage(
            "task_dev",
            dev_payload,
            self.workflow,
            project_root=workspace.root,
            artifact_dir=task_dir,
        )
        self._record_lesson_injections(task, dev_payload)
        try:
            dev_tokens = estimate_tokens(task.get("title", ""), task.get("notes", ""), task.get("scope_files", []))
            budget.record("task_dev", dev_tokens)
            budget.write_usage(self.paths.runtime_dir, slug=task["slug"], stage="task_dev", tokens=dev_tokens)
        except BudgetExceededError as exc:
            self._write_status(
                task_dir,
                {"state": "blocked", "slug": task["slug"], "block_reason": "budget_exceeded", "detail": str(exc), "updated_at": _now()},
            )
            self._record_lesson_outcomes(task, dev_payload, outcome="blocked", final_category="budget_exceeded")
            return {"slug": task["slug"], "state": "blocked", "block_reason": "budget_exceeded"}
        Path(task_dir, "RESULT.json").write_text(json.dumps(dev_result, indent=2) + "\n", encoding="utf-8")
        # P0-3: Use git diff as ground truth, merge with agent self-report,
        # then exclude files whose content hash is unchanged from baseline.
        reported_files = list(dev_result.get("files_modified", []))
        actual_files = _git_diff_changed_files(workspace.root)
        untracked_files = _git_untracked_files(workspace.root)
        all_dirty = set(reported_files) | set(actual_files) | set(untracked_files)
        changed_files = sorted(_filter_unchanged_baseline(workspace.root, all_dirty, baseline_hashes))
        finalize_task_workspace(workspace, status="task_dev_completed", changed_files=changed_files)
        bookkeeping = {f".auto/tasks/{task['slug']}/STATUS.json", ".auto/queue/TASK-QUEUE.md"}
        sibling_drift = check_sibling_task_state_drift(task["slug"], changed_files)
        artifact_drift = check_artifact_drift(task["slug"], changed_files)
        drift_decisions = evaluate_scope_drift(task.get("scope_files", []), changed_files, self.workflow.get("safeguards", {}))
        empty_diff = check_empty_dev_diff(changed_files, bookkeeping)
        if sibling_drift or artifact_drift or empty_diff or has_drift_block(drift_decisions):
            block_reason = "empty_diff" if empty_diff else "artifact_drift"
            if sibling_drift:
                block_reason = "sibling_drift"
            elif has_drift_block(drift_decisions):
                block_reason = "scope_drift"
            payload = {
                "state": "blocked",
                "slug": task["slug"],
                "block_reason": block_reason,
                "sibling_drift": sibling_drift,
                "artifact_drift": artifact_drift,
                "drift_decisions": drift_decisions,
                "updated_at": _now(),
            }
            self._write_status(task_dir, payload)
            Path(task_dir, "GATE-RESULT.md").write_text(f"blocked: {block_reason}\n", encoding="utf-8")
            finalize_task_workspace(workspace, status=f"blocked:{block_reason}", changed_files=changed_files)
            append_lesson(self.paths.runtime_dir, {"type": "task_blocked", "slug": task["slug"], "reason": block_reason})
            self._record_lesson_outcomes(task, dev_payload, outcome="blocked", final_category=block_reason)
            return {"slug": task["slug"], "state": "blocked", "block_reason": block_reason}

        review_payload = run_review(task_dir, task, self.workflow, project_root=workspace.root)
        review_tokens = estimate_tokens(task.get("title", ""), task.get("notes", ""), review_payload.get("summary", ""))
        budget.record("task_review", review_tokens)
        budget.write_usage(self.paths.runtime_dir, slug=task["slug"], stage="task_review", tokens=review_tokens)
        write_task_scorecard(task_dir, review_payload)
        if review_payload.get("verdict") == "block":
            payload = {"state": "blocked", "slug": task["slug"], "block_reason": "review_block", "updated_at": _now()}
            self._write_status(task_dir, payload)
            Path(task_dir, "GATE-RESULT.md").write_text("blocked: review_block\n", encoding="utf-8")
            finalize_task_workspace(workspace, status="blocked:review_block", changed_files=changed_files)
            append_lesson(self.paths.runtime_dir, {"type": "task_blocked", "slug": task["slug"], "reason": "review_block"})
            self._record_lesson_outcomes(task, dev_payload, outcome="blocked", final_category="review_blocked")
            return {"slug": task["slug"], "state": "blocked", "block_reason": "review_block"}

        verify_payload = None
        if self.workflow.get("verify", {}).get("task_level_enabled", False):
            verify_payload = run_verify(task_dir, task, self.workflow, project_root=workspace.root)
            verify_tokens = estimate_tokens(task.get("title", ""), verify_payload.get("reasoning", ""))
            budget.record("task_review", verify_tokens)
            budget.write_usage(self.paths.runtime_dir, slug=task["slug"], stage="task_review", tokens=verify_tokens)
            if verify_payload.get("verdict") == "block":
                payload = {"state": "blocked", "slug": task["slug"], "block_reason": "verify_block", "updated_at": _now()}
                self._write_status(task_dir, payload)
                finalize_task_workspace(workspace, status="blocked:verify_block", changed_files=changed_files)
                self._record_lesson_outcomes(task, dev_payload, outcome="blocked", final_category="verify_blocked")
                return {"slug": task["slug"], "state": "blocked", "block_reason": "verify_block"}

        gate_payload = run_quality_gates(
            project_root=workspace.root,
            workflow=self.workflow,
            task=task,
            task_dir=task_dir,
            meta_root=self.project_root,
        )
        if gate_payload.get("verdict") == "block":
            block_reason = str(gate_payload.get("category", "verify_block") or "verify_block")
            payload = {"state": "blocked", "slug": task["slug"], "block_reason": block_reason, "updated_at": _now()}
            self._write_status(task_dir, payload)
            Path(task_dir, "GATE-RESULT.md").write_text(f"blocked: {block_reason}\n", encoding="utf-8")
            finalize_task_workspace(workspace, status=f"blocked:{block_reason}", changed_files=changed_files)
            self._record_lesson_outcomes(task, dev_payload, outcome="blocked", final_category=block_reason)
            return {"slug": task["slug"], "state": "blocked", "block_reason": block_reason}

        payload = {
            "state": "integrated",
            "slug": task["slug"],
            "updated_at": _now(),
            "review_verdict": review_payload.get("verdict", "pass"),
        }
        if verify_payload:
            payload["verify_verdict"] = verify_payload.get("verdict", "pass")
        sync_workspace_changes(self.project_root, workspace.root, changed_files)
        self._write_status(task_dir, payload)
        Path(task_dir, "GATE-RESULT.md").write_text("pass\n", encoding="utf-8")
        finalize_task_workspace(workspace, status="integrated", changed_files=changed_files)
        append_lesson(self.paths.runtime_dir, {"type": "task_integrated", "slug": task["slug"]})
        self._record_lesson_outcomes(task, dev_payload, outcome="passed", final_category="")
        return {"slug": task["slug"], "state": "integrated"}

    def _write_plan(self, task_dir: Path, task: dict) -> None:
        lines = [
            f"# Plan for {task['slug']}",
            "",
            "## Scope",
        ]
        for scope_file in task.get("scope_files", []):
            lines.append(f"- `{scope_file}`")
        lines.extend(["", "## Goal", task.get("title", ""), ""])
        task_dir.joinpath("PLAN.md").write_text("\n".join(lines), encoding="utf-8")

    def _write_status(self, task_dir: Path, payload: dict) -> None:
        task_dir.joinpath("STATUS.json").write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")

    def _record_lesson_injections(self, task: dict, dev_payload: dict) -> None:
        for lesson_id in dev_payload.get("matched_lesson_ids", []):
            append_lesson(
                self.paths.runtime_dir,
                {
                    "type": "lesson_injected",
                    "lesson_id": lesson_id,
                    "task_slug": task["slug"],
                    "work_item_id": task.get("work_item_id", ""),
                    "failure_category": dev_payload.get("failure_category", ""),
                    "stage": "task_dev",
                },
            )

    def _record_lesson_outcomes(
        self,
        task: dict,
        dev_payload: dict,
        *,
        outcome: str,
        final_category: str,
    ) -> None:
        for lesson_id in dev_payload.get("matched_lesson_ids", []):
            append_lesson(
                self.paths.runtime_dir,
                {
                    "type": "lesson_outcome",
                    "lesson_id": lesson_id,
                    "task_slug": task["slug"],
                    "work_item_id": task.get("work_item_id", ""),
                    "outcome": outcome,
                    "final_category": final_category,
                },
            )

    def _record_preflight_results(self, task: dict, preflight_results: list[dict]) -> None:
        for check in preflight_results:
            append_lesson(
                self.paths.runtime_dir,
                {
                    "type": "preflight_result",
                    "rule_id": check.get("rule_id", ""),
                    "check_id": check.get("id", ""),
                    "task_slug": task.get("slug", ""),
                    "work_item_id": task.get("work_item_id", ""),
                    "status": check.get("status", ""),
                    "severity": check.get("severity", ""),
                    "source_category": check.get("source_category", ""),
                    "matched_on": check.get("matched_on", {}),
                },
            )


def _now() -> str:
    return dt.datetime.now(dt.UTC).isoformat(timespec="seconds")


def build_task_dev_payload(
    *,
    project_root: str | Path,
    task: dict,
    workspace_root: str | Path,
    preflight_checks: list[dict] | None = None,
) -> dict:
    project_root = Path(project_root)
    item_dir = project_root / ".auto" / "work-items" / str(task.get("work_item_id", ""))
    requirement_summary = _read_first_nonempty_line(item_dir / "REQUIREMENT.md")
    spec_summary = _read_spec_summary(item_dir)
    task_context_summary = _read_task_context_summary(item_dir, str(task.get("slug", "")))
    qa_summary = _read_qa_summary(item_dir)

    slug = task.get("slug", "")
    scope_files = task.get("scope_files", [])
    work_item_id = str(task.get("work_item_id", ""))

    result: dict = {
        "slug": slug,
        "title": task.get("title", ""),
        "notes": task.get("notes", ""),
        "planned_files": scope_files,
        "workspace_root": str(workspace_root),
        "context_paths": build_task_context_paths(project_root=project_root, task=task),
        "context_hints": build_task_context_hints(slug=slug),
        "hard_rules": build_task_hard_rules(),
        "requirement_summary": requirement_summary,
        "spec_summary": spec_summary,
        "task_context_summary": task_context_summary,
        "qa_summary": qa_summary,
    }

    # ── Fix-context injection (fix tasks only) ───────────────────────
    tasks_dir = project_root / ".auto" / "tasks"
    fix_ctx = load_fix_context(tasks_dir / slug)
    if fix_ctx:
        result["failure_category"] = fix_ctx.get("failure_category", "unknown")
        result["fix_context_summary"] = summarize_fix_context(fix_ctx)
        result["bugs_detail"] = fix_ctx.get("bugs_summary", "")
        result["fix_changed_files"] = fix_ctx.get("changed_files", [])
        result["fix_planned_files"] = fix_ctx.get("planned_files", [])

    # ── Lessons injection (all tasks) ────────────────────────────────
    runtime_dir = project_root / ".auto" / "runtime"
    matched = match_lessons(
        lessons_dir=runtime_dir,
        slug=slug,
        scope_files=list(scope_files),
        work_item_id=work_item_id,
        failure_category=fix_ctx.get("failure_category") if fix_ctx else None,
    )
    if matched:
        result["matched_lessons"] = matched
        result["matched_lesson_ids"] = [lesson.get("lesson_id", "") for lesson in matched if lesson.get("lesson_id")]

    planned_preflight_checks = preflight_checks
    if planned_preflight_checks is None:
        rules = load_rules(project_root / ".auto" / "knowledge")
        planned_preflight_checks = build_preflight_plan(rules=rules, task=task)
    if planned_preflight_checks:
        result["preflight_checks"] = planned_preflight_checks

    return result


def _hash_file(path: Path) -> str:
    """Return git-style SHA1 hash of file content, or empty string on error."""
    try:
        import hashlib
        content = path.read_bytes()
        # Match git's blob hashing: "blob <size>\0<content>"
        header = f"blob {len(content)}\0".encode()
        return hashlib.sha1(header + content).hexdigest()
    except OSError:
        return ""


def _snapshot_dirty_hashes(workspace_root: Path) -> dict[str, str]:
    """Record content hashes for all currently dirty/untracked files."""
    dirty_paths = set(_git_diff_changed_files(workspace_root)) | set(_git_untracked_files(workspace_root))
    hashes: dict[str, str] = {}
    for rel_path in dirty_paths:
        full = workspace_root / rel_path
        hashes[rel_path] = _hash_file(full)
    return hashes


def _filter_unchanged_baseline(
    workspace_root: Path,
    all_dirty: set[str],
    baseline_hashes: dict[str, str],
) -> set[str]:
    """Keep files that are new or whose content changed since baseline.

    A file present in baseline with the SAME hash as now was already dirty
    before the dev stage and was NOT modified by it — exclude it.
    A file present in baseline but with a DIFFERENT hash was touched by
    the dev agent — include it.
    """
    result: set[str] = set()
    for rel_path in all_dirty:
        if rel_path not in baseline_hashes:
            # New file (not in baseline) — always include.
            result.add(rel_path)
            continue
        current_hash = _hash_file(workspace_root / rel_path)
        if current_hash != baseline_hashes[rel_path]:
            # Content changed since baseline — dev agent modified it.
            result.add(rel_path)
        # else: same content as baseline — pre-existing dirt, skip.
    return result


def _git_diff_changed_files(workspace_root: Path) -> list[str]:
    """Get actually changed files via git diff."""
    try:
        result = subprocess.run(
            ["git", "diff", "--name-only", "HEAD"],
            capture_output=True, text=True, timeout=30,
            cwd=str(workspace_root),
        )
        if result.returncode != 0:
            return []
        return [line.strip() for line in result.stdout.splitlines() if line.strip()]
    except (OSError, subprocess.TimeoutExpired):
        return []


def _git_untracked_files(workspace_root: Path) -> list[str]:
    """Get untracked files via git ls-files."""
    try:
        result = subprocess.run(
            ["git", "ls-files", "--others", "--exclude-standard"],
            capture_output=True, text=True, timeout=30,
            cwd=str(workspace_root),
        )
        if result.returncode != 0:
            return []
        return [line.strip() for line in result.stdout.splitlines() if line.strip()]
    except (OSError, subprocess.TimeoutExpired):
        return []


def _read_first_nonempty_line(path: Path) -> str:
    if not path.exists():
        return ""
    for line in path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if stripped:
            return stripped
    return ""


def _read_spec_summary(item_dir: Path) -> str:
    for name in ("SPEC.md", "SPEC-LITE.md"):
        path = item_dir / name
        if not path.exists():
            continue
        lines = [line.strip() for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]
        body = [line for line in lines if not line.startswith("#")]
        return " ".join(body[:3])[:400]
    return ""


def _read_task_context_summary(item_dir: Path, slug: str) -> str:
    path = item_dir / "TASKS.json"
    if not path.exists():
        return ""
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return ""
    if not isinstance(payload, list):
        return ""
    related: list[str] = []
    for record in payload:
        if not isinstance(record, dict):
            continue
        record_slug = str(record.get("slug", ""))
        if record_slug == slug:
            depends = record.get("depends_on", [])
            if depends:
                related.append(f"Depends on: {', '.join(str(dep) for dep in depends)}")
            continue
        related.append(str(record.get("title", "")).strip())
        if len(related) >= 2:
            break
    return " | ".join(part for part in related if part)[:400]


def _read_qa_summary(item_dir: Path) -> str:
    path = item_dir / "QA-UNITS.json"
    if not path.exists():
        return ""
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return ""
    if not isinstance(payload, list) or not payload:
        return ""
    first = payload[0] if isinstance(payload[0], dict) else {}
    boundary = str(first.get("acceptance_boundary", "")).strip()
    criteria = first.get("acceptance_criteria", [])
    criteria_text = ", ".join(str(item).strip() for item in criteria if str(item).strip())
    return " | ".join(part for part in (boundary, criteria_text) if part)[:400]
