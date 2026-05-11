# Database and Migration Verification

| Item | Expected | Found | Status | Evidence |
|---|---|---|---|---|
| EvidenceRequirement model exists | First-class framework-linked model | Present in `backend/apps/indicators/models/indicator.py` | PASS | `EvidenceRequirement` at line 136. |
| EvidenceRequirement links to FrameworkIndicator | FK to framework indicator | Present | PASS | Model definition links to `Indicator`. |
| Project fulfillment model exists | Requirement-level project record | Present | PASS | `ProjectEvidenceRequirement` at line 318. |
| Project fulfillment links project + project indicator + framework indicator + evidence requirement | All four relations available | Present | PASS | `ProjectEvidenceRequirement` model fields and service initialization. |
| Fulfillment status supports required lifecycle | Missing / submitted / approved / rejected / partial | Present | PASS | Status choices and lifecycle functions exist. |
| AI suggestions stored separately from approved evidence | Advisory model, not final evidence | Present, but duplicated | PARTIAL | `EvidenceRequirementSuggestion` exists in both `indicators` and `ai_actions`. |
| Generated drafts can link to requirement/fulfillment | `DocumentDraft.project_evidence_requirement` FK | Present | PASS | `backend/apps/ai_actions/models/document_draft.py`. |
| Uploaded evidence can link to requirement/fulfillment | `EvidenceItem.project_evidence_requirement` FK | Present | PASS | `backend/apps/evidence/models/evidence.py`. |
| Migration files exist | Migration coverage for bridge models | Present, but incomplete sync | PARTIAL | `showmigrations` includes `indicators.0004` and `ai_actions.0005`, but `makemigrations --check --dry-run` reports `0005` and `0006` pending. |
| Migration check passes | Clean model/migration graph | Fails | FAIL | `manage.py makemigrations --check --dry-run` output shows pending migrations for `EvidenceRequirementSuggestion`. |
| Database migrate passes or is clearly documented | No missing migration state | Migrate applies successfully, but warns | PARTIAL | `manage.py migrate` completed with warning that `ai_actions` and `indicators` have changes not reflected in migrations. |

### Command Evidence

- `python -m py_compile backend/apps/ai_actions/services/document_drafting.py` succeeded.
- `python manage.py check` succeeded with no issues.
- `python manage.py makemigrations --check --dry-run` reported:
  - `apps/indicators/migrations/0005_evidencerequirementsuggestion.py`
  - `apps/ai_actions/migrations/0006_evidencerequirementsuggestion.py`
- `python manage.py showmigrations` showed no migration for those model changes.
- `python manage.py migrate` completed with a warning that model changes are not reflected in migrations.

