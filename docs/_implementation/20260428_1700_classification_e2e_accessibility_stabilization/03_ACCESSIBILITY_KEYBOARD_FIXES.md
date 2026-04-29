# 03_ACCESSIBILITY_KEYBOARD_FIXES.md

## General Infrastructure
- **Skip Link:** Added a global "Skip to main content" link in `RootLayout`. It is visually hidden but appears on focus. It targets `#main-content`, ensuring keyboard users can bypass navigation.
- **Focus Ring:** Added a clear, consistent focus ring (`:focus-visible`) in `globals.css` using the project's primary blue color for high visibility.
- **Main Content Target:** Added `id="main-content"` and `tabIndex={-1}` to the main container of all core screens (Login, AppShell pages).

## Component Fixes
### Modals and Drawers
- **Focus Management:** Focus now moves to the first focusable element (or the container itself) upon opening.
- **TAB Trapping:** Implemented a robust focus trap that cycles through interactive elements within the modal/drawer.
- **ESC to Close:** Ensured the `Escape` key reliably triggers the `onClose` handler.
- **Focus Return:** Focus returns to the trigger element (e.g., the button that opened the modal) after closing.

### Forms and Inputs
- **Explicit Labels:** Replaced implicit labels with explicit `<label htmlFor="...">` and `<Input id="...">` associations.
- **Accessible Names:** Added `aria-label` to icon-only buttons or ambiguous inputs (e.g., selection checkboxes in tables).
- **Textarea Polish:** Improved accessibility of textareas in `IndicatorDrawer` and `IndicatorActionDialog`.

## Screen-Specific Improvements
- **Login:** Added `#main-content` and focus management for the sign-in form.
- **Classification Page:** Added unique IDs and labels for all filters and ensured the indicator selection checkbox has a descriptive ARIA label.
- **Indicator Drawer:** Improved accessibility of the recurring submission and approval forms.
