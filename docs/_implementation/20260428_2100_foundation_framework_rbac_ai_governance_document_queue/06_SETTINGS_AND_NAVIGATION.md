# 06_SETTINGS_AND_NAVIGATION.md

## Unified Settings Experience
All administrative and configuration pages now follow a consistent layout and navigation pattern.

### Settings Page Header
A new `SettingsPageHeader` component was implemented to provide:
-   **Contextual Title:** Clear heading for the current administrative task.
-   **Navigation Back:** A prominent "Back to Settings" button/link that returns the user to the main Admin dashboard.
-   **Landmark Labels:** Correct ARIA eyebrow labels (e.g., "Admin") for screen readers.

## Navigation Improvements
-   **Sidebar Links:** Added "AI Classification" to the main sidebar for quick access by Admin/Lead users.
-   **Breadcrumb Consistency:** Ensured that settings subpages do not feel like "dead ends" in the UI.
-   **Keyboard Access:** The "Back to Settings" button is fully reachable via keyboard TAB navigation.
