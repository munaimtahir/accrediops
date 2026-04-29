import { expect, test } from "@playwright/test";

import { authStatePath } from "./helpers";

test.describe("13 role visibility and authorization", () => {
  test.describe("admin", () => {
    test.use({ storageState: authStatePath("admin") });

    test("admin has admin discoverability and create CTA", async ({ page }) => {
      await page.goto("/projects");
      await expect(page.getByRole("button", { name: "Create project" }).first()).toBeEnabled();
      await expect(page.getByRole("link", { name: "Admin Dashboard" })).toBeVisible();
    });
  });

  test.describe("lead", () => {
    test.use({ storageState: authStatePath("lead") });

    test("lead sees admin navigation and can access admin route", async ({ page }) => {
      await page.goto("/projects");
      await expect(page.getByRole("link", { name: "Admin Dashboard" })).toBeVisible();
      await page.goto("/admin");
      await expect(page.getByRole("heading", { name: "Admin dashboard" })).toBeVisible();
      await expect(page.getByText(/• LEAD/).first()).toBeVisible();
    });
  });

  test.describe("owner", () => {
    test.use({ storageState: authStatePath("owner") });

    test("owner sees restricted route UX and no create capability", async ({ page }) => {
      await page.goto("/projects");
      await expect(page.getByRole("button", { name: "Create project" }).first()).toBeDisabled();

      await page.goto("/admin");
      await expect(page.getByText("Admin access restricted")).toBeVisible();

      const projectsResponse = await page.request.get("/api/projects/?page_size=1");
      const projectsPayload = await projectsResponse.json();
      const projectId = projectsPayload.data.results[0].id as number;
      await page.goto(`/projects/${projectId}/readiness`);
      await expect(page.getByText("Readiness access restricted")).toBeVisible();
      await page.goto(`/projects/${projectId}/exports`);
      await expect(page.getByText("Export access restricted")).toBeVisible();
      await page.goto(`/projects/${projectId}/print-pack`);
      await expect(page.getByText("Print pack access restricted")).toBeVisible();
      await page.goto(`/projects/${projectId}/client-profile`);
      await expect(page.getByText("Client profile access restricted")).toBeVisible();
    });
  });

  test.describe("lead overrides", () => {
    test.use({ storageState: authStatePath("lead") });

    test("lead can review overrides page but cannot execute admin-only reopen control", async ({ page }) => {
      await page.goto("/admin/overrides");
      await expect(page.getByRole("heading", { name: "Overrides & reopen control" })).toBeVisible();
      await expect(page.getByText("Execution restricted")).toBeVisible();
      await expect(page.getByRole("button", { name: "Confirm override" })).toHaveCount(0);
      await expect(page.getByRole("button", { name: "Execute override" })).toHaveCount(0);
    });
  });
});
