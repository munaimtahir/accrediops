# UI Improvement Plan (Remaining UX Risks Closure)

## Scope
Close the three residual UX risks from the prior UI discovery verdict:
1. indicator detail cognitive load,
2. weak inline permission context,
3. inconsistent first-entry onboarding hints.

## Improvements applied

### 1) Indicator progressive disclosure completed
- **Issue found:** Indicator page remained dense even after first-pass hierarchy improvements.
- **Improvement applied:** Completed section-based progressive disclosure using explicit section switcher (`Readiness`, `Summary`, `Operations`, `Evidence`, `Recurring`, `AI`, `Commands`, `Governance`) with focused rendering per active panel.
- **Files changed:** `frontend/components/screens/indicator-detail-screen.tsx`
- **Expected UX benefit:** Operators can focus on one workflow phase at a time with lower cognitive overhead.

### 2) Inline permission help expanded
- **Issue found:** Some role restrictions were still only implied via disabled controls/tooltips.
- **Improvement applied:** Added explicit `PermissionHint` messaging inside indicator evidence/recurring/commands sections clarifying required roles per action group.
- **Files changed:** `frontend/components/screens/indicator-detail-screen.tsx`, `frontend/components/common/permission-hint.tsx`
- **Expected UX benefit:** Users understand *why* actions are unavailable and which role can execute them.

### 3) First-entry onboarding normalized across key screens
- **Issue found:** “what to do next” guidance was uneven across execution and diagnostics screens.
- **Improvement applied:** Added reusable dismissible onboarding callouts across worklist, recurring queue, readiness, inspection, export history, and indicator detail.
- **Files changed:**
  - `frontend/components/common/onboarding-callout.tsx`
  - `frontend/components/screens/project-worklist-screen.tsx`
  - `frontend/components/screens/project-recurring-screen.tsx`
  - `frontend/components/screens/project-readiness-screen.tsx`
  - `frontend/components/screens/project-inspection-screen.tsx`
  - `frontend/components/screens/project-export-history-screen.tsx`
  - `frontend/components/screens/indicator-detail-screen.tsx`
- **Expected UX benefit:** First-time and occasional operators get consistent “next action” framing without relearning each page.

### 4) Recurring evidence linkage clarity in indicator modal
- **Issue found:** Indicator-level recurring submission still relied on manual evidence ID entry.
- **Improvement applied:** Added evidence dropdown in recurring submit modal (falls back to numeric input only when no evidence exists).
- **Files changed:** `frontend/components/screens/indicator-detail-screen.tsx`
- **Expected UX benefit:** Reduced input friction and fewer submission mistakes.

### 5) E2E resilience adjustments for updated UI affordances
- **Issue found:** New panel navigation and duplicated action labels introduced selector ambiguity in E2E.
- **Improvement applied:** Stabilized Playwright flows by targeting exact panel buttons, form submit buttons in dialogs, and main-content export links.
- **Files changed:** `frontend/tests/e2e/core-journeys.spec.ts`
- **Expected UX benefit:** Reliable regression detection for real operator journeys after UX refinements.
