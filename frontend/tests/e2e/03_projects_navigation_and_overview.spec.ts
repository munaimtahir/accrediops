import { expect, test } from "@playwright/test";

import { authStatePath, ensureCleanE2EState, openProjectByName, seedContract } from "./helpers";

test.use({ storageState: authStatePath("admin") });

test.describe("03 projects navigation and overview", () => {
  test("project list and overview surfaces are navigable with clear next-step guidance", async ({ page }) => {
    await ensureCleanE2EState(page);
    await page.goto("/projects");
    await expect(page.getByRole("heading", { name: "Project register" })).toBeVisible();
    await expect(page.getByText("Where to start")).toBeVisible();

    const projectId = await openProjectByName(page, seedContract.projectName);
    await expect(page.getByRole("heading", { name: seedContract.projectName }).first()).toBeVisible();
    const nextAction = page.getByTestId("next-action-banner");
    await expect(nextAction.getByText("Action", { exact: true })).toBeVisible();
    await expect(nextAction.getByText("Reason", { exact: true })).toBeVisible();
    await expect(nextAction.getByText("Status", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Operate indicators" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Review readiness" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Export and documentation" })).toBeVisible();

    await page.goto(`/projects/${projectId}/worklist`);
    await expect(page.getByRole("heading", { name: "Project worklist" })).toBeVisible();
    await page.goto(`/projects/${projectId}/recurring`);
    await expect(page.getByRole("heading", { name: "Recurring evidence queue" })).toBeVisible();
  });
});
