# Import Contract Summary

## Endpoint: Validate import
`POST /api/admin/import/validate-framework/`

### Request (multipart/form-data)
- `project_id` (integer, required)
- `file` (CSV file, required)

### Success response (`200`)
```json
{
  "success": true,
  "data": {
    "project_id": 123,
    "file_name": "checklist.csv",
    "rows_processed": 10,
    "normalized_rows": 8,
    "missing_headers": [],
    "missing_required_values": 2,
    "duplicate_warnings": [],
    "errors": [
      { "row": 3, "error": "missing_fields", "fields": ["standard_code"] }
    ],
    "log_id": 45
  }
}
```

## Endpoint: Run import
`POST /api/admin/frameworks/import/`

### Request (multipart/form-data)
- `project_id` (integer, required)
- `file` (CSV file, required)

### Success response (`201`)
```json
{
  "success": true,
  "data": {
    "project_id": 123,
    "file_name": "checklist.csv",
    "framework_id": 77,
    "framework_name": "Project Name Imported Checklist",
    "areas_count": 2,
    "standards_count": 5,
    "indicators_count": 40,
    "rows_processed": 40,
    "errors": [],
    "project_indicators_created": 40,
    "recurring_requirements_processed": 12
  }
}
```

## Error behavior
- `400 VALIDATION_ERROR` for invalid file/content/schema issues.
- `404 NOT_FOUND` when `project_id` does not exist.
- `409 CONFLICT` when selected project is already initialized with indicators.
- `500 SERVER_ERROR` reserved for truly unexpected failures.

## Validation behavior
- CSV-only upload, UTF-8 expected.
- Required headers enforced.
- Row-level validation reports missing fields/duplicates/invalid values.
- Validation summary exposed before import.
- Import remains transaction-safe and project-link explicit.
