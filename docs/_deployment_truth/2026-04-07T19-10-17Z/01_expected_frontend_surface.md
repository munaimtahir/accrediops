# Expected Frontend Surface (from prior realignment claims)

This is the operator-visible surface that should exist on live deployment:

## `/projects` expected cues
- Heading: **Project register**
- Primary card grid for projects (not table-primary)
- Prominent **Create project** CTA
- Per-card **Open project** action
- **Power view** table available only as secondary toggle

## `/projects/[projectId]` expected cues
- Project workspace summary with **Next step guidance**
- Workspace hierarchy sections visible:
  - **Areas**
  - **Standards**
  - **Indicators**
- Area → Standard → Indicator progressive interaction

## Indicator interaction expected cues
- Clicking an indicator card opens side drawer titled **Indicator workbench**
- Drawer sections visible:
  - Summary
  - Evidence
  - Recurring
  - Comments / Notes
  - Review / Governance
  - Actions

## Navigation / role expectations
- Admin surfaces remain available but secondary
- Role-gated CTAs are disabled/hidden with explanation where applicable

