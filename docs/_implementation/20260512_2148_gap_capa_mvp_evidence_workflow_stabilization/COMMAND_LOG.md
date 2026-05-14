# Command Log

## Sprint Setup
```bash
date +%Y%m%d_%H%M
# Output: 20260512_2148

DIR="docs/_implementation/20260512_2148_gap_capa_mvp_evidence_workflow_stabilization" && mkdir -p "$DIR" && touch "$DIR"/{01_BASELINE_AND_SCOPE.md,02_CAPA_DOMAIN_MODEL.md,03_BACKEND_IMPLEMENTATION_PLAN.md,04_FRONTEND_WORKFLOW_PLAN.md,05_AI_GOVERNANCE_FOR_CAPA.md,06_IMPLEMENTATION_LOG.md,07_TEST_RESULTS.md,08_REMAINING_GAPS.md,09_FINAL_GO_NO_GO_VERDICT.md,COMMAND_LOG.md} && touch OUT/gap_capa_mvp_evidence_workflow_stabilization_latest.md
# Output: (empty)
```

## Stage 2: Baseline Verification
```bash
# Backend verification (targeted apps)
backend/.venv/bin/python -m py_compile backend/apps/ai_actions/services/document_drafting.py && 
backend/.venv/bin/python backend/manage.py check && 
backend/.venv/bin/python backend/manage.py makemigrations --check --dry-run && 
backend/.venv/bin/python backend/manage.py migrate && 
backend/.venv/bin/python -m pytest -q backend/apps/indicators backend/apps/evidence backend/apps/exports backend/apps/api
# Output: 121 passed in ...

# Frontend verification
cd frontend && npm run lint && npm run typecheck && npm run build && npm test
# Output: All passed with 2 pre-existing lint warnings.

# E2E targeted (evidence/CAPA flow)
docker compose down -v && rm -f backend/db.sqlite3 && docker compose up -d && sleep 10 && 
cd frontend && npx playwright test 30_phc_lab_framework_full_workflow.spec.ts operator-first-time.spec.ts --workers=1
# Output: 4 passed in ...

# E2E targeted (recurring workflow baseline)
docker compose down -v && rm -f backend/db.sqlite3 && docker compose up -d && sleep 10 && 
cd frontend && npx playwright test 08_recurring_workflows.spec.ts 17_recurring_and_masters_capability_fix.spec.ts workflow-guidance.spec.ts core-journeys.spec.ts --workers=1
# Output: FAILED (as expected)
```

## Stage 3-5: ZIP Export Engine Implementation

```bash
# Implement build_final_zip_export service
replace backend/apps/exports/services.py # Add build_final_zip_export
replace backend/apps/exports/services.py # Add required imports

# Add API Endpoint for Final ZIP Export
replace backend/apps/api/views/exports.py # Add ProjectFinalZipExportView
replace backend/apps/api/urls.py # Add URL for ProjectFinalZipExportView
replace backend/apps/api/urls.py # Add import for ProjectFinalZipExportView

# Frontend UI Alignment
replace frontend/components/screens/project-print-pack-screen.tsx # Add Final ZIP Export button
replace frontend/components/screens/project-print-pack-screen.tsx # Add useTriggerZipExport hook

# Create ZIP template files
write_file backend/apps/exports/templates/exports/readiness_summary.md
write_file backend/apps/exports/templates/exports/physical_checklist.md
write_file backend/apps/exports/templates/exports/pending_gaps.csv
write_file backend/apps/exports/templates/exports/capa_report.csv
write_file backend/apps/exports/templates/exports/capa_summary.md
write_file backend/apps/exports/templates/exports/missing_evidence_report.csv
write_file backend/apps/exports/templates/exports/export_readme.md

# Configure media serving in development
replace backend/config/accrediops_backend/urls.py
```

## Stage 7: ZIP Export Tests (and Debugging)

```bash
# Create ZipExportTest
write_file backend/apps/exports/tests/test_zip_export.py

# Debug loop for ZipExportTest.setUp
replace backend/apps/exports/tests/test_zip_export.py # Fix AttributeError: 'ZipExportTest' object has no attribute 'admin_user' (create admin_user)
replace backend/apps/exports/tests/test_zip_export.py # Fix TypeError: UserManager.create_user() missing 'username'
replace backend/apps/exports/tests/test_zip_export.py # Fix KeyError: 0 in ZipExportTest.setUp (project_indicators is a dict)
replace backend/apps/exports/tests/test_zip_export.py # Fix IntegrityError: NOT NULL constraint failed: indicators_projectevidencerequirement.framework_indicator_id
replace backend/apps/exports/tests/test_zip_export.py # Fix AssertionError: False is not true (validation warning in setUp)

# Debug loop for log_framework_import ImportError
replace backend/apps/exports/services.py # Re-add log_framework_import after first removing it.
replace backend/apps/exports/tests/test_zip_export.py # Fix redundant imports (multiple turns)

# Debug loop for duplicate function definitions (create_export_job, log_framework_import)
# These were resolved by manually editing the services.py file to remove the duplicates.

# Final backend test run before documenting failure
backend/.venv/bin/python -m pytest -q backend/apps/exports backend/apps/api
# Output: 4 failed (500 errors in build_final_zip_export service)
```