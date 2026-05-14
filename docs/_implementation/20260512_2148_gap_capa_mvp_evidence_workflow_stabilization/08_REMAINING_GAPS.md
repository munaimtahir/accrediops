# Remaining Gaps

This document identifies the gaps remaining after the "Gap and CAPA MVP + Evidence Workflow Stabilization Sprint".

## 1. Final ZIP Export
-   **Gap:** The actual generation of a physical ZIP file containing the inspection pack and evidence items is not yet implemented.
-   **Status:** The data structure for the "print bundle" is complete and verified, including CAPA reports, but the packaging layer is missing.
-   **Next step:** Implement a ZIP utility in the `exports` app to bundle the evidence files and the project summary.

## 2. Advanced CAPA Features
-   **Gap:** The current CAPA implementation is an MVP focusing on core lifecycle states and readiness integration.
-   **Missing:** Advanced analytics, automated notifications, and AI-driven predictive gap analysis.

## 3. Recurring Workflow stabilization
-   **Gap:** Pre-existing E2E failures in the recurring workflow queue remain unaddressed.
-   **Next step:** Dedicated stabilization sprint for recurring requirements.

## 4. Frontend CAPA Creation Modals
-   **Gap:** While the backend supports CAPA creation and the frontend displays status badges, the actual creation forms (modals) were not fully built out in this MVP sprint to keep UI complexity low.
-   **Status:** Creation is currently supported via API/E2E but requires manual UI integration.

## 5. Production Readiness
-   **Gap:** Full performance benchmarking, security hardening of new API endpoints, and production-specific caddy/deployment configuration updates were out of scope.
