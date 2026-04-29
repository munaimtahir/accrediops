# 09_DOCUMENT_GENERATION_QUEUE.md

## First Operational Queue
Building on the indicator classification data, the foundation for the Document Generation Queue was established at `/admin/queues/document-generation`.

### Eligibility Logic
An indicator automatically appears in this queue if:
-   `primary_action_required = GENERATE_DOCUMENT`
-   `ai_assistance_level` is `FULL_AI` or `PARTIAL_AI`
-   The framework is `active`.

### Foundation Features
-   **Queue Table:** Lists all eligible indicators across frameworks.
-   **Filtering:** Allows searching by framework or indicator code.
-   **Drafting Actions:** Placeholder buttons for "Generate Draft" and "View Latest Draft", ready for the next implementation phase.
-   **Governance:** The UI clearly states that drafts are advisory and require human promotion before becoming valid accreditation evidence.
