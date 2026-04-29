# 02_CLEAN_SLATE_RESET.md

## Problem
Testing data (fake projects, indicators, evidence) was polluting the database, making it difficult to transition to real use cases. Existing reset commands were too destructive, purging permanent framework data.

## Solution
Enhanced the `reset_lab_state` Django management command to follow strict safety rules:
-   **Preservation:** Frameworks, Areas, Standards, Indicators, Master Lists, Users, and Policy Decisions are preserved.
-   **Purge:** operational data (Projects, ProjectIndicators, Evidence, AIUsageLogs, GeneratedOutputs, RecurringInstances) is deleted.
-   **Safety:** The command requires `--confirm` to execute; otherwise, it runs in `--dry-run` mode by default.
-   **Optional Reset:** `--reset-classifications` flag resets all framework indicators to `UNCLASSIFIED` status.

## Usage
```bash
# Dry run to see counts
python manage.py reset_lab_state --dry-run

# Execute full reset
python manage.py reset_lab_state --confirm

# Execute reset and clear AI classifications
python manage.py reset_lab_state --confirm --reset-classifications
```
