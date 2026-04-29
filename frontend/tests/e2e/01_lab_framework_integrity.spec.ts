import { expect, test } from "@playwright/test";

import { authStatePath, ensureCleanE2EState } from "./helpers";

test.use({ storageState: authStatePath("admin") });

test.describe("01 LAB framework integrity", () => {
  test("LAB is visible in admin framework view and has exactly 119 indicators", async ({ page }) => {
    await ensureCleanE2EState(page);
    await page.goto("/admin/frameworks");
    await expect(page.getByRole("heading", { name: "Framework management" })).toBeVisible();

    const frameworksResponse = await page.request.get("/api/frameworks/");
    const frameworksPayload = await frameworksResponse.json();
    expect(frameworksResponse.ok()).toBeTruthy();
    const frameworks = frameworksPayload.data as Array<{ id: number; name: string }>;
    expect(frameworks).toHaveLength(1);
    expect(frameworks[0].name).toBe("LAB");

    const analysisResponse = await page.request.get(`/api/frameworks/${frameworks[0].id}/analysis/`);
    const analysisPayload = await analysisResponse.json();
    expect(analysisResponse.ok()).toBeTruthy();
    expect(analysisPayload.data.total_indicators).toBe(119);
  });
});
