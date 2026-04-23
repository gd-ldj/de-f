"""Runtime loop for AUTO v2."""

from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor, as_completed
import datetime as dt
import json
import os
from pathlib import Path
import re
import time
from typing import Any

from auto.evidence.incidents import append_incident, build_incident_from_artifacts
from auto.evidence.lessons import append_lesson
from auto.evidence.metrics import build_metrics_summary, compute_metrics, write_metrics
from auto.evidence.reports import build_notification_summary, write_daily_report
from auto.evidence.scorecards import write_bug_score, write_qa_scorecard, write_review_effectiveness
from auto.knowledge.fix_context import build_fix_context, write_fix_context
from auto.knowledge.rules import apply_preflight_audit, generate_candidate_rules, write_rules
from auto.knowledge.taxonomy import classify_block_reason
from auto.orchestrator.state_machine import can_start
from auto.runtime.bootstrap import bootstrap_auto_root, load_state, save_state
from auto.runtime.lease import acquire_lease, reclaim_stale_leases, release_lease
from auto.runtime.notify import notify_event, write_notification_receipt
from auto.runtime.qa_verify import run_qa_verify
from auto.runtime.queue import read_queue, write_queue
from auto.runtime.safeguards import detect_epic_prefix, has_blocking_dependencies, is_epic_blocked
from auto.runtime.watchdog import append_watchdog_event, detect_watchdog_events
from auto.runtime.worktree import cleanup_task_workspace, load_task_workspace
from auto.runtime.worker import TaskWorker
from auto.schemas.queue import QueueEntry
from auto.schemas.states import QA_UNIT_BLOCKED, QA_UNIT_FAILED, QA_UNIT_PASSED, RUNTIME_IDLE, RUNTIME_PAUSED, RUNTIME_RUNNING, RUNTIME_STARTING, TASK_BLOCKED, TASK_INTEGRATED, TASK_PENDING
from auto.schemas.workflow import load_workflow_config


class AutoRuntime:
    def __init__(self, project_root: str | Path):
        self.project_root = Path(project_root)
        self.paths = bootstrap_auto_root(self.project_root)
        self.workflow = load_workflow_config(self.paths.workflow_file)
        self.state = load_state(self.paths)
        self.worker = TaskWorker(self.project_root, self.paths, self.workflow)

    def start(self, resume_only: bool = False, *, keep_alive: bool | None = None) -> dict[str, Any]:
        current_state = str(self.state.get("runtime_state", RUNTIME_IDLE))
        if current_state == RUNTIME_RUNNING:
            return {"status": "ok", "summary": "already running", "runtime_state": RUNTIME_RUNNING, "processed_tasks": [], "fix_loops": 0}
        # Detached /auto:start marks the runtime as "starting" before the daemon
        # process actually takes over. The daemon must be allowed to continue from
        # that handoff state instead of treating it as an invalid transition.
        if current_state != RUNTIME_STARTING and not can_start(current_state):
            return {"status": "error", "summary": f"cannot start from {current_state}", "runtime_state": current_state, "processed_tasks": [], "fix_loops": 0}
        if keep_alive is None:
            keep_alive = bool(self.workflow.get("runtime", {}).get("keep_alive", False))

        self.state.update(
            {
                "runtime_state": RUNTIME_STARTING,
                "last_start_at": _now(),
                "heartbeat_at": _now(),
                "last_progress_at": self.state.get("last_progress_at") or _now(),
            }
        )
        save_state(self.paths, self.state)
        self._write_runtime_artifacts(RUNTIME_STARTING)
        processed_tasks: list[str] = []
        blocked_tasks: list[str] = []
        fix_loops = 0
        failed_epics: set[str] = set()
        final_state = RUNTIME_IDLE

        while True:
            current_state = self._refresh_runtime_state()
            if current_state == RUNTIME_PAUSED:
                final_state = RUNTIME_PAUSED
                break
            queue_entries = read_queue(self.paths.queue_file)
            tasks_by_slug = self._load_all_tasks()
            self._recover_stale_runtime_state(queue_entries, tasks_by_slug)
            next_entries = self._select_next_entries(queue_entries, tasks_by_slug, failed_epics, resume_only)
            if not next_entries:
                if keep_alive:
                    self.state.update({"runtime_state": RUNTIME_RUNNING, "active_task": None, "heartbeat_at": _now()})
                    save_state(self.paths, self.state)
                    self._write_runtime_artifacts("idle_wait")
                    self._run_watchdog(queue_entries)
                    time.sleep(max(int(self.workflow.get("runtime", {}).get("poll_interval_seconds", 15) or 15), 1))
                    continue
                break
            active_tasks = [tasks_by_slug[entry.task]["slug"] for entry in next_entries]
            self.state.update({"runtime_state": RUNTIME_RUNNING, "active_task": ",".join(active_tasks), "heartbeat_at": _now()})
            save_state(self.paths, self.state)
            self._write_runtime_artifacts(RUNTIME_RUNNING, active_task=",".join(active_tasks))
            batch_results = self._execute_batch(next_entries, tasks_by_slug)
            for task, result in batch_results:
                processed_tasks.append(task["slug"])
                self._mark_progress()
                new_state = result.get("state", TASK_BLOCKED)
                tasks_by_slug[task["slug"]]["state"] = new_state
                self._write_task_state(task["work_item_id"], tasks_by_slug[task["slug"]])
                self._update_queue_state(queue_entries, task["slug"], new_state)
                self._apply_workspace_policy(task["slug"], new_state)
                write_queue(self.paths.queue_file, queue_entries)
                if new_state == TASK_BLOCKED:
                    block_reason = result.get("block_reason", TASK_BLOCKED)
                    self._append_failure(task["slug"], block_reason)
                    self._record_incident(
                        work_item_id=task["work_item_id"],
                        task_slug=task["slug"],
                        stage="task_dev",
                        category=block_reason,
                        summary=f"Task blocked: {block_reason}",
                    )
                    # Attempt task-level auto-fix for retryable block reasons
                    # (code issues the dev agent can fix on retry).
                    max_total_fix_attempts = max(int(self.workflow.get("verify", {}).get("max_total_fix_attempts", 6) or 0), 0)
                    fix_created = self._try_task_level_fix(
                        task=task,
                        block_reason=block_reason,
                        tasks_by_slug=tasks_by_slug,
                        queue_entries=queue_entries,
                        total_fix_loops=fix_loops,
                        max_total_fix_attempts=max_total_fix_attempts,
                    )
                    if fix_created:
                        fix_loops += 1
                        self._mark_progress()
                        # write_queue already called inside _try_task_level_fix
                        self._write_runtime_artifacts("task_fix_loop_opened", active_task=task["slug"])
                        continue
                    # Not retryable or budget exhausted — hard block + cascade.
                    blocked_tasks.append(task["slug"])
                    failed_epics.add(detect_epic_prefix(task))
                    self._mark_qa_units_blocked(task["work_item_id"])
                    self._write_runtime_artifacts(TASK_BLOCKED, active_task=task["slug"])
                    cascaded = self._cascade_block_related_tasks(
                        work_item_id=task["work_item_id"],
                        blocked_slug=task["slug"],
                        tasks_by_slug=tasks_by_slug,
                        queue_entries=queue_entries,
                    )
                    blocked_tasks.extend(cascaded)
                    write_queue(self.paths.queue_file, queue_entries)
                    continue
                fix_created = self._finalize_qa_units(
                    task["work_item_id"],
                    tasks_by_slug,
                    queue_entries,
                    total_fix_loops=fix_loops,
                )
                if fix_created:
                    fix_loops += fix_created
                    self._mark_progress()
                    write_queue(self.paths.queue_file, queue_entries)
                    self._write_runtime_artifacts("fix_loop_opened", active_task=task["slug"])
            current_state = self._refresh_runtime_state()
            if current_state == RUNTIME_PAUSED:
                final_state = RUNTIME_PAUSED
                break

        self.state.update({"runtime_state": final_state, "active_task": None, "heartbeat_at": _now()})
        save_state(self.paths, self.state)
        self._write_runtime_artifacts(final_state)
        # Compute and persist metrics, then embed summary into daily report.
        metrics = compute_metrics(knowledge_dir=self.paths.knowledge_dir, runtime_dir=self.paths.runtime_dir)
        write_metrics(self.paths.knowledge_dir, metrics)
        rules = generate_candidate_rules(self.paths.knowledge_dir)
        rules = apply_preflight_audit(rules, metrics)
        write_rules(self.paths.knowledge_dir, rules)
        metrics_summary = build_metrics_summary(metrics)
        enabled_events = set(self.workflow.get("alerts", {}).get("events", []))
        if not keep_alive and "queue_drained" in enabled_events:
            event = {
                "event": "queue_drained",
                "severity": "info",
                "summary": f"Processed {len(processed_tasks)} tasks; blocked {len(blocked_tasks)} tasks",
                "queue_depth": 0,
            }
            receipt = notify_event(
                self.workflow,
                event,
            )
            write_notification_receipt(self.paths.runtime_dir, event=event, result=receipt)
        report_path = write_daily_report(
            self.paths.daily_reports_dir,
            {
                "processed_tasks": processed_tasks,
                "blocked_tasks": blocked_tasks,
                "fix_loops": fix_loops,
                "metrics": metrics_summary,
                "notifications": build_notification_summary(self.paths.runtime_dir),
            },
        )
        append_lesson(self.paths.runtime_dir, {"type": "runtime_complete", "processed_tasks": len(processed_tasks), "fix_loops": fix_loops})
        return {
            "status": "ok",
            "summary": "runtime paused" if final_state == RUNTIME_PAUSED else "runtime drained",
            "runtime_state": final_state,
            "processed_tasks": processed_tasks,
            "blocked_tasks": blocked_tasks,
            "fix_loops": fix_loops,
            "report_path": str(report_path),
        }

    def _recover_stale_runtime_state(self, queue_entries: list[QueueEntry], tasks_by_slug: dict[str, dict]) -> None:
        stale_after_seconds = max(int(self.workflow.get("runtime", {}).get("lease_stale_after_seconds", 900) or 0), 0)
        reclaimed = reclaim_stale_leases(self.paths.runtime_dir, stale_after_seconds=stale_after_seconds)
        if not reclaimed:
            return
        for slug in reclaimed:
            task = tasks_by_slug.get(slug)
            if task and task.get("state") == TASK_RUNNING:
                task["state"] = TASK_PENDING
                self._write_task_state(task["work_item_id"], task)
            self._update_queue_state(queue_entries, slug, TASK_PENDING)
        write_queue(self.paths.queue_file, queue_entries)

    def _mark_progress(self) -> None:
        current = load_state(self.paths)
        current["last_progress_at"] = _now()
        current["heartbeat_at"] = _now()
        self.state = current
        save_state(self.paths, self.state)

    def _run_watchdog(self, queue_entries: list[QueueEntry]) -> None:
        events = detect_watchdog_events(
            runtime_dir=self.paths.runtime_dir,
            state=self.state,
            workflow=self.workflow,
        )
        if not events:
            return
        enabled_events = set(self.workflow.get("alerts", {}).get("events", []))
        last_signature = str(self.state.get("last_watchdog_signature", "") or "")
        for event in events:
            signature = str(event.get("signature", "") or "")
            if signature and signature == last_signature:
                continue
            append_watchdog_event(self.paths.runtime_dir, event)
            if event.get("event") in enabled_events:
                receipt = notify_event(self.workflow, {**event, "queue_depth": len(queue_entries)})
                write_notification_receipt(
                    self.paths.runtime_dir,
                    event={**event, "queue_depth": len(queue_entries)},
                    result=receipt,
                )
            if signature:
                self.state["last_watchdog_signature"] = signature
                last_signature = signature
                save_state(self.paths, self.state)

    def _select_next_entries(
        self,
        queue_entries: list[QueueEntry],
        tasks_by_slug: dict[str, dict],
        failed_epics: set[str],
        resume_only: bool,
    ) -> list[QueueEntry]:
        max_parallel = max(int(self.workflow.get("runtime", {}).get("max_parallel", 1) or 1), 1)
        selected: list[QueueEntry] = []
        selected_slugs: set[str] = set()
        for entry in queue_entries:
            if entry.state not in self._eligible_queue_states(resume_only):
                continue
            task = tasks_by_slug.get(entry.task)
            if not task:
                continue
            if resume_only and task.get("state") not in {"paused", "running"}:
                continue
            if not resume_only and task.get("state") != "pending":
                continue
            if is_epic_blocked(task, failed_epics):
                continue
            if has_blocking_dependencies(task, tasks_by_slug):
                continue
            if set(task.get("depends_on", [])).intersection(selected_slugs):
                continue
            selected.append(entry)
            selected_slugs.add(entry.task)
            if len(selected) >= max_parallel:
                break
        return selected

    def _load_all_tasks(self) -> dict[str, dict]:
        tasks: dict[str, dict] = {}
        for item_dir in sorted(self.paths.work_items_dir.iterdir()):
            tasks_path = item_dir / "TASKS.json"
            if not tasks_path.exists():
                continue
            payload = _load_records(tasks_path, "tasks")
            for record in payload:
                record.setdefault("state", TASK_PENDING)
                slug = record.get("slug") or record.get("id")
                if not slug:
                    continue
                record.setdefault("slug", slug)
                tasks[slug] = record
        return tasks

    def _write_task_state(self, work_item_id: str, task: dict) -> None:
        tasks_path = self.paths.work_items_dir / work_item_id / "TASKS.json"
        payload = _load_records(tasks_path, "tasks")
        for record in payload:
            slug = record.get("slug") or record.get("id")
            if slug == task["slug"]:
                record.setdefault("slug", slug)
                record["state"] = task["state"]
        _save_records(tasks_path, "tasks", payload)

    def _write_task_deps(self, work_item_id: str, task: dict) -> None:
        """Persist depends_on changes for a task to TASKS.json."""
        tasks_path = self.paths.work_items_dir / work_item_id / "TASKS.json"
        if not tasks_path.exists():
            return
        payload = _load_records(tasks_path, "tasks")
        for record in payload:
            slug = record.get("slug") or record.get("id")
            if slug == task["slug"]:
                record["depends_on"] = task.get("depends_on", [])
        _save_records(tasks_path, "tasks", payload)

    def _update_queue_state(self, queue_entries: list[QueueEntry], slug: str, state: str) -> None:
        for index, entry in enumerate(queue_entries):
            if entry.task == slug:
                queue_entries[index] = QueueEntry(
                    task=entry.task,
                    work_item=entry.work_item,
                    state=state,
                    depends_on=entry.depends_on,
                    notes=entry.notes,
                )
                return

    def _load_qa_units(self, work_item_id: str) -> list[dict]:
        qa_path = self.paths.work_items_dir / work_item_id / "QA-UNITS.json"
        if not qa_path.exists():
            return []
        return _load_records(qa_path, "qa_units")

    def _save_qa_units(self, work_item_id: str, qa_units: list[dict]) -> None:
        qa_path = self.paths.work_items_dir / work_item_id / "QA-UNITS.json"
        _save_records(qa_path, "qa_units", qa_units)

    def _mark_qa_units_blocked(self, work_item_id: str) -> None:
        qa_units = self._load_qa_units(work_item_id)
        for qa_unit in qa_units:
            qa_unit["state"] = QA_UNIT_BLOCKED
        self._save_qa_units(work_item_id, qa_units)

    def _finalize_qa_units(
        self,
        work_item_id: str,
        tasks_by_slug: dict[str, dict],
        queue_entries: list[QueueEntry],
        *,
        total_fix_loops: int,
    ) -> int:
        qa_units = self._load_qa_units(work_item_id)
        fix_loops = 0
        max_attempts = 3
        max_total_fix_attempts = max(int(self.workflow.get("verify", {}).get("max_total_fix_attempts", 6) or 0), 0)
        for qa_unit in qa_units:
            member_tasks = qa_unit.get("member_tasks", [])
            if not member_tasks:
                continue
            # QA unit is ready when every member is either integrated or
            # superseded (blocked but followed by a later integrated fix).
            if not _qa_members_ready(member_tasks, tasks_by_slug):
                continue
            qa_dir = self.paths.qa_units_dir / qa_unit["qa_unit_id"]
            qa_result = run_qa_verify(qa_dir, qa_unit, self.workflow, project_root=self.project_root)
            verify_payload = qa_result["verify_payload"]
            bugs_payload = qa_result["bugs_payload"]
            write_qa_scorecard(qa_dir, verify_payload, bugs_payload)
            write_bug_score(qa_dir, bugs_payload)
            write_review_effectiveness(
                qa_dir,
                qa_unit_id=qa_unit["qa_unit_id"],
                work_item_id=work_item_id,
                bugs_payload=bugs_payload,
            )
            if qa_result.get("verdict") == "block":
                current_attempts = int(qa_unit.get("attempt_count", 0))
                if current_attempts >= max_attempts:
                    qa_unit["state"] = QA_UNIT_BLOCKED
                    self._append_failure(qa_unit["qa_unit_id"], "qa_fix_loop_exhausted", stage="qa_verify", attempt=current_attempts)
                    self._record_incident(
                        work_item_id=work_item_id,
                        task_slug=member_tasks[-1],
                        stage="qa_verify",
                        category="qa_fix_loop_exhausted",
                        summary=f"QA fix loop exhausted after {current_attempts} attempts for {qa_unit['qa_unit_id']}",
                        attempt_count=current_attempts,
                    )
                    continue
                if max_total_fix_attempts and total_fix_loops + fix_loops >= max_total_fix_attempts:
                    qa_unit["state"] = QA_UNIT_BLOCKED
                    self._append_failure(qa_unit["qa_unit_id"], "qa_fix_budget_exhausted", stage="qa_verify", attempt=current_attempts)
                    self._record_incident(
                        work_item_id=work_item_id,
                        task_slug=member_tasks[-1],
                        stage="qa_verify",
                        category="qa_fix_budget_exhausted",
                        summary=f"QA fix budget exhausted at {total_fix_loops + fix_loops} total loops for {qa_unit['qa_unit_id']}",
                        attempt_count=current_attempts,
                    )
                    continue
                fix_task, failure_category = self._create_fix_task(work_item_id, qa_unit, tasks_by_slug)
                qa_unit["attempt_count"] = current_attempts + 1
                qa_unit["state"] = QA_UNIT_FAILED
                qa_unit["last_failure_category"] = failure_category
                tasks_by_slug[fix_task["slug"]] = fix_task
                queue_entries.append(
                    QueueEntry(
                        task=fix_task["slug"],
                        work_item=work_item_id,
                        state=TASK_PENDING,
                        depends_on=(member_tasks[-1],),
                        notes=fix_task.get("notes", ""),
                    )
                )
                member_tasks.append(fix_task["slug"])
                qa_unit["member_tasks"] = member_tasks
                self._record_incident(
                    work_item_id=work_item_id,
                    task_slug=fix_task["slug"],
                    stage="fix_loop_opened",
                    category=failure_category,
                    summary=f"Fix loop opened: attempt {current_attempts + 1} for {qa_unit['qa_unit_id']}",
                    attempt_count=current_attempts + 1,
                )
                fix_loops += 1
            else:
                qa_unit["state"] = QA_UNIT_PASSED
                # If this QA unit had previous fix attempts, record a resolved incident.
                attempt_count = int(qa_unit.get("attempt_count", 0))
                if attempt_count > 0:
                    failure_category = str(qa_unit.get("last_failure_category", "unknown") or "unknown")
                    self._record_incident(
                        work_item_id=work_item_id,
                        task_slug=member_tasks[-1],
                        stage="fix_loop_resolved",
                        category=failure_category,
                        summary=f"Fix loop resolved after {attempt_count} attempts for {qa_unit.get('qa_unit_id', '')}",
                        attempt_count=attempt_count,
                    )
        self._save_qa_units(work_item_id, qa_units)
        return fix_loops

    # Block reasons that a dev agent can potentially fix by retrying.
    _RETRYABLE_BLOCK_REASONS = frozenset({
        "review_block",
        "verify_block",
        "gate_tsc",
        "gate_e2e",
    })

    def _try_task_level_fix(
        self,
        *,
        task: dict,
        block_reason: str,
        tasks_by_slug: dict[str, dict],
        queue_entries: list[QueueEntry],
        total_fix_loops: int,
        max_total_fix_attempts: int,
    ) -> bool:
        """Attempt to create a fix task for retryable block reasons.

        Returns True if a fix task was created, False if the block is
        not retryable or retry budget is exhausted.

        All disk writes (TASKS.json, QA-UNITS.json, TASK-QUEUE.md,
        depends_on) are performed inside this function.  If any write
        fails the function rolls back already-written files and returns
        False so the caller can fall through to hard-block.
        """
        if block_reason not in self._RETRYABLE_BLOCK_REASONS:
            return False

        slug = task["slug"]
        work_item_id = str(task.get("work_item_id", ""))

        # Count existing fix attempts for this original task.
        original_slug = _extract_original_slug(slug)
        existing_attempts = sum(
            1 for s in tasks_by_slug
            if _extract_original_slug(s) == original_slug and "-fix-" in s
        )
        max_task_attempts = 3
        if existing_attempts >= max_task_attempts:
            return False
        if max_total_fix_attempts and total_fix_loops >= max_total_fix_attempts:
            return False

        fix_slug = _next_fix_slug(original_slug, tasks_by_slug)
        attempt = existing_attempts + 1

        parent_scope = list(task.get("scope_files", []))
        parent_task_dir = self.paths.tasks_dir / slug

        fix_ctx = build_fix_context(
            task_slug=fix_slug,
            parent_task_slug=slug,
            work_item_id=work_item_id,
            qa_unit_id="",
            attempt=attempt,
            failure_category=block_reason,
            parent_task_dir=parent_task_dir,
            qa_unit_dir=None,
            parent_scope_files=parent_scope,
        )
        failure_summary = str(fix_ctx.get("failure_summary", ""))[:120]

        fix_task = {
            "slug": fix_slug,
            "work_item_id": work_item_id,
            "title": f"Fix {block_reason} for {original_slug}",
            "state": TASK_PENDING,
            "depends_on": [slug],
            "notes": failure_summary,
            "scope_files": parent_scope or [f"auto/generated/{fix_slug}.md"],
            "is_fix_task": True,
        }

        # ── Snapshot disk + memory for rollback on failure ──────────
        tasks_path = self.paths.work_items_dir / work_item_id / "TASKS.json"
        tasks_backup = tasks_path.read_bytes() if tasks_path.exists() else None
        qa_path = self.paths.work_items_dir / work_item_id / "QA-UNITS.json"
        qa_backup = qa_path.read_bytes() if qa_path.exists() else None
        queue_backup = self.paths.queue_file.read_bytes() if self.paths.queue_file.exists() else None
        deps_backups: dict[Path, bytes] = {}
        # Snapshot in-memory depends_on for downstream tasks so we can
        # restore them if the transaction fails.
        deps_memory_snapshot: dict[str, list] = {}
        queue_snapshot: list[QueueEntry] = list(queue_entries)
        fix_task_dir = self.paths.tasks_dir / fix_slug
        fix_task_dir_existed = fix_task_dir.exists()

        try:
            # Persist fix task to TASKS.json.
            if tasks_path.exists():
                payload = json.loads(tasks_path.read_text(encoding="utf-8"))
                if isinstance(payload, list):
                    payload.append(fix_task)
                else:
                    payload.setdefault("tasks", []).append(fix_task)
                tasks_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

            # Write FIX-CONTEXT.json.
            write_fix_context(fix_task_dir, fix_ctx)

            # Register in runtime memory.
            tasks_by_slug[fix_slug] = fix_task
            queue_entries.append(
                QueueEntry(
                    task=fix_slug,
                    work_item=work_item_id,
                    state=TASK_PENDING,
                    depends_on=(slug,),
                    notes=failure_summary,
                )
            )

            # Add fix task to QA units that reference the blocked parent.
            qa_units = self._load_qa_units(work_item_id)
            for qa_unit in qa_units:
                members = qa_unit.get("member_tasks", [])
                if slug in members:
                    members.append(fix_slug)
                    qa_unit["member_tasks"] = members
            self._save_qa_units(work_item_id, qa_units)

            # Re-point downstream tasks that depend on the blocked parent.
            repointed_tasks: list[dict] = []
            for other_slug, other_task in tasks_by_slug.items():
                if other_slug in (slug, fix_slug):
                    continue
                deps = other_task.get("depends_on", []) or []
                if slug in deps:
                    # Snapshot original depends_on before mutation.
                    deps_memory_snapshot[other_slug] = list(deps)
                    new_deps = [fix_slug if d == slug else d for d in deps]
                    other_task["depends_on"] = new_deps
                    repointed_tasks.append(other_task)
                    for idx, entry in enumerate(queue_entries):
                        if entry.task == other_slug:
                            queue_entries[idx] = QueueEntry(
                                task=entry.task,
                                work_item=entry.work_item,
                                state=entry.state,
                                depends_on=tuple(fix_slug if d == slug else d for d in (entry.depends_on or ())),
                                notes=entry.notes,
                            )
            for repointed in repointed_tasks:
                rp_wid = str(repointed.get("work_item_id", work_item_id))
                rp_path = self.paths.work_items_dir / rp_wid / "TASKS.json"
                # Skip if this is the same file as tasks_path — it is
                # already covered by tasks_backup and snapshotting it
                # here would capture post-fix-task-append content.
                if rp_path != tasks_path and rp_path.exists() and rp_path not in deps_backups:
                    deps_backups[rp_path] = rp_path.read_bytes()
                self._write_task_deps(rp_wid, repointed)

            # Persist queue — this is the commit point.
            write_queue(self.paths.queue_file, queue_entries)

        except Exception:
            # ── Rollback disk state ────────────────────────────────
            if tasks_backup is not None:
                tasks_path.write_bytes(tasks_backup)
            if qa_backup is not None:
                qa_path.write_bytes(qa_backup)
            if queue_backup is not None:
                self.paths.queue_file.write_bytes(queue_backup)
            for backup_path, backup_data in deps_backups.items():
                backup_path.write_bytes(backup_data)
            # Clean up FIX-CONTEXT.json artifact only if we created it.
            import shutil
            if not fix_task_dir_existed and fix_task_dir.exists():
                shutil.rmtree(fix_task_dir, ignore_errors=True)
            # ── Rollback in-memory state ───────────────────────────
            tasks_by_slug.pop(fix_slug, None)
            # Restore queue_entries to pre-transaction snapshot.
            queue_entries.clear()
            queue_entries.extend(queue_snapshot)
            # Restore original depends_on for repointed tasks.
            for rp_slug, original_deps in deps_memory_snapshot.items():
                if rp_slug in tasks_by_slug:
                    tasks_by_slug[rp_slug]["depends_on"] = original_deps
            return False

        # Best-effort observability writes — fix task is already committed,
        # so failures here must not propagate to the caller.
        try:
            append_lesson(self.paths.runtime_dir, {
                "type": "task_fix_loop_opened",
                "task": fix_slug,
                "parent": slug,
                "category": block_reason,
                "attempt": attempt,
            })
            self._record_incident(
                work_item_id=work_item_id,
                task_slug=fix_slug,
                stage="task_fix_loop_opened",
                category=block_reason,
                summary=f"Task fix loop opened: {block_reason} attempt {attempt} for {original_slug}",
                attempt_count=attempt,
            )
        except Exception:
            pass  # Observability loss is acceptable; fix task is committed.
        return True

    def _create_fix_task(self, work_item_id: str, qa_unit: dict, tasks_by_slug: dict[str, dict]) -> tuple[dict, str]:
        parent_slug = qa_unit["member_tasks"][-1]
        original_slug = _extract_original_slug(parent_slug)
        attempt = int(qa_unit.get("attempt_count", 0)) + 1
        slug = _next_fix_slug(original_slug, tasks_by_slug)
        qa_unit_id = qa_unit.get("qa_unit_id", "")

        # Inherit parent scope_files instead of using a placeholder.
        parent_task = tasks_by_slug.get(parent_slug, {})
        parent_scope = list(parent_task.get("scope_files", []))

        # Build a structured fix context from parent artifacts.
        parent_task_dir = self.paths.tasks_dir / parent_slug
        qa_unit_dir = self.paths.qa_units_dir / qa_unit_id if qa_unit_id else None
        # Determine failure category: QA-triggered fix loops mean the parent
        # task *passed* dev+review (state=integrated), so STATUS.json won't
        # have a block_reason.  In that case, the correct category is
        # "verify_blocked" since QA verification rejected it.
        parent_status = self._read_parent_block_reason(parent_task_dir)
        if parent_status:
            failure_category = classify_block_reason(parent_status)
        else:
            # Parent was integrated — this fix is triggered by QA verify.
            failure_category = "verify_blocked"

        fix_ctx = build_fix_context(
            task_slug=slug,
            parent_task_slug=parent_slug,
            work_item_id=work_item_id,
            qa_unit_id=qa_unit_id,
            attempt=attempt,
            failure_category=failure_category,
            parent_task_dir=parent_task_dir,
            qa_unit_dir=qa_unit_dir,
            parent_scope_files=parent_scope,
        )

        failure_summary = str(fix_ctx.get("failure_summary", ""))[:120]

        task = {
            "slug": slug,
            "work_item_id": work_item_id,
            "title": f"Fix QA issues for {qa_unit_id}",
            "state": TASK_PENDING,
            "depends_on": [parent_slug],
            "notes": failure_summary,
            "scope_files": parent_scope or [f"auto/generated/{slug}.md"],
            "is_fix_task": True,
        }

        # Persist TASKS.json update.
        tasks_path = self.paths.work_items_dir / work_item_id / "TASKS.json"
        payload = json.loads(tasks_path.read_text(encoding="utf-8"))
        payload.append(task)
        tasks_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

        # Write FIX-CONTEXT.json artifact.
        fix_task_dir = self.paths.tasks_dir / slug
        write_fix_context(fix_task_dir, fix_ctx)

        append_lesson(self.paths.runtime_dir, {
            "type": "fix_loop_opened",
            "qa_unit_id": qa_unit_id,
            "task": slug,
            "category": failure_category,
            "attempt": attempt,
        })
        return task, failure_category

    @staticmethod
    def _read_parent_block_reason(parent_task_dir: Path) -> str:
        status_path = parent_task_dir / "STATUS.json"
        if not status_path.exists():
            return ""
        try:
            data = json.loads(status_path.read_text(encoding="utf-8"))
            return str(data.get("block_reason", ""))
        except (json.JSONDecodeError, OSError):
            return ""

    def _record_incident(
        self,
        *,
        work_item_id: str,
        task_slug: str,
        stage: str,
        category: str,
        summary: str = "",
        attempt_count: int = 0,
        tags: list[str] | None = None,
    ) -> None:
        task_dir = self.paths.tasks_dir / task_slug
        incident = build_incident_from_artifacts(
            knowledge_dir=self.paths.knowledge_dir,
            work_item_id=work_item_id,
            task_slug=task_slug,
            stage=stage,
            category=category,
            summary=summary,
            task_dir=task_dir if task_dir.exists() else None,
            attempt_count=attempt_count,
            tags=tags,
        )
        append_incident(self.paths.knowledge_dir, incident)

    def _write_runtime_artifacts(self, event: str, *, active_task: str | None = None) -> None:
        self.paths.runtime_dir.mkdir(parents=True, exist_ok=True)
        self.paths.runtime_dir.joinpath("executor.pid").write_text(f"{os.getpid()}\n", encoding="utf-8")
        with self.paths.runtime_dir.joinpath("executor.log").open("a", encoding="utf-8") as handle:
            handle.write(f"{_now()} {event} active_task={active_task or '-'}\n")
        heartbeat_payload = {
            "timestamp": _now(),
            "event": event,
            "runtime_state": self.state.get("runtime_state", "idle"),
            "active_task": active_task,
        }
        self.paths.heartbeat_dir.mkdir(parents=True, exist_ok=True)
        self.paths.heartbeat_dir.joinpath("latest.json").write_text(
            json.dumps(heartbeat_payload, indent=2) + "\n",
            encoding="utf-8",
        )

    def _append_failure(self, slug: str, reason: str, *, stage: str = "", attempt: int = 0) -> None:
        category = classify_block_reason(reason)
        payload: dict[str, Any] = {
            "timestamp": _now(),
            "slug": slug,
            "reason": reason,
            "category": category,
        }
        if stage:
            payload["stage"] = stage
        if attempt:
            payload["attempt"] = attempt
        with self.paths.runtime_dir.joinpath("failures.jsonl").open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(payload, ensure_ascii=False) + "\n")

    def _execute_batch(self, entries: list[QueueEntry], tasks_by_slug: dict[str, dict]) -> list[tuple[dict, dict[str, Any]]]:
        batch: list[tuple[dict, dict[str, Any]]] = []
        max_workers = max(len(entries), 1)
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            future_map = {}
            for entry in entries:
                task = tasks_by_slug[entry.task]
                acquire_lease(self.paths.runtime_dir, task["slug"])
                future = executor.submit(self.worker.execute, task)
                future_map[future] = task
            for future in as_completed(future_map):
                task = future_map[future]
                result = future.result()
                release_lease(self.paths.runtime_dir, task["slug"], result.get("state", TASK_BLOCKED))
                batch.append((task, result))
        ordered = {task["slug"]: (task, result) for task, result in batch}
        return [ordered[entry.task] for entry in entries if entry.task in ordered]

    def _eligible_queue_states(self, resume_only: bool) -> set[str]:
        if resume_only:
            return {"pending", "paused", "running"}
        return {TASK_PENDING}

    def _apply_workspace_policy(self, slug: str, state: str) -> None:
        workspace = load_task_workspace(self.project_root, slug)
        if workspace is None:
            return
        policy = str(self.workflow.get("worktree", {}).get("cleanup_policy", "preserve_metadata")).strip() or "preserve_metadata"
        if policy == "keep":
            return
        if policy == "always_remove":
            cleanup_task_workspace(workspace, preserve_metadata=False)
            return
        if policy == "remove_on_success":
            if state == TASK_INTEGRATED:
                cleanup_task_workspace(workspace, preserve_metadata=False)
                return
            cleanup_task_workspace(workspace, preserve_metadata=True)
            return
        if state in {TASK_INTEGRATED, TASK_BLOCKED}:
            cleanup_task_workspace(workspace, preserve_metadata=True)

    def _refresh_runtime_state(self) -> str:
        self.state = load_state(self.paths)
        return str(self.state.get("runtime_state", RUNTIME_IDLE))

    def _cascade_block_related_tasks(
        self,
        *,
        work_item_id: str,
        blocked_slug: str,
        tasks_by_slug: dict[str, dict],
        queue_entries: list[QueueEntry],
    ) -> list[str]:
        blocked: list[str] = []
        blocked_task = tasks_by_slug.get(blocked_slug, {"slug": blocked_slug})
        epic_prefix = detect_epic_prefix(blocked_task)
        changed = True
        while changed:
            changed = False
            blocked_set = {slug for slug, task in tasks_by_slug.items() if task.get("state") == TASK_BLOCKED}
            for slug, task in tasks_by_slug.items():
                if task.get("work_item_id") != work_item_id:
                    continue
                if task.get("state") != TASK_PENDING:
                    continue
                depends_on = set(task.get("depends_on", []))
                reason = ""
                if depends_on.intersection(blocked_set | {blocked_slug}):
                    reason = "dependency_blocked"
                elif detect_epic_prefix(task) == epic_prefix:
                    reason = "epic_cascade_blocked"
                if not reason:
                    continue
                task["state"] = TASK_BLOCKED
                blocked.append(slug)
                self._write_task_state(work_item_id, task)
                self._update_queue_state(queue_entries, slug, TASK_BLOCKED)
                self._write_cascade_status(slug, reason)
                self._append_failure(slug, reason)
                changed = True
        return blocked

    def _write_cascade_status(self, slug: str, reason: str) -> None:
        task_dir = self.paths.tasks_dir / slug
        task_dir.mkdir(parents=True, exist_ok=True)
        task_dir.joinpath("STATUS.json").write_text(
            json.dumps(
                {
                    "state": TASK_BLOCKED,
                    "slug": slug,
                    "block_reason": reason,
                    "updated_at": _now(),
                },
                indent=2,
            )
            + "\n",
            encoding="utf-8",
        )


def _qa_members_ready(member_tasks: list[str], tasks_by_slug: dict[str, dict]) -> bool:
    """Check whether a QA unit's member tasks are ready for verification.

    Rules:
    - Every member must be in a terminal state (integrated or blocked).
    - A blocked member is only acceptable if a LATER member in the list
      is integrated (meaning a fix task superseded it).
    - If ANY member is still pending/running, not ready.
    - If the last integrated member doesn't exist, not ready.
    """
    if not member_tasks:
        return False
    has_integrated_successor = False
    # Walk from the end to determine which blocked members are superseded.
    for member in reversed(member_tasks):
        state = tasks_by_slug.get(member, {}).get("state", "")
        if state == TASK_INTEGRATED:
            has_integrated_successor = True
        elif state == TASK_BLOCKED:
            if not has_integrated_successor:
                # Blocked with no later integrated fix — not ready.
                return False
        else:
            # Still pending or running.
            return False
    return has_integrated_successor


def _extract_original_slug(slug: str) -> str:
    """Strip all trailing -fix-N suffixes to get the original task slug."""
    return re.sub(r"(-fix-\d+)+$", "", slug)


def _next_fix_slug(original_slug: str, tasks_by_slug: dict[str, dict]) -> str:
    """Allocate the next unique fix slug for *original_slug*.

    Scans all existing task slugs to find the highest -fix-N suffix for
    the given original slug and returns original_slug-fix-(max+1).
    This is the single source of truth for fix slug numbering — both
    task-level and QA-level fix paths must use this function so that
    their slugs never collide.
    """
    max_n = 0
    prefix = f"{original_slug}-fix-"
    for slug in tasks_by_slug:
        if slug.startswith(prefix):
            tail = slug[len(prefix):]
            # tail might be "2" or "2-fix-3" (nested); take the first int.
            match = re.match(r"(\d+)", tail)
            if match:
                max_n = max(max_n, int(match.group(1)))
    return f"{original_slug}-fix-{max_n + 1}"

def _now() -> str:
    return dt.datetime.now(dt.UTC).isoformat(timespec="seconds")


def _load_records(path: Path, collection_key: str) -> list[dict]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(payload, list):
        return [record for record in payload if isinstance(record, dict)]
    if isinstance(payload, dict):
        collection = payload.get(collection_key, [])
        if isinstance(collection, list):
            return [record for record in collection if isinstance(record, dict)]
    return []


def _save_records(path: Path, collection_key: str, records: list[dict]) -> None:
    existing = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(existing, dict):
        payload = dict(existing)
        payload[collection_key] = records
    else:
        payload = records
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
