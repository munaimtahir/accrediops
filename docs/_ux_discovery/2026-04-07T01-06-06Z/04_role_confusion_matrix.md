# Role Confusion Matrix

| Surface / Action | ADMIN | LEAD | OWNER | REVIEWER / APPROVER | UX clarity update |
| --- | --- | --- | --- | --- | --- |
| Create project | Allow | Allow | Deny | Deny | Disabled CTA now explains required roles |
| Initialize project | Allow | Allow | Deny | Deny | Guidance framed on overview |
| Indicator start/send-for-review/mark-met | Allow | Mixed allow by policy | Mixed allow by policy | Mixed allow by policy | Actions section now states allowed vs blocked reasoning |
| Reopen (override) | Allow | Deny | Deny | Deny | Governance section and command hint clarify admin-only |
| Evidence add/edit | Allow | Allow | Allow | Usually deny | Evidence panel includes role hinting |
| Evidence review/approval | Allow | Allow | Deny | Allow | Review form includes approval-status semantics |
| Recurring submit | Allow | Allow | Allow | Deny | Recurring screens now show expected submit path |
| Recurring approve/reject | Allow | Allow | Deny | Allow | Approval actions include rationale when blocked |
| Export generate | Allow | Allow | Deny | Deny | Export page shows deny guidance instead of silent failure |
| Admin navigation | Allow | Deny | Deny | Deny | Admin links now isolated to admin-only visibility |

## Remaining ambiguity
- Fine-grained distinction between REVIEWER and APPROVER actions can still feel implicit on some indicator command combinations; follow-up copy refinement needed if governance rules evolve.
