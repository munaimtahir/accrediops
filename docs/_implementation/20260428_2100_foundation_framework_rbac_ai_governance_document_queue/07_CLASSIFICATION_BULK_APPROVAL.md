# 07_CLASSIFICATION_BULK_APPROVAL.md

## Enhanced Bulk Review
The Indicator Classification page (`/admin/frameworks/classification`) was upgraded with advanced bulk approval controls to speed up the finalization of imported frameworks.

### Supported Approval Modes
1.  **Approve Selected:** Approves only the specific rows checked by the user.
2.  **Approve All AI Suggested:** Automatically approves all indicators with `AI_SUGGESTED` status and `HIGH` or `MEDIUM` confidence. `LOW` confidence rows are skipped for safety.
3.  **Approve Filtered:** Approves all indicators currently visible based on active search/status filters.

### Safety Guards
-   **No Auto-Mutation:** UNCLASSIFIED rows are never approved in bulk filtered mode.
-   **Protection:** MANUALLY_CHANGED rows are protected from bulk AI overrides unless explicitly selected.
-   **Human Reviewed:** All approved rows move to `HUMAN_REVIEWED` status and track the reviewer's ID.
-   **Confirmation:** Modal confirmations are required for global bulk actions.
