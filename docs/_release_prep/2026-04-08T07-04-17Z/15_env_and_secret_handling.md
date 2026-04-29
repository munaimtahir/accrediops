# 15 — Env and Secret Handling

## Environment posture
- Backend and frontend runtime envs are explicitly configured in compose.
- Public frontend env does not expose backend secrets.
- `NEXT_PUBLIC_API_BASE_URL` remains blank for same-origin API usage.

## Secret handling
- Audits were captured in redacted form (`env_audit_redacted.txt`).
- No secrets were added to committed source as part of this sprint.

## Remaining note
- `.env` values are loaded by Django; operational secret rotation policy remains an ops concern outside this code sprint.
