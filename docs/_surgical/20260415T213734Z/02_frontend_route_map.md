# 02 — Frontend Route Map (System Truth)

Source: `frontend/app/**/page.tsx`, `middleware.ts`, `components/layout/sidebar.tsx`, screen-level CTAs.

Middleware-protected prefixes: `/projects`, `/project-indicators`, `/frameworks`, `/admin`.

| Route | Page | Purpose | Role access | Linked from UI |
|---|---|---|---|---|
| `/` | `app/page.tsx` | Root entry (redirect flow) | Public | yes (app entry) |
| `/login` | `app/login/page.tsx` | Sign-in screen | Public | yes (redirect target) |
| `/projects` | `app/(workbench)/projects/page.tsx` | Project register + create/manage | Any authenticated; create gated ADMIN/LEAD | yes (sidebar) |
| `/projects/[projectId]` | `.../projects/[projectId]/page.tsx` | Project home/overview | Any authenticated | yes |
| `/projects/[projectId]/worklist` | `.../worklist/page.tsx` | Main indicator workbench | Any authenticated | yes |
| `/projects/[projectId]/pending-actions` | `.../pending-actions/page.tsx` | Printable pending actions | Any authenticated | yes |
| `/projects/[projectId]/recurring` | `.../recurring/page.tsx` | Recurring queue + submit | Any authenticated | yes |
| `/projects/[projectId]/standards-progress` | `.../standards-progress/page.tsx` | Standards progress | Any authenticated | yes |
| `/projects/[projectId]/areas-progress` | `.../areas-progress/page.tsx` | Areas progress | Any authenticated | yes |
| `/projects/[projectId]/inspection` | `.../inspection/page.tsx` | Inspection mode (MET-focused) | Any authenticated | yes |
| `/projects/[projectId]/print-pack` | `.../print-pack/page.tsx` | Print pack output | Any authenticated | yes |
| `/projects/[projectId]/client-profile` | `.../client-profile/page.tsx` | Linked client profile context | Any authenticated | yes |
| `/projects/[projectId]/readiness` | `.../readiness/page.tsx` | Readiness score + risk summary | ADMIN/LEAD (UI gate + restriction state) | yes (visible; disabled for restricted) |
| `/projects/[projectId]/exports` | `.../exports/page.tsx` | Export history + generate | ADMIN/LEAD (UI gate + restriction state) | yes (visible; disabled for restricted) |
| `/project-indicators/[id]` | `.../project-indicators/[id]/page.tsx` | Indicator detail workbench | Any authenticated; actions role-gated | yes (worklist/recurring/project links) |
| `/frameworks/[id]/analysis` | `.../frameworks/[id]/analysis/page.tsx` | Framework analysis | Any authenticated | yes (from Admin Frameworks screen) |
| `/admin` | `.../admin/page.tsx` | Admin dashboard | ADMIN/LEAD via `AdminAreaGuard` | yes (sidebar; visible disabled for restricted roles) |
| `/admin/users` | `.../admin/users/page.tsx` | User administration | ADMIN/LEAD | yes |
| `/admin/client-profiles` | `.../admin/client-profiles/page.tsx` | Client profile administration | ADMIN/LEAD | yes |
| `/admin/audit` | `.../admin/audit/page.tsx` | Audit log explorer | ADMIN/LEAD | yes |
| `/admin/overrides` | `.../admin/overrides/page.tsx` | Reopen override audit feed | ADMIN/LEAD | yes |
| `/admin/frameworks` | `.../admin/frameworks/page.tsx` | Framework admin/import | ADMIN/LEAD | yes |
| `/admin/import-logs` | `.../admin/import-logs/page.tsx` | Framework import logs | ADMIN/LEAD | yes |
| `/admin/system-health` | `.../admin/system-health/page.tsx` | System health view | ADMIN/LEAD | yes |
| `/admin/masters/statuses` | `.../masters/statuses/page.tsx` | Master status values | ADMIN/LEAD | yes |
| `/admin/masters/priorities` | `.../masters/priorities/page.tsx` | Master priority values | ADMIN/LEAD | yes |
| `/admin/masters/evidence-types` | `.../masters/evidence-types/page.tsx` | Master evidence types | ADMIN/LEAD | yes |
| `/admin/masters/document-types` | `.../masters/document-types/page.tsx` | Master document types | ADMIN/LEAD | yes |

## Route visibility notes

1. Admin/readiness/exports are now visible to all authenticated users in navigation; restricted roles see disabled entries with explicit rationale.
2. Indicator entry points are exposed through worklist tiles, recurring queue links, and project home CTAs.
3. Restricted routes render explicit guidance states (not blank screens).
