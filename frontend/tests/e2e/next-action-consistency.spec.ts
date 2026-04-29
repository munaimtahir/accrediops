import { expect, test } from "@playwright/test";

import { authStatePath, ensureCleanE2EState, getFirstIndicatorId } from "./helpers";

test.describe("next action consistency", () => {
  test.use({ storageState: authStatePath("admin") });

  test("target screens all show action, reason, and status guidance", async ({ page }) => {
    const project = await ensureCleanE2EState(page);
    const indicatorId = await getFirstIndicatorId(page, project.id);

    const urls = [
      `/projects/${project.id}`,
      `/projects/${project.id}/worklist`,
      `/project-indicators/${indicatorId}`,
      `/projects/${project.id}/recurring`,
      `/projects/${project.id}/readiness`,
      `/projects/${project.id}/exports`,
    ];

    for (const url of urls) {
      await page.goto(url);
      const nextAction = page.getByTestId("next-action-banner");
      await expect(nextAction.getByText("Action", { exact: true })).toBeVisible();
      await expect(nextAction.getByText("Reason", { exact: true })).toBeVisible();
      await expect(nextAction.getByText("Status", { exact: true })).toBeVisible();
    }
  });
});
