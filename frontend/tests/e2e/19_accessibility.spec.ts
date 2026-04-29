import { expect, Page, test } from "@playwright/test";
import path from "node:path";

const AUTH_DIR = path.resolve(__dirname, ".auth");

async function openSeedProject(page: Page) {
  await page.goto("/projects");
  const projectCard = page.locator(".rounded-xl", { hasText: "E2E Lab Project" });
  await projectCard.getByRole("link", { name: "Open project" }).click();
  await page.waitForURL(/\/projects\/\d+/);
  const match = page.url().match(/\/projects\/(\d+)/);
  if (!match) throw new Error(`Could not extract project ID from URL: ${page.url()}`);
  return match[1];
}

test.describe("19 accessibility and keyboard navigation", () => {
  test("TAB through login form and ENTER submits", async ({ page }) => {
    await page.goto("/login");

    await page.keyboard.press("Tab"); // Skip link
    await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
    await page.keyboard.press("Tab"); // Username
    await expect(page.getByLabel("Username")).toBeFocused();
    await page.keyboard.type("pw_admin");
    await page.keyboard.press("Tab");
    await expect(page.getByLabel("Password")).toBeFocused();
    await page.keyboard.type("x");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Sign in" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/projects/);
  });

  test("dashboard exposes skip link and keyboard-reachable main actions", async ({ browser }) => {
    const context = await browser.newContext({ storageState: path.join(AUTH_DIR, "pw_admin.json") });
    const page = await context.newPage();
    const projectId = await openSeedProject(page);
    await page.goto(`/projects/${projectId}`);
    await page.evaluate(() => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      document.body.focus();
    });

    await page.keyboard.press("Tab");
    const skipLink = page.getByRole("link", { name: "Skip to main content" });
    await expect(skipLink).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#main-content")).toBeFocused();

    await expect(page.locator("#main-content").getByRole("link", { name: "Open Worklist" })).toBeVisible();
    await page.goto(`/projects/${projectId}/worklist`);
    await expect(page.getByRole("heading", { name: "Project worklist" })).toBeVisible();
    await context.close();
  });

  test("recurring approve modal traps focus, closes with ESC, and submits with ENTER", async ({ browser }) => {
    const context = await browser.newContext({ storageState: path.join(AUTH_DIR, "pw_admin.json") });
    const page = await context.newPage();
    const projectId = await openSeedProject(page);
    await page.route("**/api/recurring/queue/**", async (route) => {
      await route.fulfill({
        json: {
          success: true,
          data: [
            {
              id: 9001,
              project_indicator_id: 8001,
              project_id: Number(projectId),
              project_name: "E2E Lab Project",
              indicator_id: 7001,
              indicator_code: "A11Y-REC-001",
              indicator_text: "Keyboard accessible recurring approval",
              due_date: new Date().toISOString().slice(0, 10),
              period_label: "Current period",
              status: "SUBMITTED",
              linked_evidence_item: null,
              linked_evidence_title: "",
              submitted_at: new Date().toISOString(),
              approved_at: null,
              notes: "",
              capabilities: { can_submit: true, can_approve: true },
            },
          ],
        },
      });
    });
    await page.route("**/api/recurring/instances/9001/approve/", async (route) => {
      await route.fulfill({
        json: {
          success: true,
          data: { id: 9001, status: "APPROVED" },
        },
      });
    });
    await page.goto(`/projects/${projectId}/recurring`);

    const approveButton = page.getByRole("button", { name: "Approve" }).first();
    await expect(approveButton).toBeEnabled();
    await approveButton.focus();
    await page.keyboard.press("Enter");

    const dialog = page.getByRole("dialog", { name: "Approve recurring instance" });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("Review and finalize");
    await expect(dialog.locator(":focus")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(approveButton).toBeFocused();

    await page.keyboard.press("Enter");
    await expect(dialog).toBeVisible();
    await page.getByRole("button", { name: "Confirm decision" }).focus();
    await page.keyboard.press("Enter");
    await expect(dialog).not.toBeVisible();
    await context.close();
  });

  test("disabled recurring actions are announced as disabled by role", async ({ browser }) => {
    const adminContext = await browser.newContext({ storageState: path.join(AUTH_DIR, "pw_admin.json") });
    const adminPage = await adminContext.newPage();
    const projectId = await openSeedProject(adminPage);
    await adminContext.close();

    const context = await browser.newContext({ storageState: path.join(AUTH_DIR, "pw_admin.json") });
    const page = await context.newPage();
    await page.route("**/api/recurring/queue/**", async (route) => {
      await route.fulfill({
        json: {
          success: true,
          data: [
            {
              id: 9002,
              project_indicator_id: 8002,
              project_id: Number(projectId),
              project_name: "E2E Lab Project",
              indicator_id: 7002,
              indicator_code: "A11Y-REC-002",
              indicator_text: "Disabled recurring actions",
              due_date: new Date().toISOString().slice(0, 10),
              period_label: "Current period",
              status: "PENDING",
              linked_evidence_item: null,
              linked_evidence_title: "",
              submitted_at: null,
              approved_at: null,
              notes: "",
              capabilities: { can_submit: false, can_approve: false },
            },
          ],
        },
      });
    });
    await page.goto(`/projects/${projectId}/recurring`);
    await expect(page.getByRole("button", { name: "Submit" }).first()).toBeDisabled();
    await expect(page.getByRole("button", { name: "Approve" }).first()).toBeDisabled();
    await expect(page.getByRole("button", { name: "Approve" }).first()).toHaveAttribute(
      "title",
      "You do not have permission to approve",
    );
    await context.close();
  });

  test("admin master inputs have labels and edit modal returns focus", async ({ browser }) => {
    const context = await browser.newContext({ storageState: path.join(AUTH_DIR, "pw_admin.json") });
    const page = await context.newPage();
    await page.goto("/admin/masters/statuses");

    await expect(page.getByLabel("Code")).toBeVisible();
    await expect(page.getByLabel("Label")).toBeVisible();

    const editButton = page.getByRole("button", { name: "Edit" }).first();
    await editButton.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", { name: "Edit Master Value" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByLabel("Label")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(editButton).toBeFocused();
    await context.close();
  });

  test("classification route has accessible filter labels and row selection", async ({ browser }) => {
    const context = await browser.newContext({ storageState: path.join(AUTH_DIR, "pw_admin.json") });
    const page = await context.newPage();
    
    // Mock frameworks and classification data
    await page.route("**/api/admin/frameworks/", async (route) => {
      await route.fulfill({ json: { success: true, data: [{ id: 77, name: "A11Y Framework" }] } });
    });
    await page.route("**/api/admin/frameworks/77/classification/**", async (route) => {
      await route.fulfill({
        json: {
          success: true,
          data: {
            framework: { id: 77, name: "A11Y Framework" },
            summary: { total: 1, unclassified: 1 },
            results: [{
              id: 501,
              code: "A11Y-001",
              text: "Accessible classification row",
              classification_review_status: "UNCLASSIFIED",
            }],
          },
        },
      });
    });

    await page.goto("/admin/frameworks/classification?framework=77");
    
    // Check filter labels
    await expect(page.getByLabel("Framework")).toBeVisible();
    await expect(page.getByLabel("Search")).toBeVisible();
    await expect(page.getByLabel("Area / Standard")).toBeVisible();
    
    // Check checkbox aria-label
    await expect(page.getByLabel("Select indicator A11Y-001")).toBeVisible();
    
    // Test TAB navigation to filters
    await page.keyboard.press("Tab"); // Skip link
    await page.keyboard.press("Tab"); // Sidebar
    // ... many tabs for sidebar. Better to focus on a known element first.
    
    await page.getByLabel("Search").focus();
    await page.keyboard.type("A11Y");
    await page.keyboard.press("Tab");
    await expect(page.getByLabel("Area / Standard")).toBeFocused();
    
    await context.close();
  });
});
