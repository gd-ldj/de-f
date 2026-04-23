# /auto:start

Start or resume the AUTO v2 runtime loop as a **background agent**.

## CRITICAL: Background Execution Model

`/auto:start` MUST launch a background agent to do the actual work. The foreground conversation returns immediately after validation.

**Foreground (this conversation):**
1. Load `.auto/STATE.json` and check runtime state.
2. If already `running`, return "already running" — do NOT launch another agent.
3. If state is `idle` or `paused`, transition to `starting` in STATE.json.
4. Launch a background Agent (using `Agent` tool with `run_in_background: true`) to run the runtime loop.
5. Immediately return to the user: "AUTO runtime started. Background agent is polling TASK-QUEUE.md."

**DO NOT** execute any tasks in the foreground. DO NOT read PLAN.md, modify source code, run tsc, open browsers, or do any task work in the foreground. All of that happens in the background agent.

## Background Agent Prompt

Launch the background agent with `subagent_type: "general-purpose"` and `run_in_background: true`. The agent prompt MUST include:

```
You are the AUTO v2 runtime executor. You run in the background, polling TASK-QUEUE.md and executing pending tasks.

## Setup
1. Read `.auto/WORKFLOW.yaml` for agent config, timeouts, and safeguards.
2. Read `.auto/queue/TASK-QUEUE.md` to find pending tasks.
3. Update `.auto/STATE.json` to `running`.

## Main Loop
For each pending task (respecting dependency order via Depends On column):

### 1. Lease
- Read the task's PLAN.md from `.auto/tasks/<slug>/PLAN.md`
- Create `.auto/tasks/<slug>/STATUS.json`:
  ```json
  { "slug": "<slug>", "work_item_id": "<wid>", "state": "active",
    "created_at": "<ISO8601>", "started_at": "<ISO8601>",
    "fix_attempts": 0 }
  ```
- Update TASK-QUEUE.md state from `pending` to `active`

### 2. Dev Stage
- Read scope files from PLAN.md
- Implement the changes described in the plan
- Run `npx tsc --noEmit` to verify no type errors

### 3. Safeguard Checks
- Empty diff precheck: if no files changed, mark as blocked
- Scope drift: only modify files listed in PLAN.md scope
- Dev server self-heal: if UI verification needed, ensure localhost:3100 is healthy

### 4. Review Stage
- Self-review changes for correctness, design system compliance, i18n completeness
- Write `.auto/tasks/<slug>/REVIEW.json`:
  ```json
  { "task_slug": "<slug>", "work_item_id": "<wid>",
    "verdict": "pass"|"warn"|"block",
    "reviewed_at": "<ISO8601>",
    "findings": [{ "severity": "error"|"warn"|"info", "file": "...", "detail": "..." }],
    "notes": "..." }
  ```
- If verdict is "block": mark task blocked in STATUS.json and TASK-QUEUE.md, skip to Step 7

### 5. Verify Stage (MANDATORY for UI tasks)

**UI task detection rule** — if ANY of these match, this is a UI task and browser verification is REQUIRED:
- Scope includes `app/[locale]/**/*.tsx` or `app/**/page.tsx`
- Scope includes `components/**/*.tsx`
- PLAN.md contains keywords: page, modal, dialog, button, form, table, drawer, tab, sidebar, card

**Non-UI task** (pure types/API/utils/docs) may skip this step, but MUST write
`"verify_skipped_reason": "non-ui-task"` into STATUS.json.

**UI task MUST execute these steps:**
1. Ensure dev server is healthy:
   - `curl -s http://localhost:3100/en/sign-in` must return 200
   - If 500 or "Cannot find module": `pnpm kill:dev && rm -rf .next && pnpm dev`, wait until healthy
2. Open browser and navigate to the target page URL
3. Take initial screenshot, save to `.auto/tasks/<slug>/screenshots/`
4. Simulate key interactions (click, select, tab switch, form fill, etc.)
5. Take post-interaction screenshots
6. Write `.auto/tasks/<slug>/VERIFY.json`:
   ```json
   { "task_slug": "<slug>", "work_item_id": "<wid>",
     "verified_at": "<ISO8601>",
     "is_ui_task": true,
     "screenshots": ["screenshots/initial.png", "screenshots/after-interaction.png"],
     "qa_results": [{ "id": "...", "pass": true, "evidence": "..." }],
     "verdict": "pass"|"block",
     "all_passed": true }
   ```

**HARD RULE**: Do NOT mark a UI task as `integrated` if VERIFY.json does not exist or has no screenshots.

### 6. QA Unit Verification
1. Read `.auto/work-items/<wid>/QA-UNITS.json`
2. Filter QA units whose `covers_tasks` includes current slug
3. For each matching QA unit, execute its `steps`:
   - "visual" type: take screenshot, compare against expected appearance
   - "interaction" type: simulate user action in browser, verify outcome
   - "functional" type: code inspection or API call verification
4. Write results into VERIFY.json `qa_results[]` array
5. If any QA unit fails:
   a. Read `fix_attempts` from STATUS.json (default 0)
   b. If `fix_attempts >= max_total_fix_attempts` (from WORKFLOW.yaml, default 6):
      mark task as `blocked` with reason `[qa-max-fix-exceeded]`, skip to Step 7
   c. Otherwise:
      - Fix the code directly (do NOT create a new task)
      - Increment `fix_attempts` in STATUS.json
      - Re-run tsc + browser verification
      - Re-execute the failed QA units
6. All QA units pass → set VERIFY.json verdict="pass", all_passed=true

### 7. Finalize
- Update STATUS.json: `state`="integrated" (or "blocked"), `integrated_at`=ISO8601
- Write `.auto/tasks/<slug>/RESULT.json`:
  ```json
  { "slug": "<slug>", "work_item_id": "<wid>",
    "verdict": "pass"|"block",
    "stage_outcomes": {
      "task_dev": "pass"|"block",
      "tsc_check": "pass"|"block",
      "review": "pass"|"warn"|"block",
      "browser_verify": "pass"|"skip"|"block",
      "qa_verify": "pass"|"skip"|"block"
    },
    "changes": { "files_modified": ["..."], "lines_added": 0, "lines_removed": 0 },
    "qa_results": [{ "id": "...", "verdict": "pass"|"fail", "fix_loops": 0 }],
    "completed_at": "<ISO8601>" }
  ```
- Update TASK-QUEUE.md state to `integrated` or `blocked`
- Record incidents/lessons if blocked

### 7.5. Auto-commit (on `integrated` only)
**User preference: no manual review gate. Every successfully integrated task commits itself.**

- Skip if state is `blocked` — leave changes unstaged for human triage
- Stage ONLY the files listed in PLAN.md scope (plus lockfiles `package.json` / `pnpm-lock.yaml` if the task installed deps). Never stage files outside declared scope.
- Never run `git add -A` or `git add .` — always pass explicit paths.
- Commit message format (Conventional Commits):
  ```
  <type>(<scope>): <imperative summary>

  Task: <slug>
  Work Item: <work_item_id>

  Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
  ```
  - `<type>`: infer from scope — `feat` for new features, `fix` for bug fixes, `chore` for tooling, `refactor` for refactors, `docs` for docs-only
  - `<scope>`: short area tag from the task slug (e.g. `sentry`, `home`, `auto`)
- Do NOT push. Do NOT use `--force`, `--no-verify`, or `--amend`.
- If pre-commit hooks fail: fix the issue and create a NEW commit (do not `--amend`). If unfixable, revert staging and mark task `blocked` with `[commit-hook-fail]` note.
- If `.env.example` or other normally-gitignored files are in scope, verify the gitignore explicitly allows them (e.g. `!.env.example`) before staging; do not use `git add -f`.

### 8. Continue or Drain
- Re-read TASK-QUEUE.md for next pending task
- Check STATE.json — if someone called /auto:stop (state=paused), exit gracefully
- If no more pending tasks, transition to `idle` and exit

## Evidence & Reporting
- Write to `.auto/runtime/executor.log` for each major event
- Update `.auto/runtime/heartbeat/latest.json` periodically
- On completion: compute metrics, write daily report

## Constraints
- Do NOT modify files outside the task's declared scope
- Do NOT bypass safeguard checks
- Do NOT touch TASK-QUEUE.md entries for other tasks
- Respect `max_total_fix_attempts` from WORKFLOW.yaml (default: 6)
- If dev server returns 500 with "Cannot find module vendor-chunks", run: kill port 3000, rm -rf .next, pnpm dev
- After each successful task: auto-commit scope files per step 7.5 (no manual review gate). NEVER push, NEVER force, NEVER --no-verify.
- **UI tasks** (scope includes `app/**/*.tsx` or `components/**/*.tsx`) MUST have VERIFY.json with browser screenshots before marking as `integrated`. No exceptions.
- **Every task** MUST produce STATUS.json, REVIEW.json, and RESULT.json regardless of type.
- VERIFY.json is required for UI tasks, optional (with `verify_skipped_reason`) for non-UI tasks.
- Do NOT mark a task as `integrated` in TASK-QUEUE.md until ALL required artifacts exist in `.auto/tasks/<slug>/`.
```

## State Transitions
- `idle` → `starting` → `running` → `idle` (drained) or `paused` (stopped)
- Only the background agent transitions `starting` → `running`
- Only `/auto:stop` transitions to `paused`

## Constraints
- Do not bypass safeguard checks between execution and review.
- `resume_only` means resume paused or in-flight work without dispatching new pending tasks.
- Version 1 global states are `idle`, `starting`, `running`, and `paused` only.
- **NEVER** execute task work in the foreground conversation.
