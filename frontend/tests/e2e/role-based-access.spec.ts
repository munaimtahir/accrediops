import { expect, test } from "@playwright/test";

import { authStatePath } from "./helpers";

test.describe("Role based access", () => {
  test.describe("admin and lead", () => {
    test.use({ storageState: authStatePath("admin") });

    test("admin can open admin dashboard", async ({ page }) => {
      await page.goto("/admin");
      await expect(page.getByRole("heading", { name: "Admin dashboard" })).toBeVisible();
    });
  });

  test.describe("owner", () => {
    test.use({ storageState: authStatePath("owner") });

    test("owner sees restricted messaging for admin and readiness", async ({ page }) => {
      await page.goto("/admin");
      await expect(page.getByText("Admin access restricted")).toBeVisible();
      await expect(page.getByText("Only ADMIN or LEAD can access the admin area.").first()).toBeVisible();

      const projectResponse = await page.request.get("/api/projects/?page_size=1");
      const projectPayload = await projectResponse.json();
      const projectId = projectPayload.data.results[0].id as number;

      await page.goto(`/projects/${projectId}/readiness`);
      await expect(page.getByText("Readiness access restricted")).toBeVisible();
    });
  });
});
