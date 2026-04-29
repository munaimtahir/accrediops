import { expect, test } from "@playwright/test";
import { login, loginAsSeededAdmin, seededUsers } from "./helpers";

test.describe("CTA discoverability", () => {
  test("projects page create CTA is visible in header and sticky action panel", async ({ page }) => {
    await loginAsSeededAdmin(page);
    await expect(page.getByRole("heading", { name: "Project register" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Create project" }).first()).toBeVisible();
    await expect(page.getByText("Where to start")).toBeVisible();
  });

  test("owner sees disabled create CTA with role rationale", async ({ page }) => {
    await login(page, seededUsers.owner);
    await expect(page.getByRole("button", { name: "Create project" }).first()).toBeDisabled();
    await expect(page.getByText(/Only ADMIN or LEAD can create or manage projects/i)).toBeVisible();
  });

  test("print pack and export CTA entry points are visible from project home", async ({ page }) => {
    await loginAsSeededAdmin(page);
    await page.getByRole("link", { name: "Open project" }).first().click();
    const main = page.locator("main");
    await expect(main.getByRole("link", { name: "Print pack preview" })).toBeVisible();
    await expect(main.getByRole("link", { name: "Export history" }).first()).toBeVisible();
    await main.getByRole("link", { name: "Print pack preview" }).click();
    await expect(page.getByRole("button", { name: "Generate Print Pack" })).toBeVisible();
  });
});
