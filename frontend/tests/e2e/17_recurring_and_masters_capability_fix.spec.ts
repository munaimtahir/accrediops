import { test, expect } from "@playwright/test";
import path from "node:path";

const AUTH_DIR = path.resolve(__dirname, ".auth");

test.describe("Recurring Queue and Admin Masters Capabilities", () => {
  test("Recurring queue row action visibility", async ({ browser }) => {
    // 1. Check as Admin
    const adminContext = await browser.newContext({ storageState: path.join(AUTH_DIR, "pw_admin.json") });
    const adminPage = await adminContext.newPage();
    await adminPage.goto("/projects");
    
    // Find the E2E project and click the "Open project" button
    const projectCard = adminPage.locator('.rounded-xl', { hasText: 'E2E Lab Project' });
    await projectCard.getByRole('link', { name: 'Open project' }).click();
    
    // Wait for navigation and extract numeric ID properly
    await adminPage.waitForURL(/\/projects\/\d+/);
    const url = adminPage.url();
    const match = url.match(/\/projects\/(\d+)/);
    if (!match) throw new Error(`Could not extract project ID from URL: ${url}`);
    const projectId = match[1];
    
    console.log(`Detected Project ID: ${projectId}`);
    
    await adminPage.goto(`/projects/${projectId}/recurring`);
    
    // Check for "Request failed" banner
    await expect(adminPage.locator('text="Request failed"')).not.toBeVisible();
    
    // Row actions render with capability state from the backend.
    const submitButton = adminPage.locator('button:has-text("Submit")').first();
    await expect(submitButton).toBeVisible();
    
    const approveButton = adminPage.locator('button:has-text("Approve")').first();
    await expect(approveButton).toBeVisible();
    
    await adminContext.close();

    // 2. Check as Owner (Assigned)
    const ownerContext = await browser.newContext({ storageState: path.join(AUTH_DIR, "pw_owner.json") });
    const ownerPage = await ownerContext.newPage();
    await ownerPage.goto(`/projects/${projectId}/recurring`);
    
    // The seed_e2e_state assigns indicators to PW users where applicable. Capability
    // checks should never hide the row actions completely.
    const submitButtonOwner = ownerPage.locator('button:has-text("Submit")').first();
    await expect(submitButtonOwner).toBeVisible();
    
    // Owner cannot approve
    const approveButtonOwner = ownerPage.locator('button:has-text("Approve")').first();
    await expect(approveButtonOwner).toBeDisabled();
    
    await ownerContext.close();

    // 3. Check as Reviewer
    const reviewerContext = await browser.newContext({ storageState: path.join(AUTH_DIR, "pw_reviewer.json") });
    const reviewerPage = await reviewerContext.newPage();
    await reviewerPage.goto(`/projects/${projectId}/recurring`);
    
    // Reviewer can see both actions; submit remains disabled when not owner.
    const submitButtonReviewer = reviewerPage.locator('button:has-text("Submit")').first();
    await expect(submitButtonReviewer).toBeDisabled();
    
    const approveButtonReviewer = reviewerPage.locator('button:has-text("Approve")').first();
    await expect(approveButtonReviewer).toBeVisible();
    
    await reviewerContext.close();
  });

  test("Admin masters edit", async ({ browser }) => {
    const adminContext = await browser.newContext({ storageState: path.join(AUTH_DIR, "pw_admin.json") });
    const page = await adminContext.newPage();
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
    
    await adminContext.close();
  });
});
