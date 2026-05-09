import { expect, test } from "@playwright/test";

import { authStatePath } from "./helpers";

test.describe("Simplified Navigation and Homepage", () => {
  test.describe("admin", () => {
    test.use({ storageState: authStatePath("admin") });

    test("Simplified navigation for admin", async ({ page }) => {
      await page.goto("/projects");

      await expect(page.getByRole("link", { name: "Dashboard", exact: true })).toHaveCount(0);
      await expect(page.getByRole("link", { name: "Worklist", exact: true })).toHaveCount(0);

      await Promise.all([
        page.waitForURL(/\/admin/),
        page.getByRole("link", { name: "Admin Dashboard" }).click(),
      ]);
      await expect(page.getByRole("heading", { name: "Admin dashboard" })).toBeVisible({ timeout: 15000 });

      await Promise.all([page.waitForURL(/\/admin\/users/), page.getByRole("link", { name: "Users" }).click()]);
      await expect(page.getByRole("heading", { name: "Users and roles" })).toBeVisible({ timeout: 15000 });

      await page.goto("/admin");
      await Promise.all([page.waitForURL(/\/admin\/frameworks/), page.getByRole("link", { name: "Frameworks" }).click()]);
      await expect(page.getByRole("heading", { name: "Framework management" })).toBeVisible({ timeout: 15000 });

      await page.goto("/admin");
      await Promise.all([
        page.waitForURL(/\/admin\/masters\/statuses/),
        page.getByRole("link", { name: "Statuses" }).click(),
      ]);
      await expect(page.getByRole("heading", { name: "Statuses" })).toBeVisible({ timeout: 15000 });
    });

    test("Simplified project dashboard", async ({ page }) => {
      await page.goto("/projects");
      await page.getByRole("link", { name: "Open project" }).first().click();
      await page.waitForURL(/\/projects\/\d+/);

      await expect(page.locator("main").getByText("Project Dashboard")).toBeVisible();
      const openWorklist = page.getByRole("banner").getByRole("link", { name: "Open Worklist" }).first();
      await expect(openWorklist).toBeVisible();

      await Promise.all([page.waitForURL(/\/worklist/), openWorklist.click()]);
      await expect(page.getByRole("heading", { name: "Project worklist" })).toBeVisible();
    });

    test("AI discoverability from worklist", async ({ page }) => {
      await page.goto("/projects");
      await page.getByRole("link", { name: "Open project" }).first().click();
      await page.waitForURL(/\/projects\/\d+/);

      await page.goto(`${page.url()}/worklist`);
      await expect(page.getByRole("heading", { name: "Project worklist" })).toBeVisible();

      const indicatorTile = page.locator("main").locator("section").locator("button[title]").first();
      await expect(indicatorTile).toBeVisible({ timeout: 30000 });
      await indicatorTile.click();

      await expect(page.locator("h3:has-text('AI Action Center')")).toBeVisible();

      await Promise.all([
        page.waitForURL(/\/project-indicators\/\d+/),
        page.getByRole("link", { name: "Open AI Action Center" }).click(),
      ]);
      await expect(page.getByRole("button", { name: "AI / Assist", exact: true })).toBeVisible();
      await expect(page.locator("h2:has-text('Section 7 — AI / Assist')")).toBeVisible({ timeout: 15000 });
    });
  });

  test.describe("owner", () => {
    test.use({ storageState: authStatePath("owner") });

    test("Simplified navigation for non-admin", async ({ page }) => {
      await page.goto("/projects");

      await expect(page.getByRole("link", { name: "Admin Dashboard" })).toHaveCount(0);

      await page.getByRole("link", { name: "Open project" }).first().click();
      await page.waitForURL(/\/projects\/\d+/);

      const sidebar = page.locator("nav");
      await expect(sidebar.getByRole("link", { name: "Dashboard", exact: true })).toBeVisible();
      await expect(sidebar.getByRole("link", { name: "Worklist", exact: true })).toBeVisible();
    });
  });
});
