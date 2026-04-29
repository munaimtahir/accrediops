import { expect, test } from "@playwright/test";

import { loginAs } from "./helpers";

test.describe("00 runtime and auth", () => {
  test("runtime stays on 18080 and health routes are reachable", async ({ page, request, baseURL }) => {
    expect(baseURL).toBe("http://127.0.0.1:18080");
    await page.goto("/");
    await expect(page).toHaveURL(/\/projects|\/login/);

    const frontendHealth = await request.get("/health/frontend");
    const backendHealth = await request.get("/health/backend");
    const apiHealth = await request.get("/api/health/");
    expect(frontendHealth.ok()).toBeTruthy();
    expect(backendHealth.ok()).toBeTruthy();
    expect(apiHealth.ok()).toBeTruthy();
  });

  test("admin/lead/owner can authenticate and logout without shell crash", async ({ page }) => {
    for (const role of ["admin", "lead", "owner"] as const) {
      await loginAs(page, role);
      await expect(page.getByRole("heading", { name: "Project register" })).toBeVisible();
      await page.getByRole("button", { name: "Sign out" }).click();
      await expect(page).toHaveURL(/\/login/);
    }
  });
});
