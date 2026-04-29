# 04_PLAYWRIGHT_TESTS_ADDED.md

## New Accessibility Coverage
- **Skip Link Verification:** Confirmed that the skip-to-main-content link is the first TAB target on both the Login page and the Dashboard.
- **Login Flow Accessibility:** Verified that keyboard users can TAB through the username and password fields and submit using ENTER.
- **Classification Route Accessibility:**
  - Verified that filter inputs have accessible labels.
  - Verified that indicator selection checkboxes have unique `aria-label` values containing the indicator code.
  - Verified keyboard focus movement between filters.

## Stabilized Existing Tests
- **Focus Trapping:** Enhanced tests for modals and drawers to verify that focus remains trapped while they are open.
- **Focus Return:** Added assertions to ensure focus returns to the initiating button after a modal/drawer is closed.
- **Keyboard Shortcuts:** Verified that `Escape` closes active overlays.

## List of Specific Tests Verified
- `tests/e2e/19_accessibility.spec.ts`:
  - `TAB through login form and ENTER submits`
  - `dashboard exposes skip link and keyboard-reachable main actions`
  - `recurring approve modal traps focus, closes with ESC, and submits with ENTER`
  - `classification route has accessible filter labels and row selection` (NEW)
- `tests/e2e/20_indicator_classification_workflow.spec.ts`:
  - `admin reviews, edits, approves, and filters saved classifications`
