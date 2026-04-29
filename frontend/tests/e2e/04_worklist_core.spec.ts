import { expect, test } from "@playwright/test";

import {
  authStatePath,
  ensureCleanE2EState,
  expectNo5xxOnPage,
  getWorklistRows,
  openWorklist,
} from "./helpers";

test.use({ storageState: authStatePath("admin") });

test.describe("04 worklist core", () => {
  test("worklist filters and show-all operate without 500 responses", async ({ page }) => {
    const project = await ensureCleanE2EState(page);
    const stop5xx = expectNo5xxOnPage(page);

    await openWorklist(page, project.id);
    const nextAction = page.getByTestId("next-action-banner");
    await expect(nextAction.getByText("Action", { exact: true })).toBeVisible();
    await expect(nextAction.getByText("Reason", { exact: true })).toBeVisible();
    await expect(nextAction.getByText("Status", { exact: true })).toBeVisible();

    await page.goto(`/projects/${project.id}/worklist?page_size=all`);
    await expect(page).toHaveURL(/page_size=all/);

    const showAllResponse = await page.request.get(`/api/dashboard/worklist/?project_id=${project.id}&page_size=all`);
    const showAllPayload = await showAllResponse.json();
    expect(showAllResponse.ok()).toBeTruthy();
    expect(showAllPayload.data.count).toBeGreaterThan(0);

    await page.getByPlaceholder("Indicator code, text, area, standard, or project").fill("LAB");

    const filtered = await getWorklistRows(
      page,
      project.id,
      "status=IN_PROGRESS&recurring=true&overdue=true&search=LAB&page_size=25",
    );
    expect(filtered.count).toBeGreaterThanOrEqual(0);

    await stop5xx();
  });
});
