# Directory structure

## Proposed repo structure

```text
accrediops/
├── README.md
├── AGENT.md
├── docs/
├── contracts/
│   └── openapi/
├── backend/
│   ├── apps/
│   └── config/
├── frontend/
│   ├── app/
│   └── components/
├── exports/
├── scripts/
└── tests/
```

## Purpose of each area

### docs
Project doctrine, decisions, planning, feature maps, guardrails.

### contracts/openapi
Canonical API contract definitions.
This should be frozen before implementation.

### backend
Django project and apps.
Should contain internal service layer, models, validations, and governance logic.

### frontend
UI layer only.
May begin as a temporary bridge and later become the primary UI.

### exports
Export templates, report builders, print pack configuration.

### scripts
Import/export helpers, data seeding, migration utilities, validation scripts.

### tests
Contract tests, service tests, and workflow tests.
