# AI Governance Verification

| AI Action | Advisory Only? | Can Mutate Compliance? | Review Required? | Status | Notes |
|---|---|---|---|---|---|
| Classify indicators | Yes | No | Yes | PASS | `backend/apps/ai_actions/services/classification.py` remains advisory. |
| Suggest evidence requirements | Yes | No | Yes | PASS | Suggestion model is separate from final requirement records, although duplicated across apps. |
| Draft SOPs/policies/register templates | Yes | No | Yes | PASS | `AI_DRAFT_DISCLAIMER` explicitly requires human review. |
| Suggest gap explanations | Yes | No | Yes | PASS | Drafting prompt and review flow remain advisory. |
| Suggest CAPA actions | Yes | No | Yes | PARTIAL | Guidance exists, but CAPA modeling is still placeholder-level. |
| Draft mock inspection summaries | Yes | No | Yes | PASS | Drafts remain reviewable artifacts. |
| Draft final indexes | Yes | No | Yes | PASS | Output is not auto-approved. |
| Approve evidence | No | No | Yes | PASS | Approval is human-controlled. |
| Verify physical evidence | No | No | Yes | PASS | Evidence review requires humans. |
| Mark compliance complete | No | No | Yes | PASS | Compliance state is not AI-owned. |
| Close CAPA | No | No | Yes | NOT IMPLEMENTED | No mature CAPA closure workflow verified. |
| Override reviewer decisions | No | No | Yes | PASS | Permission checks prevent AI from doing this. |
| Delete evidence | No | No | Yes | PASS | No AI delete path verified. |
| Export final approved pack | No | No | Yes | PARTIAL | Export exists, but final approval state is still governed by humans and readiness gating. |

### Notes

- `backend/apps/ai_actions/services/document_drafting.py` includes an explicit disclaimer that the draft is advisory and requires human review.
- `EvidenceRequirementSuggestion` is stored separately from approved evidence records, which is correct architecture.
- The main governance concern is not AI overreach; it is the surrounding readiness/export plumbing and the duplicate suggestion-model migration drift.

