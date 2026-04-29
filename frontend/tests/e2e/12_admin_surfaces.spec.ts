import { expect, test } from "@playwright/test";

import { authStatePath } from "./helpers";

test.use({ storageState: authStatePath("admin") });

test.describe("12 admin surfaces", () => {
  test("admin dashboard/users/masters/audit/import logs/overrides are reachable", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: "Admin dashboard" })).toBeVisible();

    await page.goto("/admin/users");
    await expect(page).toHaveURL(/\/admin\/users/);

    await page.goto("/admin/masters/document-types");
    await expect(page).toHaveURL(/\/admin\/masters\/document-types/);

    await page.goto("/admin/audit");
    await expect(page).toHaveURL(/\/admin\/audit/);

    await page.goto("/admin/import-logs");
    await expect(page).toHaveURL(/\/admin\/import-logs/);

    await page.goto("/admin/overrides");
    await expect(page).toHaveURL(/\/admin\/overrides/);
  });
});
