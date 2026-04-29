# Plan: Document Drafting and Promotion

## Overview
This phase implements the "Document Drafting" functionality, allowing AI to generate policy and procedure drafts based on indicators. These drafts are then reviewed by humans and "promoted" to formal `EvidenceItem` records.

## Status Summary
- **Phase Started:** April 29, 2026
- **Current Status:** [EXECUTION] Implementing Review View & Promotion Flow
- **Total Tasks:** 12
- **Completed Tasks:** 5
- **Pending Tasks:** 7

## Detailed Task List

### 1. Research & Analysis
- [x] Review `backend/apps/ai_actions/services/document_drafting.py` for existing logic.
- [x] Review `frontend/components/screens/admin-document-generation-queue-screen.tsx`.
- [x] Map the "Promote to Evidence" workflow requirements (data mapping from Draft to EvidenceItem).

### 2. Backend Implementation (Drafting & Services)
- [ ] Harden `DocumentDraftingService` (ensure Gemini integration is robust).
- [ ] Implement `promote_draft_to_evidence` service method in `backend/apps/evidence/services.py` or similar.
- [ ] Create/Update API endpoints for:
    - [ ] Generating a new draft (batch or single).
    - [ ] Reviewing/Updating a draft.
    - [ ] Promoting a draft.

### 3. Frontend Implementation (UI/UX)
- [x] Side-by-side Review View: Compare indicator requirements with AI draft.
- [x] "Promote" button/modal: Confirm metadata before conversion.
- [ ] Queue Integration: Deep-linking from Indicator Detail to the Queue.
- [ ] Audit Trail Visibility: Display "AI Source" badges on promoted evidence.

### 4. Verification & Testing
- [ ] Unit tests for Draft promotion logic (backend).
- [ ] Integration tests for AI generation flow (mocked provider).
- [ ] E2E Playwright test: Draft -> Review -> Promote -> Evidence Check.

## Progress Journal

### 2026-04-29 09:15 - Initial Research
- Identified `DocumentDraft` model in `ai_actions`.
- Found `DocumentDraftingService` and `document_drafting.py` already exist with some logic.
- Identified `admin-document-generation-queue-screen.tsx` and `document-draft-review-screen.tsx` as the primary frontend components.

### 2026-04-29 09:30 - Frontend Review & Promotion Fix
- Implemented a robust side-by-side review layout in `DocumentDraftReviewScreen`.
- Fixed `PromoteToEvidenceModal` to correctly fetch and display project indicators for the selected project.
- Enhanced draft content display with proper typography and scrollable areas.
