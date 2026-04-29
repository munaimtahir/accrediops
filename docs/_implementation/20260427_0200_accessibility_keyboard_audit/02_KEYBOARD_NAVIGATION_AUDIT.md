# Keyboard Navigation Audit

## Summary of Findings

Overall, the application is usable via keyboard, but there are significant polish issues regarding focus visibility and modal interaction that impact the experience for power users and those relying on keyboard-only navigation.

## 1. Login Screen
- **Expected Flow:** Tab to username -> input -> tab to password -> input -> tab to sign in -> enter.
- **Actual Flow:** Order is correct.
- **Issues:** Focus ring on inputs is subtle (border color only).
- **Severity:** LOW

## 2. Project Dashboard
- **Expected Flow:** Tab through sidebar -> main actions -> priority work cards.
- **Actual Flow:** Tab order follows visual flow.
- **Issues:** Focus ring on sidebar links is not visible. Focus ring on dashboard action buttons is missing.
- **Severity:** MEDIUM

## 3. Worklist
- **Expected Flow:** Tab to filters -> tab to indicator cards -> enter to open drawer.
- **Actual Flow:** Works, but cards are large and tabbing through many indicators is tedious.
- **Issues:** No "Skip to main content" link. Focus indicator on indicator cards is non-existent.
- **Severity:** HIGH (Focus visibility)

## 4. Recurring Queue
- **Expected Flow:** Tab to "Open indicator" -> tab to "Submit" -> tab to "Approve".
- **Actual Flow:** Order is correct.
- **Issues:** Focus visibility on buttons.
- **Severity:** MEDIUM

## 5. Indicator Detail + AI Assist
- **Expected Flow:** Tab through section buttons -> tab through content fields.
- **Actual Flow:** Section buttons work well.
- **Issues:** Focus visibility. When switching panels, focus remains on the button, which is correct, but if content changes significantly, the user might need to re-orient.
- **Severity:** LOW

## 6. Modals & Drawers (Global)
- **Expected Flow:** Open modal -> focus moves to first input -> TAB stays inside modal -> ESC closes modal -> focus returns to triggering button.
- **Actual Flow:** ESC works (via custom logic or browser default). Focus does NOT move to first input automatically. TAB does NOT stay inside modal (can tab out into the background). Focus does NOT return to triggering button consistently.
- **Issues:** Focus trapping is missing. Focus management on open/close is missing.
- **Severity:** HIGH

## 7. Disabled Buttons
- **Expected Flow:** Reachable via TAB if they provide info (via tooltip), but clearly marked as non-interactive.
- **Actual Flow:** Standard `disabled` attribute skips them in the TAB order.
- **Issues:** Users might not know why an action is unavailable if they can't even reach it to see the `title` attribute.
- **Severity:** LOW
