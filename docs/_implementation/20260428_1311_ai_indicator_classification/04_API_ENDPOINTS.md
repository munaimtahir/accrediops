# API Endpoints

## GET `/api/admin/frameworks/<framework_id>/classification/`

Returns framework classification rows and summary counts.

Filters:

- `evidence_type`
- `ai_assistance_level`
- `evidence_frequency`
- `primary_action_required`
- `classification_review_status`
- `classification_confidence`
- `search`
- `area`
- `standard`

Uses saved database fields only. No AI call is made.

## POST `/api/admin/frameworks/<framework_id>/classify-indicators/`

Runs AI classification.

Payload:

```json
{
  "mode": "unclassified_only",
  "indicator_ids": [1, 2],
  "overwrite_human_reviewed": false,
  "confirm_force": false
}
```

Modes: `unclassified_only`, `selected`, `unreviewed_only`, `force_all`.

Returns:

```json
{
  "total_requested": 2,
  "classified_count": 2,
  "skipped_count": 0,
  "failed_count": 0,
  "needs_review_count": 0,
  "errors": []
}
```

## PATCH `/api/admin/indicators/<indicator_id>/classification/`

Updates one indicator classification and sets review metadata.

Manual value changes default status to `MANUALLY_CHANGED`; explicit approval can set `HUMAN_REVIEWED`.

## POST `/api/admin/frameworks/<framework_id>/classification/bulk-review/`

Bulk approves or marks selected indicators as needing review.

Payload:

```json
{
  "indicator_ids": [1, 2],
  "action": "approve"
}
```

## Worklist filters

`/api/dashboard/worklist/` now accepts saved classification filters for future queue readiness.
