import { test, expect } from "@playwright/test";
import path from "node:path";

const AUTH_DIR = path.resolve(__dirname, ".auth");

test.describe("Simplified Navigation and Homepage", () => {
  test("Simplified navigation for admin", async ({ browser }) => {
    const adminContext = await browser.newContext({ storageState: path.join(AUTH_DIR, "pw_admin.json") });
    const page = await adminContext.newPage();
    await page.goto("/projects");

    // Admin/Lead sees simplified primary items
    await expect(page.locator("nav >> text=Dashboard")).not.toBeVisible(); // Not in the main sidebar
    await expect(page.locator("nav >> text=Worklist")).not.toBeVisible(); // Not in the main sidebar

    // Admin/Lead can access Settings/Admin landing page
    await page.locator("nav >> text=Settings").click();
    await expect(page).toHaveURL(/.*admin/);
    await expect(page.locator("h1:has-text('Admin Settings')")).toBeVisible();

    // Admin/Lead can navigate to Users
    await page.locator("a:has-text('Users')").click();
    await expect(page).toHaveURL(/.*admin\/users/);
    
    // Admin/Lead can navigate to Framework Setup
    await page.goto("/admin");
    await page.locator("a:has-text('Frameworks')").click();
    await expect(page).toHaveURL(/.*admin\/frameworks/);

    // Admin/Lead can navigate to Master Lists
    await page.goto("/admin");
    await page.locator("a:has-text('Statuses')").click();
    await expect(page).toHaveURL(/.*admin\/masters\/statuses/);
    
    await adminContext.close();
  });

  test("Simplified navigation for non-admin", async ({ browser }) => {
    const ownerContext = await browser.newContext({ storageState: path.join(AUTH_DIR, "pw_owner.json") });
    const page = await ownerContext.newPage();
    await page.goto("/projects");

    // non-admin does not see admin technical items
    await expect(page.locator("nav >> text=Settings")).not.toBeVisible();

    // non-admin can still access Dashboard and Worklist from within a project
    const projectCard = page.locator('.rounded-xl', { hasText: 'E2E Lab Project' });
    await projectCard.getByRole('link', { name: 'Open project' }).click();
    
    // Wait for the URL to contain a numeric ID to ensure we left the project list
    await page.waitForURL(/\/projects\/\d+/);
    
    // Check sidebar links
    const sidebar = page.locator("nav");
    await expect(sidebar.locator('text="Dashboard"')).toBeVisible();
    await expect(sidebar.locator('text="Worklist"')).toBeVisible();
    
    await ownerContext.close();
  });

  test("Simplified project dashboard", async ({ browser }) => {
    const adminContext = await browser.newContext({ storageState: path.join(AUTH_DIR, "pw_admin.json") });
    const page = await adminContext.newPage();
    await page.goto("/projects");
    const projectCard = page.locator('.rounded-xl', { hasText: 'E2E Lab Project' });
    await projectCard.getByRole('link', { name: 'Open project' }).click();
    await page.waitForURL(/\/projects\/\d+/);

    // project dashboard loads
    await expect(page.locator("h1:has-text('E2E Lab Project')")).toBeVisible();

    // key action buttons exist - use main container to avoid duplicates in sidebar/topbar
    const main = page.locator("main");
    await expect(main.locator("a:has-text('Open Worklist')")).toBeVisible();

    // Open Worklist works
    await main.locator("a:has-text('Open Worklist')").click();
    await expect(page).toHaveURL(/.*worklist/);
    
    await adminContext.close();
  });

  test("AI discoverability from worklist", async ({ browser }) => {
    const adminContext = await browser.newContext({ storageState: path.join(AUTH_DIR, "pw_admin.json") });
    const page = await adminContext.newPage();
    await page.goto("/projects");
    const projectCard = page.locator('.rounded-xl', { hasText: 'E2E Lab Project' });
    await projectCard.getByRole('link', { name: 'Open project' }).click();
    await page.waitForURL(/\/projects\/\d+/);
    
    // Navigate to worklist
    await page.goto(page.url() + "/worklist");

    // from Worklist, open indicator drawer
    const indicatorButton = page.locator('button:has-text("Ind 001")');
    await expect(indicatorButton).toBeVisible({ timeout: 15000 });
    await indicatorButton.click();
    
    // AI Action Center link/button still exists in drawer
    await expect(page.locator("h3:has-text('AI Action Center')")).toBeVisible();
    
    // open the ai action center (navigates to detail page)
    await page.locator("a:has-text('Open AI Action Center')").click();

    // Expect the AI section header in the detail page
    await expect(page.locator("h2:has-text('Section 7 — AI / Assist')")).toBeVisible();
    
    await adminContext.close();
  });
});
