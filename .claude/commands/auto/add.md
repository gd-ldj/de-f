# /auto:add

Turn one requirement into a new AUTO v2 work item under `.auto/`.

## Required flow

1. Ensure `.auto/WORKFLOW.yaml`, `.auto/STATE.json`, and `.auto/queue/TASK-QUEUE.md` exist or initialize them.
2. Write the raw requirement to `.auto/work-items/<item-id>/REQUIREMENT.md`.
3. Generate `SPEC.md` or `SPEC-LITE.md` before any implementation task is queued.
4. **Run spec review through the configured stage agent** — see "Spec Review Invocation" below. This step is mandatory and must not be skipped or replaced with orchestrator self-review.
5. Add `DESIGN.md` only when the requirement crosses system or UX boundaries that need it.
6. Produce `TASKS.json`, `QA-UNITS.json`, and append executable tasks to `.auto/queue/TASK-QUEUE.md`. See "TASKS.json Format" below for required fields.

## Spec Review Invocation (Mandatory)

The spec review MUST be produced by the stage agent configured in `.auto/WORKFLOW.yaml` under `agents.spec_review` / `agent_commands.spec_review`. The orchestrator (the agent running `/auto:add`) MUST NOT hand-write `SPEC-REVIEW.json` based on its own judgment. Self-review is explicitly prohibited.

### Step 4.a — Resolve the configured command

Read `.auto/WORKFLOW.yaml` and extract `agent_commands.spec_review` (default: `python3 scripts/auto-stage-agent.py`). Also read `agent_timeouts.spec_review` (default: 300s).

### Step 4.b — Build the payload

The payload passed via `AUTO_STAGE_PAYLOAD_JSON` MUST include:

- `work_item_id` — the work item directory name (e.g. `auto-2026-04-16-002`)
- `title` — one-line human title for the requirement
- `requirement` — **concatenation of REQUIREMENT.md full content AND SPEC-LITE.md (or SPEC.md) full content**, separated by `\n\n---\n\n# SPEC\n\n`. Passing only the raw requirement is NOT sufficient — the reviewer must see both the input and the proposed spec to produce an adversarial judgment.
- `acceptance_boundary` — short string describing what is in and out of scope
- `notes` — short string summarizing task split or risks

Build the payload with `jq --rawfile` (NOT `--arg "$(cat ...)"`) to guarantee correct shell quoting AND byte-level fidelity. `jq --arg "$(cat file)"` will strip trailing newlines (shell command substitution eats them), which is usually fine but not byte-identical to the source. `jq --rawfile` reads the file directly. Do NOT try to build a JSON string by hand with shell interpolation — it WILL break on long spec content with backticks, quotes, or newlines.

### Step 4.c — Invoke the stage agent

```bash
WORK_DIR=.auto/work-items/<item-id>

# Prefer SPEC-LITE.md; fall back to SPEC.md. (Pick one; don't concatenate both.)
SPEC_FILE="$WORK_DIR/SPEC-LITE.md"
[ -f "$SPEC_FILE" ] || SPEC_FILE="$WORK_DIR/SPEC.md"

# --rawfile preserves file bytes exactly (including trailing newlines).
PAYLOAD=$(jq -n \
  --arg work_item "<item-id>" \
  --arg title "<one-line title>" \
  --rawfile req "$WORK_DIR/REQUIREMENT.md" \
  --rawfile spec "$SPEC_FILE" \
  --arg boundary "<in/out of scope summary>" \
  --arg notes "<task split or risk notes>" \
  '{
    work_item_id: $work_item,
    title: $title,
    requirement: ($req + "\n\n---\n\n# SPEC\n\n" + $spec),
    acceptance_boundary: $boundary,
    notes: $notes
  }')

AUTO_STAGE=spec_review \
  AUTO_STAGE_MODE=codex \
  AUTO_PROJECT_ROOT="$(pwd)" \
  AUTO_STAGE_PAYLOAD_JSON="$PAYLOAD" \
  python3 scripts/auto-stage-agent.py > "$WORK_DIR/.spec-review-raw.json"
```

- `AUTO_STAGE_MODE=codex` forces Codex (strict mode). If Codex is unavailable or crashes, the script returns `status: "error"`, `verdict: "block"`, and `fallback_reason: "codex_unavailable_in_codex_mode"` / `"codex_failed_in_codex_mode"` — it does NOT silent-downgrade to heuristic. See Step 4.e for verdict semantics.
- `AUTO_STAGE_MODE=auto` prefers Codex but falls back to heuristic on failure. Fallback is tagged with `fallback_reason: "codex_unavailable"` / `"codex_failed"` and `verdict` reflects the heuristic's opinion.
- `AUTO_STAGE_MODE=heuristic` is dev-only; heuristic never executes the real reviewer. Treat its verdict as informational.

### Step 4.d — Translate stdout into SPEC-REVIEW.json

The stage agent writes a JSON blob to stdout shaped like:

```json
{
  "status": "ok" | "error",
  "verdict": "pass" | "warn" | "block" | "<non-canonical>",
  "summary": "...",
  "issues": [ { "severity": "...", "description": "..." }, ... ],
  "total_score": 92,
  "fallback_reason": "codex_unavailable" | "codex_failed" | "codex_unavailable_in_codex_mode" | "codex_failed_in_codex_mode" | "forward_command_exec_failed" | "forward_command_protocol_error" | null,
  "reason": "..."  // present on toolchain/protocol errors
}
```

`status`, `verdict`, `summary`, `issues`, and `total_score` are REQUIRED by the
`_schema_for_stage("spec_review")` contract (OpenAI strict mode). `issues` is an
array (empty for `pass`); `total_score` is a number (0 on toolchain error).

Transform it into `SPEC-REVIEW.json` with these fields:

- `verdict` — copied from stage agent output (see Step 4.e for semantics)
- `reviewer` — `"codex"` if Codex ran successfully in codex/auto mode, `"heuristic-fallback:<fallback_reason>"` if fallback was used, `"forwarded:<command>"` if `AUTO_STAGE_FORWARD_COMMAND` was used, `"orchestrator_builtin"` ONLY if `AUTO_ALLOW_BUILTIN_SPEC_REVIEW=1` was set for testing (normally forbidden)
- `reviewed_at` — ISO8601 timestamp
- `summary` — copied from stage agent output verbatim
- `issues` — copied from stage agent output (always an array; empty for `pass`)
- `total_score` — copied from stage agent output (always a number)
- `stage_agent_mode` — the `AUTO_STAGE_MODE` value used (`codex` / `auto` / `heuristic`)
- `raw_output_path` — filename of `.spec-review-raw.json` for audit (relative to the work item directory)
- `fallback_reason` — copied if the stage agent tagged one (null otherwise)
- `revise_round` — set only when this review is the output of a Step 4.f revise round (integer, 1-indexed)

**Do NOT rewrite the `summary` field with orchestrator prose**. The summary is the stage agent's verdict. The orchestrator may add a `normalized_reason` field if it had to normalize a non-canonical `verdict` into `pass` / `warn` / `block` (e.g. Codex sometimes returns `ready_with_minor_clarifications` which orchestrator normalizes to `warn`), but the original stage-agent `summary` stays untouched.

### Step 4.e — Verdict semantics

Canonical verdicts and the `fallback_reason` field together determine flow.
Evaluate in the following priority order; the FIRST matching rule wins.

1. **Toolchain/protocol hard errors → block (no revise loop)**
   - `fallback_reason ∈ {"codex_unavailable_in_codex_mode", "codex_failed_in_codex_mode", "codex_forced_off_in_codex_mode", "forward_command_exec_failed", "forward_command_protocol_error"}` → treat as **block**. These are toolchain failures, not spec defects. Report the failure to the user and stop. Do NOT enter the revise loop. Do NOT downgrade to warn — the user explicitly asked for codex/forwarded reviewer and the reviewer did not run.
   - `status == "error"` with NO `fallback_reason` AND `AUTO_STAGE_MODE == "codex"` → same as above (defensive fallback for stage agents that forget to tag themselves).

2. **Fallback mode (auto) — proceed with warning**
   - `fallback_reason ∈ {"codex_unavailable", "codex_failed", "forced_heuristic", "heuristic_mode"}` AND verdict is `pass` or `warn` → treat as **warn**. Tell the user a real reviewer (Codex) did not produce the verdict and offer to retry once Codex is reachable. Do NOT enter the revise loop. `heuristic_mode` means `AUTO_STAGE_MODE=heuristic` was set (dev-only); its verdict is informational and must not be treated as a formal approval.
   - `fallback_reason ∈ {"codex_unavailable", "codex_failed", "forced_heuristic", "heuristic_mode"}` AND verdict is `block` → respect **block**. The heuristic fallback still produced a judgment; a toolchain failure does NOT downgrade an explicit block into warn.

3. **Canonical verdicts (no fallback_reason)**
   - `verdict: "pass"` → proceed to Step 5 (TASKS / QA-UNITS / TASK-QUEUE generation).
   - `verdict: "warn"` → proceed, but surface warnings to the user and include them in the final `/auto:add` completion report.
   - `verdict: "block"` → stop immediately unless `AUTO_SPEC_REVISE_ALLOW_BLOCK=true` (see Step 4.f entry gate). Default: write `SPEC-REVIEW-BLOCKED.json`, do not produce TASKS/QA-UNITS, do not append to TASK-QUEUE, report to user.

4. **Non-canonical verdicts (revisable)**
   - Any verdict string that is not `pass` / `warn` / `block` (e.g. `needs_revision`, `block_revise`, `ready_with_minor_clarifications`, `approved_with_concerns`) AND no fallback_reason → enter the **Spec Revise Loop** defined in Step 4.f.
   - The orchestrator MAY normalize obvious non-canonical verdicts into canonical ones (e.g. `ready_with_minor_clarifications` + `status=ok` + 0 blocking issues → `warn`) and record the normalization in `SPEC-REVIEW.json.normalized_reason`. If the orchestrator normalizes to `pass` / `warn`, rule 3 applies (no revise loop needed). If it cannot be safely normalized, treat as non-canonical and enter the loop.

Do NOT generate TASKS/QA-UNITS/TASK-QUEUE rows while verdict is non-pass/non-warn, regardless of source. The in-process runtime (`auto/commands/add.py`) enforces this invariant: `verdict not in {pass, warn}` → hard error, no artifacts produced.

### Step 4.f — Spec Revise Loop (auto-fix 闭环)

When verdict is `needs_revision` / `block_revise` / any non-canonical non-pass value, run the orchestrator-driven revise loop below. Goal: self-heal the spec without human intervention, up to a bounded number of rounds. If the loop does not converge, **hard stop** (do not silently ship a non-pass spec).

#### Configuration

- `AUTO_SPEC_REVISE_MAX_ROUNDS` — default `2`. Upper bound on revise attempts. After this many rounds if still non-pass, the flow hard-stops.
- `AUTO_SPEC_REVISE_ALLOW_BLOCK` — default `false`. If `true`, a `block` verdict also enters the loop; default is `false` (block stops immediately, treated as a human-needed decision).

#### Loop body

```
# --- entry gate ---
# Steps 4.e rules 1-3 have already been applied. If we reach here the
# verdict is non-canonical (rule 4) or block with ALLOW_BLOCK override.
if verdict in {"pass", "warn"}:
    goto Step 5          # nothing to revise
if verdict == "block" and AUTO_SPEC_REVISE_ALLOW_BLOCK != "true":
    hard_stop            # block requires human; write SPEC-REVIEW-BLOCKED.json
# All other verdicts (needs_revision, block_revise, block+ALLOW_BLOCK,
# any non-canonical string) enter the loop below.

round = 1
while round <= MAX_REVISE_ROUNDS:
    # --- archive prior artifacts (audit trail) ---
    # Use cp (not mv) so that SPEC-LITE.md and SPEC-REVIEW.json always
    # remain present in the work item directory. If the loop aborts mid-
    # round (scope expansion, requirement conflict, etc.) the active files
    # still exist. The vN copies are "pre-round-N snapshots" — i.e.
    # SPEC-LITE-v1.md is the original spec BEFORE the first revise attempt.
    cp SPEC-LITE.md              SPEC-LITE-v${round}.md
    cp SPEC-REVIEW.json          SPEC-REVIEW-v${round}.json
    (also copy .spec-review-raw.json / .spec-review-prompt.txt / .spec-review-payload.json
     to .spec-review-raw-v${round}.json etc.)

    # --- revise ---
    Orchestrator (the /auto:add agent) writes a revised SPEC-LITE.md addressing
    EACH issue returned by the prior review, with these rules:
      * Only edit SPEC-LITE.md. REQUIREMENT.md is the user contract and is
        read-only during the loop.
      * Each revision MUST be traceable to one or more issues. Gratuitous
        rewrites (reformatting, restructuring for style) are forbidden.
      * If the revision would introduce new scope (new files not already
        listed, new runtime dependencies, new npm packages), abort the loop
        and hard-stop — this is a signal the spec needs human scope
        renegotiation, not an orchestrator patch.
      * If an issue is a genuine requirement conflict (spec says X,
        requirement says Y, and X is the intended design), abort the loop
        and hard-stop — the REQUIREMENT.md must be amended by the user,
        orchestrator cannot decide.

    # --- re-run stage agent ---
    Re-invoke Step 4.c with the revised SPEC-LITE.md. Transform stdout into a
    new SPEC-REVIEW.json per Step 4.d. Always set `stage_agent_mode`,
    `raw_output_path`, and a new field `revise_round: <round>`.

    # --- append revise-log entry ---
    Append a section to SPEC-REVISE-LOG.md recording:
      * round number
      * pre-revise verdict + issue list (from archived SPEC-REVIEW-v${round}.json)
      * per-issue resolution notes (one bullet per issue)
      * post-revise verdict
      * diff summary (which SPEC-LITE sections changed)

    if new verdict in {pass, warn}:
        break

    round += 1

# After loop
if final verdict in {pass, warn}:
    proceed to Step 5 (TASKS / QA-UNITS / TASK-QUEUE), and in the completion
    report include:
      * total revise rounds used
      * link to SPEC-REVISE-LOG.md
else:
    write SPEC-REVIEW-BLOCKED.json summarising why the loop did not converge
    (either max rounds reached, scope-expansion abort, or requirement-conflict
    abort). Do NOT produce TASKS.json / QA-UNITS.json. Do NOT append to
    TASK-QUEUE. Report to the user with the full audit trail (SPEC-LITE-v1,
    SPEC-LITE-v2, SPEC-REVIEW-v1, ..., SPEC-REVISE-LOG.md).
```

#### Abort conditions (orchestrator MUST hard-stop, not continue revising)

1. **Scope expansion** — revise would add files outside the original scope summary, new dependencies, or introduce a new task split.
2. **Requirement conflict** — an issue says "spec conflicts with requirement" and the right fix is to change the requirement, not the spec.
3. **Repeated identical issue** — if round N returns an issue literally identical to round N-1 (same description, same severity), the loop is not converging on that issue; stop.
4. **Forbidden-path edit** — revise would require touching a forbidden path (e.g. `messages/` rules, `middleware.ts`, `app/[locale]/layout.tsx`) not already declared in scope.
5. **Max rounds reached** — default 2.

In all abort cases, write the `SPEC-REVIEW-BLOCKED.json` audit artifact and surface the issue to the user.

#### Audit artifacts

After any successful or aborted loop the work item directory MUST contain:

- `SPEC-LITE.md` — always present; reflects the latest revision (or the last state before abort). Because the loop uses `cp` (not `mv`), this file is never absent even if an abort occurs mid-round.
- `SPEC-LITE-v1.md`, `SPEC-LITE-v2.md`, ... — pre-round-N snapshots (i.e. `v1` is the original spec before round 1 revise, `v2` is the post-round-1 spec before round 2 revise)
- `SPEC-REVIEW.json` — always present; latest review result
- `SPEC-REVIEW-v1.json`, `SPEC-REVIEW-v2.json`, ... — pre-round-N review snapshots
- `SPEC-REVISE-LOG.md` — append-only human-readable log of each round
- `SPEC-REVIEW-BLOCKED.json` — present ONLY if loop aborted (explains why)

### Step 4.g — Optional: archive prior self-reviews

If `SPEC-REVIEW.json` already exists with `reviewer: "orchestrator"` (legacy self-review), rename it to `SPEC-REVIEW-ORCHESTRATOR-SELFREVIEW.json` before writing the new Codex-produced file. This preserves the audit trail and makes the shift visible in git history.

## TASKS.json Format

Each task in `TASKS.json` MUST include a structured `acceptance_criteria` array. This is critical for the completeness enforcement pipeline — review and verify agents check every criterion individually and block if any is missing.

```json
[
  {
    "slug": "watchlist-kol-panel-01",
    "work_item_id": "auto-2026-04-21-001",
    "title": "Build KOL list panel with selection and detail view",
    "state": "pending",
    "depends_on": [],
    "notes": "",
    "scope_files": ["app/[locale]/(user)/watchlist/page.tsx", "components/watchlist/KolPanel.tsx"],
    "acceptance_criteria": [
      {"id": "AC-01", "text": "Left panel shows KOL list with avatar, name, and selection highlight"},
      {"id": "AC-02", "text": "Clicking a KOL shows detail view in the right panel"},
      {"id": "AC-03", "text": "Delete and expand buttons are visible but non-functional (placeholder)"}
    ]
  }
]
```

### acceptance_criteria rules

- **REQUIRED** for every task. Do not omit this field.
- Each criterion has a unique `id` (format: `AC-01`, `AC-02`, ...) and a `text` description.
- Criteria must be **specific and verifiable** — not vague statements like "works correctly".
- Include ALL behaviors from the spec, including placeholder/stub elements that need to be visually present but not yet wired.
- The review and verify agents will check each criterion by ID. If a criterion is not satisfied, the task is blocked automatically.
- A single task should have 1-5 criteria. If more are needed, consider splitting into multiple tasks.

## Constraints

- Never create executable tasks without a spec artifact with a `pass` or `warn` verdict.
- Keep reviewer and verifier stage-configurable; do not hard-code Codex or Claude in skill logic. The stage mode (`codex` / `auto` / `heuristic`) is the configuration point.
- **The orchestrator MUST NOT self-review the spec.** `SPEC-REVIEW.json` must be produced by the stage agent, not written by hand. If the stage agent cannot be reached, mark the review as `heuristic-fallback` (or block) — do not substitute orchestrator judgment.
- **Orchestrator MAY revise the spec during the Step 4.f revise loop, but ONLY to address issues raised by the stage agent.** Revisions must stay inside the original scope summary; expanding scope or changing REQUIREMENT.md is forbidden inside the loop.
- **The revise loop MUST be bounded** (default 2 rounds). Non-pass after max rounds → hard stop, not silent ship.
- Treat task slug collision as a blocking error unless a deterministic suffix resolves it safely.
- Keep all new artifacts under `.auto/`; do not write new work into `.planning/`.
