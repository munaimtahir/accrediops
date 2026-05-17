# Remaining Gaps - Recurring Workflow Stabilization Sprint

## 1. Indicator Cards as Buttons
- **Gap:** The worklist uses `<button>` tags for indicator cards, which can sometimes lead to ambiguous locators if multiple indicators have similar text (though currently handled via `title` and `filter`).
- **Recommendation:** Consider adding unique `data-testid` attributes to worklist cards for even more robust E2E targeting.

## 2. Dynamic Date Handling
- **Gap:** Recurring instances are created based on the `start_date` of the project. If a project `start_date` is too far in the past or future, some E2E tests might need date adjustments.
- **Recommendation:** Maintain the current deterministic seed approach and monitor for any failures after long periods of inactivity in the project state.

## 3. Large Scale Recurring Queue
- **Gap:** The recurring queue performance with hundreds of instances was not tested.
- **Recommendation:** Future performance sprint if client projects scale significantly.
