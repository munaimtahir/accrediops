# UI Simplification Summary

## Summary

The main user interface has been simplified to provide a more focused and intuitive user experience.

## Sidebar Navigation

### Old Structure

The old sidebar had three main sections: "Operational", "Current project", and "Admin", with a long list of items in the "Admin" section.

### New Structure

-   The "Admin" section has been removed from the sidebar.
-   A new "Settings" item has been added, which is only visible to admin users. This item links to a new settings landing page at `/admin`.
-   The "Current project" section has been simplified to include only the main actions: "Dashboard", "Worklist", "Review / Inspection", and "Reports".
-   The visibility of the "Review / Inspection" item is now role-based.
-   Labels have been updated to be more user-friendly.

## Settings Landing Page

A new settings landing page has been created at `/admin`. This page displays the admin and technical links in a grouped card layout, making it easier to navigate.

## Project Dashboard

The project overview screen at `/projects/[projectId]` has been redesigned to be a more action-oriented dashboard.

-   The main actions in the `PageHeader` have been simplified.
-   Metric cards are now displayed at the top for a quick overview.
-   A new "Priority Work" section has been added to guide users to the most important tasks.
-   Guidance text has been added to help users understand the workflow.

## Testing

A Playwright test file, `frontend/tests/e2e/18_simplified_navigation_and_homepage.spec.ts`, has been added to verify the new UI and navigation. These tests are currently failing due to environment issues.
