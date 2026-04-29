# 06 Seed strategy

## Chosen model

**Model A: global seeded baseline reused by suite**, plus per-test isolated LAB projects.

## Seed implementation

- Management command: `seed_e2e_state`
- Flags used by Playwright global setup:
  - `--clean-e2e-records`
  - `--ensure-client`
  - `--ensure-project`
  - `--initialize-project`
- Deterministic role users:
  - `pw_admin`
  - `pw_lead`
  - `pw_owner`
  - `pw_reviewer`
  - `pw_approver`
- Password (local/dev): `x`

## Rerun behavior

- Startup cleanup removes stale E2E/PW business records.
- Each test creates an isolated LAB project (`E2E_RUN_*`) to avoid state bleed.
- Role-specific Playwright auth states are rebuilt every run.
