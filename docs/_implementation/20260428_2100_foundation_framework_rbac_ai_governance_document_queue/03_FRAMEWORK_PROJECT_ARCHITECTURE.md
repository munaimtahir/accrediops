# 03_FRAMEWORK_PROJECT_ARCHITECTURE.md

## Corrected Model Relationships
-   **Framework:** Owns the source of truth for indicators, areas, standards, and AI classification. It is a permanent template.
-   **Project:** A client-specific instance linked to an active Framework. It own projects-specific metadata (client name, dates) and its own `ProjectIndicator` working records.

## Backend Changes
-   Modified `import_framework_checklist` to take an existing `Framework` instance.
-   Updated `FrameworkImportCreateView` and `FrameworkImportValidateView` to use `framework_id` instead of `project_id`.
-   Enforced that project creation requires selecting a framework.

## Frontend Changes
-   The "Framework Management" page now handles all CSV imports and validation at the framework level.
-   "Create Project" form requires selecting a framework before initialization.
-   Updated sidebar and headers to reflect the distinction between managing global frameworks and operating specific projects.
