import { expect, test } from "@playwright/test";

import {
  authStatePath,
  createProjectFromLab,
  ensureCleanE2EState,
  listProjects,
  seedContract,
} from "./helpers";

test.use({ storageState: authStatePath("admin") });

test.describe("15 smoke clean new app mode", () => {
  test("app stays LAB-only and first-project flow remains smooth", async ({ page }) => {
    await ensureCleanE2EState(page);

    const frameworksResponse = await page.request.get("/api/frameworks/");
    const frameworksPayload = await frameworksResponse.json();
    expect(frameworksResponse.ok()).toBeTruthy();
    const frameworks = frameworksPayload.data as Array<{ id: number; name: string }>;
    expect(frameworks).toHaveLength(1);
    expect(frameworks[0].name).toBe("LAB");

    const projects = await listProjects(page);
    expect(projects.results.every((item) => item.name.startsWith("E2E"))).toBeTruthy();

    const project = await createProjectFromLab(
      page,
      `${seedContract.artifactPrefix}SMOKE_FIRST_${Date.now()}`,
      `${seedContract.artifactPrefix}SMOKE_CLIENT_${Date.now()}`,
    );
    await page.goto(`/projects/${project.id}`);
    await expect(page.getByRole("heading", { name: project.name }).first()).toBeVisible();
    await page.goto(`/projects/${project.id}/worklist`);
    await expect(page.getByRole("heading", { name: "Project worklist" })).toBeVisible();
  });
});
