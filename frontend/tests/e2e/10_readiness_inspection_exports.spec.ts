import { expect, test } from "@playwright/test";

import { authStatePath, ensureCleanE2EState, getApi, postApiRaw } from "./helpers";

test.describe("10 readiness, inspection, exports", () => {
  test.describe("admin", () => {
    test.use({ storageState: authStatePath("admin") });

    test("readiness and inspection screens open, unready export generation is blocked without history", async ({ page }) => {
      const project = await ensureCleanE2EState(page);

      await page.goto(`/projects/${project.id}/readiness`);
      await expect(page.getByRole("heading", { name: "Project readiness" })).toBeVisible();

      await page.goto(`/projects/${project.id}/inspection`);
      await expect(page.getByRole("heading", { name: "Inspection mode" })).toBeVisible();

      await page.goto(`/projects/${project.id}/exports`);
      await expect(page.getByRole("heading", { name: "Export history" })).toBeVisible();
      const blockedExport = await postApiRaw(
        page,
        `/api/exports/projects/${project.id}/generate/`,
        { type: "print-bundle", parameters: {} },
      );
      expect(blockedExport.status).toBe(403);
      expect(blockedExport.body.error.message).toContain("Export blocked:");

      const rows = await getApi<Array<{ type: string; status: string }>>(
        page,
        `/api/exports/projects/${project.id}/history/`,
        "load export history",
      );
      expect(rows).toHaveLength(0);
    });
  });

  test.describe("owner", () => {
    test.use({ storageState: authStatePath("owner") });

    test("owner sees clean restricted UX on readiness and exports", async ({ page }) => {
      const projectsResponse = await page.request.get("/api/projects/?page_size=1");
      const projectsPayload = await projectsResponse.json();
      const projectId = projectsPayload.data.results[0].id as number;

      await page.goto(`/projects/${projectId}/readiness`);
      await expect(page.getByText("Readiness access restricted")).toBeVisible();

      await page.goto(`/projects/${projectId}/exports`);
      await expect(page.getByText("Export access restricted")).toBeVisible();
    });
  });
});
