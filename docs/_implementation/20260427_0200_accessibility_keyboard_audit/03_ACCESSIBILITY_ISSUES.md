# Accessibility Issues

## 1. Labels and Associations
- **Issue:** Some inputs in filter bars and modals use `p` or `span` tags as labels without `id` and `htmlFor` association.
- **Impact:** Screen readers may not announce the purpose of the input when it receives focus.
- **Severity:** MEDIUM

## 2. Focus Visibility
- **Issue:** The global focus ring (`outline`) is often suppressed or too subtle.
- **Impact:** Keyboard users cannot see where they are on the page.
- **Severity:** HIGH

## 3. Modal and Drawer Semantics
- **Issue:** Modals lack `aria-modal="true"` and appropriate `role="dialog"` attributes.
- **Impact:** Assistive technology might not recognize the modal as a separate context, leading to confusion when navigating outside it.
- **Severity:** MEDIUM

## 4. Navigation Landmarks
- **Issue:** The sidebar uses a `nav` element but lacks an `aria-label` to distinguish it from other navigation areas.
- **Impact:** Screen reader users navigating by landmarks might find it hard to identify specific sections.
- **Severity:** LOW

## 5. Skip Links
- **Issue:** No "Skip to main content" link at the start of the page.
- **Impact:** Keyboard users must tab through the entire sidebar on every page reload to reach the content.
- **Severity:** MEDIUM

## 6. Icon Buttons
- **Issue:** Some icon buttons (if any exist without text) might lack `aria-label`.
- **Impact:** Screen readers will announce "button" without purpose.
- **Severity:** MEDIUM
