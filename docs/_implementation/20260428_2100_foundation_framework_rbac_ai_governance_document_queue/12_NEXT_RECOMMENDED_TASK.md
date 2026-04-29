# 12_NEXT_RECOMMENDED_TASK.md

## Document Drafting Implementation
Now that the Document Generation Queue exists and the foundation is stable, the next logical step is to implement the actual AI drafting logic.

### Objectives
1.  **Draft Action:** Implement the backend service for batch-generating policy/procedure drafts based on indicator requirements and guidance.
2.  **Comparison View:** Create a side-by-side frontend view for operators to review AI drafts against the indicator text.
3.  **Draft Promotion:** Implement the "Promote to Evidence" action that allows a human to approve an AI draft and convert it into a valid `EvidenceItem`.
4.  **Audit Trail:** Ensure the promotion process is audited as a `human.verified_ai_output` event.
