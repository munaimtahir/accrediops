import { test, expect } from "@playwright/test";

import { loginAs, logout } from "./helpers";

test.describe("Recurring Queue and Admin Masters Capabilities", () => {
  test("Recurring queue row action visibility", async ({ page }) => {
    test.setTimeout(180_000);
    await loginAs(page, "admin");
    await page.goto("/projects");

    const seededProjectHeading = page.getByRole("heading", { name: "E2E Lab Project", exact: true });
    const projectCard = page.locator("main").locator("div").filter({ has: seededProjectHeading }).first();
    const openProjectHref = await projectCard.getByRole("link", { name: "Open project" }).first().getAttribute("href");
    if (!openProjectHref) throw new Error("Open project href missing for E2E Lab Project.");
    await page.goto(openProjectHref);

    const match = page.url().match(/\/projects\/(\d+)/);
    if (!match) throw new Error(`Could not extract project ID from URL: ${page.url()}`);
    const projectId = match[1];

    await page.goto(`/projects/${projectId}/recurring`);
    await expect(page.getByText("Request failed")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Submit" }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Approve" }).first()).toBeVisible();

    await logout(page);

    await loginAs(page, "owner");
    await page.goto(`/projects/${projectId}/recurring`);
    await expect(page.getByRole("button", { name: "Submit" }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Approve" }).first()).toBeDisabled();

    await logout(page);

    await loginAs(page, "reviewer");
    await page.goto(`/projects/${projectId}/recurring`);
    await expect(page.getByRole("button", { name: "Submit" }).first()).toBeDisabled();
    await expect(page.getByRole("button", { name: "Approve" }).first()).toBeVisible();
  });

  test("Admin masters edit", async ({ page }) => {
    await loginAs(page, "admin");
    await page.goto("/admin/masters/statuses");

    // Click on the first edit button
    await page.waitForSelector('button:has-text("Edit")');
    await page.locator('button:has-text("Edit")').first().click();

    // The modal should be visible - Use h3 as identified in modal.tsx
    await expect(page.locator("h3:has-text('Edit Master Value')")).toBeVisible();

    // Change the label
    const dialog = page.getByRole("dialog", { name: "Edit Master Value" });
    const labelInput = dialog.getByLabel("Label");
    const currentLabel = await labelInput.inputValue();
    await labelInput.fill(currentLabel + " edited");
    
    // Save the changes
    await page.locator('button[type="submit"]:has-text("Save")').click();

    // The modal should be closed
    await expect(page.locator("h3:has-text('Edit Master Value')")).not.toBeVisible();

    // The table should contain the new label
    await expect(page.locator(`text=${currentLabel} edited`)).toBeVisible();

    await logout(page);
  });
});
