#!/usr/bin/env python3
from __future__ import annotations

import sys
import re
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

PLACEHOLDER_RE = re.compile(r"\b(todo|tbd|fixme|fill[- ]?later|placeholder)\b", re.IGNORECASE)

# Minimum non-empty, non-heading lines expected per file (rough “not heading-only” guard).
# These thresholds are intentionally low to avoid false positives while still catching empty shells.
MIN_MEANINGFUL_LINES: dict[str, int] = {
    "INDEX.md": 5,
    "00_CONTRACT_OVERVIEW.md": 6,
    "01_API_ROUTE_CONTRACT.md": 20,
    "02_FRONTEND_SCREEN_CONTRACT.md": 12,
    "03_FRONTEND_ACTION_TO_BACKEND_MAP.md": 10,
    "04_BACKEND_ENDPOINT_TO_FRONTEND_MAP.md": 10,
    "05_DATA_FIELD_CONTRACT.md": 8,
    "06_RBAC_CAPABILITY_CONTRACT.md": 10,
    "07_STATUS_WORKFLOW_CONTRACT.md": 8,
    "08_TESTING_CONTRACT.md": 8,
    "09_DRIFT_PREVENTION_RULES.md": 8,
    "10_CONTRACT_GAPS_AND_DECISIONS.md": 8,
}

TABLE_REQUIRED = {
    "01_API_ROUTE_CONTRACT.md",
    "02_FRONTEND_SCREEN_CONTRACT.md",
    "03_FRONTEND_ACTION_TO_BACKEND_MAP.md",
    "04_BACKEND_ENDPOINT_TO_FRONTEND_MAP.md",
    "06_RBAC_CAPABILITY_CONTRACT.md",
    "07_STATUS_WORKFLOW_CONTRACT.md",
}


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


def meaningful_line_count(text: str) -> int:
    count = 0
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped:
            continue
        if stripped.startswith("#"):
            continue
        count += 1
    return count


def has_placeholder(text: str) -> bool:
    return PLACEHOLDER_RE.search(text) is not None


def has_markdown_table(text: str) -> bool:
    lines = [line.rstrip("\n") for line in text.splitlines()]
    for idx, line in enumerate(lines[:-1]):
        if "|" not in line:
            continue
        next_line = lines[idx + 1].strip()
        if "|" in next_line and re.match(r"^\|?\s*:?-{3,}", next_line):
            return True
    return False


def main() -> int:
    if not CONTRACT_DIR.exists():
        print(f"CONTRACT_DIR missing: {CONTRACT_DIR}", file=sys.stderr)
        return 2

    missing: list[str] = []
    heading_only: list[str] = []
    placeholders: list[str] = []
    too_short: list[str] = []
    missing_table: list[str] = []

    for rel in REQUIRED_FILES:
        path = CONTRACT_DIR / rel
        if not path.exists():
            missing.append(rel)
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        if is_heading_only(text):
            heading_only.append(rel)
            continue
        if has_placeholder(text):
            placeholders.append(rel)
        min_lines = MIN_MEANINGFUL_LINES.get(rel, 5)
        if meaningful_line_count(text) < min_lines:
            too_short.append(rel)
        if rel in TABLE_REQUIRED and not has_markdown_table(text):
            missing_table.append(rel)

    if missing or heading_only or placeholders or too_short or missing_table:
        print("Contract documentation check FAILED.", file=sys.stderr)
        if missing:
            print("Missing:", file=sys.stderr)
            for item in missing:
                print(f"  - {item}", file=sys.stderr)
        if heading_only:
            print("Heading-only / empty:", file=sys.stderr)
            for item in heading_only:
                print(f"  - {item}", file=sys.stderr)
        if placeholders:
            print("Placeholders (TODO/TBD/etc):", file=sys.stderr)
            for item in placeholders:
                print(f"  - {item}", file=sys.stderr)
        if too_short:
            print("Too few meaningful lines:", file=sys.stderr)
            for item in too_short:
                print(f"  - {item}", file=sys.stderr)
        if missing_table:
            print("Expected a markdown table but none found:", file=sys.stderr)
            for item in missing_table:
                print(f"  - {item}", file=sys.stderr)
        return 1

    print("Contract documentation check PASSED.")
    print(f"Checked folder: {CONTRACT_DIR}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
