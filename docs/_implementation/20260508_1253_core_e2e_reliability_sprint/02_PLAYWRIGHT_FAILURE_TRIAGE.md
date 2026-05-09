# Phase 2 — Playwright Failure Triage

## Classified Failures

| Test file | Test name | Failure type | Product bug? | Root cause | Fix strategy | Priority |
|---|---|---|---|---|---|---|
| `core-journeys.spec.ts` | `admin override reopens met indicator and audit evidence is visible` | Seed/state issue or API mismatch | No | `metIndicatorId` is `undefined`, meaning the worklist API returned no `MET` indicators for the seeded project. | Investigate why `MET` indicators aren't returned or if the API response structure changed. | 1 |
| `workflow-guidance.spec.ts` | `worklist and recurring screens provide action guidance` | Stale text assertion | No | Heading "Recurring queue" changed to "Recurring evidence queue". | Update test to match the new UI heading. | 2 |
| `app-flows.spec.ts` | `post-login operational journey route opens from project home` | Race/timing issue (Flaky) | No | URL expectation failed, but passed on retry. | Improve wait/navigation logic. | 1 |
| `core-journeys.spec.ts` | `non-admin user cannot reopen met indicator` | Race/timing issue (Flaky) | No | Locator timeout during click, but passed on retry. | Use more stable selectors or improve wait logic. | 1 |

## Priority 1: Core Journeys
The `admin override` failure is high priority as it protects a core governance journey. The flaky tests in `app-flows` and `core-journeys` are also high priority to ensure CI reliability.

## Priority 2: UI Copy
The `workflow-guidance` failure is a simple fix to align the test with the current UI.
