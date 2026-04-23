"""QA Unit verification wrapper for AUTO v2."""

from __future__ import annotations

import json
from pathlib import Path

from auto.runtime.agent_runner import run_stage
from auto.runtime.dev_server import ensure_dev_server


def run_qa_verify(
    qa_dir: str | Path,
    qa_unit: dict,
    workflow: dict,
    *,
    project_root: str | Path | None = None,
) -> dict:
    qa_path = Path(qa_dir)
    qa_path.mkdir(parents=True, exist_ok=True)
    dev_server_cfg = workflow.get("dev_server", {})
    verify_mode = str(qa_unit.get("verify_mode", "non_ui")).strip().lower() or "non_ui"
    if verify_mode == "browser" and project_root is not None and str(dev_server_cfg.get("start_command", "")).strip():
        dev_server_ok = ensure_dev_server(project_root, workflow.get("dev_server", {}))
        if not dev_server_ok:
            result = {
                "status": "error",
                "verdict": "block",
                "summary": "QA verify blocked because dev server was unavailable",
                "bugs": [
                    {
                        "title": "Dev server unavailable",
                        "severity": "high",
                        "confidence": 0.9,
                    }
                ],
            }
            verify_payload = {
                "verdict": result["verdict"],
                "summary": result["summary"],
                "attempt_count": qa_unit.get("attempt_count", 0),
            }
            bugs_payload = {"bugs": result["bugs"]}
            qa_path.joinpath("VERIFY.json").write_text(json.dumps(verify_payload, indent=2) + "\n", encoding="utf-8")
            qa_path.joinpath("BUGS.json").write_text(json.dumps(bugs_payload, indent=2) + "\n", encoding="utf-8")
            return {**result, "verify_payload": verify_payload, "bugs_payload": bugs_payload}

    payload = {
        "acceptance_boundary": qa_unit.get("acceptance_boundary", ""),
        "acceptance_criteria": list(qa_unit.get("acceptance_criteria", [])),
        "verify_mode": qa_unit.get("verify_mode", "non_ui"),
        "target_path": qa_unit.get("target_path") or dev_server_cfg.get("health_path") or "/en",
        "notes": " ".join(qa_unit.get("notes", [])),
        "attempt_count": qa_unit.get("attempt_count", 0),
    }
    result = run_stage(
        "qa_verify",
        payload,
        workflow,
        project_root=project_root,
        artifact_dir=qa_dir,
    )
    verify_payload = {
        "verdict": result.get("verdict", "error"),
        "summary": result.get("summary", ""),
        "attempt_count": qa_unit.get("attempt_count", 0),
    }
    bugs_payload = {"bugs": result.get("bugs", [])}
    qa_path.joinpath("VERIFY.json").write_text(json.dumps(verify_payload, indent=2) + "\n", encoding="utf-8")
    qa_path.joinpath("BUGS.json").write_text(json.dumps(bugs_payload, indent=2) + "\n", encoding="utf-8")
    return {**result, "verify_payload": verify_payload, "bugs_payload": bugs_payload}
