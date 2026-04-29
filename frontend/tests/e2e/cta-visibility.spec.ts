import { expect, test } from "@playwright/test";

import { authStatePath } from "./helpers";

test.describe("CTA visibility", () => {
  test.describe("admin", () => {
    test.use({ storageState: authStatePath("admin") });

    test("project create and admin actions are visible", async ({ page }) => {
      await page.goto("/projects");
      await expect(page.getByRole("button", { name: "Create project" }).first()).toBeVisible();
      await expect(page.getByRole("button", { name: "Create project" }).first()).toBeEnabled();
      await expect(page.getByRole("link", { name: "Admin Dashboard" })).toBeVisible();
    });
  });

  test.describe("owner", () => {
    test.use({ storageState: authStatePath("owner") });

    test("restricted CTAs remain visible with clear disabled state", async ({ page }) => {
      await page.goto("/projects");
      await expect(page.getByRole("button", { name: "Create project" }).first()).toBeVisible();
      await expect(page.getByRole("button", { name: "Create project" }).first()).toBeDisabled();
      await expect(page.getByText("Only ADMIN or LEAD can create or manage projects.", { exact: true })).toBeVisible();
    });
  });
});
