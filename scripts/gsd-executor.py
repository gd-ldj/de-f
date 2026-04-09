#!/usr/bin/env python3
"""
GSD Task Executor — Background daemon that polls .planning/TASK-QUEUE.md
for pending tasks and executes them end-to-end via `claude` CLI.

Usage:
    python3 scripts/gsd-executor.py start [--interval 300] [--max-fix 3]
    python3 scripts/gsd-executor.py stop
    python3 scripts/gsd-executor.py status
    python3 scripts/gsd-executor.py logs [--tail 50]
    python3 scripts/gsd-executor.py workflow

Per-task flow:
    1. claude -p: develop code based on PLAN.md
    2. Quality gate: configurable via .planning/WORKFLOW.md
    3. If gate fails → claude -p: fix errors (up to --max-fix retries)
    4. If gate passes → commit
    5. Update TASK-QUEUE.md status → completed

Configuration:
    .planning/WORKFLOW.md — workflow contract (YAML front matter + prompt template)

State files:
    .planning/TASK-QUEUE.md              — task queue (source of truth)
    .planning/tasks/<slug>/STATUS.md     — per-task status + log
    .planning/tasks/<slug>/GATE-RESULT.md — latest gate output
    .planning/executor/executor.pid      — PID file
    .planning/executor/executor.log      — execution log

Task lifecycle: pending → in_progress → completed | failed
"""

import argparse
import datetime
import os
import shutil
import signal
import subprocess
import sys
import time
import re as _re
import json as _json

# ── Paths ──────────────────────────────────────────────────────────────

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Load .env so hooks can access TG_BOT_TOKEN, TG_CHAT_ID, etc.
_env_file = os.path.join(PROJECT_ROOT, ".env")
if os.path.isfile(_env_file):
    with open(_env_file) as _f:
        for _line in _f:
            _line = _line.strip()
            if _line and not _line.startswith("#") and "=" in _line:
                _k, _, _v = _line.partition("=")
                os.environ.setdefault(_k.strip(), _v.strip())

PLANNING_DIR = os.path.join(PROJECT_ROOT, ".planning")
TASK_QUEUE = os.path.join(PLANNING_DIR, "TASK-QUEUE.md")
TASKS_DIR = os.path.join(PLANNING_DIR, "tasks")
EXECUTOR_DIR = os.path.join(PLANNING_DIR, "executor")
PID_FILE = os.path.join(EXECUTOR_DIR, "executor.pid")
LOG_FILE = os.path.join(EXECUTOR_DIR, "executor.log")
USAGE_FILE = os.path.join(EXECUTOR_DIR, "usage.jsonl")
HEARTBEAT_FILE = os.path.join(EXECUTOR_DIR, "executor.heartbeat")
WORKFLOW_FILE = os.path.join(PLANNING_DIR, "WORKFLOW.md")

# ── Default Configuration ─────────────────────────────────────────────

DEFAULT_CONFIG = {
    "polling": {"interval": 300},
    "agent": {
        "command": "claude",
        "timeout": 600,
        "max_fix_attempts": 3,
        "allowed_tools": "",
    },
    "gates": [
        {"name": "tsc", "command": "npx tsc --noEmit", "timeout": 120},
        {"name": "lint", "command": "pnpm lint", "timeout": 120},
        {"name": "e2e", "command": "npx playwright test", "timeout": 900},
    ],
    "pre_commit_build": {
        "enabled": True,
        "command": "pnpm build",
        "timeout": 300,
        "kill_dev_server": True,
    },
    "review": {"enabled": False, "timeout": 300, "diff_max_chars": 8000},
    "verify": {"enabled": False, "timeout": 600, "skip_non_ui": True},
    "drift": {"enabled": False, "mode": "warn", "ignore": ".planning/**", "require_scope": False},
    "heartbeat": {"warn_after": 60, "stale_after": 900},
    "retry": {"strategy": "exponential", "base_delay": 5, "max_delay": 60, "jitter": True},
    "hooks": {
        "before_run": "",
        "after_run": "",
        "after_commit": "",
        "on_failure": "",
        "on_success": "",
        "on_queue_drained": "",
    },
    "commit": {
        "scope_from_slug": True,
        "co_author": "Claude Opus 4.6 <noreply@anthropic.com>",
    },
}

DEFAULT_REVIEW_PROMPT = """You are reviewing a completed development task BEFORE commit.

## Task: {{ description }}
## Plan: .planning/tasks/{{ slug }}/PLAN.md

## Git diff:
```
{{ diff }}
```

## Instructions:
1. Read .planning/tasks/{{ slug }}/PLAN.md
2. Compare the diff against the plan
3. Write .planning/tasks/{{ slug }}/REVIEW.md with EXACTLY this format:

verdict: pass
reasoning: <one paragraph>
issues:
- <issue 1, if any>

verdict values: pass | warn | block (block = must fix before commit)

Do NOT modify code. Do NOT commit. Only write REVIEW.md.
"""

DEFAULT_VERIFY_PROMPT = """You are an independent QA Evaluator. Your job is to verify that the completed task actually works in a real browser — not just that code compiles or unit tests pass.

## Task: {{ description }}
## Plan: .planning/tasks/{{ slug }}/PLAN.md

## Instructions:
1. Read .planning/tasks/{{ slug }}/PLAN.md to extract acceptance criteria (Goal, Steps, visual/behavioral requirements).
2. The dev server is already running at http://localhost:4321.
3. Write a throwaway Playwright spec at `tests/e2e/__verify__/{{ slug }}.spec.ts` that:
   - Navigates to the affected page(s) under the `/us` locale prefix (no login / role bypass — the frontend is public)
   - Uses `page.goto('http://localhost:4321/us/...', { waitUntil: 'domcontentloaded' })`
   - Asserts the concrete acceptance criteria (DOM state, visibility, attributes, text content, interaction behavior)
   - Takes at least one screenshot to `test-results/verify-{{ slug }}.png`
4. Run it: `npx playwright test tests/e2e/__verify__/{{ slug }}.spec.ts --reporter=line`
5. If the test fails, inspect the failure and determine: is it a real bug (task not done) or a test-writing mistake? Adjust the spec and rerun up to 3 times.
6. Write `.planning/tasks/{{ slug }}/VERIFY.json` with this schema:

```json
{
  "verdict": "pass",
  "reasoning": "One paragraph: what you verified and how",
  "criteria_checks": [
    {"criterion": "description of criterion", "status": "pass", "note": "optional"}
  ],
  "evidence": ["test-results/verify-{{ slug }}.png"]
}
```

Verdict values:
- `pass`: all acceptance criteria met in real browser
- `warn`: minor visual/polish issues, ship anyway
- `block`: acceptance criteria NOT met — dev must fix

IMPORTANT:
- You MAY read the PLAN, write the spec, and run Playwright
- Do NOT modify application code (only the verify spec)
- Do NOT commit
- ALWAYS write VERIFY.json before exiting, even on error
- Be strict: verdict `pass` requires real browser evidence, not assumptions
"""

DEFAULT_PROMPT_TEMPLATE = """You are executing a development task autonomously. Follow the plan exactly.

## Task: {{ description }}

## Instructions:
1. Read the plan: .planning/tasks/{{ slug }}/PLAN.md
2. If .planning/tasks/{{ slug }}/CONTEXT.md exists, read it for decisions
3. Execute each step in the plan
4. After code changes, run: npx tsc --noEmit
5. If there are type errors, fix them
6. Do NOT commit — the executor handles commits after all gates pass
7. If the task involves UI changes, write a Playwright e2e test (see Visual E2E Test section in .planning/WORKFLOW.md)

IMPORTANT:
- Do NOT ask questions — execute autonomously
- Do NOT commit — just make the code changes and ensure tsc passes
- If you hit an unresolvable blocker, update ONLY .planning/tasks/{{ slug }}/STATUS.md with status: failed
- NEVER modify .planning/tasks/<ANY_OTHER_SLUG>/STATUS.md — you only own your own task. The executor will auto-fail you and revert those files if you touch sibling STATUS files.
- NEVER modify .planning/TASK-QUEUE.md — the executor owns queue bookkeeping.
- You MUST produce real code changes. Declaring success with an empty diff (nothing but STATUS.md touched) will be automatically detected and rejected. If the plan says 'create file X', you must create file X.
- Follow existing project patterns and conventions
- All commit messages and code comments must be in English
- For UI tasks: a visual e2e test in tests/e2e/ is MANDATORY
"""

# ── Workflow Loading ──────────────────────────────────────────────────

def _parse_yaml_value(raw: str) -> object:
    """Parse a single YAML value (no external dependency)."""
    raw = raw.strip()
    if raw == "" or raw == '""' or raw == "''":
        return ""
    if raw.lower() == "true":
        return True
    if raw.lower() == "false":
        return False
    try:
        return int(raw)
    except ValueError:
        pass
    try:
        return float(raw)
    except ValueError:
        pass
    # Strip surrounding quotes
    if (raw.startswith('"') and raw.endswith('"')) or (raw.startswith("'") and raw.endswith("'")):
        return raw[1:-1]
    return raw


def _parse_simple_yaml(text: str) -> dict:
    """Parse simple YAML (flat keys, nested sections, lists of objects, `|` block scalars)."""
    result = {}
    current_key = None
    current_list = None
    current_item = None

    lines = text.split("\n")
    i = 0

    def _collect_block(start_idx: int, base_indent: int) -> tuple[str, int]:
        """Collect a `|` block scalar. Returns (joined_text, next_line_index)."""
        block_lines = []
        j = start_idx
        block_indent = None
        while j < len(lines):
            ln = lines[j]
            if ln.strip() == "":
                block_lines.append("")
                j += 1
                continue
            ind = len(ln) - len(ln.lstrip())
            if ind <= base_indent:
                break
            if block_indent is None:
                block_indent = ind
            block_lines.append(ln[block_indent:] if len(ln) >= block_indent else ln.lstrip())
            j += 1
        # Trim trailing empty lines
        while block_lines and block_lines[-1] == "":
            block_lines.pop()
        return ("\n".join(block_lines), j)

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            i += 1
            continue

        indent = len(line) - len(line.lstrip())

        # List item start: "  - name: value"
        if stripped.startswith("- ") and current_key is not None:
            if current_item is not None and current_list is not None:
                current_list.append(current_item)
            current_item = {}
            kv = stripped[2:].strip()
            if ":" in kv:
                k, v = kv.split(":", 1)
                current_item[k.strip()] = _parse_yaml_value(v)
            if current_list is None:
                current_list = []
            i += 1
            continue

        # Continuation of list item: "    command: value"
        if indent >= 4 and current_item is not None and ":" in stripped:
            k, v = stripped.split(":", 1)
            current_item[k.strip()] = _parse_yaml_value(v)
            i += 1
            continue

        # Top-level or nested key
        if ":" in stripped:
            # Flush pending list
            if current_list is not None:
                if current_item is not None:
                    current_list.append(current_item)
                    current_item = None
                result[current_key] = current_list
                current_list = None

            k, v = stripped.split(":", 1)
            k = k.strip()
            v = v.strip()

            # `|` block scalar
            if v == "|":
                block_text, next_i = _collect_block(i + 1, indent)
                if indent == 0:
                    result[k] = block_text
                    current_key = None
                elif current_key is not None:
                    obj = result.get(current_key, {})
                    if isinstance(obj, dict):
                        obj[k] = block_text
                        result[current_key] = obj
                i = next_i
                continue

            if indent == 0 and v == "":
                # Section header
                current_key = k
                if current_key not in result:
                    result[current_key] = {}
                i += 1
                continue

            if indent == 0 and v:
                result[k] = _parse_yaml_value(v)
                current_key = None
                i += 1
                continue

            # Nested key under section
            if indent > 0 and current_key is not None:
                obj = result.get(current_key, {})
                if isinstance(obj, dict):
                    obj[k] = _parse_yaml_value(v)
                    result[current_key] = obj
            i += 1
            continue

        i += 1

    # Flush final list
    if current_list is not None:
        if current_item is not None:
            current_list.append(current_item)
        if current_key is not None:
            result[current_key] = current_list

    return result


def _parse_prompt_sections(body: str) -> dict:
    """Parse body into named prompt sections (## Prompt: <name>).
    If no markers found, treat whole body as 'dev' prompt."""
    if not body.strip():
        return {}
    sections = {}
    current_name = "dev"
    current_lines: list[str] = []
    has_marker = False
    for line in body.split("\n"):
        m = _re.match(r"^##\s+Prompt:\s*(\w+)\s*$", line)
        if m:
            has_marker = True
            if current_lines:
                sections[current_name] = "\n".join(current_lines).strip()
            current_name = m.group(1)
            current_lines = []
        else:
            current_lines.append(line)
    if current_lines:
        sections[current_name] = "\n".join(current_lines).strip()
    if not has_marker:
        # Single-prompt mode: whole body is dev prompt
        sections = {"dev": body.strip()}
    return sections


def _load_workflow() -> tuple[dict, dict]:
    """Load WORKFLOW.md config. Returns (config_dict, prompts_dict).
    prompts_dict has keys like 'dev', 'review'. Falls back to defaults."""
    default_prompts = {
        "dev": DEFAULT_PROMPT_TEMPLATE,
        "review": DEFAULT_REVIEW_PROMPT,
        "verify": DEFAULT_VERIFY_PROMPT,
    }

    if not os.path.exists(WORKFLOW_FILE):
        return dict(DEFAULT_CONFIG), default_prompts

    try:
        with open(WORKFLOW_FILE, "r", encoding="utf-8") as f:
            content = f.read()
    except OSError:
        return dict(DEFAULT_CONFIG), default_prompts

    # Split YAML front matter from body
    parts = content.split("---")
    if len(parts) < 3:
        return dict(DEFAULT_CONFIG), {
            "dev": (content.strip() or DEFAULT_PROMPT_TEMPLATE),
            "review": DEFAULT_REVIEW_PROMPT,
            "verify": DEFAULT_VERIFY_PROMPT,
        }

    yaml_text = parts[1]
    body = "---".join(parts[2:]).strip()

    try:
        config = _parse_simple_yaml(yaml_text)
    except Exception:
        config = {}

    # Merge with defaults (config overrides defaults)
    merged = {}
    for key, default_val in DEFAULT_CONFIG.items():
        if key in config:
            if isinstance(default_val, dict) and isinstance(config[key], dict):
                merged[key] = {**default_val, **config[key]}
            else:
                merged[key] = config[key]
        else:
            merged[key] = default_val if not isinstance(default_val, (dict, list)) else (dict(default_val) if isinstance(default_val, dict) else list(default_val))

    parsed_prompts = _parse_prompt_sections(body)
    prompts = {**default_prompts, **parsed_prompts}
    return merged, prompts


def _render_template(template: str, variables: dict) -> str:
    """Simple {{ var }} template rendering. No Jinja dependency."""
    result = template
    for key, value in variables.items():
        result = result.replace("{{ " + key + " }}", str(value))
        result = result.replace("{{" + key + "}}", str(value))
    return result


# ── Structured Artifacts (JSON) ────────────────────────────────────────

def _read_json_safe(path: str, slug: str = "") -> dict | None:
    """Read a JSON file, returning None on missing/invalid."""
    if not os.path.exists(path):
        return None
    try:
        with open(path, "r", encoding="utf-8") as f:
            return _json.load(f)
    except (OSError, _json.JSONDecodeError) as e:
        if slug:
            log(f"[{slug}] Failed to parse {os.path.basename(path)}: {e}", "WARN")
        return None


def _read_result_json(slug: str) -> dict | None:
    return _read_json_safe(os.path.join(TASKS_DIR, slug, "RESULT.json"), slug)


def _read_review_json(slug: str) -> dict | None:
    return _read_json_safe(os.path.join(TASKS_DIR, slug, "REVIEW.json"), slug)


def _clear_artifact(slug: str, name: str) -> None:
    """Delete a stale per-task artifact before a new agent run."""
    path = os.path.join(TASKS_DIR, slug, name)
    try:
        os.remove(path)
    except OSError:
        pass


def _format_review_feedback(data: dict) -> str:
    """Render REVIEW.json into a human-readable feedback block for fix prompts."""
    lines = []
    if data.get("reasoning"):
        lines.append(f"Reasoning: {data['reasoning']}")
    issues = data.get("issues", [])
    if issues:
        lines.append("Issues:")
        for issue in issues:
            if isinstance(issue, dict):
                sev = issue.get("severity", "?")
                desc = issue.get("description", "")
                lines.append(f"  - [{sev}] {desc}")
            else:
                lines.append(f"  - {issue}")
    if data.get("scope_drift"):
        lines.append("WARNING: scope_drift=true (agent modified files outside plan)")
    return "\n".join(lines)


# ── Telemetry (token usage + cost) ─────────────────────────────────────

def _parse_claude_json(stdout: str) -> dict | None:
    """Parse `claude -p --output-format json` stdout into a dict."""
    if not stdout or not stdout.strip():
        return None
    text = stdout.strip()
    try:
        obj = _json.loads(text)
        if isinstance(obj, dict):
            return obj
    except _json.JSONDecodeError:
        pass
    # Tolerate preamble: try last non-empty line
    for line in reversed([l for l in text.split("\n") if l.strip()]):
        try:
            obj = _json.loads(line)
            if isinstance(obj, dict) and ("usage" in obj or "type" in obj or "result" in obj):
                return obj
        except _json.JSONDecodeError:
            continue
    return None


def _record_usage(slug: str, kind: str, claude_data: dict | None, duration_ms: int) -> dict:
    """Append a telemetry record to usage.jsonl. Returns the record dict."""
    record = {
        "ts": datetime.datetime.now().isoformat(timespec="seconds"),
        "slug": slug,
        "kind": kind,
        "duration_ms": duration_ms,
        "input_tokens": 0,
        "output_tokens": 0,
        "cache_read": 0,
        "cache_create": 0,
        "cost_usd": 0.0,
        "num_turns": 0,
        "is_error": False,
    }
    if claude_data:
        usage = claude_data.get("usage") or {}
        record["input_tokens"] = int(usage.get("input_tokens", 0) or 0)
        record["output_tokens"] = int(usage.get("output_tokens", 0) or 0)
        record["cache_read"] = int(usage.get("cache_read_input_tokens", 0) or 0)
        record["cache_create"] = int(usage.get("cache_creation_input_tokens", 0) or 0)
        record["cost_usd"] = float(claude_data.get("total_cost_usd", 0.0) or 0.0)
        record["num_turns"] = int(claude_data.get("num_turns", 0) or 0)
        record["is_error"] = bool(claude_data.get("is_error", False))
        sid = claude_data.get("session_id")
        if sid:
            record["session_id"] = sid

    try:
        os.makedirs(EXECUTOR_DIR, exist_ok=True)
        with open(USAGE_FILE, "a", encoding="utf-8") as f:
            f.write(_json.dumps(record) + "\n")
    except OSError:
        pass
    return record


# ── Drift Detection ────────────────────────────────────────────────────

import fnmatch as _fnmatch

def _extract_scope_from_plan(slug: str) -> list[str]:
    """Parse PLAN.md for declared scope (## Files / ## Scope section).

    Looks for bullet items: '- path/to/file' or '- `path`'. Returns empty list
    if no scope section is found (drift check then no-ops)."""
    plan_file = os.path.join(TASKS_DIR, slug, "PLAN.md")
    if not os.path.exists(plan_file):
        return []
    try:
        with open(plan_file, "r", encoding="utf-8") as f:
            content = f.read()
    except OSError:
        return []

    # Match a heading like "## Files", "## Files to Modify", "## Scope"
    m = _re.search(
        r"^#{2,3}\s*(?:Files(?:\s+to\s+\w+)?|Scope)\s*$(.+?)(?=^#{2,3}\s|\Z)",
        content, _re.DOTALL | _re.IGNORECASE | _re.MULTILINE,
    )
    if not m:
        return []

    section = m.group(1)
    paths: list[str] = []
    for line in section.split("\n"):
        line = line.strip()
        if not line:
            continue
        # Match "- path", "* path", optionally backticked
        bullet = _re.match(r"^[-*]\s+`?([^\s`]+)`?", line)
        if bullet:
            paths.append(bullet.group(1))
    return paths


def _get_changed_files() -> list[str]:
    """Return list of files modified vs HEAD (staged + unstaged + untracked)."""
    files: set[str] = set()
    try:
        # Tracked changes vs HEAD
        r = subprocess.run(
            ["git", "diff", "--name-only", "HEAD"],
            cwd=PROJECT_ROOT, capture_output=True, text=True, timeout=10,
        )
        if r.returncode == 0:
            files.update(l.strip() for l in (r.stdout or "").split("\n") if l.strip())
        # Untracked files (newly created)
        r2 = subprocess.run(
            ["git", "ls-files", "--others", "--exclude-standard"],
            cwd=PROJECT_ROOT, capture_output=True, text=True, timeout=10,
        )
        if r2.returncode == 0:
            files.update(l.strip() for l in (r2.stdout or "").split("\n") if l.strip())
    except Exception as e:
        log(f"Failed to list changed files: {e}", "WARN")
    return sorted(files)


def _parse_ignore_globs(ignore_str: str) -> list[str]:
    """Parse comma-separated glob patterns."""
    if not ignore_str:
        return []
    return [p.strip() for p in ignore_str.split(",") if p.strip()]


def _match_any(path: str, patterns: list[str]) -> bool:
    """True if path matches any glob pattern. Supports ** prefix matching.

    Literal equality is checked before fnmatch so that bracketed path
    segments (e.g. Next.js dynamic routes like `[locale]`) are not
    interpreted as fnmatch character classes.
    """
    for pat in patterns:
        if path == pat:
            return True
        if _fnmatch.fnmatch(path, pat):
            return True
        # Manual ** prefix support: "dir/**" matches "dir/anything/nested"
        if pat.endswith("/**"):
            prefix = pat[:-3]
            if path == prefix or path.startswith(prefix + "/"):
                return True
        if pat.endswith("**"):
            prefix = pat[:-2]
            if path.startswith(prefix):
                return True
    return False


def _check_drift(scope: list[str], changed: list[str], ignore_globs: list[str]) -> list[str]:
    """Return list of changed files that are NOT in scope and NOT ignored."""
    if not scope:
        return []  # no scope declared → drift detection no-ops
    out_of_scope: list[str] = []
    for f in changed:
        if _match_any(f, ignore_globs):
            continue
        if _match_any(f, scope):
            continue
        out_of_scope.append(f)
    return out_of_scope


def _check_sibling_status_drift(current_slug: str, changed: list[str]) -> list[str]:
    """Return any .planning/tasks/<OTHER_SLUG>/STATUS.md files that were modified.

    The dev agent must only touch its own task's STATUS.md. Historically agents
    would also overwrite siblings' STATUS.md when their prompt mentioned
    'update status on blocker', corrupting queue bookkeeping. This check runs
    regardless of whether PLAN.md declares a formal Files/Scope section."""
    bad: list[str] = []
    prefix = ".planning/tasks/"
    suffix = "/STATUS.md"
    for f in changed:
        if not f.startswith(prefix) or not f.endswith(suffix):
            continue
        sibling_slug = f[len(prefix):-len(suffix)]
        if sibling_slug != current_slug:
            bad.append(f)
    return bad


def _check_empty_dev_diff(current_slug: str, changed: list[str]) -> bool:
    """Return True if the dev agent produced no meaningful code change.

    Filters out purely-bookkeeping files (the task's own STATUS.md /
    TASK-QUEUE.md) before deciding. An empty result means the agent
    'finished' without writing any implementation — the exact failure
    mode that caused podcast-6/7 to pass through to the critic with
    nothing to review."""
    own_status = f".planning/tasks/{current_slug}/STATUS.md"
    bookkeeping = {own_status, ".planning/TASK-QUEUE.md"}
    meaningful = [f for f in changed if f not in bookkeeping]
    return len(meaningful) == 0


# ── Heartbeat ──────────────────────────────────────────────────────────

def _write_heartbeat(phase: str, slug: str = "") -> None:
    """Write daemon heartbeat with current phase and timestamp."""
    try:
        os.makedirs(EXECUTOR_DIR, exist_ok=True)
        data = {
            "ts": int(time.time()),
            "pid": os.getpid(),
            "phase": phase,
            "slug": slug,
        }
        with open(HEARTBEAT_FILE, "w", encoding="utf-8") as f:
            _json.dump(data, f)
    except OSError:
        pass


def _read_heartbeat() -> dict | None:
    if not os.path.exists(HEARTBEAT_FILE):
        return None
    try:
        with open(HEARTBEAT_FILE, "r", encoding="utf-8") as f:
            return _json.load(f)
    except (OSError, ValueError):
        return None


def _remove_heartbeat() -> None:
    try:
        if os.path.exists(HEARTBEAT_FILE):
            os.remove(HEARTBEAT_FILE)
    except OSError:
        pass


# ── Retry Backoff ──────────────────────────────────────────────────────

import random as _random


def _compute_backoff(attempt: int, config: dict) -> float:
    """Compute delay in seconds for a retry attempt based on config.

    Config keys: strategy (fixed|exponential), base_delay, max_delay, jitter.
    """
    retry_cfg = config.get("retry", DEFAULT_CONFIG["retry"])
    strategy = str(retry_cfg.get("strategy", "exponential")).lower()
    base = float(retry_cfg.get("base_delay", 5))
    cap = float(retry_cfg.get("max_delay", 60))
    use_jitter = bool(retry_cfg.get("jitter", True))

    if strategy == "exponential":
        delay = min(base * (2 ** attempt), cap)
    else:  # fixed
        delay = base

    if use_jitter:
        delay = delay * (0.5 + _random.random() * 0.5)

    return round(delay, 1)


# ── Hooks ──────────────────────────────────────────────────────────────

def _run_hook(hook_cmd: str, label: str, env_extra: dict | None = None) -> None:
    """Run a shell hook command if non-empty. env_extra merges into subprocess env."""
    if not hook_cmd or not hook_cmd.strip():
        return
    log(f"Running hook [{label}]: {hook_cmd[:80]}")
    env = os.environ.copy()
    if env_extra:
        env.update({k: str(v) for k, v in env_extra.items()})
    try:
        r = subprocess.run(
            hook_cmd, shell=True, cwd=PROJECT_ROOT,
            capture_output=True, text=True, timeout=60, env=env,
        )
        if r.returncode != 0:
            log(f"Hook [{label}] failed (rc={r.returncode}): {(r.stderr or '')[:200]}", "WARN")
        else:
            log(f"Hook [{label}] completed")
    except subprocess.TimeoutExpired:
        log(f"Hook [{label}] timed out", "WARN")
    except Exception as e:
        log(f"Hook [{label}] error: {e}", "WARN")


# ── Logging ────────────────────────────────────────────────────────────

def log(msg: str, level: str = "INFO") -> None:
    ts = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] [{level}] {msg}"
    print(line, flush=True)
    try:
        os.makedirs(EXECUTOR_DIR, exist_ok=True)
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(line + "\n")
    except OSError:
        pass


# ── Task Queue ─────────────────────────────────────────────────────────

def read_task_queue() -> list[dict]:
    """Parse TASK-QUEUE.md table.

    Supports both 4-column (Task|Description|Status|Created) and
    5-column (Task|Description|Status|Depends|Created) formats.
    The Depends column contains comma-separated slugs or '-' for none.
    """
    if not os.path.exists(TASK_QUEUE):
        return []
    tasks = []
    with open(TASK_QUEUE, "r", encoding="utf-8") as f:
        lines = f.readlines()
    in_table = False
    has_depends = False
    for line in lines:
        stripped = line.strip()
        if stripped.startswith("| Task"):
            in_table = True
            has_depends = "Depends" in stripped
            continue
        if in_table and stripped.startswith("|---"):
            continue
        if in_table and stripped.startswith("|"):
            cols = [c.strip() for c in stripped.split("|")[1:-1]]
            if has_depends and len(cols) >= 5:
                deps_raw = cols[3].strip()
                deps = [d.strip() for d in deps_raw.split(",") if d.strip() and d.strip() != "-"]
                tasks.append({
                    "slug": cols[0],
                    "description": cols[1],
                    "status": cols[2],
                    "depends": deps,
                    "created": cols[4],
                })
            elif len(cols) >= 4:
                tasks.append({
                    "slug": cols[0],
                    "description": cols[1],
                    "status": cols[2],
                    "depends": [],
                    "created": cols[3],
                })
        elif in_table and not stripped.startswith("|"):
            break
    return tasks


def update_task_status_in_queue(slug: str, new_status: str) -> None:
    if not os.path.exists(TASK_QUEUE):
        return
    with open(TASK_QUEUE, "r", encoding="utf-8") as f:
        content = f.read()
    lines = content.split("\n")
    new_lines = []
    for line in lines:
        if line.strip().startswith("|") and slug in line:
            cols = [c.strip() for c in line.split("|")]
            for i, col in enumerate(cols):
                if col in ("pending", "in_progress", "completed", "failed", "blocked"):
                    cols[i] = new_status
                    break
            new_lines.append("| " + " | ".join(c for c in cols if c != "") + " |")
        else:
            new_lines.append(line)
    with open(TASK_QUEUE, "w", encoding="utf-8") as f:
        f.write("\n".join(new_lines))


def cascade_block_downstream(failed_slug: str) -> list[str]:
    """Mark downstream tasks as 'blocked' when a task fails (P3).

    Checks both explicit depends and implicit epic-prefix siblings.
    Returns list of slugs that were blocked."""
    all_tasks = read_task_queue()
    failed_ep = _detect_epic_prefix(failed_slug)
    blocked_slugs: list[str] = []

    for task in all_tasks:
        if task["status"] not in ("pending", "in_progress"):
            continue
        if task["slug"] == failed_slug:
            continue

        should_block = False
        reason = ""

        # Explicit dependency
        deps = task.get("depends", [])
        if failed_slug in deps:
            should_block = True
            reason = f"explicit depends on {failed_slug}"

        # Implicit epic sibling (no explicit depends declared)
        if not should_block and not deps and failed_ep:
            task_ep = _detect_epic_prefix(task["slug"])
            if task_ep == failed_ep:
                should_block = True
                reason = f"same epic '{failed_ep}', no explicit depends"

        if should_block:
            update_task_status_in_queue(task["slug"], "blocked")
            update_task_status_file(
                task["slug"], "blocked",
                f"Blocked: upstream task '{failed_slug}' failed ({reason}). "
                f"Fix the upstream task, then change this status back to 'pending' to retry.",
            )
            blocked_slugs.append(task["slug"])
            log(f"[{task['slug']}] Cascade blocked ({reason})")

    return blocked_slugs


def update_task_status_file(slug: str, status: str, error: str = "") -> None:
    status_file = os.path.join(TASKS_DIR, slug, "STATUS.md")
    if not os.path.exists(os.path.dirname(status_file)):
        return
    ts = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    content = f"# Task Status\n\nstatus: {status}\nupdated: {ts}\n"
    if error:
        content += f"error: {error}\n"
    with open(status_file, "w", encoding="utf-8") as f:
        f.write(content)


def _detect_epic_prefix(slug: str) -> str | None:
    """Extract epic prefix from a slug like 'podcast-5-list-page' → 'podcast'.

    Heuristic: if slug matches '<word>-<number>-...', the first word is the
    epic. Single-segment slugs (no number after first '-') return None."""
    m = _re.match(r"^([a-z]+)-\d+", slug)
    return m.group(1) if m else None


def get_next_pending_task() -> dict | None:
    """Return next pending task whose dependencies are all completed.

    Also applies implicit epic-level blocking: if a task shares an epic
    prefix with any failed task AND has no explicit depends declared,
    it is skipped (since the lack of depends likely means the dependency
    was omitted, not that none exists)."""
    all_tasks = read_task_queue()
    completed = {t["slug"] for t in all_tasks if t["status"] == "completed"}
    failed = {t["slug"] for t in all_tasks if t["status"] == "failed"}

    # Build set of epics that have failures
    failed_epics: set[str] = set()
    for slug in failed:
        ep = _detect_epic_prefix(slug)
        if ep:
            failed_epics.add(ep)

    for task in all_tasks:
        if task["status"] != "pending":
            continue

        # Explicit dependency check
        deps = task.get("depends", [])
        unmet = [d for d in deps if d not in completed]
        if unmet:
            log(f"[{task['slug']}] Blocked by unfinished deps: {', '.join(unmet)}")
            continue

        # Implicit epic-level blocking (P0):
        # If task has NO explicit depends but belongs to an epic with failures,
        # block it to prevent cascade waste. Tasks WITH explicit depends are
        # trusted — they declared their dep chain is satisfied.
        if not deps:
            ep = _detect_epic_prefix(task["slug"])
            if ep and ep in failed_epics:
                failed_siblings = [s for s in failed if _detect_epic_prefix(s) == ep]
                log(
                    f"[{task['slug']}] Epic '{ep}' has failed tasks "
                    f"({', '.join(failed_siblings)}), and this task has no "
                    f"explicit depends — skipping to prevent cascade. "
                    f"Fix failed tasks or add explicit 'Depends' column.",
                    "WARN",
                )
                continue

        return task
    return None


# ── Dev Server Health Check (P5) ──────────────────────────────────────

_CORRUPTION_MARKERS = (
    "Cannot find module",
    "vendor-chunks",
    '"statusCode":500',
    "MODULE_NOT_FOUND",
    "ENOENT: no such file",
)


def _build_noproxy_opener():
    """Build a urllib opener that bypasses any system HTTP proxy.

    Needed because users commonly run Clash / Shadowsocks on 127.0.0.1:7890
    and `http_proxy` env vars route localhost traffic through the proxy,
    which returns 502 even when the dev server is healthy."""
    import urllib.request
    return urllib.request.build_opener(urllib.request.ProxyHandler({}))


def _probe_dev_server_health(port: int = 4321) -> tuple[str, str]:
    """Deep health probe: GETs /us and inspects HTML.

    Returns (status, detail):
      - ("ok", "")                  — server serving real pages
      - ("unreachable", reason)     — connection refused / timeout
      - ("corrupted", marker)       — 500 / vendor-chunks / Cannot find module in body
    """
    import urllib.error

    opener = _build_noproxy_opener()
    import urllib.request as _ur
    url = f"http://localhost:{port}/us"
    req = _ur.Request(url, headers={"User-Agent": "gsd-executor-health"})

    try:
        with opener.open(req, timeout=8) as resp:
            body = resp.read(16384).decode("utf-8", errors="ignore")
            for marker in _CORRUPTION_MARKERS:
                if marker in body:
                    return "corrupted", marker
            if resp.status >= 500:
                return "corrupted", f"HTTP {resp.status}"
            return "ok", ""
    except urllib.error.HTTPError as e:
        # Next.js error page also comes through as HTTPError with a body
        try:
            body = e.read(16384).decode("utf-8", errors="ignore")
        except Exception:
            body = ""
        for marker in _CORRUPTION_MARKERS:
            if marker in body:
                return "corrupted", marker
        if e.code >= 500:
            return "corrupted", f"HTTP {e.code}"
        # 4xx (e.g., 404 on a dev route) still means the server is alive
        return "ok", ""
    except Exception as e:
        return "unreachable", str(e)[:120]


def _kill_dev_server(port: int = 4321) -> None:
    """Kill any process holding the dev port (Astro dev on 4321)."""
    try:
        result = subprocess.run(
            ["lsof", "-ti", f":{port}"],
            capture_output=True, text=True, timeout=5,
        )
        for pid in result.stdout.strip().splitlines():
            if pid.strip():
                subprocess.run(["kill", "-9", pid.strip()], timeout=5)
    except Exception:
        pass
    time.sleep(1)


def _clear_next_cache() -> None:
    """Remove Astro build caches (node_modules/.astro, dist) to recover from corruption."""
    for rel in ("node_modules/.astro", "dist", ".astro"):
        cache_dir = PROJECT_ROOT / rel
        if cache_dir.exists():
            log(f"Clearing {rel} cache to recover from corruption...")
            try:
                shutil.rmtree(cache_dir)
            except Exception as e:
                log(f"Failed to clear {rel}: {e}", "WARN")


def _start_dev_server() -> None:
    """Spawn pnpm dev detached in the background."""
    try:
        subprocess.Popen(
            ["pnpm", "dev"],
            cwd=PROJECT_ROOT,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            start_new_session=True,
        )
    except Exception as e:
        log(f"Failed to start dev server: {e}", "ERROR")


def _wait_for_healthy(port: int = 4321, timeout: int = 90) -> tuple[bool, str]:
    """Poll the deep health probe until ok or timeout."""
    deadline = time.time() + timeout
    last_detail = "no probe yet"
    while time.time() < deadline:
        status, detail = _probe_dev_server_health(port)
        if status == "ok":
            return True, ""
        last_detail = f"{status}: {detail}"
        time.sleep(2)
    return False, last_detail


def _ensure_dev_server(port: int = 4321, timeout: int = 90) -> bool:
    """Ensure dev server is healthy; self-heal from corruption automatically.

    Strategy:
      1. Deep probe GET /us. If ok → return True.
      2. If unreachable → start pnpm dev, wait for healthy.
      3. If corrupted (500 / Cannot find module) →
         kill dev, clear Astro caches, restart, wait for healthy.
      4. Still bad after one recovery cycle → return False.
    """
    status, detail = _probe_dev_server_health(port)
    if status == "ok":
        return True

    if status == "unreachable":
        log(f"Dev server unreachable ({detail}), starting pnpm dev...")
        _start_dev_server()
        ok, reason = _wait_for_healthy(port, timeout)
        if ok:
            log(f"Dev server healthy on port {port}")
            return True
        log(f"Dev server failed to become healthy: {reason}", "ERROR")
        return False

    # status == "corrupted" — full recovery cycle
    log(f"Dev server corrupted (marker: {detail}), running Astro cache recovery...", "WARN")
    _kill_dev_server(port)
    _clear_next_cache()
    _start_dev_server()
    ok, reason = _wait_for_healthy(port, timeout)
    if ok:
        log(f"Dev server recovered and healthy on port {port}")
        return True
    log(f"Dev server recovery failed: {reason}", "ERROR")
    return False


# ── Quality Gate ───────────────────────────────────────────────────────

def run_quality_gate(slug: str, config: dict) -> tuple[bool, str]:
    """Run quality gates from config. Returns (all_passed, error_details)."""
    checks = []
    all_passed = True
    gates = config.get("gates", DEFAULT_CONFIG["gates"])

    # P5: ensure dev server is running before e2e gates
    has_e2e = any(g["name"] in ("e2e", "playwright") for g in gates)
    if has_e2e:
        if not _ensure_dev_server():
            checks.append("e2e: FAIL (dev server not reachable)")
            return False, "\n".join(checks)

    for gate in gates:
        name = gate["name"]
        cmd_str = gate["command"]
        timeout = gate.get("timeout", 120)
        cmd = cmd_str.split()

        # Fail-fast: skip remaining gates if a prior one failed.
        # Avoids running expensive gates (build, e2e) when tsc/lint already broken.
        if not all_passed:
            checks.append(f"{name}: SKIPPED (prior gate failed)")
            log(f"[{slug}] {name}: SKIPPED")
            continue

        log(f"[{slug}] Gate: {name}...")
        try:
            r = subprocess.run(cmd, cwd=PROJECT_ROOT, capture_output=True, text=True, timeout=timeout)
            if r.returncode == 0:
                checks.append(f"{name}: PASS")
                log(f"[{slug}] {name}: PASS")
            else:
                all_passed = False
                out = (r.stdout or "") + (r.stderr or "")
                tail = "\n".join(out.strip().split("\n")[-10:])
                checks.append(f"{name}: FAIL\n{tail}")
                log(f"[{slug}] {name}: FAIL", "ERROR")
        except subprocess.TimeoutExpired:
            all_passed = False
            checks.append(f"{name}: TIMEOUT ({timeout}s)")
            log(f"[{slug}] {name}: TIMEOUT", "ERROR")

    details = "\n".join(checks)

    # Write gate results
    gate_file = os.path.join(TASKS_DIR, slug, "GATE-RESULT.md")
    ts = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(gate_file, "w", encoding="utf-8") as f:
        f.write(f"# Quality Gate Results\n\ntimestamp: {ts}\nresult: {'PASS' if all_passed else 'FAIL'}\n\n```\n{details}\n```\n")

    return all_passed, details


# ── Claude CLI ─────────────────────────────────────────────────────────

def run_claude(prompt: str, slug: str, config: dict, expect_result_json: bool = True, kind: str = "dev") -> tuple[bool, str]:
    """Run claude -p with a prompt. Returns (success, output_tail).

    Uses --output-format json to capture token usage and cost telemetry,
    which is appended to .planning/executor/usage.jsonl.

    If expect_result_json=True, reads .planning/tasks/<slug>/RESULT.json after
    the run and uses its `status` field as the source of truth for success.
    Falls back to STATUS.md text scan + returncode if RESULT.json missing.
    """
    agent_cfg = config.get("agent", DEFAULT_CONFIG["agent"])
    agent_cmd = agent_cfg.get("command", "claude")
    timeout = agent_cfg.get("timeout", 600)
    allowed_tools = agent_cfg.get("allowed_tools", "")

    cmd = [agent_cmd, "-p", prompt, "--output-format", "json"]
    if allowed_tools:
        cmd.extend(["--allowedTools", allowed_tools])

    # Clear stale RESULT.json so we don't read leftover data
    if expect_result_json:
        _clear_artifact(slug, "RESULT.json")

    start_time = time.monotonic()
    try:
        result = subprocess.run(
            cmd, cwd=PROJECT_ROOT,
            capture_output=True, text=True, timeout=timeout,
        )
        duration_ms = int((time.monotonic() - start_time) * 1000)

        # Parse JSON output for telemetry + agent result
        claude_data = _parse_claude_json(result.stdout or "")
        record = _record_usage(slug, kind, claude_data, duration_ms)

        if claude_data:
            log(f"[{slug}] {kind}: {duration_ms}ms in={record['input_tokens']} out={record['output_tokens']} cache_read={record['cache_read']} cost=${record['cost_usd']:.4f} turns={record['num_turns']}")
            agent_text = claude_data.get("result", "")
            if agent_text:
                log(f"[{slug}] claude result (tail): {agent_text[-300:]}")
            tail = (agent_text or "")[-1000:]
        else:
            log(f"[{slug}] {kind}: {duration_ms}ms (no JSON output parsed)", "WARN")
            if result.stdout:
                log(f"[{slug}] claude stdout (tail): {result.stdout[-300:]}")
            tail = (result.stdout or "")[-1000:]

        if result.stderr:
            log(f"[{slug}] claude stderr (tail): {result.stderr[-300:]}", "WARN")

        # Primary source of truth: RESULT.json (structured)
        if expect_result_json:
            result_data = _read_result_json(slug)
            if result_data is not None:
                status = str(result_data.get("status", "")).lower()
                notes = result_data.get("notes", "")
                files = result_data.get("files_modified", [])
                blockers = result_data.get("blockers", [])

                log(f"[{slug}] RESULT.json: status={status}, files={len(files)}, blockers={len(blockers)}")
                if notes:
                    log(f"[{slug}] Agent notes: {notes[:200]}")

                if status in ("ok", "completed", "success"):
                    return True, _json.dumps(result_data)[:500]
                else:
                    blocker_text = "; ".join(str(b) for b in blockers) if blockers else notes
                    return False, f"Agent reported status={status}: {blocker_text[:500]}"

            log(f"[{slug}] RESULT.json missing — falling back to STATUS.md scan", "WARN")

        # Fallback: legacy STATUS.md text scan
        status_file = os.path.join(TASKS_DIR, slug, "STATUS.md")
        if os.path.exists(status_file):
            with open(status_file, "r", encoding="utf-8") as f:
                if "status: failed" in f.read():
                    return False, tail

        return result.returncode == 0, tail

    except subprocess.TimeoutExpired:
        log(f"[{slug}] claude timed out ({timeout}s)", "ERROR")
        return False, f"Timeout ({timeout}s)"
    except Exception as e:
        log(f"[{slug}] claude error: {e}", "ERROR")
        return False, str(e)


# ── Review Agent ───────────────────────────────────────────────────────

def run_review(slug: str, task: dict, config: dict, prompts: dict) -> tuple[str, str]:
    """Run review agent. Returns (verdict, feedback).
    verdict: 'pass' | 'warn' | 'block' | 'error'"""
    review_cfg = config.get("review", DEFAULT_CONFIG["review"])
    diff_max = review_cfg.get("diff_max_chars", 8000)

    # Capture full working-tree diff (staged + unstaged)
    try:
        diff_proc = subprocess.run(
            ["git", "diff", "HEAD"], cwd=PROJECT_ROOT,
            capture_output=True, text=True, timeout=30,
        )
        diff = diff_proc.stdout or ""
    except Exception as e:
        return "error", f"Failed to capture diff: {e}"

    if not diff.strip():
        log(f"[{slug}] Review: no diff to review, skipping")
        return "pass", "no changes"

    if len(diff) > diff_max:
        diff = diff[:diff_max] + f"\n\n... (truncated, total {len(diff)} chars)"

    review_prompt = _render_template(prompts.get("review", DEFAULT_REVIEW_PROMPT), {
        "slug": slug,
        "description": task["description"],
        "diff": diff,
    })

    # Run with review-specific timeout. Review agent does NOT write RESULT.json,
    # it writes REVIEW.json — so disable result-json check inside run_claude.
    review_timeout = review_cfg.get("timeout", 300)
    review_config = dict(config)
    review_config["agent"] = {**config.get("agent", {}), "timeout": review_timeout}

    _clear_artifact(slug, "REVIEW.json")
    _clear_artifact(slug, "REVIEW.md")

    log(f"[{slug}] Running review agent...")
    success, output = run_claude(review_prompt, slug, review_config, expect_result_json=False, kind="review")

    # Primary source: REVIEW.json (structured)
    review_data = _read_review_json(slug)
    if review_data is not None:
        verdict = str(review_data.get("verdict", "")).lower()
        if verdict in ("pass", "warn", "block"):
            log(f"[{slug}] Review verdict: {verdict.upper()} (from REVIEW.json)")
            if review_data.get("scope_drift"):
                log(f"[{slug}] Review flagged scope_drift", "WARN")
            return verdict, _format_review_feedback(review_data)
        log(f"[{slug}] REVIEW.json has invalid verdict '{verdict}'", "WARN")

    # Fallback: legacy REVIEW.md regex parsing
    review_file = os.path.join(TASKS_DIR, slug, "REVIEW.md")
    if not os.path.exists(review_file):
        log(f"[{slug}] Review: no REVIEW.json or REVIEW.md produced", "WARN")
        return "error", f"Review agent did not produce REVIEW.json. Output tail:\n{output[-300:]}"

    with open(review_file, "r", encoding="utf-8") as f:
        review_content = f.read()

    m = _re.search(r"verdict:\s*(\w+)", review_content, _re.IGNORECASE)
    verdict = m.group(1).lower() if m else "error"
    if verdict not in ("pass", "warn", "block"):
        log(f"[{slug}] Review: unparseable verdict '{verdict}'", "WARN")
        return "error", f"Unparseable verdict in REVIEW.md:\n{review_content[:500]}"

    log(f"[{slug}] Review verdict: {verdict.upper()} (from REVIEW.md fallback)")
    return verdict, review_content


def _read_verify_json(slug: str) -> dict | None:
    return _read_json_safe(os.path.join(TASKS_DIR, slug, "VERIFY.json"), slug)


def _format_verify_feedback(data: dict) -> str:
    """Render VERIFY.json into a human-readable feedback block."""
    lines = []
    if data.get("reasoning"):
        lines.append(f"Reasoning: {data['reasoning']}")
    checks = data.get("criteria_checks", [])
    if checks:
        lines.append("Criteria checks:")
        for c in checks:
            if isinstance(c, dict):
                status = c.get("status", "?")
                criterion = c.get("criterion", "")
                note = c.get("note", "")
                lines.append(f"  - [{status}] {criterion}{' — ' + note if note else ''}")
    evidence = data.get("evidence", [])
    if evidence:
        lines.append("Evidence:")
        for e in evidence:
            lines.append(f"  - {e}")
    return "\n".join(lines)


def run_verify(slug: str, task: dict, config: dict, prompts: dict) -> tuple[str, str]:
    """Independent environment verification: spawn a separate claude agent that opens
    the live page via Playwright and validates PLAN acceptance criteria.

    Returns (verdict, feedback). verdict ∈ {pass, warn, block, error, skip}.
    """
    verify_cfg = config.get("verify", DEFAULT_CONFIG["verify"])
    if not verify_cfg.get("enabled", False):
        return "pass", "verify disabled"

    # Ensure dev server is up (verify needs real browser access)
    if not _ensure_dev_server():
        return "error", "dev server failed to start for verify step"

    verify_prompt = _render_template(
        prompts.get("verify", DEFAULT_VERIFY_PROMPT),
        {"slug": slug, "description": task["description"]},
    )

    verify_timeout = int(verify_cfg.get("timeout", 600))
    verify_config = dict(config)
    verify_config["agent"] = {**config.get("agent", {}), "timeout": verify_timeout}

    _clear_artifact(slug, "VERIFY.json")

    log(f"[{slug}] Running verify agent (env validation)...")
    success, output = run_claude(verify_prompt, slug, verify_config, expect_result_json=False, kind="verify")

    verify_data = _read_verify_json(slug)
    if verify_data is None:
        log(f"[{slug}] Verify: no VERIFY.json produced", "WARN")
        return "error", f"Verify agent did not produce VERIFY.json. Output tail:\n{output[-300:]}"

    verdict = str(verify_data.get("verdict", "")).lower()
    if verdict not in ("pass", "warn", "block"):
        log(f"[{slug}] VERIFY.json has invalid verdict '{verdict}'", "WARN")
        return "error", f"Invalid verdict in VERIFY.json: {verdict}"

    log(f"[{slug}] Verify verdict: {verdict.upper()} (from VERIFY.json)")
    return verdict, _format_verify_feedback(verify_data)


# ── Helpers ────────────────────────────────────────────────────────────

def _extract_commit_msg(slug: str) -> str | None:
    """Extract commit message from PLAN.md (looks for ```-fenced or inline commit line)."""
    plan_file = os.path.join(TASKS_DIR, slug, "PLAN.md")
    if not os.path.exists(plan_file):
        return None
    with open(plan_file, "r", encoding="utf-8") as f:
        content = f.read()
    # Match fenced code block after "### Commit" heading
    m = _re.search(r"###?\s*[Cc]ommit.*?\n```[^\n]*\n(.+?)\n```", content, _re.DOTALL)
    if m:
        return m.group(1).strip()
    # Match inline: "Commit: <msg>" or "commit message: <msg>"
    m = _re.search(r"[Cc]ommit(?:\s+message)?:\s*`?(.+?)`?\s*$", content, _re.MULTILINE)
    if m:
        return m.group(1).strip()
    return None


# ── Task Execution (full cycle) ───────────────────────────────────────

def execute_task(task: dict, max_fix: int, config: dict, prompts: dict) -> bool:
    """Execute a task end-to-end: develop → gate → fix loop → commit."""
    slug = task["slug"]
    plan_file = os.path.join(TASKS_DIR, slug, "PLAN.md")

    if not os.path.exists(plan_file):
        log(f"PLAN.md not found for '{slug}', skipping", "ERROR")
        update_task_status_in_queue(slug, "failed")
        update_task_status_file(slug, "failed", "PLAN.md not found")
        return False

    hooks = config.get("hooks", {})
    commit_cfg = config.get("commit", DEFAULT_CONFIG["commit"])
    review_cfg = config.get("review", DEFAULT_CONFIG["review"])
    review_enabled = bool(review_cfg.get("enabled", False))
    verify_cfg = config.get("verify", DEFAULT_CONFIG["verify"])
    verify_enabled = bool(verify_cfg.get("enabled", False))
    drift_cfg = config.get("drift", DEFAULT_CONFIG["drift"])
    drift_enabled = bool(drift_cfg.get("enabled", False))
    drift_mode = str(drift_cfg.get("mode", "warn")).lower()
    drift_ignore = _parse_ignore_globs(drift_cfg.get("ignore", ""))

    declared_scope = _extract_scope_from_plan(slug) if drift_enabled else []
    require_scope = bool(drift_cfg.get("require_scope", False))
    if drift_enabled:
        if declared_scope:
            log(f"[{slug}] Drift detection: enabled (mode={drift_mode}, scope={len(declared_scope)} files)")
        elif require_scope:
            err = (
                "PLAN.md has no '## Files' or '## Scope' section, but "
                "drift.require_scope is enabled. Without a declared scope, "
                "drift detection is ineffective and the agent can modify "
                "any file unchecked. Add a scope section to PLAN.md or "
                "disable require_scope."
            )
            log(f"[{slug}] {err}", "ERROR")
            update_task_status_in_queue(slug, "failed")
            update_task_status_file(slug, "failed", err)
            return False
        else:
            log(f"[{slug}] Drift detection: no scope declared in PLAN.md, skipping")

    update_task_status_in_queue(slug, "in_progress")
    update_task_status_file(slug, "in_progress")
    log(f"=== Starting task: {slug} — {task['description']} ===")

    # ── Step 1: Develop ──────────────────────────────────────────────
    dev_prompt = _render_template(prompts.get("dev", DEFAULT_PROMPT_TEMPLATE), {
        "slug": slug,
        "description": task["description"],
    })

    log(f"[{slug}] Step 1: Running development agent...")
    _write_heartbeat("dev", slug)
    _run_hook(hooks.get("before_run", ""), "before_run")
    success, output = run_claude(dev_prompt, slug, config, kind="dev")
    _run_hook(hooks.get("after_run", ""), "after_run")

    if not success:
        update_task_status_in_queue(slug, "failed")
        update_task_status_file(slug, "failed", f"Development agent failed:\n{output[-500:]}")
        log(f"[{slug}] Development failed", "ERROR")
        return False

    # ── Step 1.5: Post-dev prechecks (before gates) ─────────────────
    # These catch two classes of bug that previously got past the critic:
    #   (a) empty dev diff — agent reported success without writing code
    #   (b) sibling STATUS.md drift — agent overwrote another task's state
    post_dev_changed = _get_changed_files()

    if _check_empty_dev_diff(slug, post_dev_changed):
        err = (
            "Empty dev diff: development agent did not modify any source "
            "files (only bookkeeping files touched). This usually means the "
            "agent declared success without executing the plan. Task is "
            "being marked failed to prevent wasted critic/gate cycles."
        )
        log(f"[{slug}] {err}", "ERROR")
        update_task_status_in_queue(slug, "failed")
        update_task_status_file(slug, "failed", err)
        return False

    sibling_drift = _check_sibling_status_drift(slug, post_dev_changed)
    if sibling_drift:
        err = (
            "Sibling STATUS.md drift: dev agent modified STATUS.md for "
            "tasks it does not own:\n"
            + "\n".join(f"  - {f}" for f in sibling_drift)
            + "\nReverting those files and failing this task."
        )
        log(f"[{slug}] Sibling STATUS drift detected: {', '.join(sibling_drift)}", "ERROR")
        # Revert sibling STATUS files so we don't corrupt the queue
        for f in sibling_drift:
            try:
                subprocess.run(
                    ["git", "checkout", "HEAD", "--", f],
                    cwd=PROJECT_ROOT, capture_output=True, timeout=10,
                )
            except Exception:
                pass
        update_task_status_in_queue(slug, "failed")
        update_task_status_file(slug, "failed", err)
        return False

    # ── Step 2: Verify loop (gates + drift + optional review) → Fix ─
    for attempt in range(max_fix + 1):
        log(f"[{slug}] Step 2: Quality gate (attempt {attempt + 1}/{max_fix + 1})...")
        _write_heartbeat("gate", slug)
        gate_passed, gate_details = run_quality_gate(slug, config)

        # Drift check (only if scope was declared)
        drift_files: list[str] = []
        drift_block = False
        if drift_enabled and declared_scope and gate_passed:
            changed_files = _get_changed_files()
            drift_files = _check_drift(declared_scope, changed_files, drift_ignore)
            if drift_files:
                level = "ERROR" if drift_mode == "block" else "WARN"
                log(f"[{slug}] Drift detected ({len(drift_files)} files outside scope): {', '.join(drift_files[:5])}{'...' if len(drift_files) > 5 else ''}", level)
                if drift_mode == "block":
                    drift_block = True

        review_verdict = "pass"
        review_feedback = ""
        if gate_passed and not drift_block and review_enabled:
            log(f"[{slug}] Step 2.5: Critic review (attempt {attempt + 1}/{max_fix + 1})...")
            _write_heartbeat("review", slug)
            _run_hook(hooks.get("before_run", ""), "before_run")
            review_verdict, review_feedback = run_review(slug, task, config, prompts)
            _run_hook(hooks.get("after_run", ""), "after_run")

        env_verify_verdict = "pass"
        env_verify_feedback = ""
        if gate_passed and not drift_block and review_verdict in ("pass", "warn") and verify_enabled:
            log(f"[{slug}] Step 2.7: Env verify (attempt {attempt + 1}/{max_fix + 1})...")
            _write_heartbeat("verify", slug)
            _run_hook(hooks.get("before_run", ""), "before_run")
            env_verify_verdict, env_verify_feedback = run_verify(slug, task, config, prompts)
            _run_hook(hooks.get("after_run", ""), "after_run")

        verify_passed = (
            gate_passed
            and not drift_block
            and review_verdict in ("pass", "warn")
            and env_verify_verdict in ("pass", "warn")
        )

        if verify_passed:
            log(f"[{slug}] All checks passed!")
            break

        if attempt >= max_fix:
            log(f"[{slug}] Max fix attempts reached, giving up", "ERROR")
            update_task_status_in_queue(slug, "failed")
            error_msg = ""
            if not gate_passed:
                error_msg += f"Quality gates still failing:\n{gate_details}\n"
            if drift_block:
                error_msg += f"\nScope drift (blocked): {len(drift_files)} files outside declared scope:\n" + "\n".join(f"  - {f}" for f in drift_files[:20])
            if review_verdict == "block":
                error_msg += f"\nCritic review blocked:\n{review_feedback[:1000]}"
            elif review_verdict == "error":
                error_msg += f"\nCritic review errored:\n{review_feedback[:500]}"
            if env_verify_verdict == "block":
                error_msg += f"\nEnv verify blocked:\n{env_verify_feedback[:1000]}"
            elif env_verify_verdict == "error":
                error_msg += f"\nEnv verify errored:\n{env_verify_feedback[:500]}"
            update_task_status_file(slug, "failed", error_msg)
            return False

        # Build a fix prompt combining gate failures + drift + review feedback
        fix_sections = []
        if not gate_passed:
            fix_sections.append(f"## Gate failures:\n```\n{gate_details}\n```")
        if drift_block:
            scope_list = "\n".join(f"  - {p}" for p in declared_scope[:30])
            drift_list = "\n".join(f"  - {f}" for f in drift_files[:30])
            fix_sections.append(
                f"## Scope drift (BLOCKED):\n"
                f"The plan declared this scope:\n{scope_list}\n\n"
                f"But you also modified these files outside that scope:\n{drift_list}\n\n"
                f"Action: revert any unrelated edits, OR if these files are genuinely required, "
                f"justify why and add them to PLAN.md `## Files` section."
            )
        if review_verdict == "block":
            fix_sections.append(f"## Critic review (BLOCKED):\n```\n{review_feedback}\n```")
        elif review_verdict == "error":
            fix_sections.append(f"## Critic review error:\n```\n{review_feedback}\n```\nRe-run the dev step to address scope issues.")
        if env_verify_verdict == "block":
            fix_sections.append(
                f"## Env verify (BLOCKED — real browser test failed):\n```\n{env_verify_feedback}\n```\n"
                f"A separate QA agent opened the live page and found acceptance criteria NOT met. "
                f"See `.planning/tasks/{slug}/VERIFY.json` and screenshots under `test-results/verify-{slug}.png`."
            )
        elif env_verify_verdict == "error":
            fix_sections.append(f"## Env verify error:\n```\n{env_verify_feedback}\n```")

        fix_prompt = f"""You are fixing issues for a development task.

## Task: {task['description']}

{chr(10).join(fix_sections)}

## Instructions:
1. Read the issues above carefully
2. If gate failures: fix ONLY the errors reported — do not refactor unrelated code
3. If critic review blocked: address the specific concerns raised, re-read .planning/tasks/{slug}/PLAN.md if needed
4. Run npx tsc --noEmit to verify your fixes
5. Do NOT commit — just fix the code

## SCOPE RULES (strict — violations fail the task)
- You may ONLY modify: (a) files listed in .planning/tasks/{slug}/PLAN.md `## Files` or `## Scope`, (b) the task's own e2e spec (`tests/e2e/{slug}*.spec.ts`), (c) the task's own artifacts under `.planning/tasks/{slug}/`.
- You MUST NOT touch: other tasks' files, sibling STATUS.md, TASK-QUEUE.md, unrelated test files (e.g. `core-routes.spec.ts`), `super-admin-side-nav.tsx` unless it is in PLAN `## Files`.
- If the real fix requires a file outside scope, STOP and write a blocker to `.planning/tasks/{slug}/RESULT.json` with `status: "blocked"` and `blockers: ["need to modify <file> but it is outside PLAN scope"]`. Do not silently expand scope.
- If an e2e test is flaky or selectors are wrong, prefer fixing the SPEC (in scope) rather than adding `data-testid` to an out-of-scope component.

IMPORTANT:
- Do NOT ask questions — fix autonomously
- Do NOT commit
- Do NOT touch `.pyc` / `__pycache__/` files — they are build artifacts
- If you cannot fix the issues, update .planning/tasks/{slug}/STATUS.md with status: failed
"""
        backoff = _compute_backoff(attempt, config)
        log(f"[{slug}] Backoff {backoff}s before fix attempt {attempt + 1}...")
        time.sleep(backoff)
        log(f"[{slug}] Running fix agent (attempt {attempt + 1})...")
        _write_heartbeat("fix", slug)
        _run_hook(hooks.get("before_run", ""), "before_run")
        fix_success, fix_output = run_claude(fix_prompt, slug, config, kind="fix")
        _run_hook(hooks.get("after_run", ""), "after_run")

        if not fix_success:
            update_task_status_in_queue(slug, "failed")
            update_task_status_file(slug, "failed", f"Fix agent failed:\n{fix_output[-500:]}")
            return False

    # ── Step 2.9: Pre-commit build ──────────────────────────────────
    pcb = config.get("pre_commit_build", DEFAULT_CONFIG.get("pre_commit_build", {}))
    if pcb.get("enabled", False):
        build_cmd = pcb.get("command", "pnpm build")
        build_timeout = int(pcb.get("timeout", 300))
        log(f"[{slug}] Step 2.9: Pre-commit build ({build_cmd})...")
        _write_heartbeat("pre_commit_build", slug)

        # Kill dev server to free build output directories
        if pcb.get("kill_dev_server", False):
            try:
                r = subprocess.run(
                    ["lsof", "-ti:4321"], capture_output=True, text=True, timeout=5,
                )
                pids = [p.strip() for p in (r.stdout or "").split("\n") if p.strip()]
                if pids:
                    for pid in pids:
                        try:
                            os.kill(int(pid), signal.SIGTERM)
                        except (OSError, ValueError):
                            pass
                    log(f"[{slug}] Killed dev server (PIDs: {', '.join(pids)})")
                    time.sleep(2)  # let processes exit
            except Exception as e:
                log(f"[{slug}] Failed to kill dev server: {e}", "WARN")

        try:
            r = subprocess.run(
                build_cmd, shell=True, cwd=PROJECT_ROOT,
                capture_output=True, text=True, timeout=build_timeout,
            )
            if r.returncode != 0:
                error_tail = (r.stderr or r.stdout or "")[-1000:]
                log(f"[{slug}] Pre-commit build FAILED", "ERROR")
                update_task_status_in_queue(slug, "failed")
                update_task_status_file(slug, "failed", f"Pre-commit build failed:\n{error_tail}")
                return False
            log(f"[{slug}] Pre-commit build: PASS")
        except subprocess.TimeoutExpired:
            log(f"[{slug}] Pre-commit build timed out ({build_timeout}s)", "ERROR")
            update_task_status_in_queue(slug, "failed")
            update_task_status_file(slug, "failed", f"Pre-commit build timed out ({build_timeout}s)")
            return False

    # ── Step 3: Commit ───────────────────────────────────────────────
    log(f"[{slug}] Step 3: Committing changes...")
    _write_heartbeat("commit", slug)
    commit_msg = _extract_commit_msg(slug) or f"fix({slug}): update per task plan"

    # Append co-author if configured
    co_author = commit_cfg.get("co_author", "")
    if co_author and f"Co-Authored-By:" not in commit_msg:
        commit_msg = f"{commit_msg}\n\nCo-Authored-By: {co_author}"

    try:
        # Scope-aware staging (P2): only stage files that belong to this task.
        # This prevents accidentally committing files the agent shouldn't have
        # touched, even if drift check was warn-mode or scope was undeclared.
        changed_files = _get_changed_files()
        task_artifacts = f".planning/tasks/{slug}/**"
        task_e2e = f"tests/e2e/{slug}*"
        # Build allowed patterns: declared scope + task artifacts + e2e
        allowed = list(declared_scope) + [task_artifacts, task_e2e]

        files_to_stage: list[str] = []
        files_to_revert: list[str] = []
        for f in changed_files:
            if _match_any(f, allowed) or _match_any(f, drift_ignore):
                files_to_stage.append(f)
            else:
                files_to_revert.append(f)

        if files_to_revert:
            log(f"[{slug}] Scope-aware commit: reverting {len(files_to_revert)} out-of-scope files: {', '.join(files_to_revert[:10])}")
            for f in files_to_revert:
                try:
                    subprocess.run(
                        ["git", "checkout", "HEAD", "--", f],
                        cwd=PROJECT_ROOT, capture_output=True, timeout=10,
                    )
                except Exception:
                    pass

        if files_to_stage:
            subprocess.run(
                ["git", "add", "--"] + files_to_stage,
                cwd=PROJECT_ROOT, check=True, capture_output=True,
            )
            log(f"[{slug}] Staged {len(files_to_stage)} files")
        else:
            # Fallback: if no scope declared, stage everything (backward compat)
            log(f"[{slug}] No scope-based staging possible, using git add -A")
            subprocess.run(["git", "add", "-A"], cwd=PROJECT_ROOT, check=True, capture_output=True)

        # Check if there are changes to commit
        diff = subprocess.run(["git", "diff", "--cached", "--quiet"], cwd=PROJECT_ROOT, capture_output=True)
        if diff.returncode == 0:
            log(f"[{slug}] No changes to commit (already committed by agent?)")
        else:
            subprocess.run(
                ["git", "commit", "-m", commit_msg],
                cwd=PROJECT_ROOT, check=True, capture_output=True,
            )
            log(f"[{slug}] Committed: {commit_msg.split(chr(10))[0]}")
            _run_hook(hooks.get("after_commit", ""), "after_commit")
    except subprocess.CalledProcessError as e:
        log(f"[{slug}] Git commit failed: {e}", "WARN")

    # ── Done ─────────────────────────────────────────────────────────
    update_task_status_in_queue(slug, "completed")
    update_task_status_file(slug, "completed")
    log(f"=== Task completed: {slug} ===")
    return True


# ── Daemon Control ─────────────────────────────────────────────────────

def is_running() -> int | None:
    if not os.path.exists(PID_FILE):
        return None
    try:
        with open(PID_FILE, "r") as f:
            pid = int(f.read().strip())
        os.kill(pid, 0)
        return pid
    except (OSError, ValueError):
        try:
            os.remove(PID_FILE)
        except OSError:
            pass
        return None


def write_pid() -> None:
    os.makedirs(EXECUTOR_DIR, exist_ok=True)
    with open(PID_FILE, "w") as f:
        f.write(str(os.getpid()))


def remove_pid() -> None:
    try:
        os.remove(PID_FILE)
    except OSError:
        pass


def handle_signal(signum, frame):
    log(f"Received signal {signum}, shutting down...")
    remove_pid()
    _remove_heartbeat()
    sys.exit(0)


# ── Main Loop ──────────────────────────────────────────────────────────

def run_loop(interval: int | None, max_fix: int | None) -> None:
    config, prompts = _load_workflow()

    # CLI args override workflow config
    if interval is None:
        interval = config.get("polling", {}).get("interval", 300)
    if max_fix is None:
        max_fix = config.get("agent", {}).get("max_fix_attempts", 3)

    existing_pid = is_running()
    if existing_pid:
        print(f"Executor already running (PID {existing_pid}). Use 'stop' first.")
        sys.exit(1)

    signal.signal(signal.SIGTERM, handle_signal)
    signal.signal(signal.SIGINT, handle_signal)

    write_pid()
    log(f"Executor started (PID {os.getpid()}, interval {interval}s, max_fix {max_fix})")
    if os.path.exists(WORKFLOW_FILE):
        log(f"Loaded workflow config from {WORKFLOW_FILE}")
    else:
        log("No WORKFLOW.md found, using default config")

    _write_heartbeat("idle")
    processed_this_session = 0
    drain_notified = False
    try:
        while True:
            _write_heartbeat("idle")
            task = get_next_pending_task()
            if task:
                drain_notified = False  # new work → reset drain flag
                log(f"Found pending task: {task['slug']}")
                _write_heartbeat("executing", task["slug"])
                success = execute_task(task, max_fix, config, prompts)
                _write_heartbeat("idle")
                processed_this_session += 1

                hooks_cfg = config.get("hooks", {})
                err_tail = ""
                if not success:
                    try:
                        with open(os.path.join(TASKS_DIR, task["slug"], "STATUS.md"), "r") as f:
                            err_tail = f.read()[-500:]
                    except OSError:
                        pass
                env_extra = {
                    "TASK_SLUG": task["slug"],
                    "TASK_DESCRIPTION": task.get("description", ""),
                    "TASK_STATUS": "completed" if success else "failed",
                    "TASK_ERROR": err_tail,
                }
                if success:
                    _run_hook(hooks_cfg.get("on_success", ""), "on_success", env_extra)
                    log("Task done. Checking for next task immediately...")
                    continue
                else:
                    _run_hook(hooks_cfg.get("on_failure", ""), "on_failure", env_extra)
                    # P3: cascade-block downstream tasks
                    blocked = cascade_block_downstream(task["slug"])
                    if blocked:
                        log(f"Cascade blocked {len(blocked)} downstream tasks: {', '.join(blocked)}")
                    log("Task failed. Waiting before next poll...")
            else:
                # Queue drained — fire once per drain cycle, only if we did work this session
                if processed_this_session > 0 and not drain_notified:
                    tasks = read_task_queue()
                    summary_env = {
                        "PROCESSED_COUNT": processed_this_session,
                        "TOTAL_COUNT": len(tasks),
                        "COMPLETED_COUNT": sum(1 for t in tasks if t["status"] == "completed"),
                        "FAILED_COUNT": sum(1 for t in tasks if t["status"] == "failed"),
                        "BLOCKED_COUNT": sum(1 for t in tasks if t["status"] == "blocked"),
                    }
                    _run_hook(
                        config.get("hooks", {}).get("on_queue_drained", ""),
                        "on_queue_drained",
                        summary_env,
                    )
                    drain_notified = True
                log("No pending tasks. Waiting...")
            time.sleep(interval)
    except KeyboardInterrupt:
        log("Interrupted by user")
    finally:
        remove_pid()
        _remove_heartbeat()
        log("Executor stopped")


# ── CLI Commands ───────────────────────────────────────────────────────

def cmd_start(args):
    if is_running():
        print(f"Executor already running (PID {is_running()})")
        return
    # Pass None to let workflow config be used; CLI args override if explicitly set
    interval = args.interval if args.interval != 300 else None
    max_fix = args.max_fix if args.max_fix != 3 else None
    # If user explicitly passed these, use them
    if "--interval" in sys.argv:
        interval = args.interval
    if "--max-fix" in sys.argv:
        max_fix = args.max_fix

    if args.foreground:
        run_loop(interval, max_fix)
    else:
        log(f"Starting executor daemon...")
        pid = os.fork()
        if pid > 0:
            time.sleep(0.5)
            if is_running():
                print(f"Executor started (PID {is_running()})")
                print(f"Logs: {LOG_FILE}")
                print(f"Stop: python3 scripts/gsd-executor.py stop")
            else:
                print("Failed to start executor")
            return
        os.setsid()
        devnull = os.open(os.devnull, os.O_RDWR)
        os.dup2(devnull, 0)
        os.dup2(devnull, 1)
        os.dup2(devnull, 2)
        os.close(devnull)
        run_loop(interval, max_fix)


def cmd_stop(args):
    pid = is_running()
    if not pid:
        print("Executor is not running")
        return
    try:
        os.kill(pid, signal.SIGTERM)
        for _ in range(10):
            time.sleep(0.5)
            try:
                os.kill(pid, 0)
            except OSError:
                break
        print(f"Executor stopped (PID {pid})")
    except OSError as e:
        print(f"Error stopping executor: {e}")
    finally:
        remove_pid()


def _render_status_once():
    pid = is_running()
    print(f"Executor: {'RUNNING (PID ' + str(pid) + ')' if pid else 'STOPPED'}")
    tasks = read_task_queue()
    pending = sum(1 for t in tasks if t["status"] == "pending")
    in_prog = sum(1 for t in tasks if t["status"] == "in_progress")
    completed = sum(1 for t in tasks if t["status"] == "completed")
    failed = sum(1 for t in tasks if t["status"] == "failed")
    total = len(tasks)
    done = completed + failed
    bar_w = 24
    filled = int(bar_w * done / total) if total else 0
    bar = "█" * filled + "░" * (bar_w - filled)
    print(f"Progress: [{bar}] {done}/{total}  "
          f"(✅ {completed}  ❌ {failed}  🔄 {in_prog}  ⏳ {pending})")
    # Current task from heartbeat
    hb = _read_heartbeat()
    if pid and hb:
        phase = hb.get("phase", "?")
        slug = hb.get("slug", "")
        age = int(time.time() - hb.get("ts", 0))
        if slug and phase != "idle":
            desc = ""
            for t in tasks:
                if t["slug"] == slug:
                    desc = t["description"][:50]
                    break
            print(f"Current:  🔄 {slug}  [phase: {phase}, elapsed: {age}s]")
            if desc:
                print(f"          {desc}")
        else:
            print(f"Current:  💤 idle ({age}s)")
    print()
    if not tasks:
        print("Task queue: empty")
        return
    print("Task Queue:")
    print(f"  {'Slug':<30} {'Status':<15} {'Description'}")
    print(f"  {'─' * 30} {'─' * 15} {'─' * 40}")
    completed_set = {t["slug"] for t in tasks if t["status"] == "completed"}
    for t in tasks:
        icon = {"pending": "⏳", "in_progress": "🔄", "completed": "✅", "failed": "❌"}.get(t["status"], "❓")
        deps = t.get("depends", [])
        dep_str = ""
        if deps:
            unmet = [d for d in deps if d not in completed_set]
            if unmet:
                dep_str = f" [blocked by: {', '.join(unmet)}]"
            else:
                dep_str = f" [deps ok: {', '.join(deps)}]"
        print(f"  {t['slug']:<30} {icon} {t['status']:<12} {t['description'][:40]}{dep_str}")
    blocked = sum(1 for t in tasks if t["status"] == "pending" and
                  any(d not in completed_set for d in t.get("depends", [])))
    print(f"\n  Total: {total} | Pending: {pending} (blocked: {blocked}) | "
          f"In-progress: {in_prog} | Completed: {completed} | Failed: {failed}")


def cmd_status(args):
    interval = getattr(args, "watch", 0) or 0
    if not interval:
        _render_status_once()
        return
    try:
        while True:
            print("\033[2J\033[H", end="")
            _render_status_once()
            print(f"\n(watching, refresh every {interval}s — Ctrl+C to exit)")
            time.sleep(interval)
    except KeyboardInterrupt:
        return


def cmd_logs(args):
    if not os.path.exists(LOG_FILE):
        print("No logs yet")
        return
    with open(LOG_FILE, "r", encoding="utf-8") as f:
        lines = f.readlines()
    for line in lines[-args.tail:]:
        print(line, end="")


def cmd_stats(args):
    """Display aggregated token usage and cost from usage.jsonl."""
    if not os.path.exists(USAGE_FILE):
        print("No usage data yet. Run some tasks first.")
        return

    records = []
    with open(USAGE_FILE, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                records.append(_json.loads(line))
            except _json.JSONDecodeError:
                continue

    if args.slug:
        records = [r for r in records if r.get("slug") == args.slug]

    if not records:
        print("No matching usage records.")
        return

    # Aggregate by kind
    by_kind: dict[str, dict] = {}
    for r in records:
        kind = r.get("kind", "?")
        agg = by_kind.setdefault(kind, {
            "runs": 0, "input": 0, "output": 0,
            "cache_read": 0, "cache_create": 0,
            "cost": 0.0, "duration_ms": 0, "errors": 0,
        })
        agg["runs"] += 1
        agg["input"] += r.get("input_tokens", 0)
        agg["output"] += r.get("output_tokens", 0)
        agg["cache_read"] += r.get("cache_read", 0)
        agg["cache_create"] += r.get("cache_create", 0)
        agg["cost"] += r.get("cost_usd", 0.0)
        agg["duration_ms"] += r.get("duration_ms", 0)
        if r.get("is_error"):
            agg["errors"] += 1

    print(f"Usage telemetry — {len(records)} records")
    if args.slug:
        print(f"Filter: slug={args.slug}")
    print()
    print(f"  {'Kind':<8} {'Runs':>5} {'In':>10} {'Out':>10} {'CacheR':>10} {'Cost':>10} {'Time':>10} {'Err':>4}")
    print(f"  {'─'*8} {'─'*5} {'─'*10} {'─'*10} {'─'*10} {'─'*10} {'─'*10} {'─'*4}")

    total_cost = 0.0
    total_in = 0
    total_out = 0
    total_cache = 0
    total_time = 0
    total_runs = 0
    total_errors = 0
    for kind, agg in sorted(by_kind.items()):
        print(f"  {kind:<8} {agg['runs']:>5} {agg['input']:>10,} {agg['output']:>10,} {agg['cache_read']:>10,} ${agg['cost']:>9.4f} {agg['duration_ms']/1000:>9.1f}s {agg['errors']:>4}")
        total_cost += agg["cost"]
        total_in += agg["input"]
        total_out += agg["output"]
        total_cache += agg["cache_read"]
        total_time += agg["duration_ms"]
        total_runs += agg["runs"]
        total_errors += agg["errors"]

    print(f"  {'─'*8} {'─'*5} {'─'*10} {'─'*10} {'─'*10} {'─'*10} {'─'*10} {'─'*4}")
    print(f"  {'TOTAL':<8} {total_runs:>5} {total_in:>10,} {total_out:>10,} {total_cache:>10,} ${total_cost:>9.4f} {total_time/1000:>9.1f}s {total_errors:>4}")

    cache_ratio = (total_cache / (total_in + total_cache) * 100) if (total_in + total_cache) > 0 else 0
    print(f"\n  Cache hit ratio: {cache_ratio:.1f}%")

    # Per-task breakdown (only when not filtered)
    if not args.slug:
        by_slug: dict[str, dict] = {}
        for r in records:
            slug = r.get("slug", "?")
            agg = by_slug.setdefault(slug, {"runs": 0, "cost": 0.0, "tokens": 0})
            agg["runs"] += 1
            agg["cost"] += r.get("cost_usd", 0.0)
            agg["tokens"] += r.get("input_tokens", 0) + r.get("output_tokens", 0)

        print()
        print("Per-task (top 10 by cost):")
        sorted_tasks = sorted(by_slug.items(), key=lambda x: -x[1]["cost"])[:10]
        for slug, agg in sorted_tasks:
            print(f"  {slug:<45} runs={agg['runs']:>2} tokens={agg['tokens']:>10,} cost=${agg['cost']:.4f}")


def cmd_workflow(args):
    """Display current workflow configuration."""
    config, prompts = _load_workflow()
    source = WORKFLOW_FILE if os.path.exists(WORKFLOW_FILE) else "(defaults)"

    print(f"Workflow config source: {source}")
    print()

    print("── Polling ──")
    polling = config.get("polling", {})
    print(f"  interval: {polling.get('interval', 300)}s")
    print()

    print("── Agent ──")
    agent = config.get("agent", {})
    print(f"  command:          {agent.get('command', 'claude')}")
    print(f"  timeout:          {agent.get('timeout', 600)}s")
    print(f"  max_fix_attempts: {agent.get('max_fix_attempts', 3)}")
    allowed = agent.get("allowed_tools", "")
    print(f"  allowed_tools:    {allowed if allowed else '(none)'}")
    print()

    print("── Quality Gates ──")
    gates = config.get("gates", [])
    for g in gates:
        print(f"  {g['name']:<8} {g['command']:<30} timeout={g.get('timeout', 120)}s")
    print()

    print("── Pre-commit Build ──")
    pcb = config.get("pre_commit_build", {})
    print(f"  enabled:          {pcb.get('enabled', False)}")
    print(f"  command:          {pcb.get('command', 'pnpm build')}")
    print(f"  timeout:          {pcb.get('timeout', 300)}s")
    print(f"  kill_dev_server:  {pcb.get('kill_dev_server', False)}")
    print()

    print("── Critic Review ──")
    review = config.get("review", {})
    print(f"  enabled:        {review.get('enabled', False)}")
    print(f"  timeout:        {review.get('timeout', 300)}s")
    print(f"  diff_max_chars: {review.get('diff_max_chars', 8000)}")
    print()

    print("── Env Verify (independent QA) ──")
    verify = config.get("verify", {})
    print(f"  enabled:      {verify.get('enabled', False)}")
    print(f"  timeout:      {verify.get('timeout', 600)}s")
    print(f"  skip_non_ui:  {verify.get('skip_non_ui', True)}")
    print()

    print("── Drift Detection ──")
    drift = config.get("drift", {})
    print(f"  enabled: {drift.get('enabled', False)}")
    print(f"  mode:    {drift.get('mode', 'warn')}")
    print(f"  ignore:  {drift.get('ignore', '(none)')}")
    print()

    print("── Heartbeat ──")
    hb = config.get("heartbeat", {})
    print(f"  warn_after:  {hb.get('warn_after', 60)}s")
    print(f"  stale_after: {hb.get('stale_after', 900)}s")
    print()

    print("── Retry ──")
    retry = config.get("retry", {})
    print(f"  strategy:   {retry.get('strategy', 'exponential')}")
    print(f"  base_delay: {retry.get('base_delay', 5)}s")
    print(f"  max_delay:  {retry.get('max_delay', 60)}s")
    print(f"  jitter:     {retry.get('jitter', True)}")
    print()

    print("── Hooks ──")
    hooks = config.get("hooks", {})
    for k in ("before_run", "after_run", "after_commit", "on_failure", "on_success", "on_queue_drained"):
        v = hooks.get(k, "")
        print(f"  {k:<14} {v if v else '(none)'}")
    print()

    print("── Commit ──")
    commit = config.get("commit", {})
    print(f"  scope_from_slug: {commit.get('scope_from_slug', True)}")
    print(f"  co_author:       {commit.get('co_author', '')}")
    print()

    print("── Prompt Templates ──")
    for name, tpl in prompts.items():
        lines = tpl.strip().split("\n")
        print(f"  [{name}] ({len(lines)} lines)")
        for line in lines[:3]:
            print(f"    {line}")
        if len(lines) > 3:
            print(f"    ... ({len(lines) - 3} more lines)")
        print()


def cmd_doctor(args):
    """Health check: detect zombie/hung daemon via PID + heartbeat staleness."""
    config, _ = _load_workflow()
    hb_cfg = config.get("heartbeat", DEFAULT_CONFIG["heartbeat"])
    warn_after = int(hb_cfg.get("warn_after", 60))
    stale_after = int(hb_cfg.get("stale_after", 900))

    pid = is_running()
    hb = _read_heartbeat()
    now = int(time.time())

    print("── GSD Executor Doctor ──")
    print(f"  PID file:     {'running (PID ' + str(pid) + ')' if pid else 'not running'}")

    if hb:
        age = now - int(hb.get("ts", 0))
        print(f"  Heartbeat:    pid={hb.get('pid')} phase={hb.get('phase')} slug={hb.get('slug') or '-'} age={age}s")
    else:
        print("  Heartbeat:    (none)")

    print()
    if pid and hb:
        age = now - int(hb.get("ts", 0))
        if hb.get("pid") != pid:
            print(f"  Status: WARN — heartbeat PID ({hb.get('pid')}) does not match running PID ({pid})")
            sys.exit(1)
        elif age > stale_after:
            print(f"  Status: ZOMBIE — heartbeat is {age}s old (> stale_after={stale_after}s). Daemon appears hung.")
            print(f"  Suggest: kill -9 {pid} && python3 scripts/gsd-executor.py start")
            sys.exit(2)
        elif age > warn_after:
            print(f"  Status: WARN — heartbeat is {age}s old (> warn_after={warn_after}s, phase={hb.get('phase')})")
            sys.exit(1)
        else:
            print(f"  Status: HEALTHY — phase={hb.get('phase')} age={age}s")
            sys.exit(0)
    elif pid and not hb:
        print("  Status: WARN — daemon running but no heartbeat file. Older version or crash mid-write?")
        sys.exit(1)
    elif not pid and hb:
        print("  Status: UNCLEAN SHUTDOWN — heartbeat exists but daemon not running.")
        print("  Suggest: rm " + HEARTBEAT_FILE)
        sys.exit(1)
    else:
        print("  Status: STOPPED")
        sys.exit(0)


# ── Entry Point ────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="GSD Task Executor Daemon")
    sub = parser.add_subparsers(dest="command", required=True)

    p_start = sub.add_parser("start", help="Start the executor")
    p_start.add_argument("--interval", type=int, default=300, help="Poll interval in seconds (default: from WORKFLOW.md or 300)")
    p_start.add_argument("--max-fix", type=int, default=3, help="Max fix attempts per task (default: from WORKFLOW.md or 3)")
    p_start.add_argument("--foreground", action="store_true", help="Run in foreground")
    p_start.set_defaults(func=cmd_start)

    p_stop = sub.add_parser("stop", help="Stop the executor")
    p_stop.set_defaults(func=cmd_stop)

    p_status = sub.add_parser("status", help="Show status and task queue")
    p_status.add_argument("--watch", type=int, nargs="?", const=2, default=0,
                          help="Auto-refresh every N seconds (default 2)")
    p_status.set_defaults(func=cmd_status)

    p_logs = sub.add_parser("logs", help="Show recent logs")
    p_logs.add_argument("--tail", type=int, default=50, help="Number of lines (default: 50)")
    p_logs.set_defaults(func=cmd_logs)

    p_workflow = sub.add_parser("workflow", help="Show current workflow configuration")
    p_workflow.set_defaults(func=cmd_workflow)

    p_stats = sub.add_parser("stats", help="Show token usage and cost statistics")
    p_stats.add_argument("--slug", help="Filter by task slug")
    p_stats.set_defaults(func=cmd_stats)

    p_doctor = sub.add_parser("doctor", help="Health check: detect zombie/hung daemon")
    p_doctor.set_defaults(func=cmd_doctor)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
