# UI Breakpoints

## Critical
1. **Create Project discoverability on `/projects`**
   - **Observed:** Functional flow existed but entry point was easy to miss.
   - **Fix applied:** Sticky “Primary action” card + persistent top CTA + explicit role rationale for disabled state.

2. **Indicator mental model drift**
   - **Observed:** Mixed section emphasis made first-time operation confusing.
   - **Fix applied:** Enforced section order: Readiness → Summary → Actions → Evidence → Recurring → AI/Assist → Governance/Override with section purpose + status + allowed action framing.

## High
3. **Role gating clarity**
   - **Observed:** Some actions were hidden/disabled without clear “why”.
   - **Fix applied:** Permission hints and disabled-state explanations across projects, indicators, exports, and recurring.

4. **Status semantics inconsistency**
   - **Observed:** Color/label meanings differed by screen.
   - **Fix applied:** Introduced shared semantic mapping (Green/Yellow/Red/Blue/Grey) + global legend and reusable badge component.

## Medium
5. **Navigation context between operational vs admin surfaces**
   - **Observed:** Cross-role users could misinterpret admin page availability.
   - **Fix applied:** Sidebar grouped IA and admin section visibility tightened to admin-only links.

6. **Workflow guidance density**
   - **Observed:** Data-heavy screens lacked “what next?” cues.
   - **Fix applied:** Added next-action helpers in overview/worklist/recurring/readiness/inspection/exports.

## Low
7. **Empty/zero states in selected lists**
   - **Observed:** Some sparse views lacked explicit “do this next” language.
   - **Fix applied:** Added or refined empty-state prompts where operationally relevant.
