import { expect, test } from "@playwright/test";
import { login, seededUsers } from "./helpers";

test.describe("Role visibility and gating", () => {
  test("owner sees disabled create project CTA with explanation", async ({ page }) => {
    await login(page, seededUsers.owner);
    const createButton = page.getByRole("button", { name: "Create project" }).first();
    await expect(createButton).toBeDisabled();
    await expect(page.getByText(/Only ADMIN or LEAD can create or manage projects/i)).toBeVisible();
  });

  test("lead sees admin navigation section", async ({ page }) => {
    await login(page, seededUsers.lead);
    await expect(page.getByText("Admin")).toBeVisible();
    await expect(page.getByRole("link", { name: "Admin Dashboard" })).toBeVisible();
    await expect(page.getByText("Viewing as LEAD")).toBeVisible();
  });

  test("owner sees disabled readiness/export CTAs and guarded routes", async ({ page }) => {
    await login(page, seededUsers.owner);
    await page.getByRole("link", { name: "Open project" }).first().click();
    const projectId = Number(page.url().match(/\/projects\/(\d+)/)?.[1]);
    await expect(page.getByRole("button", { name: "Readiness" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Export history" })).toBeDisabled();

    await page.goto(`/projects/${projectId}/readiness`);
    await expect(page.getByText("Readiness access restricted")).toBeVisible();
    await expect(page.getByText("Only ADMIN or LEAD can access readiness views.")).toBeVisible();

    await page.goto(`/projects/${projectId}/exports`);
    await expect(page.getByText("Export access restricted")).toBeVisible();
    await expect(page.getByText("Only ADMIN or LEAD can access export generation and history.")).toBeVisible();
    await expect(page.getByText("Only ADMIN or LEAD can perform this action.")).toHaveCount(0);
  });
});
