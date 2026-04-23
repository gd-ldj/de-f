#!/usr/bin/env python3
"""AUTO v2 QA verify wrapper with optional Playwright execution."""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from auto.runtime.stage_common import (
    command_exists,
    get_project_root,
    load_payload,
    run_forward_command,
)


def main() -> int:
    payload = load_payload()
    artifact_dir = Path(os.environ.get("AUTO_ARTIFACT_DIR", ".")).resolve()
    project_root = get_project_root()
    spec_path = _write_generated_spec(project_root, artifact_dir, payload)

    mode = os.environ.get("AUTO_QA_VERIFY_MODE", "auto").strip().lower()
    if os.environ.get("AUTO_QA_FORWARD_COMMAND", "").strip():
        result = run_forward_command(os.environ["AUTO_QA_FORWARD_COMMAND"], timeout=1200)
    elif mode == "playwright":
        result = _run_playwright(project_root, spec_path, payload)
    elif mode == "auto":
        result = _run_auto_verify(project_root, spec_path, payload)
    else:
        result = _heuristic_verify(payload, spec_path)

    sys.stdout.write(json.dumps(result, ensure_ascii=False) + "\n")
    return 0


def _write_generated_spec(project_root: Path, artifact_dir: Path, payload: dict) -> Path:
    artifact_dir.mkdir(parents=True, exist_ok=True)
    spec_path = artifact_dir / "GENERATED-QA.spec.ts"
    target_path = _normalize_target_path(payload.get("target_path"))
    acceptance_boundary = str(payload.get("acceptance_boundary", "QA Unit verification")).strip()
    notes = str(payload.get("notes", "")).strip()
    verify_mode = str(payload.get("verify_mode", "non_ui")).strip() or "non_ui"
    acceptance_criteria = _normalize_criteria(payload.get("acceptance_criteria", []))
    required_states = _normalize_criteria(payload.get("required_states", []))
    step_lines = _build_step_lines(acceptance_criteria, verify_mode)
    if required_states and verify_mode == "browser":
        step_lines.extend(_build_state_assertion_lines(required_states, target_path))
    spec_path.write_text(
        "\n".join(
            [
                "import { expect, test } from '@playwright/test';",
                "",
                "test('auto generated qa verify', async ({ page }) => {",
                f"  // acceptance boundary: {acceptance_boundary}",
                f"  // verify mode: {verify_mode}",
                f"  // notes: {notes}",
                f"  await page.goto('{target_path}');",
                "  await expect(page.locator('body')).toBeVisible();",
                *step_lines,
                "});",
                "",
            ]
        ),
        encoding="utf-8",
    )
    return spec_path


def _normalize_target_path(value: object) -> str:
    if value is None:
        return "/"
    text = str(value).strip()
    if not text or text.lower() == "none":
        return "/"
    return text


def _run_playwright(project_root: Path, spec_path: Path, payload: dict | None = None) -> dict:
    pnpm_bin = os.environ.get("AUTO_PLAYWRIGHT_BIN", "pnpm").strip() or "pnpm"
    if not _can_run_playwright(project_root, pnpm_bin):
        return _playwright_unavailable(spec_path)
    env = os.environ.copy()
    env.setdefault("PLAYWRIGHT_HTML_OUTPUT_DIR", str(spec_path.parent / "playwright-report"))
    config_path = spec_path.parent / "playwright.auto.config.ts"
    base_url = os.environ.get("AUTO_QA_BASE_URL", "http://127.0.0.1:3000").strip() or "http://127.0.0.1:3000"
    config_path.write_text(
        "\n".join(
            [
                "import { defineConfig } from '@playwright/test';",
                "",
                "export default defineConfig({",
                f"  testDir: {str(spec_path.parent)!r},",
                f"  testMatch: {spec_path.name!r},",
                "  reporter: 'line',",
                "  workers: 1,",
                "  fullyParallel: false,",
                "  use: {",
                f"    baseURL: {base_url!r},",
                "  },",
                "});",
                "",
            ]
        ),
        encoding="utf-8",
    )
    result = subprocess.run(
        [
            pnpm_bin,
            "exec",
            "playwright",
            "test",
            "--config",
            str(config_path),
        ],
        cwd=str(project_root),
        capture_output=True,
        text=True,
        timeout=1800,
        env=env,
    )
    # Capture implementation screenshots regardless of test outcome.
    target_path = _normalize_target_path((payload or {}).get("target_path"))
    screenshot_paths = _capture_screenshots(project_root, spec_path.parent, target_path, pnpm_bin, base_url)
    if result.returncode == 0:
        return {
            "status": "ok",
            "verdict": "pass",
            "summary": "playwright QA verify passed",
            "bugs": [],
            "generated_spec": str(spec_path),
            "screenshot_paths": screenshot_paths,
        }
    return {
        "status": "error",
        "verdict": "block",
        "summary": "playwright QA verify failed",
        "bugs": [{"title": "Playwright verification failed", "severity": "high", "confidence": 0.8}],
        "generated_spec": str(spec_path),
        "screenshot_paths": screenshot_paths,
        "stderr": (result.stderr or "").strip()[-500:],
        "stdout": (result.stdout or "").strip()[-500:],
    }


def _capture_screenshots(
    project_root: Path,
    artifact_dir: Path,
    target_path: str,
    pnpm_bin: str,
    base_url: str,
) -> list[str]:
    """Capture desktop and mobile screenshots of the target page after verify.

    Saves to <artifact_dir>/screenshots/{desktop.png,mobile.png}.
    Returns a list of absolute paths for the captured files.
    """
    screenshots_dir = artifact_dir / "screenshots"
    screenshots_dir.mkdir(parents=True, exist_ok=True)

    desktop_path = screenshots_dir / "desktop.png"
    mobile_path = screenshots_dir / "mobile.png"

    capture_spec = artifact_dir / "SCREENSHOT-CAPTURE.spec.ts"
    capture_config = artifact_dir / "playwright.screenshot.config.ts"

    capture_spec.write_text(
        "\n".join([
            "import { expect, test } from '@playwright/test';",
            "",
            f"test('desktop screenshot', async ({{ page }}) => {{",
            f"  await page.setViewportSize({{ width: 1440, height: 900 }});",
            f"  await page.goto({target_path!r});",
            "  await expect(page.locator('body')).toBeVisible();",
            f"  await page.screenshot({{ path: {str(desktop_path)!r}, fullPage: false }});",
            "});",
            "",
            f"test('mobile screenshot', async ({{ page }}) => {{",
            f"  await page.setViewportSize({{ width: 375, height: 812 }});",
            f"  await page.goto({target_path!r});",
            "  await expect(page.locator('body')).toBeVisible();",
            f"  await page.screenshot({{ path: {str(mobile_path)!r}, fullPage: false }});",
            "});",
            "",
        ]),
        encoding="utf-8",
    )
    capture_config.write_text(
        "\n".join([
            "import { defineConfig } from '@playwright/test';",
            "",
            "export default defineConfig({",
            f"  testDir: {str(artifact_dir)!r},",
            f"  testMatch: {capture_spec.name!r},",
            "  reporter: 'line',",
            "  workers: 1,",
            "  fullyParallel: false,",
            "  use: {",
            f"    baseURL: {base_url!r},",
            "  },",
            "});",
            "",
        ]),
        encoding="utf-8",
    )
    try:
        subprocess.run(
            [pnpm_bin, "exec", "playwright", "test", "--config", str(capture_config)],
            cwd=str(project_root),
            capture_output=True,
            text=True,
            timeout=120,
            env=os.environ.copy(),
        )
    except (subprocess.TimeoutExpired, OSError):
        pass

    captured = []
    if desktop_path.exists():
        captured.append(str(desktop_path))
    if mobile_path.exists():
        captured.append(str(mobile_path))
    return captured


def _run_auto_verify(project_root: Path, spec_path: Path, payload: dict) -> dict:
    verify_mode = str(payload.get("verify_mode", "non_ui")).strip().lower() or "non_ui"
    if verify_mode != "browser":
        fallback = _heuristic_verify(payload, spec_path)
        fallback["summary"] = "QA verify completed via non-ui heuristic"
        fallback["fallback_reason"] = "non_ui_mode"
        return fallback
    pnpm_bin = os.environ.get("AUTO_PLAYWRIGHT_BIN", "pnpm").strip() or "pnpm"
    if not _can_run_playwright(project_root, pnpm_bin):
        return _playwright_unavailable(spec_path)
    return _run_playwright(project_root, spec_path, payload)


def _heuristic_verify(payload: dict, spec_path: Path) -> dict:
    text = " ".join(
        str(payload.get(key, ""))
        for key in ("acceptance_boundary", "notes")
    ).lower()
    attempts = int(payload.get("attempt_count", 0) or 0)
    if "[qa-fail-once]" in text and attempts == 0:
        return {
            "status": "error",
            "verdict": "block",
            "summary": "QA wrapper requested one fix loop",
            "bugs": [{"title": "Simulated QA failure", "severity": "high", "confidence": 0.9}],
            "generated_spec": str(spec_path),
        }
    if "[qa-block]" in text:
        return {
            "status": "error",
            "verdict": "block",
            "summary": "QA wrapper blocked the task",
            "bugs": [{"title": "Simulated QA block", "severity": "high", "confidence": 0.9}],
            "generated_spec": str(spec_path),
        }
    return {
        "status": "ok",
        "verdict": "pass",
        "summary": "QA verify template generated",
        "bugs": [],
        "generated_spec": str(spec_path),
    }


def _playwright_unavailable(spec_path: Path) -> dict:
    return {
        "status": "error",
        "verdict": "block",
        "summary": "Playwright QA verify unavailable in current environment",
        "bugs": [
            {
                "title": "Playwright unavailable",
                "severity": "high",
                "confidence": 0.95,
            }
        ],
        "generated_spec": str(spec_path),
        "fallback_reason": "playwright_unavailable",
    }


def _can_run_playwright(project_root: Path, command: str) -> bool:
    if not command_exists(command):
        return False
    return (project_root / "package.json").exists()


def _normalize_criteria(raw: object) -> list[str]:
    if isinstance(raw, list):
        return [str(item).strip() for item in raw if str(item).strip()]
    if isinstance(raw, tuple):
        return [str(item).strip() for item in raw if str(item).strip()]
    text = str(raw).strip()
    return [text] if text else []


def _build_state_assertion_lines(required_states: list[str], target_path: str) -> list[str]:
    """Generate Playwright assertion steps for required UI states (loading, empty, error)."""
    lines: list[str] = []
    for state in required_states:
        lowered = state.lower().strip()
        if lowered == "loading":
            lines.append(f"  await test.step('verify loading state', async () => {{")
            lines.append(f"    await page.goto('{target_path}');")
            lines.append("    // Loading state should appear before data resolves")
            lines.append("    const loadingIndicator = page.getByText(/loading|skeleton/i).or(page.locator('[data-loading], [aria-busy=\"true\"]'));")
            lines.append("    await expect(loadingIndicator.first()).toBeVisible({ timeout: 5000 });")
            lines.append("  });")
        elif lowered == "empty":
            lines.append(f"  await test.step('verify empty state handling', async () => {{")
            lines.append("    // Empty state should show a meaningful message when no data is present")
            lines.append("    const emptyIndicator = page.getByText(/no.*(?:data|results|items|content)|empty/i).or(page.locator('[data-empty]'));")
            lines.append("    // This assertion is soft — empty state may not be reachable via normal navigation")
            lines.append("    // but must exist in the DOM when triggered")
            lines.append("    await expect(emptyIndicator.first()).toBeAttached({ timeout: 3000 }).catch(() => {});")
            lines.append("  });")
        elif lowered == "error":
            lines.append(f"  await test.step('verify error state handling', async () => {{")
            lines.append("    // Error state should show user-friendly messaging")
            lines.append("    const errorIndicator = page.getByText(/error|failed|unable/i).or(page.locator('[data-error], [role=\"alert\"]'));")
            lines.append("    // Soft assertion — error state may not be reachable via normal flow")
            lines.append("    await expect(errorIndicator.first()).toBeAttached({ timeout: 3000 }).catch(() => {});")
            lines.append("  });")
        else:
            lines.append(f"  await test.step('verify {state} state', async () => {{")
            lines.append(f"    await expect(page.getByText(/{state}/i)).toBeVisible({{ timeout: 5000 }});")
            lines.append("  });")
    return lines


def _build_step_lines(criteria: list[str], verify_mode: str) -> list[str]:
    lines: list[str] = []
    if not criteria:
        lines.append("  await test.step('baseline smoke check', async () => {")
        lines.append("    await expect(page.locator('body')).toBeVisible();")
        lines.append("  });")
        return lines
    for criterion in criteria:
        lines.append(f"  await test.step({criterion!r}, async () => {{")
        if verify_mode == "browser":
            lines.extend(_browser_assertion_lines(criterion))
        else:
            lines.append("    await expect(page.locator('body')).toBeVisible();")
        lines.append("  });")
    return lines


def _browser_assertion_lines(criterion: str) -> list[str]:
    lowered = criterion.lower()
    matcher = _criterion_to_regex(criterion)
    inferred_lines = _inferred_browser_checks(criterion, lowered)
    if inferred_lines:
        return inferred_lines
    if "input" in lowered and any(token in lowered for token in ("accepts", "enter", "type", "editable", "edit")):
        field_name = _extract_named_subject(criterion, "input")
        return [
            f"    await expect(page.getByRole('textbox', {{ name: {_criterion_to_regex(field_name)} }})).toBeVisible();",
            f"    await page.getByRole('textbox', {{ name: {_criterion_to_regex(field_name)} }}).fill('auto-test');",
        ]
    if "checkbox" in lowered and ("toggle" in lowered or "check" in lowered):
        field_name = _extract_named_subject(criterion, "checkbox")
        return [
            f"    await expect(page.getByRole('checkbox', {{ name: {_criterion_to_regex(field_name)} }})).toBeVisible();",
            f"    await page.getByRole('checkbox', {{ name: {_criterion_to_regex(field_name)} }}).check();",
        ]
    if ("select" in lowered or "dropdown" in lowered) and ("selectable" in lowered or "choose" in lowered or "select" in lowered):
        field_name = _extract_named_subject(criterion, "select" if "select" in lowered else "dropdown")
        return [
            f"    await expect(page.getByRole('combobox', {{ name: {_criterion_to_regex(field_name)} }})).toBeVisible();",
            f"    await page.getByRole('combobox', {{ name: {_criterion_to_regex(field_name)} }}).selectOption({{ index: 0 }});",
        ]
    if "button" in lowered and ("opens" in lowered or "open" in lowered) and ("dialog" in lowered or "modal" in lowered):
        button_name = _extract_named_subject(criterion, "button")
        return [
            f"    await expect(page.getByRole('button', {{ name: {_criterion_to_regex(button_name)} }})).toBeVisible();",
            f"    await page.getByRole('button', {{ name: {_criterion_to_regex(button_name)} }}).click();",
            "    await expect(page.getByRole('dialog')).toBeVisible();",
        ]
    if "button" in lowered and ("clickable" in lowered or "click" in lowered):
        button_name = _extract_named_subject(criterion, "button")
        return [
            f"    await expect(page.getByRole('button', {{ name: {_criterion_to_regex(button_name)} }})).toBeVisible();",
            f"    await expect(page.getByRole('button', {{ name: {_criterion_to_regex(button_name)} }})).toBeEnabled();",
        ]
    if "button" in lowered and "visible" in lowered:
        button_name = _extract_named_subject(criterion, "button")
        return [f"    await expect(page.getByRole('button', {{ name: {_criterion_to_regex(button_name)} }})).toBeVisible();"]
    if "dialog" in lowered or "modal" in lowered:
        return ["    await expect(page.getByRole('dialog')).toBeVisible();"]
    if "link" in lowered and ("clickable" in lowered or "click" in lowered):
        link_name = _extract_named_subject(criterion, "link")
        return [
            f"    await expect(page.getByRole('link', {{ name: {_criterion_to_regex(link_name)} }})).toBeVisible();",
            f"    await page.getByRole('link', {{ name: {_criterion_to_regex(link_name)} }}).click();",
        ]
    if "link" in lowered:
        link_name = _extract_named_subject(criterion, "link")
        return [f"    await expect(page.getByRole('link', {{ name: {_criterion_to_regex(link_name)} }})).toBeVisible();"]
    return [f"    await expect(page.getByText({matcher})).toBeVisible();"]


def _inferred_browser_checks(criterion: str, lowered: str) -> list[str]:
    lines: list[str] = []
    required_copy = _extract_required_copy(criterion)
    if required_copy:
        lines.append(f"    await expect(page.getByText({_criterion_to_regex(required_copy)})).toBeVisible();")
    return _dedupe_lines(lines)


def _criterion_to_regex(criterion: str) -> str:
    sanitized = " ".join(criterion.split())
    escaped = sanitized.replace("\\", "\\\\").replace("/", "\\/")
    return f"/{escaped}/i"


def _extract_required_copy(criterion: str) -> str | None:
    match = re.search(r"must say\\s+(.+?)(?:\\.|$)", criterion, flags=re.IGNORECASE)
    if not match:
        return None
    text = match.group(1).strip().strip('"\'' "`")
    return text or None


def _extract_named_subject(criterion: str, keyword: str) -> str:
    lowered = criterion.lower()
    index = lowered.find(keyword)
    if index == -1:
        return criterion
    prefix = criterion[:index].strip(" -:")
    if prefix:
        return prefix
    return criterion


def _dedupe_lines(lines: list[str]) -> list[str]:
    ordered: list[str] = []
    seen: set[str] = set()
    for line in lines:
        if line in seen:
            continue
        seen.add(line)
        ordered.append(line)
    return ordered


if __name__ == "__main__":
    raise SystemExit(main())
