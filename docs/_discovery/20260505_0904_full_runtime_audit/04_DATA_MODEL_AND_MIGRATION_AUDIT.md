# Data Model and Migration Audit

## Migration Check
- **Status:** PASS
- **Command:** `python manage.py makemigrations --check --dry-run`
- **Output:** `No changes detected`
- **Pending Migrations:** None. `showmigrations` reveals all apps have applied their initial and subsequent migrations.

## Data Models
The backend is structured into clear modular apps. The separation of concerns between the Framework (template) and the Project (working data) is maintained correctly.

### Core Models:
- **Frameworks:** `Framework`, `Area`, `Standard`, `Indicator`. These store the locked master definitions and the expected AI classification values.
- **Projects:** `AccreditationProject`, `ClientProfile`, `ProjectIndicator`, `ProjectIndicatorComment`, `ProjectIndicatorStatusHistory`.
  - The `ProjectIndicator` correctly bridges the project context with the framework template, tracking the operational status, assignees (owner, reviewer, approver), and due dates.
- **Evidence:** `EvidenceItem` handles file references, status (validity, completeness, approval), and physical location mapping.
- **AI & Drafting:** `AIUsageLog`, `GeneratedOutput`, `DocumentDraft`. Stores structured logging of all AI calls and handles multi-stage document generation and promotion logic.
- **Workflow & Audit:** `AuditEvent` records changes and status transitions, ensuring governance visibility.
- **Configuration:** `MasterValue` for configurable dropdowns and `PolicyDecision` for dynamic backend enforcement.

## Evaluation
The schema aligns perfectly with the architectural doctrine. It firmly anchors governance data in relational tables and treats AI merely as an advisory feature. The inclusion of `DocumentDraft` with explicit promotion and review tracking ensures AI output does not mutate final governance state unilaterally.
