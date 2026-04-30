# Comprehensive Testing Plan: Indicators Service Layer

## 1. Overview
This plan outlines the testing strategy for the `indicators` app service layer in the AccrediOps project. The goal is to ensure high reliability and coverage of the core business logic governing indicator workflows, assignments, and readiness assessments.

## 2. Test Environment
- **Framework:** `pytest` with `pytest-django`.
- **Database:** SQLite (in-memory for tests).
- **Dependencies:** All dependencies listed in `backend/requirements.txt`.

## 3. Scope of Testing

### 3.1. Assignment and Access Control
- **`assign_project_indicator`**
    - **Happy Path:** Admin/Lead can assign owner, reviewer, and approver with valid roles.
    - **Edge Case:** Assigning a user with an incorrect role (e.g., assigning a REVIEWER as an OWNER) should raise a `ValidationError`.
    - **Permission:** Non-Admin/Lead users should be denied access (`PermissionDenied`).
    - **Updates:** Verify that priority, due date, and notes are updated correctly.

- **`update_project_indicator_working_state`**
    - **Happy Path:** Assigned OWNER can update notes, due date, and priority.
    - **Permission:** Users other than the OWNER (or Admin/Lead) should be denied access.

### 3.2. Workflow Transitions
- **`start_project_indicator`**
    - **Happy Path:** Transition from `NOT_STARTED` to `IN_PROGRESS`.
    - **Permission:** Restricted to assigned OWNER or Admin/Lead.

- **`send_project_indicator_for_review`**
    - **Happy Path:** Transition from `IN_PROGRESS` to `UNDER_REVIEW` when notes or evidence exist.
    - **Edge Case:** Prevent transition if no work (notes or evidence) is present (`ValidationError`).
    - **Permission:** Restricted to assigned OWNER or Admin/Lead.

- **`mark_project_indicator_met`**
    - **Happy Path:** Transition to `MET` when all readiness conditions are met.
    - **Edge Case:** Prevent transition if readiness conditions fail (e.g., missing evidence) (`ValidationError`).
    - **Permission:** Restricted to assigned APPROVER or Admin/Lead.

- **`reopen_project_indicator`**
    - **Happy Path:** Transition back to `IN_PROGRESS`.
    - **Edge Case:** Prevent reopening without a reason (`ValidationError`).
    - **Permission:** Restricted to ADMIN only.

### 3.3. Readiness and Progress Calculations
- **`validate_project_indicator_readiness`**
    - Verify correct counting of approved/rejected/missing evidence.
    - Verify `ready_for_met` correctly evaluates the combination of minimum evidence and approval status.
    - Verify recurring requirements are correctly factored in.

- **`standards_progress` & `areas_progress`**
    - Verify percentages and counts across multiple indicators in different states.
    - Ensure blocked and overdue indicators are correctly identified in the risk/readiness scores.

### 3.4. Audit and Comments
- **`add_project_indicator_comment`**
    - Verify comment types (Working, Review, Approval) are restricted to the appropriate roles.
- **Audit Logging**
    - Ensure `log_audit_event` is called for every state-changing service call.

## 4. Execution Strategy
1. **Unit Tests:** Focus on service functions in isolation using mocks where necessary, though Django's `TestCase` with a test DB is preferred for service layer integrity.
2. **Regression Testing:** Run the full suite after any change to ensure existing API contracts remain valid.
3. **Data Integrity:** Use factories or the `ContractBaseTestCase` setup to ensure consistent test data.
