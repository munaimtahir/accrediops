# PHASE 6 — EXPORT FORMAT AND HISTORY

This document details the implementation of the chosen export format for the Inspection Pack.

## Export Format

| Export type           | Implemented? | Notes                                                                                                                                                                                                               |
| :-------------------- | :----------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Print-friendly page   | Yes          | The Inspection Pack Preview page (`frontend/components/screens/project-print-pack-screen.tsx`) has been enhanced to be print-friendly. A "Print" button has been added, and basic `@media print` CSS styles are applied globally. |
| Export history        | Yes          | The backend already supports `ExportJob` for tracking export history. The UI is currently a preview, not a final download that would create a new history entry.                                                                 |
| JSON export           | No           | The underlying API (`/api/exports/projects/{project_id}/print-bundle/`) returns a JSON payload. This is the source for the UI, but a direct JSON download option is not yet exposed to the user.                      |
| CSV export            | No           | Not implemented in this phase.                                                                                                                                                                              |
| ZIP export            | No           | Not implemented in this phase.                                                                                                                                                                              |
| PDF export            | No           | Not implemented in this phase, as per instruction to not overbuild PDF generation unless existing tooling is present.                                                                                       |

## Implementation Details

### Frontend (`frontend/components/screens/project-print-pack-screen.tsx`)

-   **Print Button:** A new `Button` with the text "Print" and `variant="outline"` has been added to the `PageHeader` actions.
-   **Functionality:** Clicking this button triggers `window.print()`, leveraging the browser's native print capabilities.

### Global CSS (`frontend/app/globals.css`)

-   **`@media print` Styles:** Basic print-specific CSS rules have been added to improve the visual presentation of the Inspection Pack when printed. These styles ensure:
    -   Non-essential UI elements (navigation, headers, footers, specific `.no-print` elements) are hidden.
    -   Main content area expands to full width for optimal paper usage.
    -   Text color is forced to black, and background to white for better readability and ink saving.
    -   Box shadows, borders, and rounded corners are removed to provide a cleaner, more document-like appearance.
    -   Spacing adjustments are made to ensure content flows appropriately on printed pages.

## Export History

The backend currently has a robust `ExportJob` model and associated services (`log_export_audit`) to track export generation events. While the frontend currently provides a "preview" (which is technically an internal generation event), a user-facing action that explicitly "exports" and creates a new audit trail entry has not yet been implemented in the UI.

## Limitations

-   The implemented "print-friendly page" relies on the browser's native print dialog. Custom PDF generation or more advanced layout control for export is not part of this phase.
-   Direct download options (e.g., JSON, CSV) are not yet exposed in the UI.
-   The "Generate Inspection Pack" button currently only triggers the internal API call to update the preview data; it does not yet produce a downloadable file.
-   Export history records are only generated when `printBundle.mutate()` is successful, but this is a preview only. A dedicated "Export" action linked to history creation is pending.
