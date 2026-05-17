# UX Improvement Plan - Pilot-Phase Polish

## 1. CAPA/Gap Workflow
- **Gap Creation**: 
    - Add a "⚠️ Record Gap" button to each evidence requirement card in the Indicator Detail screen (Required Evidence panel).
    - This button will open a `RecordGapModal`.
- **CAPA Creation**:
    - When an "Open Gap" badge is clicked or displayed, show an "Initialize CAPA" button.
    - This button will open an `InitializeCAPAModal`.
- **CAPA Actions**:
    - Allow users to "Submit" or "Close" CAPAs from the Indicator Detail screen.

## 2. Audit Log Readability
- Instead of showing full "Before" and "After" JSON by default, show a "Summary of changes" (e.g., `status: DRAFT -> ACTIVE`).
- Use a collapsible section or a secondary modal for full JSON details.
- Add better labels for object types.

## 3. E2E Stability (data-testid)
- Add IDs to:
    - Sidebar navigation links.
    - Action buttons in Indicator Detail (Start, Send for Review, etc.).
    - Modal confirmation buttons.
    - Tab triggers in Indicator Detail.

## 4. Fresh Deployment
- Create a script or documentation for "Fresh Demo Reset".
- Ensure `seed_e2e_state` is perfectly reliable for a clean slate.
