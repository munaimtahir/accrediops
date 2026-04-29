import { expect, test } from "@playwright/test";

import { authStatePath, ensureCleanE2EState, postApiRaw } from "./helpers";

test.describe("export guard", () => {
  test.use({ storageState: authStatePath("admin") });

  test("backend and UI both block unready exports", async ({ page }) => {
    const project = await ensureCleanE2EState(page);

    const response = await postApiRaw(page, `/api/exports/projects/${project.id}/generate/`, {
      type: "print-bundle",
      parameters: {},
    });
    expect(response.status).toBe(403);
    expect(response.body.error.message).toContain("Export blocked:");

    await page.goto(`/projects/${project.id}/exports`);
    await expect(page.getByText("Resolve readiness blockers before generating governed exports.")).toBeVisible();
    await expect(page.getByText("Cannot proceed because")).toBeVisible();
    await expect(page.getByRole("button", { name: "Generate print-bundle" })).toBeDisabled();
  });
});
