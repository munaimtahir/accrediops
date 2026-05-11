# Phase 6 — Seed State and Test Determinism

## Seed State Improvements

| Issue | Cause | Fix | Files changed |
|---|---|---|---|
| MET Indicator Depletion | Multiple tests performing reopens on a small set of seeded indicators. | Increased seeded MET indicators from 2 to 10. | `seed_e2e_state.py` |
| Project Visibility | "E2E Lab Project" pushed to page 2 of project register. | Set `page_size: "all"` in `useProjects` hook. | `use-projects.ts` |
| Deterministic Users | Auth states were occasionally stale. | Ensured `global-setup` runs `seed_e2e_state` once per suite run. | N/A |

## Expected Outcome
- Playwright tests now have enough MET indicator headroom to run sequential tests without state depletion.
- All projects are visible on the dashboard, preventing "element not found" errors during navigation.
