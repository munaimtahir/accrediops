# Drift Prevention Rules

1. Every new backend endpoint must be added to the API route contract.
2. Every new frontend page/action must be added to the frontend screen/action contract.
3. Every user-facing backend action must have visible frontend exposure unless explicitly marked internal-only.
4. Every frontend button/form action must call a documented backend endpoint or service.
5. Every model/serializer field shown in UI must appear in the data field contract.
6. Every status transition must be listed in the workflow contract.
7. Every role/capability-controlled action must be documented in the RBAC capability contract.
8. Contract documentation must be updated in the same implementation sprint as code changes.
9. CI or local verification should include a contract-check step where possible.
10. Any undocumented feature is incomplete, even if code exists.