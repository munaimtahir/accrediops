# CAPA Dashboard Information Architecture

Timestamp: 2026-05-16 21:42 UTC

## Route
- Proposed: `/projects/:projectId/capa`
- Subviews (tabs or segmented controls):
  - Dashboard
  - Board
  - My Tasks

## Dashboard Cards (Clickable/Filterable)
- Open CAPA
- In Progress
- Submitted for Review
- High Risk
- Overdue
- Export Blockers
- Closed CAPA
- Assigned to Me

## Main Sections
1. CAPA requiring my action
2. CAPA blocking final export
3. High-risk CAPA
4. Overdue CAPA
5. Recently closed CAPA

## Board Columns (Grouped by Status)
- Open
- In Progress
- Submitted for Review
- Closed
- Rejected
- Cancelled

## Card Fields
- CAPA title
- Linked indicator code
- Linked evidence requirement
- Severity
- Responsible person
- Due date
- Overdue badge
- Export blocker badge
- Status badge

## Actions (Permission/Capability-gated)
- View
- Edit
- Submit
- Close
- Reject

## Management Filters
- Status, severity, responsible person
- Due date range, overdue toggle
- Export blocker toggle
- Linked indicator, evidence requirement
- Gap source

## Search
- CAPA title
- Indicator code
- Requirement title
- Responsible person

