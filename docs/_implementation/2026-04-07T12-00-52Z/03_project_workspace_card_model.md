# Project Workspace Card Model

## Projects Home (`/projects`)
- Primary: card grid with project name, client, framework, status semantic badge, progress, quick open.
- Primary CTA: Create project (role-gated).
- Secondary: optional "Power view" table toggle for dense power usage.
- Empty state and role guidance preserved.

## Project Workspace (`/projects/[projectId]`)
- Pathway cards retained for Operate / Readiness / Export contexts.
- Embedded workspace board as primary operational hierarchy.

## Hierarchy Board (`ProjectWorkspaceBoard`)
- Areas as first-level selection cards:
  - area code/name
  - standards count
  - indicator count
  - progress/readiness percentages
- Standards as second-level cards scoped by selected area:
  - standard code/name
  - met/total
  - in-review
  - blocked/overdue summary
- Indicators as third-level compact status cards scoped by selected standard:
  - code + text
  - status visual label
  - evidence approved/total
  - recurring pending/overdue
  - click opens indicator drawer

## Navigation Properties
- Progressive disclosure prevents dense walls of detail.
- Workspace helper block provides quick links to compact worklist and recurring queue.
- Core update intent stays in context (no mandatory route transitions for normal indicator updates).

