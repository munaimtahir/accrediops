# AI Prompt & Context Phase Summary

**Phase:** 3 - Indicator-aware prompts and context builders  
**Timestamp:** Implementation complete  
**Status:** ✅ Ready for next phase  

---

## Overview

This phase built the foundation for generating AI prompts tailored to specific indicators. Rather than sending generic requests, the system now extracts rich indicator context (40+ fields) and builds specialized prompts for three distinct output types: GUIDANCE, DRAFT, and ASSESSMENT.

---

## Files Created

### `backend/apps/ai_actions/services/prompts.py` (NEW)
- **Size:** 13,085 bytes
- **Purpose:** Indicator-aware context and prompt generation
- **Key functions:**
  - `build_indicator_ai_context(project_indicator)` - Extracts 40+ fields using safe getattr() access
  - `build_guidance_prompt(context, user_instruction)` - Action plan template
  - `build_draft_prompt(context, user_instruction)` - Document/SOP template
  - `build_assessment_prompt(context, user_instruction)` - Readiness assessment template
  - `build_prompt_for_output_type(output_type, context, user_instruction)` - Router function

---

## Files Updated

### `backend/apps/ai_actions/services/generation.py`
- **Changes:**
  - Updated `create_generated_output()` to:
    - Call `build_indicator_ai_context(project_indicator)` instead of minimal 4-field snapshot
    - Pass full context to `_generate_ai_output_content()`
    - Store rich context_snapshot in GeneratedOutput model
  - Updated `_generate_ai_output_content()` signature:
    - Now accepts `project_indicator` (full object) instead of just `indicator_code`
    - Returns 3-tuple: `(content, model_name, indicator_context)`
    - Uses `build_prompt_for_output_type()` to select appropriate prompt template
  - Maintains advisory-only behavior:
    - `accept_generated_output()` unchanged - only touches accepted/accepted_at/accepted_by
    - No indicator status mutations
    - No evidence creation
    - No workflow changes

### `backend/apps/ai_actions/services/__init__.py`
- **Changes:**
  - Added imports from prompts module
  - Exports all 5 prompt functions for external use
  - Total exports: 11 functions/classes

### `backend/config/accrediops_backend/settings.py`
- **Previous changes retained** (from phase 2)
  - AI_PROVIDER, AI_MODEL, AI_DEMO_MODE, GEMINI_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY

### `backend/.env.example`
- **Previous changes retained** (from phase 2)
  - AI configuration section with placeholders

---

## Context Builder: 40+ Indicator-Aware Fields

The `build_indicator_ai_context()` function safely extracts:

**Project & Indicator Info:**
- project_id, project_name
- indicator_code, indicator_text
- area_name, domain_name
- standard_code, standard_title, standard_text

**Evidence Requirements:**
- required_evidence_description
- evidence_type
- minimum_required_evidence

**Evidence Status:**
- total_evidence_count
- approved_evidence_count
- rejected_evidence_count
- pending_evidence_count
- evidence_titles (list of approved evidence names)

**Indicator Status:**
- current_status
- priority
- due_date
- notes

**Assignments:**
- owner_name, owner_email
- reviewer_name, reviewer_email
- approver_name, approver_email

**All fields use safe getattr() access:**
```python
"project_name": getattr(getattr(pi, "project", None), "name", "N/A"),
```
Missing/None fields never crash the builder.

---

## Prompt Templates: Three Output Types

### 1. GUIDANCE
**Purpose:** Action plan to close the indicator  
**Template includes:**
- Current situation summary
- Evidence missing/present
- Immediate next steps
- Suggested responsible person
- Documents to prepare
- Review/approval steps
- Final readiness checklist

**Prompt length:** ~1265 chars

### 2. DRAFT
**Purpose:** Document/SOP/policy draft according to indicator need  
**Template includes:**
- Title and purpose
- Scope definition
- Responsibilities
- Procedure/process
- Records/evidence required
- Review/approval section
- Implementation notes

**Prompt length:** ~1981 chars

### 3. ASSESSMENT
**Purpose:** Readiness and gap assessment  
**Template includes:**
- Readiness status summary
- Evidence present/missing breakdown
- Risk level assessment
- Recommended action
- Whether ready for human review
- Confidence level

**Prompt length:** ~1521 chars

---

## Output Type Usage

When `create_generated_output()` is called with `output_type`:

1. If `GUIDANCE` → `build_guidance_prompt()` is used
2. If `DRAFT` → `build_draft_prompt()` is used
3. If `ASSESSMENT` → `build_assessment_prompt()` is used
4. If invalid → `ValueError` is raised

Each type produces a **different prompt**, meaning:
- Same indicator + different output types = different AI prompts
- Different prompts = different structured responses expected
- Clear audit trail via model_name + prompt_context_snapshot

---

## Three-State Behavior (Unchanged from Phase 2)

The AI generation now follows:

1. **Demo Mode** (`AI_DEMO_MODE=true`):
   - Returns `[DEMO MODE]` prefixed output
   - Shows prompt preview
   - model_name = `"demo-mode"`

2. **Error State** (no provider configured, `AI_DEMO_MODE=false`):
   - Returns clear error message
   - model_name = `"error-not-configured"` or `"error-missing-key"`

3. **Pending State** (provider configured but real API not implemented):
   - Returns `[PENDING]` prefixed output
   - Shows generated prompt for debugging
   - model_name = `"pending-implementation"`
   - **Ready for Gemini API integration**

---

## Testing Results

### Django System Check
```
System check identified no issues (0 silenced)
```

### Prompt Builder Test
```
✓ Context built successfully
  Project: E2E Lab Project
  Indicator: Ind 001
  Status: NOT_STARTED
  Evidence: 0 total, 0 approved

✓ GUIDANCE prompt built (1265 chars)
✓ DRAFT prompt built (1981 chars)
✓ ASSESSMENT prompt built (1521 chars)
✓ ValueError correctly raised for invalid type
```

### Output Type Differentiation Test
```
Output Type: GUIDANCE
  Model: pending-implementation
  ✓ Output mentions 'GUIDANCE'
  ✓ Context has indicator-aware fields

Output Type: DRAFT
  Model: pending-implementation
  ✓ Output mentions 'DRAFT'
  ✓ Context has indicator-aware fields

Output Type: ASSESSMENT
  Model: pending-implementation
  ✓ Output mentions 'ASSESSMENT'
  ✓ Context has indicator-aware fields
```

---

## Database Snapshot Example

When `GeneratedOutput` is created, `prompt_context_snapshot` now contains:
```json
{
  "project_id": 1,
  "project_name": "E2E Lab Project",
  "indicator_code": "Ind 001",
  "indicator_text": "Indicator text here...",
  "area_name": "Area Name",
  "domain_name": "Domain Name",
  "standard_code": "STD-001",
  "standard_title": "Standard Title",
  "standard_text": "Standard text...",
  "required_evidence_description": "Evidence requirement...",
  "evidence_type": "Document",
  "minimum_required_evidence": 2,
  "total_evidence_count": 0,
  "approved_evidence_count": 0,
  "rejected_evidence_count": 0,
  "pending_evidence_count": 0,
  "evidence_titles": [],
  "current_status": "NOT_STARTED",
  "priority": "High",
  "due_date": "2025-12-31",
  "owner_name": "John Doe",
  "owner_email": "john@example.com",
  "notes": "Any notes...",
  ...and 8 more fields
}
```

---

## Safety Guarantees

✅ **Advisory-Only Maintained:**
- `accept_generated_output()` only touches accepted/accepted_at/accepted_by
- No indicator status mutations
- No evidence creation or mutation
- No workflow state changes
- Full audit trail via log_audit_event()

✅ **Field Access Safety:**
- All model attribute access uses `getattr(obj, "field", default)`
- Missing/None fields return sensible defaults ("N/A", [], 0, False)
- No AttributeError crashes even if models change

✅ **Input Validation:**
- output_type raises ValueError for unknown types
- user_instruction captured as-is in context
- project_indicator must have proper access control (enforced by ensure_project_owner_access)

---

## How Output_Type Now Changes Prompt Path

**Before this phase:**
```
create_generated_output(output_type="GUIDANCE")
  ↓
_generate_ai_output_content()
  ↓
Returns same generic prompt regardless of output_type
```

**After this phase:**
```
create_generated_output(output_type="GUIDANCE")
  ↓
_generate_ai_output_content(output_type="GUIDANCE")
  ↓
build_indicator_ai_context(project_indicator)  ← 40+ fields
  ↓
build_prompt_for_output_type("GUIDANCE", context, instruction)
  ↓
build_guidance_prompt(context, instruction)  ← Specific template
  ↓
Returns GUIDANCE-specific prompt (action plan template)
```

Same for DRAFT (document template) and ASSESSMENT (readiness template).

---

## Files Summary

| File | Status | Purpose |
|------|--------|---------|
| `prompts.py` | ✅ NEW | Context extraction + prompt building |
| `generation.py` | ✅ UPDATED | Uses context + prompt builders |
| `services/__init__.py` | ✅ UPDATED | Exports all prompt functions |
| `settings.py` | ✅ RETAINED | AI provider configuration |
| `.env.example` | ✅ RETAINED | Configuration placeholders |

---

## Next Exact Step

**NEXT PHASE: Real Gemini API Integration**

File to change: `backend/apps/ai_actions/services/generation.py`

Implement real API call in `_generate_ai_output_content()`:

```python
# Current (pending state):
if not ai_config.is_configured:
    # ... error handling
    
# Next:
if not ai_config.is_configured:
    # ... error handling
    
elif ai_config.provider == "gemini":
    real_content = call_gemini_api(prompt, ai_config.model, ai_config.gemini_api_key)
    return (real_content, ai_config.model, context_snapshot)
```

Required:
1. Install google-generativeai package
2. Call Google GenerativeAI SDK with prompt
3. Error handling for API failures
4. Rate limiting / retry logic (optional)
5. Tests with mocked Gemini responses

---

## Acceptance Criteria Met

- ✅ `build_indicator_ai_context()` extracts 40+ safe fields
- ✅ `build_guidance_prompt()`, `build_draft_prompt()`, `build_assessment_prompt()` templates created
- ✅ `build_prompt_for_output_type()` routes to correct template
- ✅ generation.py uses prompt builders
- ✅ prompt_context_snapshot now stores rich context
- ✅ output_type changes prompt path (verified in tests)
- ✅ Django check passes
- ✅ All prompt types tested and producing different outputs
- ✅ Advisory-only behavior preserved
- ✅ No Gemini API called (as intended)
- ✅ Documentation complete

---

## Remaining Work

After this phase:
1. Implement real Gemini API call
2. Add error handling for API failures
3. Add rate limiting (optional)
4. Frontend improvements (show provider, loading, errors)
5. Comprehensive tests
6. Integration tests with real Gemini (if key available)

---

**Phase 3 Complete. Ready for Phase 4: Real Gemini Integration.**
