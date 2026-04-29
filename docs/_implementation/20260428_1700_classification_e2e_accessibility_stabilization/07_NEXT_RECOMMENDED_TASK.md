# 07_NEXT_RECOMMENDED_TASK.md

## Document Generation Queue Foundation

Now that indicators are classified with `primary_action_required=GENERATE_DOCUMENT` and `ai_assistance_level=FULL_AI` or `PARTIAL_AI`, the logical next step is to build the **Document Generation Queue**.

### Objectives
1.  **Queue Surface:** Create a new admin view (`/admin/queues/document-generation`) that lists all indicators requiring document generation.
2.  **AI Drafting Integration:** Implement a "Draft All" action that sends batches of indicators to the AI service layer to generate initial policy/procedure drafts based on the indicator text and fulfillment guidance.
3.  **Governance Trail:** Ensure each generated draft is recorded in the `AIOutput` model and linked to the corresponding indicator as a "Suggested Draft" evidence item.
4.  **Operator Review:** Provide a side-by-side view for operators to review AI-generated drafts, make edits, and promote them to "SUBMITTED" evidence.

### Why this is next?
This directly leverages the work done in the classification sprint and moves the platform towards its goal of automated (but human-governed) document preparation for accreditation.
