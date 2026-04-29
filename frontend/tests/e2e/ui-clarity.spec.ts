import { expect, test } from "@playwright/test";
import { authStatePath } from "./helpers";

test.use({ storageState: authStatePath("admin") });

test.describe("UI clarity", () => {
  test("projects page exposes prominent create CTA and guidance", async ({ page }) => {
    await page.goto("/projects");
    const main = page.locator("main");
    await expect(main.getByRole("heading", { name: "Project register" })).toBeVisible();
    await expect(main.getByRole("link", { name: "Open project" }).first()).toBeVisible();
    await expect(main.getByRole("button", { name: "Create project" }).first()).toBeVisible();
    await expect(main.getByText("Where to start")).toBeVisible();
  });

  test("indicator follows ordered workflow sections", async ({ page }) => {
    const projectResponse = await page.request.get("/api/projects/?page_size=1");
    const projectPayload = await projectResponse.json();
    const projectId = projectPayload.data.results[0].id as number;
    const worklistResponse = await page.request.get(`/api/dashboard/worklist/?project_id=${projectId}&page_size=1`);
    const worklistPayload = await worklistResponse.json();
    const indicatorId = Number(worklistPayload.data.results[0].project_indicator_id);
    await page.goto(`/project-indicators/${indicatorId}`);
    await expect(page.getByText("Indicator sections")).toBeVisible();
    await expect(page.getByRole("button", { name: "Readiness status" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Summary" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Required evidence" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Actions" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Evidence", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Recurring", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "AI / Assist", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Governance / Override", exact: true })).toBeVisible();
  });
});
