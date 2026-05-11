# Drift Risk Report

| Drift Issue | Severity | Evidence | Why It Matters | Required Fix | Blocks Next Sprint? |
|---|---|---|---|---|---|
| Final ZIP export not built | Medium | Export preview is present, not a final pack engine | Leaves the inspection pack incomplete | Build export engine later | No |
| CAPA remains placeholder-level | Medium | No mature CAPA model/workflow verified | Gaps remain unresolved in-system | Add CAPA sprint later | No |
| Frontend requirement matrix not explicit enough | Medium | UI surfaces workflow, but rows are not first-class | Users can miss requirement-level status | Add matrix alignment sprint | No |
| Playwright tests assume only one framework exists | Low | Two specs failed on extra frameworks | Creates noisy false negatives | Update test data assumptions | No |

## Conclusion

No architectural drift toward a simple SOP generator was found. The main residual risks are product-completeness gaps, not architecture collapse.

