# Baseline and Scope

This document establishes the starting conditions and scope for the "E2E Environment Hardening & ZIP Export Verification Sprint".

## 1. Previous Sprint Context

The preceding "Evidence Bridge Test Hardening Sprint" concluded with a `CONDITIONAL GO` verdict. Key achievements included:
- Stabilized backend logic for export eligibility.
- Backend and frontend tests passed.
- Frontend verification was green.
- E2E tests were *partially* working, but the environment setup and approval flow had persistent issues. The main blocker was the lack of a deterministic E2E seed process for the "PHC LAB" framework, and an unresolved backend API issue preventing status persistence.

## 2. Current Verified Status (from previous sprint)

-   **Migration Drift:** Fixed (already resolved).
-   **`makemigrations --check --dry-run`:** Passes.
-   **`migrate`:** Passes.
-   **`EvidenceRequirementSuggestion`:** Clean and canonical.
-   **Export Eligibility:** Uses real, deterministic state.
-   **Print-bundle / Inspection Views:** Stable.
-   **Backend Tests:** 121/121 targeted tests pass.
-   **Frontend Verification:** Lint, typecheck, build, unit tests pass.
-   **E2E Blocked:** Playwright tests failed due to backend API issues preventing requirement approval persistence (backend returns 200 OK with stale data) and pre-existing recurring workflow/AI doc test failures. The seed command was created and integrated.
-   **CAPA:** Placeholder-level only.
-   **Final ZIP Export:** Deferred/partial/unverified.

## 3. Sprint Goals for "E2E Environment Hardening & ZIP Export Verification Sprint"

The main purpose of this sprint is to make the E2E test environment self-contained and reliable, and to verify the final export path.

### Core Goals:

1.  **Self-Contained E2E Environment:**
    *   Establish a deterministic command to seed the E2E test database, ensuring the "PHC LAB" framework and all its necessary constituent data exist.
    *   Repair Playwright's global setup (`global-setup.cjs`) to reliably use this seeding mechanism.
    *   Fix E2E tests related to the evidence bridge approval flow, specifically the backend persistence issue.
2.  **Verify Final Export Path:**
    *   Investigate the current state of the final ZIP export functionality.
    *   Determine if it's implemented, partial, or missing.
    *   If implemented, test its behavior (eligibility blocking, artifact creation).
    *   Clearly document the ZIP export's status and any remaining limitations.

### Product Identity to Preserve:

*   AccrediOps is a framework-first, indicator-driven, evidence-based accreditation operating system.
*   Core chain: Framework → Area / Standard → Indicator → Evidence Requirement → Project Evidence Fulfillment → Generated Draft / Uploaded Evidence → Review / Approval → Readiness → Inspection Pack / Export.
*   AI remains advisory only.

## 4. Scope Lock

*   **Do not ask for confirmation.**
*   **Do not stop after planning.**
*   **Do not start unrelated features.**
*   **Do not build full CAPA in this sprint.**
*   **Do not redesign frontend UI.**
*   **Do not change Caddy, DNS, production routing, or unrelated server apps.**
*   **Do not delete tests to force success.**
*   **Do not hide failures.**

This sprint focuses on E2E stability and export verification, not extensive feature development.
