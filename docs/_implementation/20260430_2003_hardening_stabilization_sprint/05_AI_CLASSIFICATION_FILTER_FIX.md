# AI Classification Filter Fix

## Audit Findings
- **Backend**: Verified `FrameworkClassificationView` and `_classification_filtered_queryset` in `backend/apps/api/views/admin.py`. The GET view strictly performs database filtering on the `Indicator` model. No AI provider calls are triggered during list or filter operations.
- **Frontend**: Verified `IndicatorClassificationScreen` (in `frontend/components/screens/indicator-classification-screen.tsx`). Filters correctly map to the backend API parameters.
- **Logic**: AI classification remains an explicit action triggered only by the "Run AI Classification" button (POST request).

## Architecture Compliance
1. **Persistence**: AI classifications are stored on the `Indicator` model fields (`ai_assistance_level`, `evidence_type`, etc.).
2. **Filtering**: Filtering uses these saved database fields.
3. **External Calls**: No external AI provider calls occur on page load or filter change.

## Verification
- Code review of `backend/apps/api/views/admin.py` and `backend/apps/ai_actions/services/classification.py` confirms separation of GET (read) and POST (classify).
- Smoke test confirms screen loads without errors.
