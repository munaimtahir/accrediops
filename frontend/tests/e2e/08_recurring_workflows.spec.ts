import { expect, test } from "@playwright/test";

import { authStatePath, ensureCleanE2EState, getApi, postApi } from "./helpers";

test.use({ storageState: authStatePath("admin") });

test.describe("08 recurring workflows", () => {
  test("submit and approve a recurring instance with state updates", async ({ page }) => {
    const project = await ensureCleanE2EState(page);
    await page.goto(`/projects/${project.id}/recurring`);
    await expect(page.getByRole("heading", { name: "Recurring evidence queue" })).toBeVisible();

    const queueRows = await getApi<Array<{ id: number; project_indicator_id: number; indicator_code: string }>>(
      page,
      `/api/recurring/queue/?project_id=${project.id}`,
      "list recurring queue",
    );
    const instance = queueRows[0];
    expect(instance).toBeTruthy();

    const evidence = await postApi<{ id: number }>(
      page,
      "/api/evidence/",
      {
        project_indicator_id: instance.project_indicator_id,
        title: `E2E_RECUR_${Date.now()}`,
        source_type: "TEXT_NOTE",
        text_content: "Recurring evidence item",
      },
      "create recurring evidence",
    );

    await postApi(
      page,
      `/api/recurring/instances/${instance.id}/submit/`,
      {
        evidence_item_id: evidence.id,
        notes: "E2E recurring submit",
      },
      "submit recurring instance",
    );

    await postApi(
      page,
      `/api/recurring/instances/${instance.id}/approve/`,
      {
        approval_status: "APPROVED",
        notes: "E2E recurring approve",
      },
      "approve recurring instance",
    );

    const refreshedQueue = await getApi<Array<{ id: number; status: string }>>(
      page,
      `/api/recurring/queue/?project_id=${project.id}`,
      "refresh recurring queue",
    );
    const updated = refreshedQueue.find((row) => row.id === instance.id);
    expect(updated?.status).toBe("APPROVED");
  });
});
