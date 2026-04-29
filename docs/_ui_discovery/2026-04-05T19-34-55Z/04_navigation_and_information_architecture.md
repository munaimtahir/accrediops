# Navigation and Information Architecture Review

## Navigation findings
- Projects is correctly the core entry point.
- Admin and project-specific links were present but lacked explicit structural grouping.
- Role context was implicit rather than visible.

## Changes implemented
- Sidebar now has explicit groups:
  - **Operational**
  - **Current project**
  - **Admin** (role-gated)
- Added persistent **“Viewing as ROLE”** context in sidebar.
- Topbar now includes user role in identity chip.
- Improved page label mapping for exports/print-pack/readiness/inspection/admin routes.

## IA outcome
- Operational vs admin separation is now visually explicit.
- Current project surfaces are easier to identify as a dedicated sub-domain.
- Role context is visible at all times, reducing permission confusion.
