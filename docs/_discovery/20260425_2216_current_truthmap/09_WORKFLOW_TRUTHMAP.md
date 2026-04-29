# Workflow Truth Map

| Workflow | Steps Expected | Steps Implemented | Working End-to-End? | Status | Gap |
|---|---|---|---|---|---|
| Initial setup/import | Create/import indicator list, users | Framework CSV import works, user admin exists | Yes | COMPLETE | None |
| Daily accreditation work | Filter indicators, open detail, update status | Worklist filters, detail view, state transitions all present | Yes | COMPLETE | None |
| Evidence closure | Add link/file, review | Evidence form exists, review form exists | Yes | COMPLETE | Physical file upload (S3) |
| Review workflow | Reviewer opens pending items, comments, accepts/returns | `EvidenceReviewView`, `ProjectIndicatorSendForReviewView` exist | Yes | COMPLETE | Notification/email trigger |
| Approval workflow | Approver marks final evidence ready/submitted | `ProjectIndicatorMarkMetView` | Yes | COMPLETE | Notification |
| Action Center | Select indicator, generate prompt, save output | `AIGenerateView`, `AIAcceptView`, UI present | Yes | COMPLETE | Clarify applying output |
| Reporting | Filter by department/domain, Export | Excel export and Print Bundle export exist | Yes | COMPLETE | None |
| Laboratory/FMS standards | Import lab standards, map evidence distinct from other frameworks | Generic framework import exists | No | UNKNOWN | Distinct logic missing |
