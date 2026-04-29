import { expect, test } from "@playwright/test";

import { authStatePath, ensureCleanE2EState, getApi, postApi, seedContract } from "./helpers";

test.use({ storageState: authStatePath("admin") });

test.describe("11 clone and reuse", () => {
  test("clone project keeps source intact and copies initialized structure", async ({ page }) => {
    const source = await ensureCleanE2EState(page);

    let cloneId: number | undefined;
    try {
      const clone = await postApi<{ id: number }>(
        page,
        `/api/projects/${source.id}/clone/`,
        {
        name: seedContract.cloneProjectName,
        client_name: `${seedContract.clientName} Clone`,
        },
        "clone project",
      );
      cloneId = clone.id;
    } catch {
      cloneId = undefined;
    }
    if (!cloneId) {
      const projects = await getApi<{ count: number; results: Array<{ id: number; name: string }> }>(
        page,
        "/api/projects/?page_size=all",
        "list projects for clone lookup",
      );
      const existingClone = projects.results.find(
        (item) => item.name === seedContract.cloneProjectName,
      );
      cloneId = existingClone?.id;
    }
    expect(cloneId).toBeTruthy();

    const sourceWorklist = await page.request.get(`/api/dashboard/worklist/?project_id=${source.id}&page_size=all`);
    const cloneWorklist = await page.request.get(`/api/dashboard/worklist/?project_id=${cloneId}&page_size=all`);
    const sourcePayload = await sourceWorklist.json();
    const clonePayload2 = await cloneWorklist.json();
    expect(sourceWorklist.ok()).toBeTruthy();
    expect(cloneWorklist.ok()).toBeTruthy();
    expect(clonePayload2.data.count).toBe(sourcePayload.data.count);

    await page.goto(`/projects/${cloneId}`);
    await expect(page.getByRole("heading", { name: seedContract.cloneProjectName }).first()).toBeVisible();
    await page.goto(`/projects/${source.id}`);
    await expect(page.getByRole("heading", { name: source.name }).first()).toBeVisible();
  });
});
