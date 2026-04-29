import { expect, test } from "@playwright/test";

import { authStatePath } from "./helpers";

test.describe("Negative flows", () => {
  test.use({ storageState: authStatePath("owner") });

  test("restricted and empty-state flows always provide operator guidance", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByText("Admin access restricted")).toBeVisible();
    await expect(page.getByRole("link", { name: "Back to projects" })).toBeVisible();

    await page.goto("/projects");
    await expect(page.getByRole("button", { name: "Create project" }).first()).toBeDisabled();

    const projectResponse = await page.request.get("/api/projects/?page_size=1");
    const projectPayload = await projectResponse.json();
    const projectId = projectPayload.data.results[0].id as number;

    await page.goto(`/projects/${projectId}/exports`);
    await expect(page.getByText("Export access restricted")).toBeVisible();
    await expect(page.getByRole("link", { name: "Back to project" })).toBeVisible();
  });
});
