# 06 — Data Inventory

## Baseline inventory source
- `OUT/release_prep/2026-04-08T07-04-17Z/db_row_counts_before.txt`
- `OUT/release_prep/2026-04-08T07-04-17Z/data_grouped_stats.txt`
- `OUT/release_prep/2026-04-08T07-04-17Z/test_data_classification_raw.txt`

## Key baseline findings (before cleanup)
- Projects: **275**
- Project indicators: **271**
- Evidence items: **133**
- Recurring requirements: **259**
- Recurring instances: **239**
- Export jobs: **32**
- Print pack items: **45**
- Audit events: **1520**
- Users: **21**

## Data profile
- Large majority of operational rows were E2E/demo/test generated.
- Multiple E2E naming patterns existed (`E2E`, `local_*`, synthetic timestamped entities).
- Small set of baseline framework/reference entities required preservation for app bootstrap.
