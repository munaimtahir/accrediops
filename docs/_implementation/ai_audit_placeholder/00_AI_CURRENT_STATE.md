# AI Functionality Audit: Current State

**Date:** 2026-04-26 17:41 UTC  
**Scope:** Backend AI generation, frontend AI panel, provider configuration  
**Status:** Placeholder implementation confirmed. No real AI provider configured.

---

## 1. WHERE "manual-placeholder" COMES FROM

### Backend Source
File: `backend/apps/ai_actions/services.py` (lines 12-47)

```python
@transaction.atomic
def create_generated_output(
    *,
    project_indicator,
    actor,
    output_type: str,
    user_instruction: str = "",
) -> GeneratedOutput:
    # ... permission check, snapshot ...
    content = (
        f"Advisory {output_type.lower()} for {project_indicator.indicator.code}. "
        f"Instruction: {user_instruction or 'No extra instruction provided.'}"
    )
    # ... variable replacement ...
    generated_output = GeneratedOutput.objects.create(
        project_indicator=project_indicator,
        output_type=output_type,
        prompt_context_snapshot=snapshot,
        content=content,
        model_name="manual-placeholder",  # ← HARDCODED HERE
        created_by=actor,
    )
```

**Finding:** `model_name="manual-placeholder"` is hardcoded in line 37.

---

## 2. REAL AI PROVIDER CONFIGURATION

### Backend Dependencies
File: `backend/requirements.txt`

```
Django>=5.2,<5.3
djangorestframework>=3.16,<3.17
python-dotenv>=1.1,<2.0
psycopg[binary]>=3.2,<4.0
whitenoise>=6.7,<7.0
pytest>=8.3,<9.0
pytest-django>=4.8,<5.0
pytest-cov>=5.0,<6.0
```

**Finding:** No AI provider libraries (openai, anthropic, google-generativeai, langchain) present.

### Settings Configuration
File: `backend/config/accrediops_backend/settings.py`

**Finding:** No `AI_PROVIDER`, `AI_MODEL`, or `API_KEY` settings defined. No environment variables searched for AI configuration.

### Environment Variables
File: `backend/.env.example`

Lines 1-17 show:
- DJANGO_SECRET_KEY
- DJANGO_DEBUG
- DJANGO_ALLOWED_HOSTS
- DJANGO_CSRF settings
- DB_ENGINE, DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT

**Finding:** No AI provider environment variables configured.

---

## 3. AI OUTPUT GENERATION FLOW

### Snapshot Context (Minimal)
Lines 20-25 of `services.py`:

```python
snapshot = {
    "project_id": project_indicator.project_id,
    "indicator_code": project_indicator.indicator.code,
    "current_status": project_indicator.current_status,
    "user_instruction": user_instruction,
}
```

**Finding:** Snapshot captures only 4 fields. Does NOT include:
- Indicator text, area, standard
- Required evidence description
- Evidence type, document type
- Current evidence counts
- Approved/rejected evidence counts
- Minimum required evidence
- Notes
- Existing evidence titles or details

### Content Generation (Placeholder)
Lines 26-31:

```python
content = (
    f"Advisory {output_type.lower()} for {project_indicator.indicator.code}. "
    f"Instruction: {user_instruction or 'No extra instruction provided.'}"
)
project = project_indicator.project
content = replace_variables(content, project.client_profile)
```

**Finding:** Output is generic string concatenation, not AI-generated. Variable replacement only substitutes client profile placeholders.

### Output Types
File: `frontend/types/index.ts` line 11:

```typescript
export type AIOutputType = "GUIDANCE" | "DRAFT" | "ASSESSMENT";
```

Model: `backend/apps/ai_actions/models/generated_output.py` line 13:

```python
output_type = models.CharField(max_length=20, choices=GeneratedOutputTypeChoices.choices)
```

**Finding:** `output_type` (GUIDANCE, DRAFT, ASSESSMENT) changes the string but NOT the actual output content or structure. All three produce identical placeholder format:
- "Advisory guidance for Ind 066. Instruction: ..."
- "Advisory draft for Ind 066. Instruction: ..."
- "Advisory assessment for Ind 066. Instruction: ..."

---

## 4. USER INSTRUCTION USAGE

### Backend
Lines 34 in `services.py`: Input parameter captured and used in snapshot and content.

```python
user_instruction: str = "",
```

Line 27-28: Used in output:
```python
f"Instruction: {user_instruction or 'No extra instruction provided.'}"
```

**Finding:** User instruction IS captured and included in placeholder output, but not used as a prompt to guide real AI generation.

### Frontend
File: `frontend/components/screens/indicator-detail-screen.tsx` lines 137-138:

```typescript
const [aiInstruction, setAiInstruction] = useState("");
```

Lines 306-310 in `handleGenerateAI()`:
```typescript
await generateAI.mutateAsync({
  project_indicator_id: indicatorId,
  output_type: aiOutputMode,
  user_instruction: aiInstruction,
});
```

**Finding:** Frontend captures user instruction and sends it to backend. Backend uses it in placeholder output only.

---

## 5. ACCEPT OUTPUT BEHAVIOR (SAFETY CHECK)

### Backend Service
File: `backend/apps/ai_actions/services.py` lines 50-67:

```python
@transaction.atomic
def accept_generated_output(*, generated_output: GeneratedOutput, actor) -> GeneratedOutput:
    ensure_project_owner_access(actor, generated_output.project_indicator)
    if generated_output.accepted:
        raise ValidationError("Generated output has already been accepted.")
    before = snapshot_instance(generated_output)
    generated_output.accepted = True
    generated_output.accepted_at = timezone.now()
    generated_output.accepted_by = actor
    generated_output.save()
    log_audit_event(
        actor=actor,
        event_type="ai.output_accepted",
        obj=generated_output,
        before=before,
        after=snapshot_instance(generated_output),
    )
    return generated_output
```

**Finding:** Accept only updates:
- `accepted = True`
- `accepted_at = timezone.now()`
- `accepted_by = actor`

NO changes to:
- `ProjectIndicator.current_status`
- `ProjectIndicator.is_met`
- Evidence items
- Recurring requirements
- Any workflow state

### Permission Check
Line 52: `ensure_project_owner_access(actor, generated_output.project_indicator)`

**Finding:** Accepts follow same role-based permission as generation (owner or lead/admin).

### Audit Trail
Lines 60-66: Accept event logged to audit trail with before/after snapshots.

**Finding:** Full governance trail preserved.

---

## 6. WORKFLOW STATUS MUTATION PROTECTION

### Indicator Detail API
File: `backend/apps/api/views/project_indicators.py` lines 36-65:

The `ProjectIndicatorDetailView.get()` method does NOT call any AI functions. It only returns indicator state.

### Workflow Commands
Lines 100-162 show dedicated workflow mutation endpoints:
- `ProjectIndicatorStartView`
- `ProjectIndicatorSendForReviewView`
- `ProjectIndicatorMarkMetView`
- `ProjectIndicatorReopenView`

Each enforces explicit permission checks:
- `ensure_project_owner_access()` for start/review
- `ensure_project_approver_access()` for mark-met
- `ensure_admin_access()` for reopen

**Finding:** AI accept is separate from workflow. No cross-mutation.

---

## 7. FRONTEND AI PANEL UI

### Panel Location
File: `frontend/components/screens/indicator-detail-screen.tsx` lines 233-234:

```typescript
{ key: "ai", label: "AI / Assist" },
```

### Generation Dialog
Lines 137-138, 296-318 in `handleGenerateAI()`:

- Shows modal with output type selector (GUIDANCE, DRAFT, ASSESSMENT)
- Input field for user instruction (optional)
- "Generate" button calls `generateAI.mutateAsync()`
- Success toast: "AI output generated."

### Display of Generated Outputs
Lines 179, 859-900 (approximate):

Generated outputs displayed in a list with:
- Output type badge
- Model name display
- Content text
- Accept button (disabled if already accepted)
- Status badge: "AI-generated"

### Accept Dialog
Lines 1055-1080 (approximate):

Confirmation dialog:
- Title: "Accept AI output"
- Description: "This records manual acceptance of an AI-generated output. It does not change indicator workflow state."
- Calls `acceptAI.mutateAsync()`
- Success toast: "AI output accepted."

**Finding:** UI clearly labels AI output as advisory and non-mutating.

---

## 8. SUMMARY: PLACEHOLDER STATUS

| Aspect | Finding | Risk |
|--------|---------|------|
| **Provider** | None configured | Low (explicit placeholder) |
| **Output** | Hardcoded string | Low (not misleading) |
| **Context** | Minimal snapshot | Medium (not indicator-aware) |
| **User instruction** | Captured, included in output | Low (advisory only) |
| **Output types** | Three types but same format | Low (structure identical) |
| **Accept behavior** | Advisory-only flag, no mutation | **GREEN** |
| **Workflow separation** | Dedicated endpoints, no cross-call | **GREEN** |
| **Permission checks** | Owner/lead/admin gated | **GREEN** |
| **Audit trail** | Full before/after logged | **GREEN** |

---

## 9. CURRENT STATE CONCLUSION

### What IS Working Safely
✓ Accept output does NOT change indicator status  
✓ Accept output is role-gated (owner/lead/admin)  
✓ Workflow commands are separate and explicit  
✓ Full audit trail preserved  
✓ Frontend UI clearly labels AI as advisory  
✓ Placeholder output is not deceptive  

### What IS NOT Working
✗ No real AI provider configured  
✗ No prompt engineering or context-aware generation  
✗ Output type (GUIDANCE/DRAFT/ASSESSMENT) produces identical output  
✗ Snapshot is minimal (4 fields, not indicator-complete)  
✗ User instruction not used as prompt steering  
✗ No error messaging if provider missing  

---

## 10. NEXT STEPS

To make AI genuinely functional while keeping it advisory-only:

1. **Add provider abstraction** → `backend/apps/ai_actions/services/provider.py`
2. **Configure environment variables** → Add `AI_PROVIDER`, `AI_MODEL`, `API_KEY` to `.env.example`
3. **Build indicator-aware prompts** → `backend/apps/ai_actions/services/prompts.py`
4. **Update context snapshot** → Include full indicator metadata
5. **Update generation service** → Call real provider with structured prompt
6. **Improve frontend UI** → Show provider/model, loading state, errors
7. **Add tests** → Verify provider fallback, output type differences, permission enforcement

---

**Document Status:** Audit complete. No code changes. Ready for implementation phase.
