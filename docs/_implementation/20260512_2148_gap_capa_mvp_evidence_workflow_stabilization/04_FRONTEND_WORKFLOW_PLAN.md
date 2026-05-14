# Frontend Workflow Plan - Gap and CAPA MVP

This document outlines the UI/UX strategy for integrating Gap and CAPA workflows into the AccrediOps dashboard.

## 1. Type Safety & Interface Updates
- **`frontend/types/index.ts`**: 
    - Extend `ProjectIndicatorDetail` with optional `project_evidence_requirements`, `gaps`, and `capas` arrays.
    - Update `ExportResponse` to include `consolidated_lists.pending_capa` to support the updated print bundle payload.

## 2. Component Integration

### Project Indicator Detail
- **Location:** `indicator-detail-screen.tsx`
- **Logic:** Within the "Required Evidence" panel, replace the static description with a dynamic map of `project_evidence_requirements`.
- **Badging:**
    - Display "Open Gap" (red) if a requirement has a linked open gap.
    - Display "CAPA [Status]" (orange) for linked CAPA records.

### Project Readiness Summary
- **Location:** `project-readiness-screen.tsx`
- **Logic:** Introduce a new summary section below the primary metric cards.
- **Metrics:** Render "Open Gaps", "Open CAPAs", "High-Risk CAPAs", and "Overdue CAPAs".

### Print Pack & Inspection Preview
- **Location:** `project-print-pack-screen.tsx`
- **Logic:** 
    - Parse `capa_blockers` from the readiness response.
    - Add a `CAPA Report` section at the top of the bundle preview.
    - Block the "Generate Print Pack" button if blockers exist.

## 3. Workflow Transitions
- The MVP relies on API-driven creation for E2E validation. 
- UI buttons in `indicator-detail-screen.tsx` are positioned to facilitate future modal-driven creation flows.
- Standard API response envelopes must be strictly handled to prevent "Stale Status" bugs in the React state.
