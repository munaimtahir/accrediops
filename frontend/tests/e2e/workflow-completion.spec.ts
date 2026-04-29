import { expect, test } from "@playwright/test";

import { authStatePath } from "./helpers";

test.describe("Workflow completion surfaces", () => {
  test.use({ storageState: authStatePath("admin") });

  test("operator can traverse core workflow screens with explicit next action guidance", async ({ page }) => {
    const projectResponse = await page.request.get("/api/projects/?page_size=1");
    const projectPayload = await projectResponse.json();
    const projectId = projectPayload.data.results[0].id as number;
    const worklistResponse = await page.request.get(`/api/dashboard/worklist/?project_id=${projectId}&page_size=1`);
    const worklistPayload = await worklistResponse.json();
    const indicatorId = Number(worklistPayload.data.results[0].project_indicator_id);

    await page.goto(`/projects/${projectId}`);
    await expect(page.getByTestId("next-action-banner").getByText("Action", { exact: true })).toBeVisible();

    await page.goto(`/projects/${projectId}/worklist`);
    await expect(page.getByRole("heading", { name: "Project worklist" })).toBeVisible();
    await expect(page.getByTestId("next-action-banner").getByText("Action", { exact: true })).toBeVisible();

    await page.goto(`/project-indicators/${indicatorId}`);
    await expect(page.getByRole("button", { name: "Readiness status", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Required evidence", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Actions", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Evidence", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Recurring", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "AI / Assist", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Governance / Override", exact: true })).toBeVisible();
  });
});
