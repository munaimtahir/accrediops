import { expect, test } from "@playwright/test";

import { authStatePath, ensureCleanE2EState, getApi, getFirstIndicatorId, postApi } from "./helpers";

test.use({ storageState: authStatePath("admin") });

test.describe("06 evidence lifecycle", () => {
  test("add/review/version evidence and keep a single current marker", async ({ page }) => {
    const project = await ensureCleanE2EState(page);
    const indicatorId = await getFirstIndicatorId(page, project.id);
    const title = `E2E_EVIDENCE_${Date.now()}`;

    const createdEvidence = await postApi<{ id: number }>(
      page,
      "/api/evidence/",
      {
        project_indicator_id: indicatorId,
        title,
        source_type: "TEXT_NOTE",
        text_content: "Initial evidence body",
        notes: "E2E evidence create",
      },
      "create evidence",
    );
    const evidenceId = createdEvidence.id;

    await postApi(
      page,
      `/api/evidence/${evidenceId}/review/`,
      {
        validity_status: "VALID",
        completeness_status: "COMPLETE",
        approval_status: "APPROVED",
        review_notes: "Approved by e2e",
      },
      "review evidence",
    );

    await postApi(
      page,
      `/api/evidence/${evidenceId}/update/`,
      {
        text_content: "Updated evidence body for new version",
        notes: "E2E version update",
      },
      "update evidence",
    );

    const rows = await getApi<
      Array<{
        id: number;
        title: string;
        version_no: number;
        is_current: boolean;
        approval_status: string;
      }>
    >(page, `/api/project-indicators/${indicatorId}/evidence/`, "list evidence");
    const sameTitle = rows.filter((item) => item.title === title);
    expect(sameTitle.length).toBeGreaterThanOrEqual(2);
    expect(sameTitle.filter((item) => item.is_current)).toHaveLength(1);
    expect(Math.max(...sameTitle.map((item) => item.version_no))).toBeGreaterThanOrEqual(2);

    await page.goto(`/project-indicators/${indicatorId}`);
    await page.getByRole("button", { name: "Evidence", exact: true }).click();
    await expect(page.getByRole("heading", { name: title }).first()).toBeVisible();
    await expect(page.getByText("Current version")).toBeVisible();
  });
});
