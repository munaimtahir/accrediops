import { expect, test } from "@playwright/test";

import { authStatePath } from "./helpers";

test.describe("permission enforcement", () => {
  test.describe("owner", () => {
    test.use({ storageState: authStatePath("owner") });

    test("restricted admin and export endpoints return 403", async ({ page }) => {
      const projectsResponse = await page.request.get("/api/projects/?page_size=1");
      const projectsPayload = await projectsResponse.json();
      const projectId = projectsPayload.data.results[0].id as number;

      const adminDashboard = await page.request.get("/api/admin/dashboard/");
      expect(adminDashboard.status()).toBe(403);
      const adminPayload = await adminDashboard.json();
      expect(adminPayload.error.code).toBe("PERMISSION_DENIED");

      const generateExport = await page.request.post(`/api/exports/projects/${projectId}/generate/`, {
        data: { type: "print-bundle", parameters: {} },
      });
      expect(generateExport.status()).toBe(403);
      const exportPayload = await generateExport.json();
      expect(exportPayload.error.code).toBe("PERMISSION_DENIED");

      await page.goto(`/projects/${projectId}/exports`);
      await expect(page.getByText("Export access restricted")).toBeVisible();
    });
  });
});
