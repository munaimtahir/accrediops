import { expect, test } from "@playwright/test";

import { authStatePath, ensureCleanE2EState, getApi, getWorklistRows, openWorklist } from "./helpers";

test.use({ storageState: authStatePath("admin") });

test.describe("16 action visibility fix", () => {
  test("primary worklist drawer exposes full detail and AI Action Center entry points", async ({ page }) => {
    const project = await ensureCleanE2EState(page);
    const worklist = await getWorklistRows(page, project.id, "page_size=1");
    const firstRow = worklist.results[0];

    test.skip(!firstRow, "No worklist indicator available for the generated project.");
    if (!firstRow) {
      return;
    }

    const beforeDetail = await getApi<{ current_status: string }>(
      page,
      `/api/project-indicators/${firstRow.project_indicator_id}/`,
      "get indicator before drawer ai flow",
    );

    await openWorklist(page, project.id);
    await page.locator(`[title*="${firstRow.indicator_code}"]`).first().click();

    await expect(page.getByRole("link", { name: "Open full detail" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Open AI Action Center" })).toBeVisible();

    await page.getByRole("link", { name: "Open AI Action Center" }).click();
    await expect(page).toHaveURL(new RegExp(`/project-indicators/${firstRow.project_indicator_id}(\\?panel=ai)?`));
    await expect(page.getByText("Section 7 — AI / Assist")).toBeVisible();
    await expect(page.getByRole("button", { name: "Generate guidance" })).toBeVisible();

    const generateResponsePromise = page.waitForResponse(
      (response) => response.url().includes("/api/ai/generate/") && response.request().method() === "POST",
    );
    await page.getByRole("button", { name: "Generate guidance" }).click();
    await page.getByRole("button", { name: "Generate", exact: true }).click();
    const generateResponse = await generateResponsePromise;
    expect(generateResponse.ok()).toBeTruthy();

    const afterDetail = await getApi<{ current_status: string }>(
      page,
      `/api/project-indicators/${firstRow.project_indicator_id}/`,
      "get indicator after drawer ai flow",
    );
    expect(afterDetail.current_status).toBe(beforeDetail.current_status);
  });
});
