# 05 LAB framework integrity

## Integrity checks

- LAB exists in `/api/frameworks/` and admin framework UI.
- Framework analysis endpoint reports `total_indicators = 119`.
- Hierarchy count is stable at:
  - Areas: 10
  - Standards: 37
  - Indicators: 119

## Enforcement mechanism

- `reset_lab_state` rebuilds LAB and hard-enforces exact indicator count.
- Playwright coverage includes LAB integrity assertions (`01_lab_framework_integrity.spec.ts`).
