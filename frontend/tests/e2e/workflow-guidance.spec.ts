import { expect, test } from "@playwright/test";
import { loginAsSeededAdmin } from "./helpers";

test.describe("Workflow guidance", () => {
  test("project overview shows next-step guidance and grouped pathways", async ({ page }) => {
    await loginAsSeededAdmin(page);
    await page.getByRole("link", { name: "Open project" }).first().click();
    const main = page.locator("main");
    await expect(main.getByText("Action").first()).toBeVisible();
    await expect(main.getByText("Reason")).toBeVisible();
    await expect(main.getByText("Status")).toBeVisible();
    await expect(main.getByRole("heading", { name: "Operate indicators" })).toBeVisible();
    await expect(main.getByRole("heading", { name: "Review readiness" })).toBeVisible();
    await expect(main.getByRole("heading", { name: "Export and documentation" })).toBeVisible();
  });

  test("worklist and recurring screens provide action guidance", async ({ page }) => {
    await loginAsSeededAdmin(page);
    await page.getByRole("link", { name: "Open project" }).first().click();
    await expect(page).toHaveURL(/\/projects\/\d+/); // Wait for navigation
    const projectId = Number(page.url().match(/\/projects\/(\d+)/)?.[1]);
    expect(projectId).toBeGreaterThan(0);

    await page.goto(`/projects/${projectId}/worklist`);
    await expect(page.getByRole("heading", { name: "Project worklist" })).toBeVisible();
    await expect(page.getByText("Action").first()).toBeVisible();

    await page.goto(`/projects/${projectId}/recurring`);
    await expect(page.getByRole("heading", { name: "Recurring evidence queue" })).toBeVisible({ timeout: 20000 });
    await expect(page.getByText("Recurring execution tip")).toBeVisible();
  });
});
