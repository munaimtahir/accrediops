import { expect, test } from "@playwright/test";

import { authStatePath, createProjectFromLab, ensureCleanE2EState, seedContract } from "./helpers";

test.describe("02 project create and initialize", () => {
  test.describe("admin", () => {
    test.use({ storageState: authStatePath("admin") });

    test("ADMIN can create and initialize a LAB project", async ({ page }) => {
      await ensureCleanE2EState(page);
      const project = await createProjectFromLab(
        page,
        `${seedContract.artifactPrefix}ADMIN_CREATE_${Date.now()}`,
        `${seedContract.artifactPrefix}ADMIN_CLIENT_${Date.now()}`,
      );
      await page.goto(`/projects/${project.id}`);
      await expect(page.getByRole("heading", { name: project.name }).first()).toBeVisible();
      await expect(page.getByText("Indicators total")).toBeVisible();
    });
  });

  test.describe("lead", () => {
    test.use({ storageState: authStatePath("lead") });

    test("LEAD can create and initialize a LAB project", async ({ page }) => {
      const project = await createProjectFromLab(
        page,
        `${seedContract.artifactPrefix}LEAD_CREATE_${Date.now()}`,
        `${seedContract.artifactPrefix}LEAD_CLIENT_${Date.now()}`,
      );
      const worklistResponse = await page.request.get(`/api/dashboard/worklist/?project_id=${project.id}&page_size=1`);
      const worklistPayload = await worklistResponse.json();
      expect(worklistResponse.ok()).toBeTruthy();
      expect(worklistPayload.data.count).toBeGreaterThan(0);
    });
  });

  test.describe("owner", () => {
    test.use({ storageState: authStatePath("owner") });

    test("OWNER cannot create project", async ({ page }) => {
      await page.goto("/projects");
      await expect(page.getByRole("button", { name: "Create project" }).first()).toBeDisabled();
      await expect(page.getByText(/Only ADMIN or LEAD can create or manage projects/i).first()).toBeVisible();
    });
  });
});
