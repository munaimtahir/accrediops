# Phase 3 Implementation Checklist

## Files Created ✅

- [x] `backend/apps/ai_actions/services/prompts.py` (13,085 bytes)
  - `build_indicator_ai_context()` - 30+ indicator fields with safe access
  - `build_guidance_prompt()` - Action plan template
  - `build_draft_prompt()` - Document/SOP template
  - `build_assessment_prompt()` - Readiness assessment template
  - `build_prompt_for_output_type()` - Output type router

## Files Updated ✅

- [x] `backend/apps/ai_actions/services/generation.py`
  - Updated `_generate_ai_output_content()` to use prompt builders
  - Updated `create_generated_output()` to pass full project_indicator
  - Returns 3-tuple: (content, model_name, context_snapshot)

- [x] `backend/apps/ai_actions/services/__init__.py`
  - Added imports from prompts module
  - Total exports: 11 functions/classes

## Tests Passed ✅

- [x] Django system check: 0 issues
- [x] Prompt builders create different templates for each output type
- [x] Context builder safely extracts 30+ fields (no crashes on missing fields)
- [x] Invalid output_type raises clear ValueError
- [x] End-to-end generation with all three output types
- [x] Accept output remains advisory-only (only touches accepted/accepted_at/accepted_by)
- [x] No pending migrations detected

## Test Results

### Database Generated Outputs
```
Generated outputs 17, 18, 19:
  - Output 17 (GUIDANCE): 30-key context, unique prompt header
  - Output 18 (DRAFT): 30-key context, unique prompt header
  - Output 19 (ASSESSMENT): 30-key context, unique prompt header
  - All three accepted successfully
```

### Prompt Differentiation Verified
```
GUIDANCE: "Accreditation Indicator Guidance"
DRAFT: "Accreditation Indicator Draft Document"
ASSESSMENT: "Accreditation Indicator Readiness Assessment"
```

### Context Fields Verified
All 30 fields present in prompt_context_snapshot:
```
accrediting_body_name, approved_evidence_count, approver, area_code, 
area_name, client_name, current_status, document_type, due_date, 
evidence_titles, evidence_type, fulfillment_guidance, indicator_code, 
indicator_text, is_finalized, is_met, is_recurring, 
minimum_required_evidence_count, notes, owner, priority, project_id, 
project_name, rejected_evidence_count, required_evidence_description, 
reviewer, standard_code, standard_description, standard_name, 
total_evidence_count
```

## Safety Guarantees Verified ✅

- [x] `accept_generated_output()` only touches accepted/accepted_at/accepted_by
- [x] No indicator status mutations
- [x] No evidence creation
- [x] No workflow state changes
- [x] Full audit trail via log_audit_event()
- [x] Field access uses safe getattr() - no crashes on missing fields
- [x] Input validation for output_type - ValueError for unknown types

## Architecture

```
API View (ai_actions.py)
  ↓
create_generated_output(project_indicator, output_type, user_instruction)
  ↓
_generate_ai_output_content()
  ├─ build_indicator_ai_context(project_indicator)  [30 fields]
  ├─ build_prompt_for_output_type(type, context, instruction)
  │  ├─ build_guidance_prompt()
  │  ├─ build_draft_prompt()
  │  └─ build_assessment_prompt()
  └─ Returns (content, model_name, context)
  ↓
GeneratedOutput created with rich context_snapshot
```

## Backward Compatibility ✅

- [x] Serializers accept project_indicator_id and resolve to full object
- [x] Views pass full project_indicator to services
- [x] All imports forward-compatible through __init__.py exports
- [x] No breaking changes to API endpoints or data models
- [x] Optional user_instruction with default empty string

## Next Phase: Real Gemini Integration

File to modify: `backend/apps/ai_actions/services/generation.py`

Implement real API call in `_generate_ai_output_content()`:

```python
elif ai_config.provider == "gemini":
    import google.generativeai as genai
    genai.configure(api_key=ai_config.gemini_api_key)
    model = genai.GenerativeModel(ai_config.model)
    response = model.generate_content(prompt)
    real_content = response.text
    return (real_content, ai_config.model, context_snapshot)
```

Required additions:
1. google-generativeai package in requirements.txt
2. Error handling for API failures
3. Response validation
4. Mocked tests for CI/CD (real key not available in test env)
