# Workflow Confusion Map

## Journey 1: Login → Projects → Create Project → Initialize → Workspace
- **Confusion observed:** projects page previously lacked first-step framing for different roles.
- **Fix applied:** added “Where to start” guidance and first-project empty-state CTA.
- **Result:** first-time users now see clear create/start direction; non-privileged users get explicit role expectation.

## Journey 2: Projects → Open Project → Worklist → Indicator → Evidence → Review
- **Confusion observed:** project overview had high CTA density; users had to infer primary execution path.
- **Fix applied:** grouped project actions into three operational cards with clear labels and purpose.
- **Result:** worklist-first execution path is now visually obvious.

## Journey 3: Project → Recurring → Submit → Approve
- **Confusion observed:** recurring submission required manual evidence ID entry (low usability).
- **Fix applied:** recurring modal now offers evidence dropdown when evidence exists (fallback numeric input retained).
- **Result:** evidence linkage is easier and less error-prone.

## Journey 4: Project → Inspection / Readiness
- **Confusion observed:** metrics/warnings were visible but next action path was weak.
- **Fix applied:** readiness and inspection now provide direct action links back to worklist/recurring context.
- **Result:** users can move from diagnosis to remediation in one click.

## Journey 5: Admin user → Admin Dashboard → Audit / Overrides / Masters
- **Confusion observed:** admin cross-navigation cues were minimal.
- **Fix applied:** dashboard now includes direct Overrides action; admin pages include clearer descriptive context.
- **Result:** governance routes are easier to locate and understand.

## Journey 6: Non-admin user → restricted action attempt
- **Confusion observed:** disabled controls often lacked reason.
- **Fix applied:** role-sensitive actions now include permission rationale text/tooltips and contextual page guidance.
- **Result:** denied paths are understandable instead of looking broken.
