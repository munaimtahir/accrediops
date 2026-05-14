# Export Readiness Repair Plan

This document outlines the plan for repairing the export eligibility and print-bundle services.

## 1. Problem Analysis

The baseline test run confirmed that `pytest` failed with multiple assertion errors in `ExportEligibilityReportTests`. The root cause was identified as the `export_eligibility_report` service in `backend/apps/exports/services.py`, which had several issues:

*   **Reliance on Mock Data:** It depended on a service (`project_readiness` from `services_admin.py`) that was mocked in tests and provided unreliable, placeholder data.
*   **Inconsistent Logic:** It mixed data from the mock service with separate, inconsistent checks for pending indicators and other blockers.
*   **Incorrect Summary Data:** The data it returned, which was consumed by other services like `build_print_bundle`, was often incorrect (e.g., hardcoded `met_indicators: 0`), causing failures in downstream tests.

## 2. The Repair Strategy

The plan was to refactor `export_eligibility_report` to make it deterministic and based on the true state of the database.

1.  **Remove Mock Dependency:** Eliminate the call to the `project_readiness` service entirely.
2.  **Elevate Canonical Readiness Service:** Use `calculate_project_evidence_readiness` (from `backend/apps/evidence/services.py`) as the single source of truth for the readiness of `ProjectEvidenceRequirement` objects. This service was found to be well-implemented and correctly identified mandatory blockers.
3.  **Rewrite Eligibility Logic:** The core eligibility check (`eligible: True/False`) was rewritten to be based on two simple, reliable inputs:
    *   The `export_ready` flag from `calculate_project_evidence_readiness`, which correctly checks if all mandatory requirements are `APPROVED` or `NOT_APPLICABLE`.
    *   The output of `export_validation_warnings`, which checks for other data integrity issues.
4.  **Populate Summary Data:** The summary dictionary (`readiness_summary`) within the report was fixed to populate its fields (e.g., `met_indicators`) with real data queried directly from the database, instead of using hardcoded placeholders.
5.  **Refactor Tests:** The corresponding test file, `backend/apps/exports/tests/test_services.py`, was to be heavily refactored to remove the obsolete mocks and to test the new, deterministic logic by creating specific data states for each test case.

This plan directly addressed the root causes of the failures identified in the baseline analysis.
