# 05 Role Visibility Matrix

> Historical parity snapshot: role discoverability matrix remains valid; runtime port has since been reassigned to `18080`.

Frontend discoverability matrix after parity fixes (governance-safe alignment to backend ADMIN/LEAD authority for touched surfaces):

| Surface / Action | ADMIN | LEAD | OWNER |
|---|---|---|---|
| Admin sidebar section | Visible | Visible | Hidden |
| Admin route access UX | Allowed | Allowed | Restricted state / redirected by guard |
| Create Project CTA | Enabled | Enabled | Disabled with reason |
| Readiness CTA visibility | Enabled | Enabled | Hidden or disabled with explicit restriction message |
| Export history CTA visibility | Enabled | Enabled | Hidden or disabled with explicit restriction message |
| Readiness route UX | Allowed | Allowed | Restricted state (no predictable 403 trap) |
| Export history route UX | Allowed | Allowed | Restricted state (no predictable 403 trap) |
| Framework validate action | Enabled with valid inputs | Enabled with valid inputs | Not exposed in allowed admin flow |

Restriction messaging source:
- `getRestrictionMessage(feature)` in `frontend/lib/authz.ts`
