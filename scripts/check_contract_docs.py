#!/usr/bin/env python3
from __future__ import annotations

import sys
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
CONTRACT_DIR = REPO_ROOT / "docs" / "_contracts" / "20260430_2003_frontend_backend_contract_update"

REQUIRED_FILES = [
    "INDEX.md",
    "00_CONTRACT_OVERVIEW.md",
    "01_API_ROUTE_CONTRACT.md",
    "02_FRONTEND_SCREEN_CONTRACT.md",
    "03_FRONTEND_ACTION_TO_BACKEND_MAP.md",
    "04_BACKEND_ENDPOINT_TO_FRONTEND_MAP.md",
    "05_DATA_FIELD_CONTRACT.md",
    "06_RBAC_CAPABILITY_CONTRACT.md",
    "07_STATUS_WORKFLOW_CONTRACT.md",
    "08_TESTING_CONTRACT.md",
    "09_DRIFT_PREVENTION_RULES.md",
    "10_CONTRACT_GAPS_AND_DECISIONS.md",
]


def is_heading_only(text: str) -> bool:
    meaningful = []
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped:
            continue
        meaningful.append(stripped)
    if not meaningful:
        return True
    if len(meaningful) == 1 and meaningful[0].startswith("#"):
        return True
    return False


def main() -> int:
    if not CONTRACT_DIR.exists():
        print(f"CONTRACT_DIR missing: {CONTRACT_DIR}", file=sys.stderr)
        return 2

    missing: list[str] = []
    heading_only: list[str] = []

    for rel in REQUIRED_FILES:
        path = CONTRACT_DIR / rel
        if not path.exists():
            missing.append(rel)
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        if is_heading_only(text):
            heading_only.append(rel)

    if missing or heading_only:
        print("Contract documentation check FAILED.", file=sys.stderr)
        if missing:
            print("Missing:", file=sys.stderr)
            for item in missing:
                print(f"  - {item}", file=sys.stderr)
        if heading_only:
            print("Heading-only / empty:", file=sys.stderr)
            for item in heading_only:
                print(f"  - {item}", file=sys.stderr)
        return 1

    print("Contract documentation check PASSED.")
    print(f"Checked folder: {CONTRACT_DIR}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

