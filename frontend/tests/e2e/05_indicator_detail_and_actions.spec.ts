import { expect, test } from "@playwright/test";

import { authStatePath, ensureCleanE2EState, getFirstIndicatorId } from "./helpers";

test.use({ storageState: authStatePath("admin") });

test.describe("05 indicator detail and actions", () => {
  test("indicator detail renders readiness/summary/actions/evidence/recurring/governance sections", async ({ page }) => {
    const project = await ensureCleanE2EState(page);
    const indicatorId = await getFirstIndicatorId(page, project.id);
    await page.goto(`/project-indicators/${indicatorId}`);

    await expect(page.getByText("Governed indicator command surface")).toBeVisible();
    await expect(page.getByText("Indicator sections")).toBeVisible();

    await page.getByRole("button", { name: "Summary", exact: true }).click();
    await expect(page.getByText("Section 2 — Summary")).toBeVisible();

    await page.getByRole("button", { name: "Actions", exact: true }).click();
    await expect(page.getByText("Section 4 — Actions (Primary)")).toBeVisible();
    await expect(page.getByRole("button", { name: "Start" })).toBeVisible();

    await page.getByRole("button", { name: "Evidence", exact: true }).click();
    await expect(page.getByText("Section 5 — Evidence")).toBeVisible();

    await page.getByRole("button", { name: "Recurring", exact: true }).click();
    await expect(page.getByText("Current section: Recurring")).toBeVisible();

    await page.getByRole("button", { name: "Governance / Override", exact: true }).click();
    await expect(page.getByText("Section 8 — Governance / Override")).toBeVisible();
  });
});
