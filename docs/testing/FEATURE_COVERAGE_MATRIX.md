# Feature Coverage Matrix

| Feature Group | Backend Unit/Service | API Tests | Frontend Tests | Playwright E2E | Status |
|---|---|---|---|---|---|
| Projects + initialization | covered | covered | partial | partial | partial |
| Worklist + filters | covered | covered | covered | partial | partial |
| Indicator workflow commands | covered | covered | partial | partial | partial |
| Evidence (multi/version/review/physical) | covered | covered | covered | missing | partial |
| Recurring workflows | covered | covered | covered | partial | partial |
| AI advisory + accept non-mutation | covered | covered | partial | partial | partial |
| Clone/reuse engine | covered | covered | partial | partial | partial |
| Client variable replacement | covered | covered | partial | missing | partial |
| Print pack + physical retrieval | covered | covered | partial | partial | partial |
| Admin dashboard/users/masters/audit/overrides | covered | covered | covered | partial | partial |
| Readiness/risk scoring | covered | covered | partial | partial | partial |
| Framework analysis | covered | covered | partial | partial | partial |
| Inspection mode + pre-check | covered | covered | covered | partial | partial |
| Export history/generate validation | covered | covered | covered | partial | partial |
| Import validation/logs | covered | covered | partial | partial | partial |

Legend:
- covered: implemented and tested in that layer
- partial: implemented, but only some scenarios tested
- missing: not yet covered in that test layer
