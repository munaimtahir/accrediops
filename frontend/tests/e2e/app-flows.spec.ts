import { expect, test } from "@playwright/test";
import { loginAsSeededAdmin, seededUser } from "./helpers";

test.describe("AccrediOps end-to-end flows", () => {
  test("1. protected routes redirect unauthenticated users to login", async ({ page }) => {
    await page.goto("/projects");
    await expect(page).toHaveURL(/\/login\?next=%2Fprojects/);
    await expect(page.getByText("AccrediOps sign-in")).toBeVisible();
  });

  test("2. login page opens with expected form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("AccrediOps sign-in")).toBeVisible();
    await expect(page.getByLabel("Username")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
  });

  test("3. admin user can login and reach projects page", async ({ page }) => {
    await loginAsSeededAdmin(page);
    await expect(page.getByRole("heading", { name: "Project register" })).toBeVisible();
    await expect(page.locator("main").getByRole("button", { name: "Create project" }).first()).toBeEnabled();
  });

  test("3b. expired session redirects protected navigation to login", async ({ page, context }) => {
    await loginAsSeededAdmin(page);
    await context.clearCookies();
    await page.goto("/projects");
    await expect(page).toHaveURL(/\/login\?next=%2Fprojects/);
  });

  test("4. create project and initialize from framework flow works", async ({ page }) => {
    await loginAsSeededAdmin(page);
    const projectName = `E2E Project ${Date.now()}`;
    const clientName = `E2E Client ${Date.now()}`;

    await page.locator("main").getByRole("button", { name: "Create project" }).first().click();
    await expect(page.getByRole("heading", { name: "Create project" })).toBeVisible();
    const form = page.locator("form").first();
    await form.getByLabel("Project name").fill(projectName);
    await form.getByLabel("Client name").fill(clientName);
    await form.getByLabel("Accrediting body name").fill("E2E Board");
    await form.locator("select").first().selectOption({ label: seededUser.frameworkName });
    await form.getByRole("button", { name: "Create project" }).click();

    await expect(page).toHaveURL(/\/projects\/\d+/);
    await expect(page.getByRole("heading", { name: projectName }).first()).toBeVisible();
    await expect(page.getByText(`${clientName} • E2E Board`).first()).toBeVisible();
    await expect(page.getByText("Indicators total").first()).toBeVisible();
  });

  test("5. post-login operational journey route opens from project home", async ({ page }) => {
    await loginAsSeededAdmin(page);
    await page.locator("main").getByRole("link", { name: "Open project" }).first().click();
    await expect(page).toHaveURL(/\/projects\/\d+/);
    await page.getByRole("link", { name: "Go to recurring" }).first().click();
    await expect(page).toHaveURL(/\/projects\/\d+\/recurring/);
    await expect(page.getByRole("heading", { name: "Recurring evidence queue" })).toBeVisible();
  });

  test("6. health endpoints reachable via proxy", async ({ request }) => {
    const backend = await request.get("/health/backend");
    const frontend = await request.get("/health/frontend");
    expect(backend.ok()).toBeTruthy();
    expect(frontend.ok()).toBeTruthy();
  });
});
