# Backend Implementation Plan - Gap and CAPA MVP

This document outlines the implementation strategy for the backend CAPA module.

## 1. Domain Logic & Model Placement
- **Location:** `apps.indicators` was selected to house `Gap` and `CAPA` models. This allows direct FK relationships to `ProjectIndicator` and `ProjectEvidenceRequirement` without cross-app circular dependencies.
- **Model Design:** 
    - `Gap` acts as the trigger, capturing "what is missing".
    - `CAPA` acts as the workflow, capturing "how it will be fixed".
- **Enums:** New enums for Source and Status added to `apps.masters.choices`.

## 2. Service Layer Strategy (`capa_services.py`)
Decouple business logic from API views:
- `create_gap_from_project_evidence_requirement`: Automatic mapping of requirement status (REJECTED/PARTIAL) to Gap source.
- `create_capa_from_gap`: Enforce 1-to-1 active CAPA per gap logic.
- `close_capa`: Atomic operation that marks the CAPA CLOSED and the associated Gap RESOLVED.
- `calculate_project_capa_summary`: High-performance aggregation for readiness reports.

## 3. API Design
- **Standard Envelopes:** Every response must follow the `{ success: true, data: { ... } }` pattern to satisfy E2E helper requirements.
- **Explicit Serializers:** 
    - `GapCreateSerializer`: Restricted to title/desc/severity.
    - `CAPAActionSerializer`: Handles SUBMIT/CLOSE/REJECT actions in a single endpoint.
- **Permissions:** 
    - Creation/Update: `ensure_project_owner_access`.
    - Closure/Rejection: `ensure_project_approver_access`.

## 4. Integration
- **Readiness:** Inject CAPA blockers into `calculate_project_evidence_readiness`.
- **Exports:** Inject `pending_capa` lists into the print bundle payload.
