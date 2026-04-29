# AI Configuration Foundation

**Date:** 2026-04-26 18:00 UTC  
**Phase:** Configuration & Demo Mode Support  
**Status:** ✅ Complete, Django check passed

---

## 1. FILES CHANGED

### Created Files

1. **`backend/apps/ai_actions/services/provider.py`** (NEW)
   - `AIConfiguration` NamedTuple: stores config state
   - `AIConfigurationError` Exception: clear error messaging
   - `get_ai_config()`: reads env vars and validates
   - `validate_ai_config()`: raises errors if provider missing (unless demo mode)
   - Supports: gemini, openai, anthropic

2. **`backend/apps/ai_actions/services/__init__.py`** (UPDATED)
   - Exports generation and provider functions
   - Maintains backward compatibility with existing imports

3. **`backend/apps/ai_actions/services/generation.py`** (NEW)
   - `_generate_ai_output_content()`: determines what content to return based on config
   - `create_generated_output()`: creates advisory AI output record
   - `accept_generated_output()`: marks output as accepted (no status mutation)
   - Full docstrings clarifying advisory-only behavior

### Updated Files

1. **`backend/config/accrediops_backend/settings.py`**
   - Added AI_PROVIDER setting
   - Added AI_MODEL setting
   - Added AI_DEMO_MODE setting (boolean)
   - Added GEMINI_API_KEY setting
   - Added OPENAI_API_KEY setting
   - Added ANTHROPIC_API_KEY setting

2. **`backend/.env.example`**
   - Added AI configuration section with comments
   - Placeholders for all provider API keys
   - AI_DEMO_MODE=false by default (requires real provider)

---

## 2. ENVIRONMENT VARIABLES ADDED

```
AI_PROVIDER=gemini                          # Required: gemini, openai, anthropic
AI_MODEL=gemini-1.5-flash                   # Required: model identifier
AI_DEMO_MODE=false                          # Optional: true for demo output
GEMINI_API_KEY=your_gemini_api_key_here     # Required if AI_PROVIDER=gemini
OPENAI_API_KEY=your_openai_api_key_here     # Required if AI_PROVIDER=openai
ANTHROPIC_API_KEY=your_anthropic_api_key_here  # Required if AI_PROVIDER=anthropic
```

---

## 3. BEHAVIOR WHEN PROVIDER IS MISSING

When `AI_DEMO_MODE=false` (production default) and provider not configured:

**Output:**
```
[ERROR] AI provider is not configured. Please set AI_PROVIDER, AI_MODEL, and the appropriate API key environment variable. Supported providers: gemini, openai, anthropic. Or set AI_DEMO_MODE=true for demo output.
```

**Model name in database:** `error-not-configured`

**User sees:** Clear error message telling them what to configure

**No silent failure:** Output is explicitly marked as [ERROR], not deceptive placeholder

---

## 4. BEHAVIOR WHEN DEMO MODE IS TRUE

When `AI_DEMO_MODE=true` (development default):

**Output:**
```
[DEMO MODE] Advisory guidance for Ind 066. Instruction: Show compliance framework gaps. (This is placeholder output in demo mode.)
```

**Model name in database:** `demo-mode`

**User sees:** Clear [DEMO MODE] label, placeholder marked as demo

**No API calls:** Runs entirely locally without external services

**No configuration required:** Works without GEMINI_API_KEY, OPENAI_API_KEY, etc.

---

## 5. BEHAVIORAL TRANSITIONS

| Scenario | AI_PROVIDER | API_KEY | AI_DEMO_MODE | Output | Model Name |
|----------|-------------|---------|--------------|--------|-----------|
| Dev/demo mode | *any* | *any* | **true** | `[DEMO MODE] ...` | `demo-mode` |
| Missing provider | *empty* | *any* | **false** | `[ERROR] AI provider is not configured...` | `error-not-configured` |
| Missing API key | gemini | *empty* | **false** | `[ERROR] AI provider 'gemini' is configured but API key is missing...` | `error-missing-key` |
| All configured | gemini | *set* | **false** | `[PENDING] Real AI generation not yet implemented...` | `pending-implementation` |
| Real AI ready | gemini | *set* | **false** | *(future: real Gemini API call)* | `gemini-1.5-flash` |

---

## 6. ACCEPT OUTPUT BEHAVIOR (UNCHANGED & VERIFIED)

**Still advisory-only:**
- `accept_generated_output()` only sets:
  - `accepted = True`
  - `accepted_at = timezone.now()`
  - `accepted_by = actor`
- Does NOT touch:
  - `ProjectIndicator.current_status`
  - `ProjectIndicator.is_met`
  - Evidence items
  - Recurring obligations
- Full audit trail preserved

**Permissions:**
- Same role check: owner or lead/admin
- Same workflow: separate from status commands

---

## 7. PYTHON3 MANAGE.PY CHECK RESULT

```
System check identified no issues (0 silenced).
```

✅ All Django models valid  
✅ All settings valid  
✅ All imports working  
✅ No URL issues  

---

## 8. CONFIGURATION EXAMPLE OUTPUTS

### Development Setup (Demo Mode)
```bash
# .env
AI_PROVIDER=gemini
AI_MODEL=gemini-1.5-flash
AI_DEMO_MODE=true
```
Result: Placeholder output marked as [DEMO MODE]

### Production Setup (With Gemini)
```bash
# .env
AI_PROVIDER=gemini
AI_MODEL=gemini-1.5-flash
AI_DEMO_MODE=false
GEMINI_API_KEY=<actual-key-from-google>
```
Result: Will call Gemini API once implemented

### Error State (Misconfigured)
```bash
# .env
AI_PROVIDER=gemini
AI_MODEL=gemini-1.5-flash
AI_DEMO_MODE=false
GEMINI_API_KEY=
```
Result: Clear error message, no fake success

---

## 9. SOURCE CODE FLOW

```
[Frontend Generate Button]
    ↓
[APIGenerateView]
    ↓
[create_generated_output(indicator, user_instruction)]
    ↓
[_generate_ai_output_content()] ← Checks config
    ├─ if demo_mode → return "[DEMO MODE] ..."
    ├─ if not configured → return "[ERROR] AI provider is not configured..."
    ├─ if missing api_key → return "[ERROR] API key is missing..."
    └─ if ready → return "[PENDING] Real AI generation not yet implemented..."
    ↓
[save to GeneratedOutput with model_name]
    ↓
[audit log]
    ↓
[return to frontend]
    ↓
[Accept dialog available]
    ↓
[accept_generated_output()] ← Only sets accepted=True, accepted_at, accepted_by
    ↓
[NO indicator status change]
```

---

## 10. WORKFLOW INTEGRITY MAINTAINED

✅ **Workflow commands separate:**
- ProjectIndicatorStartView (workflow mutation)
- ProjectIndicatorSendForReviewView (workflow mutation)
- ProjectIndicatorMarkMetView (workflow mutation)
- AIGenerateView (advisory output, NO mutation)
- AIAcceptView (advisory acceptance, NO mutation)

✅ **No cross-contamination:**
- AI generation cannot change indicator status
- AI acceptance cannot change indicator status
- Workflow commands use separate permissions
- Full audit trail shows who did what when

✅ **Permission enforcement:**
- AI generation: owner or lead/admin
- AI acceptance: owner or lead/admin
- Workflow commands: role-specific (start/review, approver for met, admin for reopen)

---

## 11. NEXT EXACT FILE TO CHANGE

**Target:** Implement real Gemini API integration

**File:** `backend/apps/ai_actions/services/generation.py`

**Function:** `_generate_ai_output_content()`

**What to add:**
1. Import Google Generative AI client
2. Build prompt templates for GUIDANCE, DRAFT, ASSESSMENT
3. Call Gemini API when `config.is_configured and config.provider == "gemini"`
4. Parse response and return (content, model_name)
5. Handle API errors with clear messages

**Current placeholder state:**
```python
if config.provider and not config.api_key:
    # ... error handling ...

content = (
    f"[PENDING] Real AI generation not yet implemented for {config.provider}..."
)
model_name = "pending-implementation"
return content, model_name
```

**Next state (what to implement):**
```python
if config.provider == "gemini" and config.is_configured:
    # Call Google Generative AI SDK
    # Build indicator-aware prompt
    # Return real AI response
    pass
```

---

## 12. SUMMARY TABLE

| Aspect | Status | Notes |
|--------|--------|-------|
| Configuration loading | ✅ Done | Reads from env, validates |
| Demo mode support | ✅ Done | Works without API keys |
| Error messaging | ✅ Done | Clear error messages |
| Django check | ✅ Passed | No issues found |
| Accept behavior | ✅ Verified | Advisory-only, no mutation |
| Workflow separation | ✅ Maintained | Separate views/permissions |
| Audit trail | ✅ Preserved | Full before/after logging |
| Real AI calls | ⏳ Next | Ready to implement |

---

**Document Status:** Configuration foundation complete. Ready for Gemini API integration.
