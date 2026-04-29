# 04_MASTER_DATA_AND_POLICY_TABLES.md

## Database-Backed Controlled Values
Instead of relying on frontend constants or transient enums, all controlled values are now seeded into the `MasterValue` model.

### Seeded Categories
-   Evidence Types (DOCUMENT_POLICY, RECORD_REGISTER, etc.)
-   AI Assistance Levels (FULL_AI, PARTIAL_AI, NO_AI)
-   Primary Actions (GENERATE_DOCUMENT, COLLECT_RECORD, etc.)
-   Review Statuses (UNCLASSIFIED, AI_SUGGESTED, etc.)
-   User Roles (ADMIN, LEAD, etc.)

## Policy Decisions Table
A new `PolicyDecision` model was added to store and enforce high-level governance rules in the database.

### Initial Seeded Policies
-   `AI_IS_ADVISORY_ONLY`
-   `AI_NO_MUTATE_WORKFLOW`
-   `PROTECT_HUMAN_REVIEWED`
-   `FORCE_OVERWRITE_ADMIN_ONLY`
-   `FRAMEWORK_UPLOAD_IS_FRAMEWORK_LEVEL`

## Management Commands
-   `python manage.py seed_master_values`: Syncs choice classes from `choices.py` to the database.
-   `python manage.py seed_policies`: Populates core governance rules.
