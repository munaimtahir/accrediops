# Seed Command Implementation Log

This log details the process of creating and integrating a deterministic seed command for the E2E test environment.

## 1. Problem Identification

The E2E test suite (`global-setup.cjs`) failed with `CommandError: PHC LAB framework does not exist.` This indicated that the "PHC LAB" framework, a critical dependency for E2E tests, was not being seeded into the database by the existing management commands (`seed_e2e_state.py`, `reset_lab_state.py`, `seed_master_values.py`, `seed_policies.py`) or migrations.

## 2. Strategy

The strategy was to create a new, self-contained, and idempotent Django management command (`seed_phc_lab_framework.py`) responsible for seeding the "PHC LAB" framework and its essential components. This new command would then be integrated into the existing `seed_e2e_state.py` script to ensure the framework is always present before E2E tests run.

## 3. Implementation Steps

1.  **Create `seed_phc_lab_framework.py`:**
    *   **Location:** `backend/apps/frameworks/management/commands/seed_phc_lab_framework.py`
    *   **Content:**
        *   Defined a `Command` class inheriting from `BaseCommand`.
        *   Used `@transaction.atomic` to ensure atomicity.
        *   Employed `Framework.objects.update_or_create`, `Area.objects.update_or_create`, `Standard.objects.update_or_create`, `Indicator.objects.update_or_create`, and `EvidenceRequirement.objects.update_or_create` to seed data.
        *   Created:
            *   1 Framework: "PHC LAB"
            *   2 Areas: "A1", "A2"
            *   2 Standards: "AAC.1", "COP.1"
            *   3 Indicators: "IND-001", "IND-002", "IND-003" (with corrected field name from `title` to `text`).
            *   4 Evidence Requirements: Linked to indicators, with 3 marked `mandatory=True`.
        *   Added success message upon completion.

2.  **Integrate into `seed_e2e_state.py`:**
    *   **File:** `backend/apps/projects/management/commands/seed_e2e_state.py`
    *   **Action:**
        *   Added `from django.core.management import call_command` to the imports.
        *   Modified the `_handle_atomic` method to include `call_command("seed_phc_lab_framework")` at the beginning, ensuring framework seeding precedes other setup.
    *   **Purpose:** To create a single, unified command flow for E2E environment setup.

## 4. Verification

*   **Initial Seed Command Execution:**
    *   **Command:** `docker compose exec -T backend python manage.py seed_e2e_state --password x --clean-e2e-records --ensure-client --ensure-project --initialize-project`
    *   **Result:** Failed with `CommandError: PHC LAB framework does not exist.` This indicated the `seed_phc_lab_framework` command was not being called or was failing.
    *   **Diagnosis:** `seed_e2e_state` did not call the new command. The `call_command` was not correctly placed/integrated.
    *   **Fix:** Corrected the integration in `seed_e2e_state.py` to ensure `call_command("seed_phc_lab_framework")` was executed.

*   **Second Seed Command Execution:**
    *   **Command:** Same as above.
    *   **Result:** Failed with `FieldError: Invalid field name(s) for model Indicator: 'title'`.
    *   **Diagnosis:** The `seed_phc_lab_framework.py` command used `title` instead of the correct field `text` for Indicator objects.
    *   **Fix:** Corrected the field name in `seed_phc_lab_framework.py`.

*   **Third Seed Command Execution:**
    *   **Command:** Same as above.
    *   **Result:** **SUCCESS**. The seed command completed without errors, indicating the framework and related data were created. This unblocked the Playwright tests.
